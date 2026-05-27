import type React from "react";

import {
  Card,
  CardBody,
  Content,
  ContentVariants,
} from "@patternfly/react-core";

export interface TpaAgentWelcomePromptItem {
  title: string;
  description: string;
  onClick: () => void;
}

interface TpaAgentWelcomePromptProps {
  leadText?: string;
  prompts: TpaAgentWelcomePromptItem[];
  isCompact?: boolean;
  title?: string;
}

export const TpaAgentWelcomePrompt: React.FC<TpaAgentWelcomePromptProps> = ({
  title = "How can I help you today?",
  leadText,
  prompts,
  isCompact = false,
}) => {
  const isSinglePrompt = prompts.length === 1;

  return (
    <div
      className={`pf-chatbot--layout--welcome tpa-agent-welcome ${isCompact ? "pf-m-compact" : ""} ${isSinglePrompt ? "tpa-agent-welcome--single" : ""}`}
    >
      <Content component={ContentVariants.h1}>
        <span className="pf-chatbot__hello">{title}</span>
      </Content>
      {leadText && (
        <Content className="tpa-agent-welcome__lead" component="p">
          {leadText}
        </Content>
      )}
      <div className="tpa-agent-welcome__prompts">
        {prompts.map((prompt) => (
          <Card
            key={prompt.title}
            className="tpa-agent-welcome__prompt-card"
            isClickable
            isCompact={isCompact}
            isPlain
            onClick={prompt.onClick}
          >
            <CardBody>
              <Content
                className="tpa-agent-welcome__prompt-title"
                component="h3"
              >
                {prompt.title}
              </Content>
              <Content
                className="tpa-agent-welcome__prompt-description"
                component="p"
              >
                {prompt.description}
              </Content>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
