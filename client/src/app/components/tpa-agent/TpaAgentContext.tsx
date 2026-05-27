import React from "react";

import { ChatbotDisplayMode } from "@patternfly/chatbot";
import type { MessageProps } from "@patternfly/chatbot";

import {
  TPA_AGENT_DEFAULT_MODEL,
  type TpaAgentModel,
} from "./constants";
import { formatAgentResponseAsMarkdown } from "./formatAgentResponse";
import { getAgentResponse } from "./mockResponses";

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
  const scrollToBottomRef = React.useRef<HTMLDivElement>(null);

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
        name: "You",
        timestamp,
      };
      const loadingMessage: MessageProps = {
        id: generateMessageId(),
        role: "bot",
        content: "Searching across SBOMs, advisories, and VEX data...",
        name: "TPA Agent",
        isLoading: true,
        timestamp,
      };

      setMessages((current) => [...current, userMessage, loadingMessage]);
      setAnnouncement(
        `Message from you: ${trimmed}. Message from TPA Agent is loading.`,
      );

      window.setTimeout(() => {
        const response = getAgentResponse(trimmed);
        const botMessage: MessageProps = {
          id: generateMessageId(),
          role: "bot",
          content: formatAgentResponseAsMarkdown(response),
          name: "TPA Agent",
          isLoading: false,
          timestamp: new Date().toLocaleString(),
        };

        setMessages((current) => [...current.slice(0, -1), botMessage]);
        setAnnouncement(`Message from TPA Agent: ${response.answer}`);
        setIsSendButtonDisabled(false);
      }, 1500);
    },
    [isSendButtonDisabled],
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
    ],
  );

  return (
    <TpaAgentContext.Provider value={value}>
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
