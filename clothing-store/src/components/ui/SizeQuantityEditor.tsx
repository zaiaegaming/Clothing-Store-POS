"use client";

import { SizeQuantity } from "@/types/stock";

interface SizeQuantityEditorProps {
  /** Every size the user is allowed to stock. */
  availableSizes: string[];
  /** Sizes currently stocked, with their quantities. */
  sizeQuantities: SizeQuantity[];
  /** Add the size when it isn't stocked yet, remove it when it is. */
  onToggleSize: (size: string) => void;
  onQuantityChange: (size: string, quantity: number) => void;
  className?: string;
}

/**
 * Size picker plus per-size quantity inputs.
 *
 * Colorless stock still needs sizes and quantities, but it has no colour, image
 * or swatch to configure — so it gets this on its own instead of the full colour
 * variant card.
 */
export function SizeQuantityEditor({
  availableSizes,
  sizeQuantities,
  onToggleSize,
  onQuantityChange,
  className = "",
}: SizeQuantityEditorProps) {
  const totalUnits = sizeQuantities.reduce((sum, sq) => sum + sq.quantity, 0);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="min-w-0">
        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Available Sizes
        </label>
        <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {availableSizes.map((size) => {
            const isSelected = sizeQuantities.some((sq) => sq.size === size);
            return (
              <button
                key={size}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onToggleSize(size)}
                className={`px-3 py-1.5 border-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 border-pink-500 text-white shadow-md scale-105"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:scale-105"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {sizeQuantities.length === 0 ? (
        <p className="text-sm text-gray-500">
          Pick at least one size to enter quantities. Use{" "}
          <span className="font-semibold">Free</span> for one-size items.
        </p>
      ) : (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Stock Quantities
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg border border-pink-100">
            {sizeQuantities.map((sizeQty) => (
              <div
                key={sizeQty.size}
                className="flex flex-col p-2.5 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-xs font-bold text-gray-600 mb-1.5 uppercase">
                  {sizeQty.size}
                </span>
                <input
                  type="number"
                  min="0"
                  value={sizeQty.quantity === 0 ? "" : sizeQty.quantity}
                  onChange={(e) =>
                    onQuantityChange(
                      sizeQty.size,
                      e.target.value === ""
                        ? 0
                        : parseInt(e.target.value, 10) || 0,
                    )
                  }
                  className="w-full px-2 py-1.5 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-900 bg-white text-sm font-semibold text-center transition-all"
                  placeholder="0"
                  aria-label={`Quantity for size ${sizeQty.size}`}
                  title={
                    sizeQty.quantity > 0
                      ? `Quantity: ${sizeQty.quantity}`
                      : "Enter quantity"
                  }
                />
              </div>
            ))}
          </div>
          <div className="mt-2 px-3 py-2 bg-pink-50 rounded-lg border border-pink-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-pink-900">Total Stock:</span>
              <span className="font-bold text-pink-700 text-sm">
                {totalUnits} units
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
