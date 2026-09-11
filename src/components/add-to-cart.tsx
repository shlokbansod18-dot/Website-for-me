"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { addToCartAction } from "@/actions/cart";
import { buttonClass } from "@/components/ui/button";

type Props = {
  productId: string;
  owned?: boolean;
  inBag?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "outline";
  label?: string;
  className?: string;
};

/**
 * One button that knows all four states a product can be in for this visitor:
 * already owned, already in the bag, being added, or ready to add.
 */
export function AddToCart({
  productId,
  owned = false,
  inBag = false,
  size = "md",
  variant = "primary",
  label = "Add to bag",
  className = "",
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(inBag);
  const [error, setError] = useState<string | null>(null);

  if (owned) {
    return (
      <span
        className={`${buttonClass("outline", size, className)} pointer-events-none border-acid/40 text-acid`}
      >
        <CheckIcon />
        In your library
      </span>
    );
  }

  function add() {
    setError(null);
    startTransition(async () => {
      const result = await addToCartAction(productId);
      if (!result.ok) {
        setError(result.message ?? "Something went wrong.");
        return;
      }
      setAdded(true);
      router.refresh();
    });
  }

  if (added) {
    return (
      <a href="/cart" className={buttonClass("outline", size, `border-acid/40 text-acid ${className}`)}>
        <CheckIcon />
        In your bag — view
      </a>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={add}
        disabled={pending}
        className={buttonClass(variant, size, "w-full")}
      >
        {pending ? (
          <>
            <span className="spin size-3.5 rounded-full border-2 border-current border-t-transparent" />
            Adding
          </>
        ) : (
          label
        )}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs text-flare">
          {error}
        </p>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.5l5 5 10-11" />
    </svg>
  );
}
