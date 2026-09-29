"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { SettingsService } from "@/services/settingsService";

type CurrencyCode = "THB" | "MMK";

/**
 * Prices are persisted in the shop's default currency, but the top nav bar lets
 * the user look at the app in either currency. For read-only screens that is
 * just a formatting concern, so `useCurrency().formatPrice` is enough.
 *
 * Price *forms* are harder: whatever the user types has to be interpreted in
 * the currency the label promises, then written back in the stored currency. It
 * also has to survive the user flipping the nav bar selector mid-edit. This
 * hook owns that translation so the stock forms only deal with the numbers the
 * user sees.
 */
export interface PriceCurrency {
  /** Currency the price inputs are labelled with and entered in. */
  priceCurrency: CurrencyCode;
  /** Symbol for {@link priceCurrency}, e.g. "฿" or "Ks". */
  priceSymbol: string;
  /** Currency prices are stored in (the business default). */
  baseCurrency: CurrencyCode;
  /** Symbol for {@link baseCurrency}. */
  baseSymbol: string;
  /** True when the form is showing a currency other than the stored one. */
  isConverted: boolean;
  /** Configured exchange rate; 0 when the owner has not set one. */
  currencyRate: number;
  /** True once business settings have been read, so conversion is safe. */
  isReady: boolean;
  /** Stored amount -> amount to show in an input. */
  fromBase: (amount: number) => number;
  /** Amount typed into an input -> amount to store. */
  toBase: (amount: number) => number;
  /** {@link fromBase} for the raw strings the number inputs hold. */
  fromBaseString: (value: string | number | null | undefined) => string;
  /** Formats an amount that is already in the stored currency. */
  formatBase: (amount: number) => string;
}

/**
 * MMK is never quoted in fractions of a kyat, while THB is. Rounding on every
 * hop keeps converted values from showing a tail of float noise.
 */
function roundFor(amount: number, currency: CurrencyCode): number {
  if (!Number.isFinite(amount)) {
    return 0;
  }
  const factor = currency === "MMK" ? 1 : 100;
  return Math.round(amount * factor) / factor;
}

/**
 * @param onCurrencyChange Called when the currency the inputs are expressed in
 * changes, with a converter that maps an amount from the previous input
 * currency to the new one. Use it to re-scale values the user has already
 * entered. Not called for the initial currency, nor before settings load.
 */
export function usePriceCurrency(
  onCurrencyChange?: (
    convert: (amount: number) => number,
    nextCurrency: CurrencyCode,
  ) => void,
): PriceCurrency {
  const {
    selectedCurrency,
    defaultCurrency,
    currencyRate,
    isCurrencySettingsLoaded,
  } = useCurrency();

  const baseCurrency = defaultCurrency;
  // A rate of 0 means the owner never configured one; converting would wipe the
  // prices out, so fall back to editing in the stored currency.
  const canConvert = currencyRate > 0;
  const priceCurrency: CurrencyCode = canConvert
    ? selectedCurrency
    : baseCurrency;

  const convertBetween = useCallback(
    (amount: number, from: CurrencyCode, to: CurrencyCode): number => {
      if (from === to || !Number.isFinite(amount)) {
        return roundFor(amount, to);
      }
      return roundFor(
        SettingsService.convertPrice(
          amount,
          from,
          to,
          currencyRate,
          baseCurrency,
        ),
        to,
      );
    },
    [currencyRate, baseCurrency],
  );

  const fromBase = useCallback(
    (amount: number) => convertBetween(amount, baseCurrency, priceCurrency),
    [convertBetween, baseCurrency, priceCurrency],
  );

  const toBase = useCallback(
    (amount: number) => convertBetween(amount, priceCurrency, baseCurrency),
    [convertBetween, priceCurrency, baseCurrency],
  );

  const fromBaseString = useCallback(
    (value: string | number | null | undefined): string => {
      if (value === null || value === undefined || value === "") {
        return "";
      }
      const amount = typeof value === "number" ? value : parseFloat(value);
      if (!Number.isFinite(amount)) {
        return "";
      }
      return fromBase(amount).toString();
    },
    [fromBase],
  );

  const formatBase = useCallback(
    (amount: number) => SettingsService.formatPrice(amount, baseCurrency),
    [baseCurrency],
  );

  // Re-scale already-entered values when the nav bar selector changes.
  const previousCurrency = useRef<CurrencyCode | null>(null);
  const handlerRef = useRef(onCurrencyChange);
  handlerRef.current = onCurrencyChange;

  useEffect(() => {
    if (!isCurrencySettingsLoaded) {
      return;
    }

    const previous = previousCurrency.current;
    previousCurrency.current = priceCurrency;

    // First settled currency: nothing on screen to convert yet.
    if (previous === null || previous === priceCurrency) {
      return;
    }

    handlerRef.current?.(
      (amount) => convertBetween(amount, previous, priceCurrency),
      priceCurrency,
    );
  }, [priceCurrency, convertBetween, isCurrencySettingsLoaded]);

  return useMemo(
    () => ({
      priceCurrency,
      priceSymbol: SettingsService.getCurrencyInfo(priceCurrency).symbol,
      baseCurrency,
      baseSymbol: SettingsService.getCurrencyInfo(baseCurrency).symbol,
      isConverted: priceCurrency !== baseCurrency,
      currencyRate,
      isReady: isCurrencySettingsLoaded,
      fromBase,
      toBase,
      fromBaseString,
      formatBase,
    }),
    [
      priceCurrency,
      baseCurrency,
      currencyRate,
      isCurrencySettingsLoaded,
      fromBase,
      toBase,
      fromBaseString,
      formatBase,
    ],
  );
}
