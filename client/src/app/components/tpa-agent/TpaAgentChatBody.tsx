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
  ChatbotHeaderNewChatButton,
  ChatbotWelcomePrompt,
  Message,
  MessageBar,
  MessageBox,
} from "@patternfly/chatbot";

import {
  TPA_AGENT_FOOTNOTE,
  TPA_AGENT_POPUP_WELCOME_PROMPTS,
  TPA_INTELLIGENCE_ASSISTANT_DISPLAY_NAME,
} from "./constants";
import { TpaAgentHeaderSettingsMenu } from "./TpaAgentHeaderSettingsMenu";
import { TpaAgentModelSelector } from "./TpaAgentModelSelector";
import { TpaAgentContextLabel } from "./TpaAgentContextLabel";
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
  ariaLabel = TPA_INTELLIGENCE_ASSISTANT_DISPLAY_NAME,
  welcomePrompts: welcomePromptsProp,
}) => {
  const {
    announcement,
    contextFocus,
    displayMode: launcherDisplayMode,
    isSendButtonDisabled,
    messages,
    scrollToBottomRef,
    sendMessage,
    startNewChat,
    usePageContext,
  } = useTpaAgent();

  const activeDisplayMode =
    displayMode === ChatbotDisplayMode.embedded
      ? displayMode
      : launcherDisplayMode;

  /** Compact input/header only — PF default message avatars are 3rem, not 1.5rem compact. */
  const useCompactInputChrome =
    isCompact || activeDisplayMode !== ChatbotDisplayMode.fullscreen;

  const welcomePromptSource =
    welcomePromptsProp ?? TPA_AGENT_POPUP_WELCOME_PROMPTS;

  const welcomePrompts = React.useMemo(() => {
    if (contextFocus?.suggestedPrompt) {
      const suggestedPrompt = contextFocus.suggestedPrompt;
      return [
        {
          title: contextFocus.label,
          message: suggestedPrompt,
          onClick: () => sendMessage(suggestedPrompt),
        },
      ];
    }
    return welcomePromptSource.map((prompt) => ({
      title: prompt.title,
      message: prompt.description,
      onClick: () => sendMessage(prompt.description),
    }));
  }, [contextFocus, welcomePromptSource, sendMessage]);

  return (
    <Chatbot
      ariaLabel={ariaLabel}
      className={`tpa-agent-chat${showHeader ? " tpa-agent-chat--popup" : ""}`}
      displayMode={activeDisplayMode}
      isCompact={false}
      isVisible={isVisible}
    >
      {showHeader ? (
        <ChatbotHeader>
          <ChatbotHeaderMain>
            <ChatbotHeaderNewChatButton
              isCompact
              isDisabled={
                messages.length === 0 && !contextFocus && !usePageContext
              }
              menuAriaLabel="Start a new chat"
              onClick={startNewChat}
              tooltipContent="New chat"
            />
          </ChatbotHeaderMain>
          <ChatbotHeaderActions>
            <TpaAgentModelSelector
              className="tpa-agent-header__model"
              isCompact={useCompactInputChrome}
            />
            <TpaAgentHeaderSettingsMenu isCompact />
          </ChatbotHeaderActions>
        </ChatbotHeader>
      ) : null}
      <ChatbotContent isPrimary>
        <MessageBox announcement={announcement}>
          {messages.length === 0 && (
            <ChatbotWelcomePrompt
              className={`tpa-agent-welcome${welcomePrompts.length === 1 ? " tpa-agent-welcome--single" : ""}`}
              description="Ask about SBOMs, advisories, VEX, or policy. Prototype responses only—do not share sensitive data."
              isCompact={useCompactInputChrome}
              prompts={welcomePrompts}
              title="How can I help you today?"
            />
          )}
          {messages.map((message, index) => {
            if (index === messages.length - 1) {
              return (
                <React.Fragment key={message.id}>
                  <div ref={scrollToBottomRef} />
                  <Message {...message} isCompact={false} isPrimary />
                </React.Fragment>
              );
            }
            return (
              <Message key={message.id} {...message} isCompact={false} isPrimary />
            );
          })}
        </MessageBox>
      </ChatbotContent>
      <ChatbotFooter isCompact={useCompactInputChrome} isPrimary>
        <MessageBar
          alwayShowSendButton
          className="tpa-agent-message-bar"
          displayMode={activeDisplayMode}
          hasAttachButton
          isCompact={useCompactInputChrome}
          isSendButtonDisabled={isSendButtonDisabled}
          onSendMessage={sendMessage}
          placeholder="Send a message..."
        />
        <div className="tpa-agent-message-bar-toolbar">
          <TpaAgentContextLabel />
        </div>
        <ChatbotFootnote {...TPA_AGENT_FOOTNOTE} />
      </ChatbotFooter>
    </Chatbot>
  );
};
