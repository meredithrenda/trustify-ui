import React from "react";
import { Link } from "react-router-dom";

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
  PageSection,
  Stack,
  StackItem,
  Title,
  Toolbar,
  ToolbarContent,
} from "@patternfly/react-core";

import {
  type FilterCategory,
  FilterToolbar,
  FilterType,
  type IFilterValues,
} from "@app/components/FilterToolbar";
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";

import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { PageDrawerContent } from "@app/components/PageDrawerContext";
import { Paths } from "@app/Routes";
import { getSbomFilteredByAlgorithmUrl } from "@app/pages/sbom-list/helpers";

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
  libraryCapabilities?: string[];
  detectedUsage?: string[];
  primitive?: string;
  cryptoFunctions?: string[];
  occurrences?: Array<{
    location: string;
    line: number;
    context?: string;
  }>;
  sboms?: Array<{
    id: string;
    name: string;
  }>;
}

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
    libraryCapabilities: ["SHA-256", "SHA-384", "SHA-512", "SHA-1"],
    detectedUsage: ["SHA-1"],
    occurrences: [
      {
        location: "pkg/asset/imagebased/configimage/ingressoperatorsigner.go",
        line: 172,
        context: "hash := sha1.Sum(publicKeyBytes)",
      },
      {
        location: "pkg/asset/tls/tls.go",
        line: 142,
        context: "hash := sha1.Sum(publicKeyBytes)",
      },
    ],
    sboms: [
      { id: "sbom-1", name: "openshift-installer-v4.15.0" },
      { id: "sbom-2", name: "openshift-installer-agent-v4.15.0" },
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
    libraryCapabilities: ["RSA-2048", "RSA-4096", "ECDSA"],
    detectedUsage: ["RSA-2048"],
    occurrences: [
      {
        location: "internal/tshelpers/fakeregistry.go",
        line: 302,
        context: "pk, err := rsa.GenerateKey(rand.Reader, 2048)",
      },
      {
        location: "pkg/asset/tls/tls.go",
        line: 48,
        context: "rsaKey, err := rsa.GenerateKey(rand.Reader, keySize)",
      },
    ],
    sboms: [
      { id: "sbom-1", name: "openshift-installer-v4.15.0" },
    ],
  },
  {
    id: "3",
    algorithm: "AES-256",
    keyStrength: 256,
    libraryName: "OpenSSL",
    libraryVersion: "3.0.8",
    discoverySource: "Scanoss",
    fips140_3Compliant: true,
    risk: "Low",
    type: "Library Capability",
    libraryCapabilities: ["AES-128", "AES-192", "AES-256", "ChaCha20"],
  },
  {
    id: "4",
    algorithm: "CRYSTALS-Kyber",
    keyStrength: 768,
    libraryName: "liboqs",
    libraryVersion: "0.8.0",
    discoverySource: "Scanoss",
    fips140_3Compliant: false,
    risk: "Low",
    type: "Library Capability",
    libraryCapabilities: [
      "CRYSTALS-Kyber",
      "CRYSTALS-Dilithium",
      "FALCON",
      "SPHINCS+",
    ],
  },
  {
    id: "5",
    algorithm: "MD5",
    keyStrength: 128,
    libraryName: "Go crypto/md5",
    libraryVersion: "1.21",
    discoverySource: "Scanoss",
    fips140_3Compliant: false,
    risk: "Critical",
    type: "Hard-coded Insecure Crypto",
    primitive: "hash",
    cryptoFunctions: ["digest"],
    libraryCapabilities: ["SHA-256", "SHA-384", "SHA-512", "MD5"],
    detectedUsage: ["MD5"],
    occurrences: [
      {
        location: "pkg/types/gcp/clouduid.go",
        line: 11,
        context: "hash := md5.Sum([]byte(infraID))",
      },
    ],
    sboms: [
      { id: "sbom-1", name: "openshift-installer-v4.15.0" },
    ],
  },
  {
    id: "6",
    algorithm: "RSA",
    keyStrength: 2048,
    libraryName: "BoringSSL",
    libraryVersion: "1.1.1",
    discoverySource: "Scanoss",
    fips140_3Compliant: true,
    risk: "Medium",
    type: "Library Capability",
    libraryCapabilities: ["RSA-2048", "RSA-4096", "ECDSA"],
  },
  {
    id: "7",
    algorithm: "DES",
    keyStrength: 56,
    libraryName: "libcrypto",
    libraryVersion: "1.0.2",
    discoverySource: "Scanoss",
    fips140_3Compliant: false,
    risk: "Critical",
    type: "Hard-coded Insecure Crypto",
    libraryCapabilities: ["AES-256", "DES", "3DES"],
    detectedUsage: ["DES"],
  },
  {
    id: "8",
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
    libraryCapabilities: ["ECDSA-P256", "ECDSA-P384", "ECDSA-P521"],
    detectedUsage: ["ECDSA-P256"],
    occurrences: [
      {
        location: "pkg/asset/agent/gencrypto/authconfig.go",
        line: 123,
        context:
          "priv, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)",
      },
    ],
    sboms: [
      { id: "sbom-2", name: "openshift-installer-agent-v4.15.0" },
    ],
  },
];

