import type React from "react";

import {
  Card,
  CardBody,
  CardTitle,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";

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
  occurrences?: Array<{
    location: string;
    line: number;
    context?: string;
  }>;
}

export const mockCryptographicAssets: CryptographicAsset[] = [
  {
    id: "1",
    algorithm: "SHA-1",
    keyStrength: 160,
    libraryName: "Go crypto/sha1",
    libraryVersion: "1.21",
    discoverySource: "Scanoss",
    fips140_3Compliant: false,
    risk: "Critical",
    type: "Hard-coded Insecure Crypto",
    primitive: "hash",
    cryptoFunctions: ["digest"],
    occurrences: [
      {
        location: "pkg/asset/imagebased/configimage/ingressoperatorsigner.go",
        line: 172,
        context: "hash := sha1.Sum(publicKeyBytes)",
      },
    ],
  },
  {
    id: "2",
    algorithm: "RSA",
    keyStrength: 2048,
    libraryName: "Go crypto/rsa",
    libraryVersion: "1.21",
    discoverySource: "Scanoss",
    fips140_3Compliant: true,
    risk: "Medium",
    type: "Hard-coded Insecure Crypto",
    primitive: "pke",
    cryptoFunctions: ["encrypt", "decrypt"],
    occurrences: [
      {
        location: "internal/tshelpers/fakeregistry.go",
        line: 302,
        context: "pk, err := rsa.GenerateKey(rand.Reader, 2048)",
      },
    ],
  },
  {
    id: "3",
    algorithm: "ECDSA-P256",
    keyStrength: 256,
    libraryName: "Go crypto/ecdsa",
    libraryVersion: "1.21",
    discoverySource: "Scanoss",
    fips140_3Compliant: true,
    risk: "Low",
    type: "Hard-coded Insecure Crypto",
    primitive: "signature",
    cryptoFunctions: ["sign", "verify"],
    occurrences: [
      {
        location: "pkg/asset/agent/gencrypto/authconfig.go",
        line: 123,
        context: "priv, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)",
      },
    ],
  },
  {
    id: "4",
    algorithm: "SHA-256",
    keyStrength: 256,
    libraryName: "Go crypto/sha256",
    libraryVersion: "1.21",
    discoverySource: "Scanoss",
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

const getTypeColor = (
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

export const CryptoDetailContent: React.FC<{ asset: CryptographicAsset }> = ({
  asset,
}) => (
  <Stack hasGutter>
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

    {asset.occurrences && asset.occurrences.length > 0 && (
      <StackItem>
        <Card>
          <CardTitle>Code Occurrences</CardTitle>
          <CardBody>
            <Content
              component="small"
              style={{
                color: "var(--pf-v6-global--Color--200)",
                marginTop: "var(--pf-v6-global--spacer--xs)",
                marginBottom: "var(--pf-v6-global--spacer--md)",
              }}
            >
              Found {asset.occurrences.length} occurrence
              {asset.occurrences.length !== 1 ? "s" : ""} in source code
            </Content>
            {asset.occurrences.map((occurrence, index) => (
              <div
                key={index}
                style={{
                  padding: "var(--pf-v6-global--spacer--sm)",
                  marginBottom: "var(--pf-v6-global--spacer--xs)",
                  backgroundColor: "var(--pf-v6-global--BackgroundColor--200)",
                  borderLeft:
                    "3px solid var(--pf-v6-global--primary-color--100)",
                  borderRadius: "4px",
                }}
              >
                <Content component="p">
                  <strong>{occurrence.location}</strong>
                  <span
                    style={{
                      marginLeft: "var(--pf-v6-global--spacer--sm)",
                      color: "var(--pf-v6-global--Color--200)",
                    }}
                  >
                    (line {occurrence.line})
                  </span>
                </Content>
                {occurrence.context && (
                  <Content
                    component="p"
                    style={{
                      marginTop: "var(--pf-v6-global--spacer--xs)",
                      fontFamily: "monospace",
                      fontSize: "var(--pf-v6-global--FontSize--sm)",
                    }}
                  >
                    {occurrence.context}
                  </Content>
                )}
              </div>
            ))}
          </CardBody>
        </Card>
      </StackItem>
    )}
  </Stack>
);

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
          Cryptographic assets detected in this SBOM. Click an asset to view
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
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onSelectAsset(asset);
                        }}
                      >
                        {asset.algorithm}
                      </a>
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
