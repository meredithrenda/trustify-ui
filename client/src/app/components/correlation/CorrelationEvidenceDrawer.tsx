import type React from "react";
import { generatePath, Link } from "react-router-dom";

import {
  Card,
  CardBody,
  CardTitle,
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
} from "@patternfly/react-core";

import { Paths } from "@app/Routes";

import {
  correlationAssertionStatusLabels,
  correlationProviderMatchLabels,
  correlationRemediationCategoryLabels,
} from "./correlationLabels";
import { MatchConfidenceInfo } from "./MatchConfidenceInfo";
import type { CorrelationAssessment, CorrelationEvidenceDetail } from "./types";

export type CorrelationEvidenceDrawerProps = {
  vulnerabilityId: string;
  assessment: CorrelationAssessment;
};

const EvidenceRemediations: React.FC<{
  remediations: CorrelationEvidenceDetail["remediations"];
}> = ({ remediations }) => {
  if (remediations.length === 0) {
    return <>--</>;
  }

  return (
    <Stack>
      {remediations.map((remediation) => {
        const label =
          correlationRemediationCategoryLabels[remediation.category];
        const text = remediation.details
          ? remediation.category === "vendor_fix"
            ? remediation.details
            : `${label}: ${remediation.details}`
          : label;

        return (
          <Content component="p" key={`${label}-${text}`}>
            {remediation.url ? (
              <a href={remediation.url} target="_blank" rel="noreferrer">
                {text}
              </a>
            ) : (
              text
            )}
          </Content>
        );
      })}
    </Stack>
  );
};

const EvidenceStatementCard: React.FC<{
  item: CorrelationEvidenceDetail;
}> = ({ item }) => {
  const status = correlationAssertionStatusLabels[item.assertionStatus];
  const providerMatch = item.providerMatch
    ? correlationProviderMatchLabels[item.providerMatch]
    : null;

  return (
    <Card isCompact>
      <CardTitle>
        <Flex
          spaceItems={{ default: "spaceItemsMd" }}
          alignItems={{ default: "alignItemsCenter" }}
          flexWrap={{ default: "wrap" }}
        >
          <FlexItem>
            <Link
              to={generatePath(Paths.advisoryDetails, {
                advisoryId: item.advisoryId,
              })}
            >
              {item.advisoryIdentifier}
            </Link>
          </FlexItem>
          <FlexItem>
            <Label color={status.color} isCompact>
              {status.name}
            </Label>
          </FlexItem>
        </Flex>
      </CardTitle>
      <CardBody>
        <DescriptionList isHorizontal isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>Confidence</DescriptionListTerm>
            <DescriptionListDescription>
              <MatchConfidenceInfo
                matchConfidencePercent={item.confidencePercent}
                factors={item.confidenceFactors}
              />
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Matched value</DescriptionListTerm>
            <DescriptionListDescription>
              {item.matchedValue ? (
                <Stack>
                  <code style={{ overflowWrap: "anywhere" }}>
                    {item.matchedValue.identifier}
                  </code>
                  {item.matchedValue.ranges?.map((range) => (
                    <Content component="small" key={range}>
                      {range}
                    </Content>
                  ))}
                </Stack>
              ) : (
                <>--</>
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Product</DescriptionListTerm>
            <DescriptionListDescription>
              {item.products.length === 0 ? (
                <>--</>
              ) : (
                <Stack>
                  {item.products.map((product) => (
                    <Content component="p" key={product.name}>
                      {product.name}
                    </Content>
                  ))}
                </Stack>
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Provider</DescriptionListTerm>
            <DescriptionListDescription>
              <Flex
                direction={{ default: "column" }}
                spaceItems={{ default: "spaceItemsXs" }}
              >
                <FlexItem>{item.providerName}</FlexItem>
                {providerMatch && (
                  <FlexItem>
                    <Label color={providerMatch.color} isCompact>
                      {providerMatch.name}
                    </Label>
                  </FlexItem>
                )}
              </Flex>
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Remediations</DescriptionListTerm>
            <DescriptionListDescription>
              <EvidenceRemediations remediations={item.remediations} />
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

/**
 * Right drawer listing correlation evidence as stacked statement details
 * (vertical primary-detail, suited to a side drawer).
 */
export const CorrelationEvidenceDrawer: React.FC<
  CorrelationEvidenceDrawerProps
> = ({ vulnerabilityId, assessment }) => {
  const statementLabel =
    assessment.evidence.length === 1 ? "statement" : "statements";

  return (
    <Stack hasGutter>
      <StackItem>
        <Content component="p">
          <strong>{assessment.evidence.length}</strong> {statementLabel} for{" "}
          <strong>{vulnerabilityId}</strong>
        </Content>
        {assessment.hasConflict && (
          <Content component="small">
            Advisories disagree on this status. Compare the statements below.
          </Content>
        )}
      </StackItem>
      {assessment.evidence.length === 0 ? (
        <StackItem>
          <Content component="p">No evidence statements available.</Content>
        </StackItem>
      ) : (
        assessment.evidence.map((item) => (
          <StackItem key={item.id}>
            <EvidenceStatementCard item={item} />
          </StackItem>
        ))
      )}
    </Stack>
  );
};
