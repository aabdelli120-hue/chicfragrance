"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_PREMIUM_CONTACT,
  resolvePlans,
  type PremiumContact,
  type ResolvedPlan,
} from "@/lib/premium-config";
import type { OfferId, PlanId } from "@/lib/plans";
import type { AssistantIntent } from "@/lib/premium-assistant";

export type PremiumIdentity = {
  ownerName: string;
  storeName: string;
  role: string;
};

export type PremiumSubscription = {
  plan: PlanId;
  status: "inactive" | "active" | "past_due";
  startedAt: string | null;
  expiresAt: string | null;
};

type PremiumContextValue = {
  loaded: boolean;
  plans: ResolvedPlan[];
  contact: PremiumContact;
  identity: PremiumIdentity;
  subscription: PremiumSubscription;
  paymentReady: boolean;
  /** Plan under review in the activation drawer, `null` when closed. */
  activationPlan: OfferId | null;
  assistantOpen: boolean;
  assistantIntent: AssistantIntent | null;
  selectPlan: (plan: OfferId) => void;
  closeActivation: () => void;
  openAssistant: (intent?: AssistantIntent) => void;
  closeAssistant: () => void;
  consumeAssistantIntent: () => void;
};

const FALLBACK_IDENTITY: PremiumIdentity = {
  ownerName: "",
  storeName: "Chic Fragrance",
  role: "Administrateur",
};

const FALLBACK_SUBSCRIPTION: PremiumSubscription = {
  plan: "FREE",
  status: "inactive",
  startedAt: null,
  expiresAt: null,
};

const PremiumContext = createContext<PremiumContextValue | null>(null);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const defaultPlans = useMemo(
    () => resolvePlans({ contact: DEFAULT_PREMIUM_CONTACT, plans: {} }),
    [],
  );

  const [loaded, setLoaded] = useState(false);
  const [plans, setPlans] = useState<ResolvedPlan[]>(defaultPlans);
  const [contact, setContact] = useState<PremiumContact>(DEFAULT_PREMIUM_CONTACT);
  const [identity, setIdentity] = useState<PremiumIdentity>(FALLBACK_IDENTITY);
  const [subscription, setSubscription] = useState<PremiumSubscription>(FALLBACK_SUBSCRIPTION);
  const [paymentReady, setPaymentReady] = useState(false);
  const [activationPlan, setActivationPlan] = useState<OfferId | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantIntent, setAssistantIntent] = useState<AssistantIntent | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    fetch("/api/premium", { cache: "no-store", signal: controller.signal })
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled || !payload?.ok) return;
        if (Array.isArray(payload.plans) && payload.plans.length > 0) setPlans(payload.plans);
        if (payload.contact) setContact(payload.contact);
        if (payload.identity) setIdentity(payload.identity);
        if (payload.subscription) setSubscription(payload.subscription);
        setPaymentReady(Boolean(payload.paymentReady));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const selectPlan = useCallback((plan: OfferId) => setActivationPlan(plan), []);
  const closeActivation = useCallback(() => setActivationPlan(null), []);
  const openAssistant = useCallback((intent?: AssistantIntent) => {
    if (intent) setAssistantIntent(intent);
    setAssistantOpen(true);
  }, []);
  const closeAssistant = useCallback(() => setAssistantOpen(false), []);
  const consumeAssistantIntent = useCallback(() => setAssistantIntent(null), []);

  const value = useMemo<PremiumContextValue>(
    () => ({
      loaded,
      plans,
      contact,
      identity,
      subscription,
      paymentReady,
      activationPlan,
      assistantOpen,
      assistantIntent,
      selectPlan,
      closeActivation,
      openAssistant,
      closeAssistant,
      consumeAssistantIntent,
    }),
    [
      loaded,
      plans,
      contact,
      identity,
      subscription,
      paymentReady,
      activationPlan,
      assistantOpen,
      assistantIntent,
      selectPlan,
      closeActivation,
      openAssistant,
      closeAssistant,
      consumeAssistantIntent,
    ],
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error("usePremium must be used within PremiumProvider");
  }
  return context;
}

export function usePremiumPlan(id: OfferId | null): ResolvedPlan | null {
  const { plans } = usePremium();
  if (!id) return null;
  return plans.find((plan) => plan.id === id) ?? null;
}