const getRiskColor = (
  risk: CryptographicAsset["risk"],
): "red" | "orange" | "gold" | "green" | "grey" => {
  switch (risk) {
    case "Critical":
      return "red";
    case "High":
      return "orange";
    case "Medium":
      return "gold";
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

const DrawerDetailContent: React.FC<{ asset: CryptographicAsset }> = ({
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

    {asset.sboms && asset.sboms.length > 0 && (
      <StackItem>
        <Card>
          <CardTitle>Associated SBOMs</CardTitle>
          <CardBody>
            <Content
              component="small"
              style={{
                color: "var(--pf-v6-global--Color--200)",
                marginTop: "var(--pf-v6-global--spacer--xs)",
                marginBottom: "var(--pf-v6-global--spacer--md)",
              }}
            >
              Used in {asset.sboms.length} SBOM
              {asset.sboms.length !== 1 ? "s" : ""}
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
          </CardBody>
        </Card>
      </StackItem>
    )}

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
                  backgroundColor:
                    "var(--pf-v6-global--BackgroundColor--200)",
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

    {asset.libraryCapabilities && asset.libraryCapabilities.length > 0 && (
      <StackItem>
        <Card>
          <CardTitle>
            {asset.libraryName} v{asset.libraryVersion} Support
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
                      .filter(
                        (cap) => !asset.detectedUsage?.includes(cap),
                      )
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

type CbomFilterKey = "search" | "type" | "risk";

const filterCategories: FilterCategory<CryptographicAsset, CbomFilterKey>[] = [
  {
    categoryKey: "search",
    title: "Search",
    placeholderText: "Search",
    type: FilterType.search,
  },
  {
    categoryKey: "type",
    title: "Type",
    type: FilterType.select,
    selectOptions: [
      { value: "Library Capability", label: "Library Capability" },
      {
        value: "Hard-coded Insecure Crypto",
        label: "Hard-coded Insecure Crypto",
      },
    ],
  },
  {
    categoryKey: "risk",
    title: "Risk",
    type: FilterType.select,
    selectOptions: [
      { value: "Critical", label: "Critical" },
      { value: "High", label: "High" },
      { value: "Medium", label: "Medium" },
      { value: "Low", label: "Low" },
    ],
  },
];

export const CBOMInventory: React.FC = () => {
  const [selectedAsset, setSelectedAsset] =
    React.useState<CryptographicAsset | null>(null);
  const [filterValues, setFilterValues] = React.useState<
    IFilterValues<CbomFilterKey>
  >({});

  const filteredAssets = React.useMemo(() => {
    return mockCryptographicAssets.filter((asset) => {
      const searchTerms = filterValues.search;
      if (searchTerms && searchTerms.length > 0 && searchTerms[0]) {
        const searchLower = searchTerms[0].toLowerCase();
        const matchesSearch =
          asset.algorithm.toLowerCase().includes(searchLower) ||
          asset.libraryName.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      const typeFilter = filterValues.type;
      if (typeFilter && typeFilter.length > 0) {
        if (!typeFilter.includes(asset.type)) return false;
      }
      const riskFilter = filterValues.risk;
      if (riskFilter && riskFilter.length > 0) {
        if (!riskFilter.includes(asset.risk)) return false;
      }
      return true;
    });
  }, [filterValues]);

  return (
    <>
      <PageDrawerContent
        isExpanded={!!selectedAsset}
        onCloseClick={() => setSelectedAsset(null)}
        pageKey="cbom-inventory"
        header={
          selectedAsset ? (
            <Title headingLevel="h2" size="lg">
              {selectedAsset.algorithm}
            </Title>
          ) : undefined
        }
      >
        {selectedAsset ? (
          <DrawerDetailContent asset={selectedAsset} />
        ) : (
          <></>
        )}
      </PageDrawerContent>

      <DocumentMetadata title="Cryptography" />
      <PageSection variant="light">
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h1" size="2xl">
              Cryptography
            </Title>
            <Content>
              Discover and inventory cryptographic assets across your software
              supply chain. Identify library capabilities, detect hard-coded
              insecure cryptographic usage, and understand what cryptographic
              components are available but not yet utilized.
            </Content>
          </StackItem>
        </Stack>
      </PageSection>
      <PageSection variant="light" style={{ paddingTop: 0 }}>
        <Toolbar clearAllFilters={() => setFilterValues({})}>
          <ToolbarContent>
            <FilterToolbar<CryptographicAsset, CbomFilterKey>
              filterCategories={filterCategories}
              filterValues={filterValues}
              setFilterValues={setFilterValues}
            />
          </ToolbarContent>
        </Toolbar>
      </PageSection>
      <PageSection>
        <Table aria-label="Cryptographic assets table" variant="compact">
          <Thead>
            <Tr>
              <Th>Algorithm</Th>
              <Th>Library</Th>
              <Th>Type</Th>
              <Th>Risk</Th>
              <Th>SBOMs</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredAssets.map((asset) => (
              <Tr key={asset.id} isHoverable>
                <Td dataLabel="Algorithm">
                  <Stack>
                    <StackItem>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedAsset(asset);
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
                  <Label color={getTypeColor(asset.type)}>
                    {asset.type}
                  </Label>
                </Td>
                <Td dataLabel="Risk">
                  <Label color={getRiskColor(asset.risk)}>
                    {asset.risk}
                  </Label>
                </Td>
                <Td dataLabel="SBOMs">
                  {asset.sboms && asset.sboms.length > 0 ? (
                    <Link
                      to={getSbomFilteredByAlgorithmUrl([asset.algorithm])}
                    >
                      {asset.sboms.length} SBOM
                      {asset.sboms.length !== 1 ? "s" : ""}
                    </Link>
                  ) : (
                    "0 SBOMs"
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </PageSection>
    </>
  );
};
