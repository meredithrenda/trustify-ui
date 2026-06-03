import type React from "react";

import { ChatbotToggle } from "@patternfly/chatbot";

import { TPA_AGENT_POPUP_WELCOME_PROMPTS } from "./constants";
import { TpaAgentChatBody } from "./TpaAgentChatBody";
import { useTpaAgent } from "./TpaAgentContext";

export const TpaAgentLauncher: React.FC = () => {
  const { chatbotVisible, displayMode, toggleChatbot } = useTpaAgent();

  return (
    <>
      <ChatbotToggle
        isChatbotVisible={chatbotVisible}
        isRound
        onToggleChatbot={toggleChatbot}
        tooltipLabel="TPA Agent"
        toggleButtonLabel="Open TPA Agent"
      />
      <TpaAgentChatBody
        displayMode={displayMode}
        isVisible={chatbotVisible}
        welcomePrompts={TPA_AGENT_POPUP_WELCOME_PROMPTS}
      />
    </>
  );
};
