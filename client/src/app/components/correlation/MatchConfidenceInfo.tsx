import type React from "react";

import {
  Button,
  Content,
  Flex,
  FlexItem,
  List,
  ListItem,
  Popover,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { OutlinedQuestionCircleIcon } from "@patternfly/react-icons";

import type { CorrelationConfidenceFactor } from "./types";

interface MatchConfidenceInfoProps {
  matchConfidencePercent: number;
  factors: CorrelationConfidenceFactor[];
}

/**
 * Match confidence percent with info popover (mirrors eng correlation console).
 * Conflict belongs in Correlation details, not beside confidence.
 */
export const MatchConfidenceInfo: React.FC<MatchConfidenceInfoProps> = ({
  matchConfidencePercent,
  factors,
}) => {
  return (
    <Flex
      spaceItems={{ default: "spaceItemsXs" }}
      alignItems={{ default: "alignItemsCenter" }}
      flexWrap={{ default: "nowrap" }}
    >
      <FlexItem>
        <Content component="p">
          <strong>{matchConfidencePercent}%</strong>
        </Content>
      </FlexItem>
      <FlexItem>
        <Popover
          aria-label="How the match confidence comes about"
          headerContent="How the match confidence comes about"
          hasAutoWidth
          bodyContent={
            <Stack hasGutter>
              <StackItem>
                <List isPlain>
                  {factors.map((factor, index) => {
                    const percent = Math.round(factor.factor * 100);
                    return (
                      <ListItem key={factor.label}>
                        <Content component="p">
                          <strong>
                            {index === 0 ? "" : "× "}
                            {percent}%
                          </strong>{" "}
                          {factor.label}
                        </Content>
                        <Content component="small">
                          {factor.description}
                        </Content>
                      </ListItem>
                    );
                  })}
                </List>
              </StackItem>
              <StackItem>
                <Content component="small">
                  Match confidence is the product of these factors. The
                  percentages are matching heuristics, not the probability that
                  the component is vulnerable.
                </Content>
              </StackItem>
            </Stack>
          }
        >
          <Button
            variant="link"
            isInline
            aria-label="How the match confidence comes about"
            icon={<OutlinedQuestionCircleIcon />}
          />
        </Popover>
      </FlexItem>
    </Flex>
  );
};
