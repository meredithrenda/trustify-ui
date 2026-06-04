import type React from "react";

import { Button, Tooltip } from "@patternfly/react-core";

import { useTpaAgent } from "./TpaAgentContext";

export const TpaAgentContextLabel: React.FC = () => {
  const { pageContext, contextFocus, usePageContext, togglePageContext } =
    useTpaAgent();

  const hasPageContext = pageContext !== null;
  const isOn = usePageContext && (contextFocus !== null || hasPageContext);

  const label = contextFocus
    ? `Context: ${contextFocus.label}`
    : isOn
      ? "Context: on"
      : "Context: off";

  const tooltip = contextFocus
    ? `${contextFocus.summary}. Click to turn off.`
    : isOn && pageContext
      ? `Using page context: ${pageContext.summary}. Click to turn off.`
      : hasPageContext
        ? "Page context is off. Click to include data from this page in your prompts."
        : "No page context is available on this screen.";

  return (
    <Tooltip content={tooltip}>
      <Button
        type="button"
        variant="plain"
        className={`tpa-agent-context-label${isOn ? " tpa-agent-context-label--on" : ""}`}
        onClick={togglePageContext}
        aria-pressed={isOn}
        aria-label={tooltip}
        isDisabled={!hasPageContext && contextFocus === null}
      >
        {label}
      </Button>
    </Tooltip>
  );
};
