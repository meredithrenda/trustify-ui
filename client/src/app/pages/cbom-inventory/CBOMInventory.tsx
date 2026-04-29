import React from "react";
import { Link } from "react-router-dom";

import {
  Button,
  Content,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  PageSection,
  Stack,
  StackItem,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";

import {
  type FilterCategory,
  FilterToolbar,
  FilterType,
  type IFilterValues,
} from "@app/components/FilterToolbar";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";

import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { PageDrawerContent } from "@app/components/PageDrawerContext";
import {
  CryptoDetailContent,
  type CryptographicAsset,
  getRiskColor,
  getTypeColor,
} from "@app/pages/sbom-details/cryptography";
import { getSbomFilteredByAlgorithmUrl } from "@app/pages/sbom-list/helpers";

const mockCryptographicAssets: CryptographicAsset[] = [
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
    libraryCapabilities: ["SHA-256", "SHA-384", "SHA-512", "SHA-1"],
    detectedUsage: ["SHA-1"],
    evidence: [
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
      {
        id: "a1b2c3d4-0001-4000-8000-000000000001",
        name: "openshift-installer-v4.15.0",
      },
      {
        id: "a1b2c3d4-0002-4000-8000-000000000002",
        name: "openshift-installer-agent-v4.15.0",
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
    libraryCapabilities: ["RSA-2048", "RSA-4096", "ECDSA"],
    detectedUsage: ["RSA-2048"],
    evidence: [
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
      {
        id: "a1b2c3d4-0001-4000-8000-000000000001",
        name: "openshift-installer-v4.15.0",
      },
    ],
  },
  {
    id: "3",
    algorithm: "AES-256",
    keyStrength: 256,
    libraryName: "OpenSSL",
    libraryVersion: "3.0.8",
    discoverySource: "ScanOSS",
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
    discoverySource: "ScanOSS",
    fips140_3Compliant: false,
    risk: "Low",
    type: "Library Capability",
    policySignals: ["PQC / PQ candidate"],
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
    discoverySource: "ScanOSS",
    fips140_3Compliant: false,
    risk: "Critical",
    type: "Hard-coded Insecure Crypto",
    primitive: "hash",
    cryptoFunctions: ["digest"],
    libraryCapabilities: ["SHA-256", "SHA-384", "SHA-512", "MD5"],
    detectedUsage: ["MD5"],
    evidence: [
      {
        location: "pkg/types/gcp/clouduid.go",
        line: 11,
        context: "hash := md5.Sum([]byte(infraID))",
      },
    ],
    sboms: [
      {
        id: "a1b2c3d4-0001-4000-8000-000000000001",
        name: "openshift-installer-v4.15.0",
      },
    ],
  },
  {
    id: "6",
    algorithm: "RSA",
    keyStrength: 2048,
    libraryName: "BoringSSL",
    libraryVersion: "1.1.1",
    discoverySource: "ScanOSS",
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
    discoverySource: "ScanOSS",
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
    discoverySource: "ScanOSS",
    fips140_3Compliant: true,
    risk: "Low",
    type: "Hard-coded Insecure Crypto",
    primitive: "signature",
    cryptoFunctions: ["sign", "verify"],
    libraryCapabilities: ["ECDSA-P256", "ECDSA-P384", "ECDSA-P521"],
    detectedUsage: ["ECDSA-P256"],
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
        name: "openshift-installer-agent-v4.15.0",
      },
    ],
  },
];

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
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
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
      <Modal
        variant="small"
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      >
        <ModalHeader title="Upload cryptographic SBOM" />
        <ModalBody>
          Upload of Cyclone DX or SPDX cryptographic BOMs will be available when
          ingestion is wired to the API.
        </ModalBody>
      </Modal>

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
          <CryptoDetailContent asset={selectedAsset} viewContext="inventory" />
        ) : null}
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
            <ToolbarItem>
              <Button
                variant="secondary"
                onClick={() => setIsUploadModalOpen(true)}
              >
                Upload cryptographic SBOM
              </Button>
            </ToolbarItem>
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
                      <Button
                        variant="link"
                        isInline
                        onClick={() => setSelectedAsset(asset)}
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
                <Td dataLabel="SBOMs">
                  {asset.sboms && asset.sboms.length > 0 ? (
                    <Link to={getSbomFilteredByAlgorithmUrl([asset.algorithm])}>
                      {asset.sboms.length} SBOM
                      {asset.sboms.length !== 1 ? "s" : ""}
                    </Link>
                  ) : (
                    <Content
                      component="small"
                      style={{
                        color: "var(--pf-v6-global--Color--200)",
                      }}
                    >
                      Not linked to an SBOM
                    </Content>
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
