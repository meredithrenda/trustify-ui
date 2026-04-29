import type React from "react";
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
  Divider,
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
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";

import { Paths } from "@app/Routes";

/** Single detection site; aligns with Cyclone DX crypto-asset evidence (file/line sources). */
export type CryptoEvidenceEntry = {
  location: string;
  line: number;
  context?: string;
};

export interface CryptographicAsset {
  id: string;
  algorithm: string;
  keyStrength?: number;
  libraryName: string;
  libraryVersion: string;
  discoverySource: string;
  fips140_3Compliant: boolean;
  risk: "Critical" | "High" | "Medium" | "Low";
  type: "Library Capability" | "Hard-coded Insecure Crypto";
  primitive?: string;
  cryptoFunctions?: string[];
  /** Detection evidence (Cyclone DX-style: where the crypto was found in source). */
  evidence?: CryptoEvidenceEntry[];
  sboms?: Array<{
    id: string;
    name: string;
  }>;
  libraryCapabilities?: string[];
  detectedUsage?: string[];
  /** Prototype-only labels for future policy / PQ story. */
  policySignals?: string[];
}

export const mockCryptographicAssets: CryptographicAsset[] = [
  {
    id: "1",
    algorithm: "SHA-1",
    keyStrength: 160,
    libraryName: "Go crypto/sha1",
    libraryVersion: "1.21",
    discoverySource: "ScanOSS",
    fips140_3Compliant: false,
    risk: "Critical",
    type: "Hard-coded Insecure Crypto",
    primitive: "hash",
    cryptoFunctions: ["digest"],
    policySignals: ["Deprecated primitive"],
    evidence: [
      {
        location: "pkg/asset/imagebased/configimage/ingressoperatorsigner.go",
        line: 172,
        context: "hash := sha1.Sum(publicKeyBytes)",
      },
      {
        location: "pkg/asset/tls/legacy_digest.go",
        line: 88,
        context: "sum := sha1.Sum(data)",
      },
    ],
    sboms: [
      {
        id: "a1b2c3d4-0001-4000-8000-000000000001",
        name: "Demo product SBOM A",
      },
      {
        id: "a1b2c3d4-0002-4000-8000-000000000002",
        name: "Demo product SBOM B",
      },
    ],
  },
  {
    id: "2",
    algorithm: "RSA",
    keyStrength: 2048,
    libraryName: "Go crypto/rsa",
    libraryVersion: "1.21",
    discoverySource: "ScanOSS",
    fips140_3Compliant: true,
    risk: "Medium",
    type: "Hard-coded Insecure Crypto",
    primitive: "pke",
    cryptoFunctions: ["encrypt", "decrypt"],
    evidence: [
      {
        location: "internal/tshelpers/fakeregistry.go",
        line: 302,
        context: "pk, err := rsa.GenerateKey(rand.Reader, 2048)",
      },
    ],
    sboms: [
      {
        id: "a1b2c3d4-0001-4000-8000-000000000001",
        name: "Demo product SBOM A",
      },
    ],
  },
  {
    id: "3",
    algorithm: "ECDSA-P256",
    keyStrength: 256,
    libraryName: "Go crypto/ecdsa",
    libraryVersion: "1.21",
    discoverySource: "ScanOSS",
    fips140_3Compliant: true,
    risk: "Low",
    type: "Hard-coded Insecure Crypto",
    primitive: "signature",
    cryptoFunctions: ["sign", "verify"],
    evidence: [
      {
        location: "pkg/asset/agent/gencrypto/authconfig.go",
        line: 123,
        context: "priv, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)",
      },
    ],
    sboms: [
      {
        id: "a1b2c3d4-0002-4000-8000-000000000002",
        name: "Demo product SBOM B",
      },
    ],
  },
  {
    id: "4",
    algorithm: "SHA-256",
    keyStrength: 256,
    libraryName: "Go crypto/sha256",
    libraryVersion: "1.21",
    discoverySource: "ScanOSS",
    fips140_3Compliant: true,
    risk: "Low",
    type: "Library Capability",
    primitive: "hash",
    cryptoFunctions: ["digest"],
  },
];

/** SBOMs that use mock cryptographic inventory for the Cryptography tab (until API-driven CBOM exists). */
export const SBOM_IDS_WITH_MOCK_CRYPTO = new Set<string>([
  "a1b2c3d4-0001-4000-8000-000000000001",
  "a1b2c3d4-0002-4000-8000-000000000002",
]);

export function shouldShowCryptographyTab(sbomId: string | undefined): boolean {
  if (!sbomId) {
    return false;
  }
  return SBOM_IDS_WITH_MOCK_CRYPTO.has(sbomId);
}

export function getCryptographicAssetsForSbom(
  sbomId: string,
): CryptographicAsset[] {
  return shouldShowCryptographyTab(sbomId) ? mockCryptographicAssets : [];
}

