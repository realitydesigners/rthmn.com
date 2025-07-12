import { useUser } from "@/providers/UserProvider";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useSubscription() {
  const { subscription, hasActiveSubscription } = useUser();
  const router = useRouter();

  const requireSubscription = useCallback(() => {
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return false;
    }
    return true;
  }, [hasActiveSubscription, router]);

  const isSubscribed = hasActiveSubscription;
  const isTrialing = subscription?.status === "trialing";
  const isActive = subscription?.status === "active";

  return {
    subscription,
    isSubscribed,
    isTrialing,
    isActive,
    requireSubscription,
  };
}
