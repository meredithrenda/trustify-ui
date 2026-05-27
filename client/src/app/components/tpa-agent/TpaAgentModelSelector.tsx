import type React from "react";

import { ChatbotHeaderSelectorDropdown } from "@patternfly/chatbot";

import { DropdownItem, DropdownList } from "@patternfly/react-core";

import {
  TPA_AGENT_MODELS,
  type TpaAgentModel,
} from "./constants";
import { useTpaAgent } from "./TpaAgentContext";

interface TpaAgentModelSelectorProps {
  className?: string;
  isCompact?: boolean;
}

export const TpaAgentModelSelector: React.FC<TpaAgentModelSelectorProps> = ({
  className,
  isCompact = false,
}) => {
  const { selectedModel, setSelectedModel } = useTpaAgent();

  const onSelectModel = (
    _event: React.MouseEvent<Element> | undefined,
    value: string | number | undefined,
  ) => {
    if (
      typeof value === "string" &&
      TPA_AGENT_MODELS.includes(value as TpaAgentModel)
    ) {
      setSelectedModel(value as TpaAgentModel);
    }
  };

  return (
    <ChatbotHeaderSelectorDropdown
      className={className}
      isCompact={isCompact}
      onSelect={onSelectModel}
      tooltipContent="Select model"
      value={selectedModel}
    >
      <DropdownList>
        {TPA_AGENT_MODELS.map((model) => (
          <DropdownItem
            key={model}
            isSelected={selectedModel === model}
            value={model}
          >
            {model}
          </DropdownItem>
        ))}
      </DropdownList>
    </ChatbotHeaderSelectorDropdown>
  );
};
