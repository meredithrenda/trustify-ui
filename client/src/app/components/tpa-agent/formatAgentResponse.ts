import type { AgentResponse } from "./mockResponses";

const DEV_HUB_CLOSING =
  "Feel free to ask more specific questions, and I'll provide detailed guidance tailored to your use case.";

/** Collapsible reasoning block (Developer Hub “Show thinking”). */
export function buildAgentThinkingBody(
  response: AgentResponse,
  userQuery: string,
): string {
  const lines = [
    `Reviewed your question against SBOM, advisory, VEX, and exploit intelligence data (prototype).`,
    "",
    `**Prompt:** ${userQuery}`,
    "",
    `**Initial read:** ${response.answer}`,
  ];

  if (response.severity) {
    lines.push("", `**Severity:** ${response.severity.toUpperCase()}`);
  }

  if (response.sources.length > 0) {
    lines.push("", `**Sources checked:** ${response.sources.join(", ")}`);
  }

  return lines.join("\n");
}

/** Bot reply body — intro, prose, optional bullets, closing (Developer Hub layout). */
export function formatAgentResponseAsMarkdown(
  response: AgentResponse,
  options?: { userQuery?: string },
): string {
  const parts: string[] = [];

  if (options?.userQuery) {
    parts.push(
      `I understand you're asking about: '${options.userQuery.replace(/'/g, "’")}'.`,
    );
  }

  parts.push(response.answer);

  if (response.severity) {
    parts.push(
      `This finding is **${response.severity.toUpperCase()}** severity in your current data.`,
    );
  }

  parts.push(response.detail);

  if (response.items && response.items.length > 0) {
    for (const item of response.items) {
      const dashSplit = item.split(/ — /);
      if (dashSplit.length > 1) {
        parts.push(`- **${dashSplit[0].trim()}** ${dashSplit.slice(1).join(" — ").trim()}`);
      } else {
        const colonSplit = item.split(/: /);
        if (colonSplit.length > 1) {
          parts.push(
            `- **${colonSplit[0].trim()}:** ${colonSplit.slice(1).join(": ").trim()}`,
          );
        } else {
          parts.push(`- **${item}**`);
        }
      }
    }
  }

  if (response.sources.length > 0) {
    parts.push(`**Sources:** ${response.sources.join(", ")}`);
  }

  parts.push(DEV_HUB_CLOSING);

  return parts.join("\n\n");
}
