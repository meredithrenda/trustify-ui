import type React from "react";

import { Button, Icon, Tooltip } from "@patternfly/react-core";

import type { TpaAgentContextFocus } from "./agentContextFocus";
import { TPA_INTELLIGENCE_ASSISTANT_SHORT_NAME } from "./constants";
import { TpaAgentChatIcon } from "./TpaAgentChatIcon";
import { useTpaAgent } from "./TpaAgentContext";

interface TpaAgentAskActionProps {
  focus: TpaAgentContextFocus;
  /** Accessible label; defaults to asking about `focus.label`. */
  ariaLabel?: string;
}

export const TpaAgentAskAction: React.FC<TpaAgentAskActionProps> = ({
  focus,
  ariaLabel,
}) => {
  const { openAgentWithFocus } = useTpaAgent();
  const label =
    ariaLabel ??
    `Ask ${TPA_INTELLIGENCE_ASSISTANT_SHORT_NAME} about ${focus.label}`;

  return (
    <Tooltip content={label}>
      <Button
        type="button"
        variant="plain"
        className="tpa-agent-ask-action"
        aria-label={label}
        icon={
          <Icon isInline>
            <TpaAgentChatIcon className="tpa-agent-chat-icon" />
          </Icon>
        }
        onClick={() => openAgentWithFocus(focus)}
      />
    </Tooltip>
  );
};
