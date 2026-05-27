import type { AgentResponse } from "./mockResponses";

export function formatAgentResponseAsMarkdown(response: AgentResponse): string {
  const severityLine = response.severity
    ? `**Severity:** ${response.severity.toUpperCase()}\n\n`
    : "";

  let markdown = `${severityLine}**${response.answer}**\n\n${response.detail}`;

  if (response.items && response.items.length > 0) {
    markdown += "\n\n**Affected items**\n";
    for (const item of response.items) {
      markdown += `- ${item}\n`;
    }
  }

  if (response.sources.length > 0) {
    markdown += `\n\n**Sources:** ${response.sources.join(", ")}`;
  }

  return markdown;
}
