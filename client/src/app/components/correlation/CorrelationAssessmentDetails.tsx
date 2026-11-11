import type React from "react";

import {
  Button,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Label,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";

import { CorrelationConflictLabel } from "./CorrelationConflictLabel";
import { correlationVerdictLabels } from "./correlationLabels";
import { MatchConfidenceInfo } from "./MatchConfidenceInfo";
import type { CorrelationAssessment } from "./types";

interface CorrelationAssessmentDetailsProps {
  assessment: CorrelationAssessment;
  onViewEvidence: () => void;
}

/**
 * Expansion content: verdict, conflict (when present), match confidence, and
 * evidence count that opens the evidence drawer.
 */
export const CorrelationAssessmentDetails: React.FC<
  CorrelationAssessmentDetailsProps
> = ({ assessment, onViewEvidence }) => {
  const verdict = correlationVerdictLabels[assessment.verdict];
  const statementLabel =
    assessment.evidenceCount === 1 ? "statement" : "statements";

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h3" size="md">
          Correlation details
        </Title>
      </StackItem>
      <StackItem>
        <DescriptionList isHorizontal isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>Verdict</DescriptionListTerm>
            <DescriptionListDescription>
              <Label color={verdict.color} isCompact>
                {verdict.name}
              </Label>
            </DescriptionListDescription>
          </DescriptionListGroup>
          {assessment.hasConflict && (
            <DescriptionListGroup>
              <DescriptionListTerm>Conflict</DescriptionListTerm>
              <DescriptionListDescription>
                <Flex
                  direction={{ default: "column" }}
                  spaceItems={{ default: "spaceItemsXs" }}
                >
                  <FlexItem>
                    <CorrelationConflictLabel />
                  </FlexItem>
                  <FlexItem>
                    <Content component="small">
                      Advisories disagree on this status. Review the evidence to
                      compare them.
                    </Content>
                  </FlexItem>
                </Flex>
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          <DescriptionListGroup>
            <DescriptionListTerm>Match confidence</DescriptionListTerm>
            <DescriptionListDescription>
              <MatchConfidenceInfo
                matchConfidencePercent={assessment.matchConfidencePercent}
                factors={assessment.factors}
              />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Evidence</DescriptionListTerm>
            <DescriptionListDescription>
              <Button variant="link" isInline onClick={onViewEvidence}>
                {assessment.evidenceCount} {statementLabel}
              </Button>
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </StackItem>
    </Stack>
  );
};
