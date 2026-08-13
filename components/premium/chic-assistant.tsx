"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePremium } from "@/components/premium/premium-provider";
import { StatusDot } from "@/components/premium/plan-badge";
import {
  ASSISTANT_NAME,
  ASSISTANT_SUBTITLE,
  CHOOSE_ANY_OFFER,
  FOCUS_OPTIONS,
  QUICK_ACTIONS,
  VOLUME_OPTIONS,
  chooseAction,
  detectIntent,
  recommendPlan,
  replyForIntent,
  type AssistantAction,
  type AssistantIntent,
  type FocusOption,
  type VolumeOption,
} from "@/lib/premium-assistant";
import { buildAdvisorLinks } from "@/lib/subscription-flow";
import type { OfferId } from "@/lib/plans";
import type { ResolvedPlan } from "@/lib/premium-config";

type Bubble = {
  id: string;
  role: "assistant" | "user";
  lines: string[];
  quote?: OfferId[];
  actions?: AssistantAction[];
  label?: string;
  links?: { whatsapp: string | null; email: string | null };
};

type Stage = "idle" | "ask-volume" | "ask-focus";

let bubbleSeq = 0;
function nextId() {
  bubbleSeq += 1;
  return `bubble-${bubbleSeq}`;
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ChicAssistant() {
  const {
    plans,
    contact,
    identity,
    loaded,
    assistantOpen,
    assistantIntent,
    openAssistant,
    closeAssistant,
    consumeAssistantIntent,
    selectPlan,
  } = usePremium();

  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [stage, setStage] = useState<Stage>("idle");
  const [volume, setVolume] = useState<VolumeOption | null>(null);
  const [input, setInput] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);

  const planMap = useMemo(() => {
    const map = new Map<OfferId, ResolvedPlan>();
    for (const plan of plans) map.set(plan.id, plan);
    return map;
  }, [plans]);

  const push = useCallback((bubble: Omit<Bubble, "id">) => {
    setBubbles((current) => [...current, { ...bubble, id: nextId() }]);
  }, []);

  const pushReply = useCallback(
    (intent: AssistantIntent) => {
      const reply = replyForIntent(intent);
      push({ role: "assistant", lines: reply.lines, quote: reply.quote, actions: reply.actions });
    },
    [push],
  );

  // Derived rather than stored: the opening message follows the loaded identity
  // without an effect writing to state.
  const opening = useMemo<Bubble[]>(() => {
    if (!loaded) return [];
    const name = identity.ownerName.trim();
    return [
      {
        id: "opening-greeting",
        role: "assistant",
        lines: [
          `Bonjour ${name || "et bienvenue"} 👋`,
          "Je peux vous aider à choisir l’offre adaptée à votre activité.",
        ],
      },
      {
        id: "opening-actions",
        role: "assistant",
        lines: ["Que souhaitez-vous faire ?"],
        actions: QUICK_ACTIONS,
      },
    ];
  }, [identity.ownerName, loaded]);

  const thread = useMemo(() => [...opening, ...bubbles], [bubbles, opening]);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [thread, assistantOpen]);

  const startRecommendation = useCallback(() => {
    setStage("ask-volume");
    setVolume(null);
    push({
      role: "assistant",
      label: "Recommandation",
      lines: ["Combien de commandes gérez-vous généralement ?"],
    });
  }, [push]);

  const talkToAdvisor = useCallback(() => {
    const links = buildAdvisorLinks(contact, identity.ownerName, identity.storeName);
    push({
      role: "assistant",
      lines: [
        "Notre équipe vous répond directement.",
        "Aucun paiement n’est traité dans l’application: l’activation est faite manuellement.",
      ],
      links,
    });
  }, [contact, identity.ownerName, identity.storeName, push]);

  const runAction = useCallback(
    (action: AssistantAction) => {
      push({ role: "user", lines: [action.label] });

      if (action.id.startsWith("choose:")) {
        const planId = action.id.slice("choose:".length) as OfferId;
        const plan = planMap.get(planId);
        push({
          role: "assistant",
          lines: [
            `Offre ${plan?.name ?? planId} sélectionnée. J’ouvre la demande d’activation.`,
          ],
        });
        selectPlan(planId);
        return;
      }

      switch (action.id) {
        case "show-plans":
          pushReply("pricing");
          scrollToSection("plans");
          return;
        case "compare-plans":
          pushReply("comparison");
          scrollToSection("comparer");
          return;
        case "talk-to-advisor":
          talkToAdvisor();
          return;
        case "create-request":
          push({
            role: "assistant",
            lines: ["Quelle offre souhaitez-vous activer ?"],
            actions: CHOOSE_ANY_OFFER,
          });
          return;
        case "start-recommendation":
          startRecommendation();
          return;
        default:
          pushReply("fallback");
      }
    },
    [planMap, push, pushReply, selectPlan, startRecommendation, talkToAdvisor],
  );

  useEffect(() => {
    if (!assistantOpen || !assistantIntent) return;
    const intent = assistantIntent;
    const frame = window.requestAnimationFrame(() => {
      consumeAssistantIntent();
      if (intent === "recommendation") startRecommendation();
      else pushReply(intent);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [assistantIntent, assistantOpen, consumeAssistantIntent, pushReply, startRecommendation]);

  function answerVolume(value: VolumeOption) {
    push({ role: "user", lines: [value] });
    setVolume(value);
    setStage("ask-focus");
    push({
      role: "assistant",
      label: "Recommandation",
      lines: ["Qu’utilisez-vous le plus ?"],
    });
  }

  function answerFocus(value: FocusOption) {
    push({ role: "user", lines: [value] });
    const result = recommendPlan(volume ?? "0–50", value);
    setStage("idle");
    push({
      role: "assistant",
      label: "Recommandation · règles",
      lines: [`Offre recommandée: ${result.label}.`, result.reason],
      quote: [result.offer],
      actions: [
        chooseAction(result.offer),
        { id: "compare-plans", label: "Comparer les plans" },
        { id: "talk-to-advisor", label: "Parler à un conseiller" },
      ],
    });
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    push({ role: "user", lines: [text] });
    const intent = detectIntent(text);
    if (intent === "recommendation") {
      startRecommendation();
      return;
    }
    pushReply(intent);
  }

  return (
    <>
      {assistantOpen ? null : (
        <button
          type="button"
          onClick={() => openAssistant()}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-chic-forest-deep px-4 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-chic-ink"
        >
          <SparkIcon />
          {ASSISTANT_NAME}
        </button>
      )}

      {assistantOpen ? (
        <>
          <button
            type="button"
            aria-label="Fermer l’assistant"
            onClick={closeAssistant}
            className="fixed inset-0 z-40 bg-chic-ink/40 lg:hidden"
          />
          <aside
            role="dialog"
            aria-label={ASSISTANT_NAME}
            className="fixed bottom-0 left-0 right-0 z-50 flex h-[80vh] flex-col overflow-hidden rounded-t-3xl border border-chic-line bg-white shadow-2xl lg:bottom-4 lg:left-auto lg:right-4 lg:h-[620px] lg:max-h-[calc(100vh-2rem)] lg:w-[400px] lg:rounded-3xl"
          >
            <header className="flex items-start justify-between gap-3 border-b border-chic-line bg-chic-forest-deep px-4 py-3.5 text-white">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <StatusDot tone="gold" />
                  {ASSISTANT_NAME}
                </p>
                <p className="mt-0.5 text-xs text-white/70">{ASSISTANT_SUBTITLE}</p>
              </div>
              <button
                type="button"
                onClick={closeAssistant}
                className="rounded-lg border border-white/20 px-2 py-1 text-xs text-white/80 transition hover:bg-white/10"
              >
                Fermer
              </button>
            </header>

            <div ref={threadRef} className="flex-1 space-y-3 overflow-y-auto bg-chic-cream/40 px-4 py-4">
              {thread.map((bubble) => (
                <div
                  key={bubble.id}
                  className={bubble.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      bubble.role === "user"
                        ? "bg-chic-emerald text-white"
                        : "border border-chic-line bg-white"
                    }`}
                  >
                    {bubble.label ? (
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-chic-gold">
                        {bubble.label}
                      </p>
                    ) : null}
                    {bubble.lines.map((line, index) => (
                      <p key={index} className={index > 0 ? "mt-1.5" : undefined}>
                        {line}
                      </p>
                    ))}

                    {bubble.quote?.length ? (
                      <ul className="mt-2.5 space-y-1">
                        {bubble.quote.map((id) => {
                          const plan = planMap.get(id);
                          if (!plan) return null;
                          return (
                            <li
                              key={id}
                              className="flex items-center justify-between gap-2 rounded-lg border border-chic-line bg-chic-cream/60 px-2.5 py-1.5 text-xs"
                            >
                              <span className="font-semibold">{plan.name}</span>
                              <span className="tabular-nums text-chic-muted">
                                {plan.price === null
                                  ? plan.priceLabel
                                  : `${plan.messagePrice}/mois`}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}

                    {bubble.links ? (
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        <ChannelLink href={bubble.links.whatsapp} label="WhatsApp" primary />
                        <ChannelLink href={bubble.links.email} label="Email" />
                      </div>
                    ) : null}

                    {bubble.actions?.length ? (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {bubble.actions.map((action) => (
                          <button
                            key={action.id}
                            type="button"
                            onClick={() => runAction(action)}
                            className="rounded-full border border-chic-emerald/30 bg-chic-mint/70 px-2.5 py-1 text-xs font-medium text-chic-emerald transition hover:bg-chic-mint"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}

              {stage === "ask-volume" ? (
                <OptionRow
                  options={VOLUME_OPTIONS}
                  onSelect={(value) => answerVolume(value as VolumeOption)}
                />
              ) : null}
              {stage === "ask-focus" ? (
                <OptionRow
                  options={FOCUS_OPTIONS}
                  onSelect={(value) => answerFocus(value as FocusOption)}
                />
              ) : null}
            </div>

            <form
              onSubmit={submit}
              className="flex items-center gap-2 border-t border-chic-line bg-white px-3 py-3"
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Posez votre question…"
                className="min-w-0 flex-1 rounded-xl border border-chic-line px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-xl bg-chic-emerald px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-chic-forest"
              >
                Envoyer
              </button>
            </form>
          </aside>
        </>
      ) : null}
    </>
  );
}

function OptionRow({
  options,
  onSelect,
}: {
  options: readonly string[];
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          className="rounded-full border border-chic-line bg-white px-3 py-1.5 text-xs font-medium transition hover:border-chic-emerald/40 hover:bg-chic-mint/50"
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function ChannelLink({
  href,
  label,
  primary = false,
}: {
  href: string | null;
  label: string;
  primary?: boolean;
}) {
  if (!href) {
    return (
      <span className="rounded-full border border-chic-line px-2.5 py-1 text-xs text-chic-muted">
        {label} · à configurer
      </span>
    );
  }
  return (
    <a
      href={href}
      target={label === "WhatsApp" ? "_blank" : undefined}
      rel={label === "WhatsApp" ? "noopener noreferrer" : undefined}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
        primary
          ? "bg-chic-emerald text-white hover:bg-chic-forest"
          : "border border-chic-line hover:bg-chic-cream"
      }`}
    >
      {label}
    </a>
  );
}

function SparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v4M12 17v4M4 12h4M16 12h4M6.5 6.5 9 9M15 15l2.5 2.5M17.5 6.5 15 9M9 15l-2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AssistantCard() {
  const { openAssistant } = usePremium();

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.16em] text-chic-gold">Assistant</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">{ASSISTANT_NAME}</h2>
          <p className="mt-1 max-w-xl text-sm text-chic-muted">{ASSISTANT_SUBTITLE}</p>
        </div>
        <button
          type="button"
          onClick={() => openAssistant()}
          className="rounded-xl bg-chic-forest-deep px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-chic-ink"
        >
          Ouvrir l’assistant
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() =>
              openAssistant(
                action.id === "compare-plans"
                  ? "comparison"
                  : action.id === "talk-to-advisor"
                    ? "contact"
                    : action.id === "create-request"
                      ? "contact"
                      : "pricing",
              )
            }
            className="rounded-full border border-chic-line bg-white px-3 py-1.5 text-xs font-medium transition hover:border-chic-emerald/40 hover:bg-chic-mint/50"
          >
            {action.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-chic-muted">
        L’assistant ne traite aucun paiement. Il vous aide à comprendre les offres, préparer une
        demande et contacter notre équipe.
      </p>
    </section>
  );
}
