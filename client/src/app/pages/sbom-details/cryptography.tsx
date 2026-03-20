import React from "react";

import {
  Card,
  CardBody,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Label,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";

interface CryptographicAsset {
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

// Mock data - in a real implementation, this would come from the SBOM CBOM data
const mockCryptographicAssets: CryptographicAsset[] = [
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

interface CryptographyProps {
  sbomId: string;
}

export const Cryptography: React.FC<CryptographyProps> = () => {
  const [selectedAsset, setSelectedAsset] =
    React.useState<CryptographicAsset | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const handleRowClick = (asset: CryptographicAsset) => {
    setSelectedAsset(asset);
    setIsDrawerOpen(true);
  };

  const onDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedAsset(null);
  };

  const getRiskColor = (risk: CryptographicAsset["risk"]) => {
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

  const getTypeColor = (type: CryptographicAsset["type"]) => {
    switch (type) {
      case "Hard-coded Insecure Crypto":
        return "red";
      case "Library Capability":
        return "blue";
      default:
        return "grey";
    }
  };

  const columns = ["Algorithm", "Library", "Type", "Risk"];

  return (
    <Drawer isExpanded={isDrawerOpen} isInline>
      <DrawerContent
        panelContent={
          <DrawerPanelContent>
            <DrawerHead>
              <Title headingLevel="h2" size="xl">
                {selectedAsset?.algorithm || "Select an asset"}
              </Title>
              <DrawerActions>
                <DrawerCloseButton onClose={onDrawerClose} />
              </DrawerActions>
            </DrawerHead>
            <DrawerPanelBody>
              {selectedAsset ? (
                <Stack hasGutter>
                  <StackItem>
                    <Card>
                      <CardBody>
                        <DescriptionList>
                          <DescriptionListGroup>
                            <DescriptionListTerm>Algorithm</DescriptionListTerm>
                            <DescriptionListDescription>
                              {selectedAsset.algorithm}
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                          {selectedAsset.keyStrength && (
                            <DescriptionListGroup>
                              <DescriptionListTerm>Key Strength</DescriptionListTerm>
                              <DescriptionListDescription>
                                {selectedAsset.keyStrength} bits
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                          )}
                          <DescriptionListGroup>
                            <DescriptionListTerm>Library</DescriptionListTerm>
                            <DescriptionListDescription>
                              {selectedAsset.libraryName} v{selectedAsset.libraryVersion}
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                          <DescriptionListGroup>
                            <DescriptionListTerm>Discovery Source</DescriptionListTerm>
                            <DescriptionListDescription>
                              {selectedAsset.discoverySource}
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                          <DescriptionListGroup>
                            <DescriptionListTerm>Type</DescriptionListTerm>
                            <DescriptionListDescription>
                              <Label color={getTypeColor(selectedAsset.type)}>
                                {selectedAsset.type}
                              </Label>
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                          <DescriptionListGroup>
                            <DescriptionListTerm>Risk</DescriptionListTerm>
                            <DescriptionListDescription>
                              <Label color={getRiskColor(selectedAsset.risk)}>
                                {selectedAsset.risk}
                              </Label>
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                          <DescriptionListGroup>
                            <DescriptionListTerm>FIPS 140-3 Status</DescriptionListTerm>
                            <DescriptionListDescription>
                              <Label
                                color={selectedAsset.fips140_3Compliant ? "green" : "red"}
                              >
                                {selectedAsset.fips140_3Compliant ? "Compliant" : "Not Compliant"}
                              </Label>
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                          {selectedAsset.primitive && (
                            <DescriptionListGroup>
                              <DescriptionListTerm>Primitive Type</DescriptionListTerm>
                              <DescriptionListDescription>
                                {selectedAsset.primitive}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                          )}
                          {selectedAsset.cryptoFunctions && selectedAsset.cryptoFunctions.length > 0 && (
                            <DescriptionListGroup>
                              <DescriptionListTerm>Crypto Functions</DescriptionListTerm>
                              <DescriptionListDescription>
                                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                  {selectedAsset.cryptoFunctions.map((func, index) => (
                                    <Label key={index} color="blue">
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
                  {selectedAsset.occurrences && selectedAsset.occurrences.length > 0 && (
                    <StackItem>
                      <Card>
                        <CardBody>
                          <Title headingLevel="h3" size="lg">
                            Code Occurrences
                          </Title>
                          <Content style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                            Found {selectedAsset.occurrences.length} occurrence
                            {selectedAsset.occurrences.length !== 1 ? "s" : ""} in source code:
                          </Content>
                          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                            {selectedAsset.occurrences.map((occurrence, index) => (
                              <div
                                key={index}
                                style={{
                                  padding: "var(--pf-v6-global--spacer--sm)",
                                  marginBottom: "var(--pf-v6-global--spacer--xs)",
                                  backgroundColor: "var(--pf-v6-global--BackgroundColor--100)",
                                  borderLeft: "3px solid var(--pf-v6-global--primary-color--100)",
                                  borderRadius: "4px",
                                }}
                              >
                                <Content>
                                  <strong>{occurrence.location}</strong>
                                  {occurrence.line && (
                                    <span style={{ marginLeft: "0.5rem", color: "var(--pf-v6-global--Color--200)" }}>
                                      (line {occurrence.line})
                                    </span>
                                  )}
                                </Content>
                                {occurrence.context && (
                                  <Content style={{ marginTop: "0.25rem", fontFamily: "monospace", fontSize: "0.875rem" }}>
                                    {occurrence.context}
                                  </Content>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardBody>
                      </Card>
                    </StackItem>
                  )}
                </Stack>
              ) : (
                <Content>Select an asset from the table to view details.</Content>
              )}
            </DrawerPanelBody>
          </DrawerPanelContent>
        }
      >
        <DrawerContentBody>
          <Stack hasGutter>
            <StackItem>
              <Title headingLevel="h3" size="lg">
                Cryptographic Assets
              </Title>
              <Content>
                Cryptographic assets detected in this SBOM. Click an asset to view
                detailed information including key strength, discovery source, and code
                occurrences.
              </Content>
            </StackItem>
            <StackItem>
              <Table aria-label="Cryptographic assets table" variant="compact">
                <Thead>
                  <Tr>
                    {columns.map((column) => (
                      <Th key={column}>{column}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {mockCryptographicAssets.map((asset) => (
                    <Tr
                      key={asset.id}
                      onClick={() => handleRowClick(asset)}
                      style={{ cursor: "pointer" }}
                    >
                      <Td dataLabel={columns[0]}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                          <Content>
                            <span
                              style={{
                                color: "#0066cc",
                                cursor: "pointer",
                                textDecoration: "underline",
                              }}
                            >
                              {asset.algorithm}
                            </span>
                          </Content>
                          {asset.keyStrength && (
                            <Content>
                              <small>{asset.keyStrength} bits</small>
                            </Content>
                          )}
                        </div>
                      </Td>
                      <Td dataLabel={columns[1]}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                          <Content>
                            {asset.libraryName}
                          </Content>
                          {asset.libraryVersion && (
                            <Content>
                              <small>v{asset.libraryVersion}</small>
                            </Content>
                          )}
                        </div>
                      </Td>
                      <Td dataLabel={columns[2]}>
                        <Label color={getTypeColor(asset.type)}>
                          {asset.type}
                        </Label>
                      </Td>
                      <Td dataLabel={columns[3]}>
                        <Label color={getRiskColor(asset.risk)}>
                          {asset.risk}
                        </Label>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </StackItem>
          </Stack>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};
