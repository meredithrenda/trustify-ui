import type React from "react";

import {
  Card,
  CardBody,
  CardTitle,
  Content,
  Grid,
  GridItem,
  Skeleton,
  Title,
} from "@patternfly/react-core";

import { getCryptographicAlgorithmPolicyPosture } from "./cryptoAlgorithmPolicies";
import type { CryptographicAsset } from "./types";

export interface CryptographicAlgorithmPoliciesProps {
  assets: CryptographicAsset[];
  /** Workspace inventory shows SBOM-level readiness; single-SBOM views omit it. */
  includeSbomsMeetingPolicy?: boolean;
  isRecalculating?: boolean;
}

export const CryptographicAlgorithmPolicies: React.FC<
  CryptographicAlgorithmPoliciesProps
> = ({
  assets,
  includeSbomsMeetingPolicy = true,
  isRecalculating = false,
}) => {
  const policies = getCryptographicAlgorithmPolicyPosture(assets, {
    includeSbomsMeetingPolicy,
  });

  return (
    <Grid hasGutter>
      {policies.map((policy) => (
        <GridItem key={policy.id} sm={12} md={6} lg={3}>
          <Card isFullHeight>
            <CardTitle>{policy.name}</CardTitle>
            <CardBody>
              {isRecalculating ? (
                <>
                  <Skeleton fontSize="2xl" width="25%" />
                  <Content component="small">Recalculating…</Content>
                </>
              ) : (
                <>
                  <Title headingLevel="h3" size="2xl">
                    {policy.percent}%
                  </Title>
                  <Content component="small">{policy.summary}</Content>
                </>
              )}
            </CardBody>
          </Card>
        </GridItem>
      ))}
    </Grid>
  );
};

/** @deprecated Use CryptographicAlgorithmPolicies */
export const CryptographyPolicySection: React.FC<
  Pick<CryptographicAlgorithmPoliciesProps, "assets">
> = ({ assets }) => <CryptographicAlgorithmPolicies assets={assets} />;
