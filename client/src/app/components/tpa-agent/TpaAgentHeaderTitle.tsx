import type React from "react";

import { Title } from "@patternfly/react-core";

import { TPA_INTELLIGENCE_ASSISTANT_DISPLAY_NAME } from "./constants";

interface TpaAgentHeaderTitleProps {
  title?: string;
}

export const TpaAgentHeaderTitle: React.FC<TpaAgentHeaderTitleProps> = ({
  title = TPA_INTELLIGENCE_ASSISTANT_DISPLAY_NAME,
}) => {
  return (
    <div className="pf-chatbot__title tpa-agent-header__title">
      <Title
        className="tpa-agent-header__title-text"
        headingLevel="h2"
        size="md"
      >
        {title}
      </Title>
    </div>
  );
};
