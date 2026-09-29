"use client";

import { Info } from "lucide-react";
import { PriceCurrency } from "@/hooks/usePriceCurrency";

interface CurrencyConversionNoticeProps {
  currency: PriceCurrency;
  className?: string;
}

/**
 * Explains, on price forms, that the amounts being typed are not the amounts
 * being stored. Without this the owner has no way to tell that switching the top
 * nav bar currency changed what the numbers in the form mean.
 *
 * Renders nothing while the form is showing the stored currency.
 */
export function CurrencyConversionNotice({
  currency,
  className = "",
}: CurrencyConversionNoticeProps) {
  if (!currency.isConverted) {
    return null;
  }

  return (
    <div
      className={`flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 ${className}`}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <p>
        Prices are entered in{" "}
        <span className="font-semibold">
          {currency.priceSymbol} ({currency.priceCurrency})
        </span>{" "}
        to match the currency selected in the top bar, and saved in{" "}
        <span className="font-semibold">
          {currency.baseSymbol} ({currency.baseCurrency})
        </span>{" "}
        at 1 {currency.baseSymbol} = {currency.currencyRate}{" "}
        {currency.priceSymbol}.
      </p>
    </div>
  );
}
