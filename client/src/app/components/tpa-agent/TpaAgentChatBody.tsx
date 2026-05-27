import React from "react";

import {
  Chatbot,
  ChatbotContent,
  ChatbotDisplayMode,
  ChatbotFooter,
  ChatbotFootnote,
  ChatbotHeader,
  ChatbotHeaderActions,
  ChatbotHeaderMain,
  Message,
  MessageBar,
  MessageBox,
} from "@patternfly/chatbot";

import { TPA_AGENT_FOOTNOTE, TPA_AGENT_POPUP_WELCOME_PROMPTS } from "./constants";
import type { TpaAgentWelcomePromptItem } from "./TpaAgentWelcomePrompt";
import { TpaAgentHeaderSettingsMenu } from "./TpaAgentHeaderSettingsMenu";
import { TpaAgentHeaderTitle } from "./TpaAgentHeaderTitle";
import { TpaAgentModelSelector } from "./TpaAgentModelSelector";
import { TpaAgentWelcomePrompt } from "./TpaAgentWelcomePrompt";
import { useTpaAgent } from "./TpaAgentContext";

import "./tpa-agent.css";

interface TpaAgentChatBodyProps {
  displayMode: ChatbotDisplayMode;
  isVisible?: boolean;
  isCompact?: boolean;
  /** When false, omits chatbot header. Use on Home where the card already provides context. */
  showHeader?: boolean;
  ariaLabel?: string;
  /** Override default welcome prompts (e.g. three cards on Home). */
  welcomePrompts?: Array<{
    title: string;
    description: string;
  }>;
}

export const TpaAgentChatBody: React.FC<TpaAgentChatBodyProps> = ({
  displayMode,
  isVisible = true,
  isCompact = false,
  showHeader = true,
  ariaLabel = "TPA Agent",
  welcomePrompts: welcomePromptsProp,
}) => {
  const {
    announcement,
    displayMode: launcherDisplayMode,
    isSendButtonDisabled,
    messages,
    scrollToBottomRef,
    sendMessage,
  } = useTpaAgent();

  const activeDisplayMode =
    displayMode === ChatbotDisplayMode.embedded
      ? displayMode
      : launcherDisplayMode;

  const useCompactChrome =
    isCompact || activeDisplayMode !== ChatbotDisplayMode.fullscreen;

  const welcomePromptSource =
    welcomePromptsProp ?? TPA_AGENT_POPUP_WELCOME_PROMPTS;
  const welcomePrompts: TpaAgentWelcomePromptItem[] =
    welcomePromptSource.map((prompt) => ({
      title: prompt.title,
      description: prompt.description,
      onClick: () => sendMessage(prompt.description),
    }));

  return (
    <Chatbot
      ariaLabel={ariaLabel}
      className={`tpa-agent-chat${showHeader ? " tpa-agent-chat--popup" : ""}`}
      displayMode={activeDisplayMode}
      isCompact={useCompactChrome}
      isVisible={isVisible}
    >
      {showHeader ? (
        <ChatbotHeader>
          <ChatbotHeaderMain>
            <TpaAgentHeaderTitle />
          </ChatbotHeaderMain>
          <ChatbotHeaderActions>
            <TpaAgentHeaderSettingsMenu />
            <TpaAgentModelSelector
              className="tpa-agent-header__model"
              isCompact={useCompactChrome}
            />
          </ChatbotHeaderActions>
        </ChatbotHeader>
      ) : null}
      <ChatbotContent isPrimary>
        <MessageBox announcement={announcement}>
          {messages.length === 0 && (
            <TpaAgentWelcomePrompt
              isCompact={useCompactChrome}
              leadText="Ask about SBOMs, advisories, VEX, or policy. Prototype responses only—do not share sensitive data."
              prompts={welcomePrompts}
            />
          )}
          {messages.map((message, index) => {
            if (index === messages.length - 1) {
              return (
                <React.Fragment key={message.id}>
                  <div ref={scrollToBottomRef} />
                  <Message {...message} isPrimary />
                </React.Fragment>
              );
            }
            return <Message key={message.id} {...message} isPrimary />;
          })}
        </MessageBox>
      </ChatbotContent>
      <ChatbotFooter isCompact={useCompactChrome} isPrimary>
        <MessageBar
          alwayShowSendButton
          className="tpa-agent-message-bar"
          displayMode={activeDisplayMode}
          hasAttachButton
          isCompact={useCompactChrome}
          isSendButtonDisabled={isSendButtonDisabled}
          onSendMessage={sendMessage}
          placeholder="Send a message..."
        />
        <ChatbotFootnote {...TPA_AGENT_FOOTNOTE} />
      </ChatbotFooter>
    </Chatbot>
  );
};
