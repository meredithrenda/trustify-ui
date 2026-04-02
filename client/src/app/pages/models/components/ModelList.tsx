import React from "react";

import {
  Content,
  Flex,
  FlexItem,
  Label,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";

import type { AIModel } from "../types";

const riskColor = (
  risk: string
): "red" | "orange" | "green" | "grey" => {
  switch (risk) {
    case "High risk":
      return "red";
    case "Medium risk":
      return "orange";
    case "Low risk":
      return "green";
    default:
      return "grey";
  }
};

interface Props {
  models: AIModel[];
  onSelectModel: (model: AIModel | null) => void;
}

export const ModelList: React.FC<Props> = ({ models, onSelectModel }) => {
  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h3" size="md">
          Models
        </Title>
      </StackItem>
      {models.map((model) => (
        <StackItem key={model.id}>
          <Flex
            justifyContent={{
              default: "justifyContentSpaceBetween",
            }}
            alignItems={{ default: "alignItemsFlexStart" }}
            style={{
              borderBottom:
                "1px solid var(--pf-v6-global--BorderColor--100)",
              paddingBottom: "var(--pf-v6-global--spacer--md)",
            }}
          >
            <FlexItem>
              <Stack>
                <StackItem>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectModel(model);
                    }}
                    style={{
                      fontSize: "var(--pf-v6-global--FontSize--md)",
                    }}
                  >
                    {model.name}
                  </a>
                </StackItem>
                <StackItem>
                  <Content
                    component="small"
                    style={{
                      color: "var(--pf-v6-global--Color--200)",
                    }}
                  >
                    {model.purl}
                  </Content>
                </StackItem>
                <StackItem>
                  <Content
                    component="small"
                    style={{
                      color: "var(--pf-v6-global--Color--200)",
                    }}
                  >
                    Supplied by: {model.suppliedBy}
                    &nbsp;&nbsp;&nbsp;License: {model.license}
                  </Content>
                </StackItem>
              </Stack>
            </FlexItem>
            <FlexItem>
              <Label color={riskColor(model.risk)}>
                {model.risk}
              </Label>
            </FlexItem>
          </Flex>
        </StackItem>
      ))}
      {models.length === 0 && (
        <StackItem>
          <Content component="p">
            No AI models found in this SBOM.
          </Content>
        </StackItem>
      )}
    </Stack>
  );
};
