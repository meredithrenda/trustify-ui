import React from "react";

import { ChatbotDisplayMode } from "@patternfly/chatbot";
import type { MessageProps } from "@patternfly/chatbot";

import {
  TPA_AGENT_DEFAULT_MODEL,
  TPA_AGENT_MESSAGE_USER_NAME,
  TPA_INTELLIGENCE_ASSISTANT_DISPLAY_NAME,
  type TpaAgentModel,
} from "./constants";
import {
  tpaAgentBotAvatarSrc,
  tpaAgentUserAvatarProps,
  tpaAgentUserAvatarSrc,
} from "./messageDisplay";
import {
  buildAgentThinkingBody,
  formatAgentResponseAsMarkdown,
} from "./formatAgentResponse";
import { getAgentResponse } from "./mockResponses";
import type { TpaAgentContextFocus } from "./agentContextFocus";
import type { TpaPageContext } from "./pageContext";
import { TpaAgentPageContextSync } from "./TpaAgentPageContextSync";

const generateMessageId = () => `${Date.now()}-${Math.random()}`;

interface TpaAgentContextValue {
  chatbotVisible: boolean;
  setChatbotVisible: (visible: boolean) => void;
  toggleChatbot: () => void;
  openChatbot: () => void;
  displayMode: ChatbotDisplayMode;
  setDisplayMode: (mode: ChatbotDisplayMode) => void;
  messages: MessageProps[];
  announcement: string | undefined;
  isSendButtonDisabled: boolean;
  sendMessage: (message: string) => void;
  startNewChat: () => void;
  scrollToBottomRef: React.RefObject<HTMLDivElement | null>;
  selectedModel: TpaAgentModel;
  setSelectedModel: (model: TpaAgentModel) => void;
  pageContext: TpaPageContext | null;
  setPageContext: (context: TpaPageContext | null) => void;
  contextFocus: TpaAgentContextFocus | null;
  usePageContext: boolean;
  togglePageContext: () => void;
  openAgentWithFocus: (focus: TpaAgentContextFocus) => void;
  clearContextFocus: () => void;
}

const TpaAgentContext = React.createContext<TpaAgentContextValue | undefined>(
  undefined,
);

