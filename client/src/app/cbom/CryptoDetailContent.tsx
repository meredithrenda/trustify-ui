import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

import {
  Button,
  Card,
  CardBody,
  CardTitle,
  CodeBlock,
  CodeBlockCode,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Flex,
  FlexItem,
  Label,
  Stack,
  StackItem,
} from "@patternfly/react-core";

import { CBOM_ROUTE_PATHS } from "./paths";

import {
  cryptoAlgorithmPolicyStatusLabel,
  cryptoAssetPolicyVerdictLabel,
  getCryptoAssetPolicyResults,
  getCryptoAssetPolicyVerdict,
} from "./cryptoAlgorithmPolicies";
import {
  formatPrimitiveCell,
  getAssetTypeColor,
  getAssetTypeLabel,
  getUsageTypeColor,
} from "./display";
import type { CryptographicAsset } from "./types";

const EVIDENCE_PAGE_SIZE = 10;

export type CryptoDetailViewContext = "inventory" | "sbom";

export const CryptoDetailContent: React.FC<{
  asset: CryptographicAsset;
  viewContext?: CryptoDetailViewContext;
}> = ({ asset, viewContext = "inventory" }) => {
  const [evidenceVisibleCount, setEvidenceVisibleCount] =
    useState(EVIDENCE_PAGE_SIZE);

  const unlinkedMessage =
    viewContext === "sbom"
      ? "Not linked to another SBOM in this workspace."
      : "Not linked to an SBOM in this workspace.";

  const policyResults = getCryptoAssetPolicyResults(asset);
  const policyVerdict = getCryptoAssetPolicyVerdict(asset);
  const verdictLabel = cryptoAssetPolicyVerdictLabel[policyVerdict];

  const visibleEvidence = asset.evidence?.slice(0, evidenceVisibleCount) ?? [];
  const hasMoreEvidence = (asset.evidence?.length ?? 0) > evidenceVisibleCount;

  const scannerLine = [asset.scannerName, asset.scannerVersion]
    .filter(Boolean)
    .join(" ");

  return (
    <Stack hasGutter>
      <StackItem>
        <Card>
          <CardTitle>Summary</CardTitle>
          <CardBody>
            <DescriptionList
              isHorizontal
              isCompact
              horizontalTermWidthModifier={{ default: "14ch" }}
            >
              <DescriptionListGroup>
                <DescriptionListTerm>Name</DescriptionListTerm>
                <DescriptionListDescription>
                  {asset.name}
                </DescriptionListDescription>
              </DescriptionListGroup>
              {asset.description ? (
                <DescriptionListGroup>
                  <DescriptionListTerm>Description</DescriptionListTerm>
                  <DescriptionListDescription>
                    {asset.description}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              ) : null}
              <DescriptionListGroup>
                <DescriptionListTerm>Asset type</DescriptionListTerm>
                <DescriptionListDescription>
                  <Label color={getAssetTypeColor(asset.assetType)} isCompact>
                    {getAssetTypeLabel(asset.assetType)}
                  </Label>
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Primitive / material</DescriptionListTerm>
                <DescriptionListDescription>
                  {(() => {
                    const primitive = formatPrimitiveCell(asset);
                    return primitive ? (
                      <Label color={primitive.color} isCompact>
                        {primitive.label}
                      </Label>
                    ) : (
                      "—"
                    );
                  })()}
                </DescriptionListDescription>
              </DescriptionListGroup>
              {asset.parameterSetIdentifier ? (
                <DescriptionListGroup>
                  <DescriptionListTerm>Parameter set</DescriptionListTerm>
                  <DescriptionListDescription>
                    {asset.parameterSetIdentifier}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              ) : null}
              {asset.oid ? (
                <DescriptionListGroup>
                  <DescriptionListTerm>OID</DescriptionListTerm>
                  <DescriptionListDescription>
                    <CodeBlock aria-label="Object identifier">
                      <CodeBlockCode>{asset.oid}</CodeBlockCode>
                    </CodeBlock>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              ) : null}
              {asset.cryptoFunctions && asset.cryptoFunctions.length > 0 ? (
                <DescriptionListGroup>
                  <DescriptionListTerm>Functions</DescriptionListTerm>
                  <DescriptionListDescription>
                    <div
                      style={{
                        display: "flex",
                        gap: "4px",
                        flexWrap: "wrap",
                      }}
                    >
                      {asset.cryptoFunctions.map((func) => (
                        <Label key={func} color="blue" isCompact>
                          {func}
                        </Label>
                      ))}
                    </div>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              ) : null}
              <DescriptionListGroup>
                <DescriptionListTerm>Usage</DescriptionListTerm>
                <DescriptionListDescription>
                  <Label color={getUsageTypeColor(asset.usageType)} isCompact>
                    {asset.usageType}
                  </Label>
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Occurrences</DescriptionListTerm>
                <DescriptionListDescription>
                  {asset.occurrenceCount}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>Detection</CardTitle>
          <CardBody>
            <DescriptionList
              isHorizontal
              isCompact
              horizontalTermWidthModifier={{ default: "14ch" }}
            >
              <DescriptionListGroup>
                <DescriptionListTerm>Scanner</DescriptionListTerm>
                <DescriptionListDescription>
                  {scannerLine || asset.discoverySource}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Source</DescriptionListTerm>
                <DescriptionListDescription>
                  {asset.discoverySource}
                </DescriptionListDescription>
              </DescriptionListGroup>
              {(asset.executionEnvironment || asset.implementationPlatform) && (
                <>
                  {asset.executionEnvironment ? (
                    <DescriptionListGroup>
                      <DescriptionListTerm>Execution</DescriptionListTerm>
                      <DescriptionListDescription>
                        {asset.executionEnvironment}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  ) : null}
                  {asset.implementationPlatform ? (
                    <DescriptionListGroup>
                      <DescriptionListTerm>Platform</DescriptionListTerm>
                      <DescriptionListDescription>
                        {asset.implementationPlatform}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  ) : null}
                </>
              )}
            </DescriptionList>
          </CardBody>
        </Card>
      </StackItem>

      {asset.detectionRules && asset.detectionRules.length > 0 ? (
        <StackItem>
          <Card>
            <CardTitle>Detection rules</CardTitle>
            <CardBody>
              <Stack hasGutter>
                {asset.detectionRules.map((rule) => (
                  <StackItem key={rule.value}>
                    <CodeBlock aria-label="Detection rule">
                      <CodeBlockCode>{rule.value}</CodeBlockCode>
                    </CodeBlock>
                    {rule.technique ? (
                      <Content
                        component="small"
                        style={{
                          color: "var(--pf-t--global--text--color--subtle)",
                          marginTop: "var(--pf-t--global--spacer--xs)",
                        }}
                      >
                        {rule.technique}
                      </Content>
                    ) : null}
                  </StackItem>
                ))}
              </Stack>
            </CardBody>
          </Card>
        </StackItem>
      ) : null}

      {asset.evidence && asset.evidence.length > 0 ? (
        <StackItem>
          <Card>
            <CardTitle>Evidence</CardTitle>
            <CardBody>
              <Stack hasGutter>
                <StackItem>
                  <Content
                    component="p"
                    style={{
                      color: "var(--pf-t--global--text--color--subtle)",
                      marginBottom: 0,
                    }}
                  >
                    File and line references where this cryptographic use was
                    detected (CycloneDX crypto-asset evidence).
                  </Content>
                </StackItem>
                <StackItem>
                  <Content component="p" style={{ marginBottom: 0 }}>
                    <strong>{asset.evidence.length}</strong>{" "}
                    {asset.evidence.length === 1 ? "site" : "sites"} in source
                  </Content>
                </StackItem>
                <StackItem>
                  <Stack hasGutter>
                    {visibleEvidence.map((entry, index) => (
                      <StackItem
                        key={`${entry.location}-${entry.line}-${index}`}
                      >
                        <Stack hasGutter>
                          {index > 0 ? (
                            <StackItem>
                              <Divider />
                            </StackItem>
                          ) : null}
                          <StackItem>
                            <Flex
                              alignItems={{
                                default: "alignItemsFlexStart",
                              }}
                              justifyContent={{
                                default: "justifyContentSpaceBetween",
                              }}
                              gap={{ default: "gapMd" }}
                              flexWrap={{ default: "wrap" }}
                            >
                              <FlexItem
                                style={{
                                  minWidth: 0,
                                  flex: "1 1 12rem",
                                }}
                              >
                                <Content
                                  component="p"
                                  style={{
                                    marginBottom: 0,
                                    wordBreak: "break-all",
                                    fontFamily:
                                      "var(--pf-t--global--font--family--monospace)",
                                    fontSize:
                                      "var(--pf-t--global--font--size--body--sm)",
                                  }}
                                >
                                  {entry.location}
                                </Content>
                              </FlexItem>
                              <FlexItem>
                                <Label color="blue" isCompact>
                                  Line {entry.line}
                                </Label>
                              </FlexItem>
                            </Flex>
                          </StackItem>
                          {entry.context ? (
                            <StackItem>
                              <CodeBlock
                                aria-label={`Code at ${entry.location}:${entry.line}`}
                              >
                                <CodeBlockCode>{entry.context}</CodeBlockCode>
                              </CodeBlock>
                            </StackItem>
                          ) : null}
                        </Stack>
                      </StackItem>
                    ))}
                  </Stack>
                </StackItem>
                {hasMoreEvidence ? (
                  <StackItem>
                    <Button
                      variant="link"
                      isInline
                      onClick={() =>
                        setEvidenceVisibleCount(
                          (count) => count + EVIDENCE_PAGE_SIZE,
                        )
                      }
                    >
                      Show more ({asset.evidence.length - evidenceVisibleCount}{" "}
                      remaining)
                    </Button>
                  </StackItem>
                ) : null}
              </Stack>
            </CardBody>
          </Card>
        </StackItem>
      ) : null}

      <StackItem>
        <Card>
          <CardTitle>Algorithm policy</CardTitle>
          <CardBody>
            {policyResults.length > 0 ? (
              <DescriptionList isCompact>
                <DescriptionListGroup>
                  <DescriptionListTerm>Verdict</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Label color={verdictLabel.color} isCompact>
                      {verdictLabel.text}
                    </Label>
                  </DescriptionListDescription>
                </DescriptionListGroup>
                {policyResults.map((result) => {
                  const status =
                    cryptoAlgorithmPolicyStatusLabel[result.status];

                  return (
                    <DescriptionListGroup key={result.id}>
                      <DescriptionListTerm>{result.name}</DescriptionListTerm>
                      <DescriptionListDescription>
                        <Stack gap={{ default: "gapXs" }}>
                          <StackItem>
                            <Label color={status.color} isCompact>
                              {status.text}
                            </Label>
                          </StackItem>
                          <StackItem>
                            <Content
                              component="small"
                              style={{
                                color:
                                  "var(--pf-t--global--text--color--subtle)",
                                marginBottom: 0,
                              }}
                            >
                              {result.summary}
                            </Content>
                          </StackItem>
                        </Stack>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  );
                })}
              </DescriptionList>
            ) : (
              <DescriptionList isCompact>
                <DescriptionListGroup>
                  <DescriptionListTerm>Verdict</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Label color={verdictLabel.color} isCompact>
                      {verdictLabel.text}
                    </Label>
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Policies</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Content
                      component="p"
                      style={{
                        color: "var(--pf-t--global--text--color--subtle)",
                        marginBottom: 0,
                      }}
                    >
                      No algorithm policies apply to this asset type.
                    </Content>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            )}
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>Related SBOMs</CardTitle>
          <CardBody>
            {asset.sboms && asset.sboms.length > 0 ? (
              <>
                <Content
                  component="small"
                  style={{
                    color: "var(--pf-t--global--text--color--subtle)",
                    marginBottom: "var(--pf-t--global--spacer--md)",
                  }}
                >
                  SBOMs in this workspace that reference this finding.
                </Content>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--pf-t--global--spacer--xs)",
                  }}
                >
                  {asset.sboms.map((sbom) => (
                    <Link
                      key={sbom.id}
                      to={CBOM_ROUTE_PATHS.sbomDetails(sbom.id)}
                      style={{
                        padding: "var(--pf-t--global--spacer--sm)",
                        backgroundColor:
                          "var(--pf-t--global--background--color--secondary--default)",
                        borderLeft:
                          "3px solid var(--pf-t--global--color--brand--default)",
                        borderRadius: "4px",
                        textDecoration: "none",
                        display: "block",
                      }}
                    >
                      {sbom.name}
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <Content
                component="p"
                style={{ color: "var(--pf-t--global--text--color--subtle)" }}
              >
                {unlinkedMessage}
              </Content>
            )}
          </CardBody>
        </Card>
      </StackItem>
    </Stack>
  );
};
