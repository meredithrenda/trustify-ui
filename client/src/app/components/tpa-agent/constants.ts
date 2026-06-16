/** User-facing product name for the in-app assistant. */
export const TPA_INTELLIGENCE_ASSISTANT_DISPLAY_NAME = "Intelligent assistant";

/** Shorter title for the corner launcher and popup chat. */
export const TPA_INTELLIGENCE_ASSISTANT_SHORT_NAME = "Intelligent assistant";

/** Display name on user messages (Developer Hub uses “Guest”). */
export const TPA_AGENT_MESSAGE_USER_NAME = "Guest";

/** LLM options shown in the message bar model selector (Developer Hub layout). */
export const TPA_AGENT_MODELS = [
  "granite-3.1-8b",
  "granite-3.1-2b",
  "llama-3.1-8b",
  "mistral-7b-instruct",
] as const;

export type TpaAgentModel = (typeof TPA_AGENT_MODELS)[number];

export const TPA_AGENT_DEFAULT_MODEL: TpaAgentModel = "granite-3.1-8b";

/** Home embedded assistant — three equal prompt cards (Developer Hub layout). */
export const TPA_AGENT_HOME_WELCOME_PROMPTS = [
  {
    title: "CVE impact",
    description: "Which products are affected by CVE-2024-12345?",
  },
  {
    title: "Critical CVEs",
    description: "Show me unpatched critical CVEs",
  },
  {
    title: "SBOM search",
    description: "Which SBOMs contain log4j?",
  },
];

/** Corner popup assistant — one starter prompt (Developer Hub layout). */
export const TPA_AGENT_POPUP_WELCOME_PROMPTS = [
  TPA_AGENT_HOME_WELCOME_PROMPTS[0],
];

export const TPA_AGENT_FOOTNOTE = {
  label: `${TPA_INTELLIGENCE_ASSISTANT_SHORT_NAME} uses AI. Check for mistakes.`,
  popover: {
    title: "Verify responses",
    description:
      "Answers are prototype data for layout review. Confirm release and security decisions using your SBOM, advisory, and policy sources.",
    cta: {
      label: "Got it",
      onClick: () => undefined,
    },
  },
};
