/** Strip SCANOSS match prefix from CycloneDX additionalContext for readable snippets. */
export function formatEvidenceContext(
  raw: string | undefined,
): string | undefined {
  if (!raw) {
    return undefined;
  }
  const trimmed = raw.trim();
  if (trimmed.startsWith("scanoss:match,")) {
    return trimmed.slice("scanoss:match,".length);
  }
  return trimmed;
}
