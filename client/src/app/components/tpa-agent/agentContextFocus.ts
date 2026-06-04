import type { ExploitIntelligenceCellState } from "@app/components/exploit-intelligence";

/** Row- or record-level context when the user launches the agent from a data line. */
export interface TpaAgentContextFocus {
  kind: string;
  /** Short label in the context control (e.g. CVE id). */
  label: string;
  /** Full description for tooltips and prompts. */
  summary: string;
  suggestedPrompt?: string;
}

const describeExploitIntelligence = (
  state: ExploitIntelligenceCellState,
): string => {
  if (state.kind === "not_run") {
    return "Exploit intelligence analysis has not been requested.";
  }
  switch (state.finding.variant) {
    case "vulnerable":
      return "Exploit intelligence: Vulnerable";
    case "not_vulnerable":
      return "Exploit intelligence: Not vulnerable";
    case "uncertain":
      return "Exploit intelligence: Uncertain";
    case "in_progress":
      return "Exploit intelligence: Analysis in progress";
    case "failed":
      return "Exploit intelligence: Analysis failed";
    default:
      return "Exploit intelligence finding available";
  }
};

export const buildSbomVulnerabilityFocus = (input: {
  sbomId: string;
  sbomName?: string;
  vulnerabilityId: string;
  vulnerabilityTitle?: string;
  severity?: string;
  exploitIntelligence: ExploitIntelligenceCellState;
}): TpaAgentContextFocus => {
  const sbomLabel = input.sbomName ?? input.sbomId;
  const title = input.vulnerabilityTitle?.trim();
  const exploitSummary = describeExploitIntelligence(input.exploitIntelligence);

  let suggestedPrompt = `What should I know about ${input.vulnerabilityId} on SBOM ${sbomLabel}?`;

  if (input.exploitIntelligence.kind === "finding") {
    switch (input.exploitIntelligence.finding.variant) {
      case "vulnerable":
        suggestedPrompt = `Explain the exploit intelligence finding for ${input.vulnerabilityId} and recommended next steps.`;
        break;
      case "in_progress":
        suggestedPrompt = `What will the exploit intelligence analysis cover for ${input.vulnerabilityId}?`;
        break;
      case "not_vulnerable":
        suggestedPrompt = `Summarize why ${input.vulnerabilityId} is marked not vulnerable in exploit intelligence.`;
        break;
      case "uncertain":
        suggestedPrompt = `What does the uncertain exploit intelligence result mean for ${input.vulnerabilityId}?`;
        break;
      case "failed":
        suggestedPrompt = `Why did exploit intelligence analysis fail for ${input.vulnerabilityId}?`;
        break;
      default:
        break;
    }
  }

  const summaryParts = [
    `SBOM: ${sbomLabel}`,
    `Vulnerability: ${input.vulnerabilityId}`,
    title ? `Title: ${title}` : null,
    input.severity ? `Severity: ${input.severity}` : null,
    exploitSummary,
  ].filter(Boolean);

  return {
    kind: "sbom-vulnerability",
    label: input.vulnerabilityId,
    summary: summaryParts.join(" · "),
    suggestedPrompt,
  };
};
