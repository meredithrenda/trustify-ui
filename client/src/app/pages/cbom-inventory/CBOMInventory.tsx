import React from "react";
import { Link } from "react-router-dom";

import {
  Alert,
  Button,
  Content,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
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
import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { PageDrawerContent } from "@app/components/PageDrawerContext";
import {
  CBOM_FIXTURE_SCANNER_LABEL,
  CBOM_SPEC_LABEL,
  CbomInventoryProvider,
  CryptographicAlgorithmPolicies,
  CryptoAssetsTable,
  CryptoDetailContent,
  type CryptographicAsset,
  useCbomInventory,
} from "@app/cbom";
import { getSbomFilteredByAlgorithmUrl } from "@app/pages/sbom-list/helpers";

type CbomFilterKey = "search" | "assetType" | "primitive" | "usageType";

const USAGE_OPTIONS = [
  { value: "Usage in source", label: "Usage in source" },
  { value: "Declared capability", label: "Declared capability" },
];

const ASSET_TYPE_OPTIONS = [
  { value: "algorithm", label: "Algorithm" },
  { value: "related-crypto-material", label: "Related material" },
];

const CBOMInventoryPage: React.FC = () => {
  const { assets, addUploadedCbom, uploadError, clearUploadError } =
    useCbomInventory();
  const [selectedAsset, setSelectedAsset] =
    React.useState<CryptographicAsset | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [pendingFileName, setPendingFileName] = React.useState<string | null>(
    null,
  );
  const [pendingJson, setPendingJson] = React.useState<string | null>(null);
  const [filterValues, setFilterValues] = React.useState<
    IFilterValues<CbomFilterKey>
  >({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const primitiveOptions = React.useMemo(() => {
    const primitives = new Set<string>();
    for (const asset of assets) {
      if (asset.primitive) {
        primitives.add(asset.primitive);
      }
      if (asset.materialType) {
        primitives.add(asset.materialType);
      }
    }
    return [...primitives].sort().map((value) => ({ value, label: value }));
  }, [assets]);

  const filterCategories = React.useMemo<
    FilterCategory<CryptographicAsset, CbomFilterKey>[]
  >(
    () => [
      {
        categoryKey: "search",
        title: "Search",
        placeholderText: "Search by name",
        type: FilterType.search,
      },
      {
        categoryKey: "assetType",
        title: "Asset type",
        type: FilterType.select,
        selectOptions: ASSET_TYPE_OPTIONS,
      },
      ...(primitiveOptions.length > 0
        ? [
            {
              categoryKey: "primitive" as const,
              title: "Primitive / material",
              type: FilterType.select,
              selectOptions: primitiveOptions,
            },
          ]
        : []),
      {
        categoryKey: "usageType",
        title: "Usage",
        type: FilterType.select,
        selectOptions: USAGE_OPTIONS,
      },
    ],
    [primitiveOptions],
  );

  const filteredAssets = React.useMemo(() => {
    return assets.filter((asset) => {
      const searchTerms = filterValues.search;
      if (searchTerms?.[0]) {
        const q = searchTerms[0].toLowerCase();
        if (!asset.name.toLowerCase().includes(q)) {
          return false;
        }
      }
      const assetTypes = filterValues.assetType;
      if (assetTypes?.[0] && asset.assetType !== assetTypes[0]) {
        return false;
      }
      const primitives = filterValues.primitive;
      if (primitives?.[0]) {
        const match =
          asset.primitive === primitives[0] ||
          asset.materialType === primitives[0];
        if (!match) {
          return false;
        }
      }
      const usage = filterValues.usageType;
      if (usage?.[0] && asset.usageType !== usage[0]) {
        return false;
      }
      return true;
    });
  }, [assets, filterValues]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    clearUploadError();
    const file = event.target.files?.[0];
    if (!file) {
      setPendingFileName(null);
      setPendingJson(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPendingFileName(file.name);
      setPendingJson(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleUploadConfirm = () => {
    if (pendingJson && pendingFileName) {
      const added = addUploadedCbom(pendingFileName, pendingJson);
      if (added) {
        setIsUploadModalOpen(false);
        setPendingFileName(null);
        setPendingJson(null);
      }
    }
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setPendingFileName(null);
    setPendingJson(null);
    clearUploadError();
  };

  return (
    <>
      <Modal
        variant="medium"
        isOpen={isUploadModalOpen}
        onClose={closeUploadModal}
      >
        <ModalHeader title="Upload SBOM" />
        <ModalBody>
          <Stack hasGutter>
            <StackItem>
              <Content component="p">
                Upload a CycloneDX 1.6 JSON BOM with{" "}
                <code>cryptographic-asset</code> components. Parsed assets are
                added to this workspace inventory for the current session.
              </Content>
            </StackItem>
            {uploadError ? (
              <StackItem>
                <Alert
                  variant="danger"
                  title={uploadError}
                  isInline
                  actionClose={
                    <Button variant="plain" onClick={clearUploadError}>
                      Dismiss
                    </Button>
                  }
                />
              </StackItem>
            ) : null}
            <StackItem>
              <Form>
                <FormGroup label="CBOM file" fieldId="cbom-upload-file">
                  <input
                    ref={fileInputRef}
                    accept=".json,application/json"
                    id="cbom-upload-file"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    type="file"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose JSON file
                  </Button>
                  {pendingFileName ? (
                    <Content
                      component="p"
                      style={{
                        marginTop: "var(--pf-t--global--spacer--sm)",
                        marginBottom: 0,
                      }}
                    >
                      Selected: <strong>{pendingFileName}</strong>
                    </Content>
                  ) : null}
                </FormGroup>
              </Form>
            </StackItem>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="link" onClick={closeUploadModal}>
            Cancel
          </Button>
          <Button
            isDisabled={!pendingJson}
            variant="primary"
            onClick={handleUploadConfirm}
          >
            Add to inventory
          </Button>
        </ModalFooter>
      </Modal>

      <PageDrawerContent
        isExpanded={!!selectedAsset}
        onCloseClick={() => setSelectedAsset(null)}
        pageKey="cbom-inventory"
        header={
          selectedAsset ? (
            <Title headingLevel="h2" size="lg">
              {selectedAsset.name}
            </Title>
          ) : undefined
        }
      >
        {selectedAsset ? (
          <CryptoDetailContent
            key={selectedAsset.id}
            asset={selectedAsset}
            viewContext="inventory"
          />
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
              supply chain from CycloneDX CBOMs. Sample data from{" "}
              <strong>openshift-installer</strong> and{" "}
              <strong>rsa-signer-c</strong> is loaded from SCANOSS crypto-finder
              output ({CBOM_SPEC_LABEL}).
            </Content>
            <Content
              component="small"
              style={{
                color: "var(--pf-t--global--text--color--subtle)",
                marginTop: "var(--pf-t--global--spacer--sm)",
              }}
            >
              Scanner: {CBOM_FIXTURE_SCANNER_LABEL}
            </Content>
          </StackItem>
        </Stack>
      </PageSection>
      <PageSection variant="light" style={{ paddingTop: 0 }}>
        <Stack hasGutter>
          <StackItem>
            <CryptographicAlgorithmPolicies assets={assets} />
          </StackItem>
          <StackItem>
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
                    Upload SBOM
                  </Button>
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
          </StackItem>
          <StackItem>
            <CryptoAssetsTable
              assets={filteredAssets}
              onSelectAsset={setSelectedAsset}
              showSbomColumn
              renderSbomCell={(asset) =>
                asset.sboms && asset.sboms.length > 0 ? (
                  <Link to={getSbomFilteredByAlgorithmUrl([asset.algorithm])}>
                    {asset.sboms.length} SBOM
                    {asset.sboms.length !== 1 ? "s" : ""}
                  </Link>
                ) : (
                  <Content
                    component="small"
                    style={{
                      color: "var(--pf-t--global--text--color--subtle)",
                    }}
                  >
                    Not linked to an SBOM
                  </Content>
                )
              }
            />
          </StackItem>
        </Stack>
      </PageSection>
    </>
  );
};

export const CBOMInventory: React.FC = () => (
  <CbomInventoryProvider>
    <CBOMInventoryPage />
  </CbomInventoryProvider>
);
