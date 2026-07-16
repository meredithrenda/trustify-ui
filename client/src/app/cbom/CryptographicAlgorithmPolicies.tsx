import type React from "react";

import {
  Card,
  CardBody,
  CardTitle,
  Content,
  Grid,
  GridItem,
  Label,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";

import {
  cryptoAlgorithmPolicyStatusLabel,
  getCryptographicAlgorithmPolicyPosture,
} from "./cryptoAlgorithmPolicies";
import type { CryptographicAsset } from "./types";

import "./cryptographic-algorithm-policies.css";

export interface CryptographicAlgorithmPoliciesProps {
  assets: CryptographicAsset[];
}

export const CryptographicAlgorithmPolicies: React.FC<
  CryptographicAlgorithmPoliciesProps
> = ({ assets }) => {
  const policies = getCryptographicAlgorithmPolicyPosture(assets);

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2" size="lg">
          Cryptographic algorithm policies
        </Title>
      </StackItem>
      <StackItem>
        <Grid hasGutter>
          {policies.map((policy) => {
            const status = cryptoAlgorithmPolicyStatusLabel[policy.status];

            return (
              <GridItem key={policy.id} sm={12} md={6} lg={3}>
                <Card isFullHeight>
                  <CardTitle className="crypto-algorithm-policies__card-title">
                    <span>{policy.name}</span>
                    <Label color={status.color} isCompact>
                      {status.text}
                    </Label>
                  </CardTitle>
                  <CardBody>
                    <Title headingLevel="h3" size="2xl">
                      {policy.metric}
                    </Title>
                    <Content component="small">{policy.summary}</Content>
                  </CardBody>
                </Card>
              </GridItem>
            );
          })}
        </Grid>
      </StackItem>
    </Stack>
  );
};

/** @deprecated Use CryptographicAlgorithmPolicies */
export const CryptographyPolicySection: React.FC<
  Pick<CryptographicAlgorithmPoliciesProps, "assets">
> = ({ assets }) => <CryptographicAlgorithmPolicies assets={assets} />;
