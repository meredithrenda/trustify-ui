import type React from "react";

import { Button, Card, CardBody, Flex, FlexItem, Title } from "@patternfly/react-core";
import { ChatbotDisplayMode } from "@patternfly/chatbot";

import tpaAgentAiExperienceIconMedium from "@app/images/rh-ui-icon-ai-experience-medium.png";

import {
  TPA_AGENT_HOME_WELCOME_PROMPTS,
  TPA_INTELLIGENCE_ASSISTANT_DISPLAY_NAME,
  TpaAgentChatBody,
  TpaAgentHeaderSettingsMenu,
  TpaAgentModelSelector,
  useTpaAgent,
} from "@app/components/tpa-agent";

import "@app/components/tpa-agent/tpa-agent.css";

export const AskAgentSection: React.FC = () => {
  const { messages, startNewChat } = useTpaAgent();

  return (
    <Card>
      <CardBody>
        <Flex
          alignItems={{ default: "alignItemsCenter" }}
          justifyContent={{ default: "justifyContentSpaceBetween" }}
          gap={{ default: "gapMd" }}
          wrap={{ default: "wrap" }}
        >
          <FlexItem>
            <Flex
              alignItems={{ default: "alignItemsCenter" }}
              gap={{ default: "gapSm" }}
            >
              <FlexItem>
                <img
                  alt=""
                  aria-hidden
                  className="tpa-agent-section__ai-icon"
                  src={tpaAgentAiExperienceIconMedium}
                />
              </FlexItem>
              <FlexItem>
                <Title headingLevel="h2" size="lg">
                  {TPA_INTELLIGENCE_ASSISTANT_DISPLAY_NAME}
                </Title>
              </FlexItem>
            </Flex>
          </FlexItem>
          <FlexItem>
            <Flex
              alignItems={{ default: "alignItemsCenter" }}
              gap={{ default: "gapMd" }}
              justifyContent={{ default: "justifyContentFlexEnd" }}
            >
              {messages.length > 0 && (
                <FlexItem>
                  <Button variant="link" onClick={startNewChat}>
                    Clear conversation
                  </Button>
                </FlexItem>
              )}
              <FlexItem>
                <TpaAgentHeaderSettingsMenu />
              </FlexItem>
              <FlexItem>
                <TpaAgentModelSelector
                  className="tpa-agent-section__model"
                  isCompact
                />
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
        <div className="tpa-agent-embedded tpa-agent-embedded--fill pf-v-u-mt-md">
          <TpaAgentChatBody
            ariaLabel={`${TPA_INTELLIGENCE_ASSISTANT_DISPLAY_NAME} on home`}
            displayMode={ChatbotDisplayMode.embedded}
            isCompact
            isVisible
            showHeader={false}
            welcomePrompts={TPA_AGENT_HOME_WELCOME_PROMPTS}
          />
        </div>
      </CardBody>
    </Card>
  );
};
