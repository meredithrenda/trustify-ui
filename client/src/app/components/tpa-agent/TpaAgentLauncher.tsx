import type React from "react";

import { ChatbotToggle } from "@patternfly/chatbot";

import tpaAgentLauncherIcon from "@app/images/rh-ui-ai-chatbot-medium.png";

import {
  TPA_AGENT_POPUP_WELCOME_PROMPTS,
  TPA_INTELLIGENCE_ASSISTANT_SHORT_NAME,
} from "./constants";
import { TpaAgentChatBody } from "./TpaAgentChatBody";
import { useTpaAgent } from "./TpaAgentContext";

export const TpaAgentLauncher: React.FC = () => {
  const { chatbotVisible, displayMode, toggleChatbot } = useTpaAgent();

  return (
    <>
      <ChatbotToggle
        closedToggleIcon={() => (
          <img
            alt=""
            aria-hidden
            className="tpa-agent-launcher-icon"
            src={tpaAgentLauncherIcon}
          />
        )}
        isChatbotVisible={chatbotVisible}
        isRound
        onToggleChatbot={toggleChatbot}
        tooltipLabel={TPA_INTELLIGENCE_ASSISTANT_SHORT_NAME}
        toggleButtonLabel={`Open ${TPA_INTELLIGENCE_ASSISTANT_SHORT_NAME}`}
      />
      <TpaAgentChatBody
        ariaLabel={TPA_INTELLIGENCE_ASSISTANT_SHORT_NAME}
        displayMode={displayMode}
        isVisible={chatbotVisible}
        welcomePrompts={TPA_AGENT_POPUP_WELCOME_PROMPTS}
      />
    </>
  );
};