export const getRiskColor = (
  risk: CryptographicAsset["risk"],
): "red" | "orange" | "yellow" | "green" | "grey" => {
  switch (risk) {
    case "Critical":
      return "red";
    case "High":
      return "orange";
    case "Medium":
      return "yellow";
    case "Low":
      return "green";
    default:
      return "grey";
  }
};

export const getTypeColor = (
  type: CryptographicAsset["type"],
): "red" | "blue" | "grey" => {
  switch (type) {
    case "Hard-coded Insecure Crypto":
      return "red";
    case "Library Capability":
      return "blue";
    default:
      return "grey";
  }
};

const defaultPolicyPlaceholders = ["PQ / PQC signal", "Unwanted library"];

export type CryptoDetailViewContext = "inventory" | "sbom";

export const CryptoDetailContent: React.FC<{
  asset: CryptographicAsset;
  /** Workspace inventory vs SBOM Cryptography tab (copy for Related SBOMs). */
  viewContext?: CryptoDetailViewContext;
}> = ({ asset, viewContext = "inventory" }) => {
  const unlinkedMessage =
    viewContext === "sbom"
      ? "Not linked to another SBOM in this workspace."
      : "Not linked to an SBOM in this workspace.";

  const policyChips =
    asset.policySignals && asset.policySignals.length > 0
      ? asset.policySignals
      : defaultPolicyPlaceholders;

  return (
    <Stack hasGutter>
      <StackItem>
        <Card>
          <CardTitle>Policy signals</CardTitle>
          <CardBody>
            <Stack hasGutter>
              <StackItem>
                <Content
                  component="p"
                  style={{
                    color: "var(--pf-v6-global--Color--200)",
                    marginBottom: 0,
                  }}
                >
                  Non-enforced examples for roadmap demos. Future policy would
                  evaluate findings against organizational rules.
                </Content>
              </StackItem>
              <StackItem>
                <div
                  style={{
                    display: "flex",
                    gap: "var(--pf-v6-global--spacer--xs)",
                    flexWrap: "wrap",
                  }}
                >
                  {policyChips.map((label) => (
                    <Label key={label} color="grey" isCompact>
                      {label}
                    </Label>
                  ))}
                </div>
              </StackItem>
            </Stack>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>Algorithm Details</CardTitle>
          <CardBody>
            <DescriptionList
              isHorizontal
              isCompact
              horizontalTermWidthModifier={{ default: "14ch" }}
            >
              <DescriptionListGroup>
                <DescriptionListTerm>Algorithm</DescriptionListTerm>
                <DescriptionListDescription>
                  {asset.algorithm}
                </DescriptionListDescription>
              </DescriptionListGroup>
              {asset.keyStrength && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Key Strength</DescriptionListTerm>
                  <DescriptionListDescription>
                    {asset.keyStrength} bits
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {asset.primitive && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Primitive</DescriptionListTerm>
                  <DescriptionListDescription>
                    {asset.primitive}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {asset.cryptoFunctions && asset.cryptoFunctions.length > 0 && (
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
              )}
            </DescriptionList>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>Source & Compliance</CardTitle>
          <CardBody>
            <DescriptionList
              isHorizontal
              isCompact
              horizontalTermWidthModifier={{ default: "14ch" }}
            >
              <DescriptionListGroup>
                <DescriptionListTerm>Library</DescriptionListTerm>
                <DescriptionListDescription>
                  {asset.libraryName} v{asset.libraryVersion}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Source</DescriptionListTerm>
                <DescriptionListDescription>
                  {asset.discoverySource}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Type</DescriptionListTerm>
                <DescriptionListDescription>
                  <Label color={getTypeColor(asset.type)} isCompact>
                    {asset.type}
                  </Label>
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Risk</DescriptionListTerm>
                <DescriptionListDescription>
                  <Label color={getRiskColor(asset.risk)} isCompact>
                    {asset.risk}
                  </Label>
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>FIPS 140-3</DescriptionListTerm>
                <DescriptionListDescription>
                  <Label
                    color={asset.fips140_3Compliant ? "green" : "red"}
                    isCompact
                  >
                    {asset.fips140_3Compliant ? "Compliant" : "Not Compliant"}
                  </Label>
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
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
                    color: "var(--pf-v6-global--Color--200)",
                    marginBottom: "var(--pf-v6-global--spacer--md)",
                  }}
                >
                  SBOMs in this workspace that reference this finding.
                </Content>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--pf-v6-global--spacer--xs)",
                  }}
                >
                  {asset.sboms.map((sbom) => (
                    <Link
                      key={sbom.id}
                      to={Paths.sbomDetails.replace(":sbomId", sbom.id)}
                      style={{
                        padding: "var(--pf-v6-global--spacer--sm)",
                        backgroundColor:
                          "var(--pf-v6-global--BackgroundColor--200)",
                        borderLeft:
                          "3px solid var(--pf-v6-global--primary-color--100)",
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
                style={{ color: "var(--pf-v6-global--Color--200)" }}
              >
                {unlinkedMessage}
              </Content>
            )}
          </CardBody>
        </Card>
      </StackItem>

      {asset.evidence && asset.evidence.length > 0 && (
        <StackItem>
          <Card>
            <CardTitle>Evidence</CardTitle>
            <CardBody>
              <Stack hasGutter>
                <StackItem>
                  <Content
                    component="p"
                    style={{
                      color: "var(--pf-v6-global--Color--200)",
                      marginBottom: 0,
                    }}
                  >
                    File and line references where this cryptographic use was
                    detected (Cyclone DX crypto-asset style).
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
                    {asset.evidence.map((entry, index) => (
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
                                      "var(--pf-v6-global--FontFamily--text--monospace)",
                                    fontSize:
                                      "var(--pf-v6-global--FontSize--sm)",
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
              </Stack>
            </CardBody>
          </Card>
        </StackItem>
      )}

      {asset.libraryCapabilities && asset.libraryCapabilities.length > 0 && (
        <StackItem>
          <Card>
            <CardTitle>
              {asset.libraryName} v{asset.libraryVersion} support
            </CardTitle>
            <CardBody>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--pf-v6-global--spacer--md)",
                }}
              >
                {asset.detectedUsage && asset.detectedUsage.length > 0 && (
                  <div>
                    <Content
                      component="small"
                      style={{
                        fontWeight: "bold",
                        marginBottom: "var(--pf-v6-global--spacer--xs)",
                      }}
                    >
                      Detected in code:
                    </Content>
                    <div
                      style={{
                        display: "flex",
                        gap: "4px",
                        flexWrap: "wrap",
                        marginTop: "var(--pf-v6-global--spacer--xs)",
                      }}
                    >
                      {asset.detectedUsage.map((usage) => (
                        <Label key={usage} color="red" isCompact>
                          {usage}
                        </Label>
                      ))}
                    </div>
                  </div>
                )}
                {asset.libraryCapabilities.filter(
                  (cap) => !asset.detectedUsage?.includes(cap),
                ).length > 0 && (
                  <div>
                    <Content
                      component="small"
                      style={{
                        fontWeight: "bold",
                        marginBottom: "var(--pf-v6-global--spacer--xs)",
                      }}
                    >
                      Available but not used:
                    </Content>
                    <div
                      style={{
                        display: "flex",
                        gap: "4px",
                        flexWrap: "wrap",
                        marginTop: "var(--pf-v6-global--spacer--xs)",
                      }}
                    >
                      {asset.libraryCapabilities
                        .filter((cap) => !asset.detectedUsage?.includes(cap))
                        .map((capability) => (
                          <Label key={capability} color="orange" isCompact>
                            {capability}
                          </Label>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </StackItem>
      )}
    </Stack>
  );
};

interface CryptographyProps {
  sbomId: string;
  onSelectAsset: (asset: CryptographicAsset | null) => void;
}

export const Cryptography: React.FC<CryptographyProps> = ({
  sbomId,
  onSelectAsset,
}) => {
  const assets = getCryptographicAssetsForSbom(sbomId);

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h3" size="lg">
          Cryptographic Assets
        </Title>
        <Content component="p">
          Cryptographic assets detected for this SBOM. Click an asset to view
          detailed information.
        </Content>
      </StackItem>
      <StackItem>
        <Table aria-label="Cryptographic assets table" variant="compact">
          <Thead>
            <Tr>
              <Th>Algorithm</Th>
              <Th>Library</Th>
              <Th>Type</Th>
              <Th>Risk</Th>
            </Tr>
          </Thead>
          <Tbody>
            {assets.map((asset) => (
              <Tr key={asset.id}>
                <Td dataLabel="Algorithm">
                  <Stack>
                    <StackItem>
                      <Button
                        variant="link"
                        isInline
                        onClick={() => onSelectAsset(asset)}
                      >
                        {asset.algorithm}
                      </Button>
                    </StackItem>
                    {asset.keyStrength && (
                      <StackItem>
                        <Content
                          component="small"
                          style={{
                            color: "var(--pf-v6-global--Color--200)",
                          }}
                        >
                          {asset.keyStrength} bits
                        </Content>
                      </StackItem>
                    )}
                  </Stack>
                </Td>
                <Td dataLabel="Library">
                  <Stack>
                    <StackItem>{asset.libraryName}</StackItem>
                    <StackItem>
                      <Content
                        component="small"
                        style={{
                          color: "var(--pf-v6-global--Color--200)",
                        }}
                      >
                        v{asset.libraryVersion}
                      </Content>
                    </StackItem>
                  </Stack>
                </Td>
                <Td dataLabel="Type">
                  <Label color={getTypeColor(asset.type)}>{asset.type}</Label>
                </Td>
                <Td dataLabel="Risk">
                  <Label color={getRiskColor(asset.risk)}>{asset.risk}</Label>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </StackItem>
    </Stack>
  );
};