export const TpaAgentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [chatbotVisible, setChatbotVisible] = React.useState(false);
  const [displayMode, setDisplayMode] = React.useState<ChatbotDisplayMode>(
    ChatbotDisplayMode.default,
  );
  const [messages, setMessages] = React.useState<MessageProps[]>([]);
  const [announcement, setAnnouncement] = React.useState<string>();
  const [isSendButtonDisabled, setIsSendButtonDisabled] = React.useState(false);
  const [selectedModel, setSelectedModel] = React.useState<TpaAgentModel>(
    TPA_AGENT_DEFAULT_MODEL,
  );
  const [pageContext, setPageContext] = React.useState<TpaPageContext | null>(
    null,
  );
  const [contextFocus, setContextFocus] =
    React.useState<TpaAgentContextFocus | null>(null);
  const [usePageContext, setUsePageContext] = React.useState(false);
  const scrollToBottomRef = React.useRef<HTMLDivElement>(null);

  const clearContextFocus = React.useCallback(() => {
    setContextFocus(null);
  }, []);

  const togglePageContext = React.useCallback(() => {
    if (contextFocus) {
      setContextFocus(null);
      setUsePageContext(false);
      return;
    }
    setUsePageContext((current) => {
      if (current) {
        return false;
      }
      return pageContext !== null;
    });
  }, [contextFocus, pageContext]);

  const openAgentWithFocus = React.useCallback((focus: TpaAgentContextFocus) => {
    setContextFocus(focus);
    setUsePageContext(true);
    setChatbotVisible(true);
  }, []);

  React.useEffect(() => {
    if (!pageContext && !contextFocus) {
      setUsePageContext(false);
    }
  }, [pageContext, contextFocus]);

  React.useEffect(() => {
    if (messages.length > 0) {
      scrollToBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = React.useCallback(
    (message: string) => {
      const trimmed = message.trim();
      if (!trimmed || isSendButtonDisabled) {
        return;
      }

      setIsSendButtonDisabled(true);
      const timestamp = new Date().toLocaleString();
      const userMessage: MessageProps = {
        id: generateMessageId(),
        role: "user",
        content: trimmed,
        name: TPA_AGENT_MESSAGE_USER_NAME,
        avatar: tpaAgentUserAvatarSrc,
        avatarProps: tpaAgentUserAvatarProps,
        timestamp,
        hasRoundAvatar: true,
      };
      const loadingMessage: MessageProps = {
        id: generateMessageId(),
        role: "bot",
        content: "",
        name: selectedModel,
        avatar: tpaAgentBotAvatarSrc,
        avatarProps: { isBordered: false },
        isLoading: true,
        timestamp,
        hasRoundAvatar: false,
      };

      setMessages((current) => [...current, userMessage, loadingMessage]);
      setAnnouncement(
        `Message from you: ${trimmed}. Message from ${TPA_INTELLIGENCE_ASSISTANT_DISPLAY_NAME} is loading.`,
      );

      window.setTimeout(() => {
        const response = getAgentResponse(trimmed, {
          pageContext: usePageContext ? pageContext : null,
          contextFocus: usePageContext ? contextFocus : null,
        });
        const botMessage: MessageProps = {
          id: generateMessageId(),
          role: "bot",
          content: formatAgentResponseAsMarkdown(response, {
            userQuery: trimmed,
          }),
          name: selectedModel,
          avatar: tpaAgentBotAvatarSrc,
          avatarProps: { isBordered: false },
          isLoading: false,
          timestamp: new Date().toLocaleString(),
          hasRoundAvatar: false,
          deepThinking: {
            toggleContent: "Show thinking",
            isDefaultExpanded: false,
            subheading: "Reviewed trust and vulnerability context",
            body: buildAgentThinkingBody(response, trimmed),
          },
        };

        setMessages((current) => [...current.slice(0, -1), botMessage]);
        setAnnouncement(
          `Message from ${TPA_INTELLIGENCE_ASSISTANT_DISPLAY_NAME}: ${response.answer}`,
        );
        setIsSendButtonDisabled(false);
      }, 1500);
    },
    [
      isSendButtonDisabled,
      usePageContext,
      pageContext,
      contextFocus,
      selectedModel,
    ],
  );

  const startNewChat = React.useCallback(() => {
    setMessages([]);
    setAnnouncement(undefined);
    setIsSendButtonDisabled(false);
  }, []);

  const value = React.useMemo<TpaAgentContextValue>(
    () => ({
      chatbotVisible,
      setChatbotVisible,
      toggleChatbot: () => setChatbotVisible((visible) => !visible),
      openChatbot: () => setChatbotVisible(true),
      displayMode,
      setDisplayMode,
      messages,
      announcement,
      isSendButtonDisabled,
      sendMessage,
      startNewChat,
      scrollToBottomRef,
      selectedModel,
      setSelectedModel,
      pageContext,
      setPageContext,
      contextFocus,
      usePageContext,
      togglePageContext,
      openAgentWithFocus,
      clearContextFocus,
    }),
    [
      chatbotVisible,
      displayMode,
      messages,
      announcement,
      isSendButtonDisabled,
      sendMessage,
      startNewChat,
      selectedModel,
      pageContext,
      contextFocus,
      usePageContext,
      togglePageContext,
      openAgentWithFocus,
      clearContextFocus,
    ],
  );

  return (
    <TpaAgentContext.Provider value={value}>
      <TpaAgentPageContextSync />
      {children}
    </TpaAgentContext.Provider>
  );
};

export const useTpaAgent = (): TpaAgentContextValue => {
  const context = React.useContext(TpaAgentContext);
  if (!context) {
    throw new Error("useTpaAgent must be used within TpaAgentProvider");
  }
  return context;
};
