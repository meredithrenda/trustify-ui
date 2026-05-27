import type React from "react";

import { Flex, FlexItem, Title } from "@patternfly/react-core";

import tpaAgentAiIcon from "@app/images/tpa-agent-ai-icon.png";

export const TpaAgentHeaderTitle: React.FC = () => {
  return (
    <div className="pf-chatbot__title tpa-agent-header__title">
      <Flex
        alignItems={{ default: "alignItemsCenter" }}
        gap={{ default: "gapSm" }}
      >
        <FlexItem>
          <img
            alt=""
            aria-hidden
            className="tpa-agent-section__ai-icon"
            src={tpaAgentAiIcon}
          />
        </FlexItem>
        <FlexItem>
          <Title
            className="tpa-agent-header__title-text"
            headingLevel="h2"
            size="md"
          >
            TPA Agent
          </Title>
        </FlexItem>
      </Flex>
    </div>
  );
};
