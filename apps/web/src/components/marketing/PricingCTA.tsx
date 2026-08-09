"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/ui/Icons";
import { authFetch, useAuthUser } from "@/hooks/useAuthUser";
import type { PlanId } from "@/lib/plans";

interface PricingCTAProps {
  tierName: string;
  price: number;
  featured?: boolean;
}

function planIdForTier(tierName: string, price: number): PlanId {
  if (price === 0) return "free";
  if (tierName.toLowerCase() === "team") return "team";
  return "pro";
}

export function PricingCTA({ tierName, price, featured }: PricingCTAProps) {
  const router = useRouter();
  const { user, loading, getToken } = useAuthUser();
  const [busy, setBusy] = useState(false);
  const plan = planIdForTier(tierName, price);

  async function handleClick() {
    if (price === 0) {
      router.push(user ? "/dashboard" : "/signup");
      return;
    }

    if (!user) {
      router.push(`/signup?plan=${plan}`);
      return;
    }

    setBusy(true);
    try {
      const response = await authFetch(getToken, "/api/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ plan }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      router.push(`/dashboard?upgrade=${plan}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={`btn ${featured ? "btn-primary" : "btn-secondary"} btn-block`}
      onClick={() => void handleClick()}
      disabled={loading || busy}
    >
      {busy ? (
        <>
          <Spinner />
          Please wait…
        </>
      ) : price === 0 ? (
        "Get started free"
      ) : (
        "Subscribe now"
      )}
    </button>
  );
}
