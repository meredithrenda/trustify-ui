import React from "react";
import { Link, useNavigate } from "react-router-dom";

import type { AxiosError } from "axios";

import {
  Breadcrumb,
  BreadcrumbItem,
  ButtonVariant,
  Content,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Label,
  MenuToggle,
  type MenuToggleElement,
  PageSection,
  Popover,
  Split,
  SplitItem,
  Tab,
  TabAction,
  TabContent,
  Tabs,
  TabTitleText,
  Title,
} from "@patternfly/react-core";
import HelpIcon from "@patternfly/react-icons/dist/esm/icons/help-icon";

import {
  sbomDeletedErrorMessage,
  sbomDeleteDialogProps,
  sbomDeletedSuccessMessage,
} from "@app/Constants";
import { PathParam, Paths, useRouteParams } from "@app/Routes";
import type { SbomSummary } from "@app/client";
import { ConfirmDialog } from "@app/components/ConfirmDialog";
import { LoadingWrapper } from "@app/components/LoadingWrapper";
import { NotificationsContext } from "@app/components/NotificationsContext";
import { PageDrawerContent } from "@app/components/PageDrawerContext";
import { useDownload } from "@app/hooks/domain-controls/useDownload";
import { useTabControls } from "@app/hooks/tab-controls";
import { useDeleteSbomMutation, useFetchSBOMById } from "@app/queries/sboms";
import { mockModels } from "@app/mocks/models";

import { Overview } from "./overview";
import { PackagesBySbom } from "./packages-by-sbom";
import { VulnerabilitiesBySbom } from "./vulnerabilities-by-sbom";
import {
  Cryptography,
  CryptoDetailContent,
  type CryptographicAsset,
  shouldShowCryptographyTab,
} from "./cryptography";
import { ModelList } from "@app/pages/models/components/ModelList";
import { ModelDetailDrawer } from "@app/pages/models/components/ModelDetailDrawer";
import type { AIModel } from "@app/pages/models/types";
import { DocumentMetadata } from "@app/components/DocumentMetadata";

type DrawerItem =
  | { kind: "crypto"; asset: CryptographicAsset }
  | { kind: "model"; model: AIModel };

type SbomDetailsTabKey =
  | "vulnerabilities"
  | "packages"
  | "info"
  | "cryptography"
  | "models";

export const SbomDetails: React.FC = () => {
  const navigate = useNavigate();
  const { pushNotification } = React.useContext(NotificationsContext);

  const sbomId = useRouteParams(PathParam.SBOM_ID);
  const { sbom, isFetching, fetchError } = useFetchSBOMById(sbomId);

  const [isActionsDropdownOpen, setIsActionsDropdownOpen] =
    React.useState(false);

  const handleActionsDropdownToggle = () => {
    setIsActionsDropdownOpen(!isActionsDropdownOpen);
  };

  const { downloadSBOM, downloadSBOMLicenses } = useDownload();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const onDeleteSbomSuccess = (sbom: SbomSummary) => {
    setIsDeleteDialogOpen(false);
    pushNotification({
      title: sbomDeletedSuccessMessage(sbom),
      variant: "success",
    });
    navigate("/sboms");
  };

  const onDeleteAdvisoryError = (error: AxiosError) => {
    pushNotification({
      title: sbomDeletedErrorMessage(error),
      variant: "danger",
    });
  };

  const { mutate: deleteSbom, isPending: isDeleting } = useDeleteSbomMutation(
    onDeleteSbomSuccess,
    onDeleteAdvisoryError,
  );

  const isAibom = sbom?.labels.kind === "aibom";

  const sbomModels = React.useMemo(
    () => (sbom ? mockModels.filter((m) => m.sbomId === sbom.id) : []),
    [sbom],
  );

  const validTabKeys = React.useMemo((): SbomDetailsTabKey[] => {
    const keys: SbomDetailsTabKey[] = ["vulnerabilities", "packages", "info"];
    if (shouldShowCryptographyTab(sbom?.id)) {
      keys.push("cryptography");
    }
    if (isAibom && sbomModels.length > 0) {
      keys.push("models");
    }
    return keys;
  }, [sbom?.id, isAibom, sbomModels.length]);

  const tabControls = useTabControls<SbomDetailsTabKey>({
    persistenceKeyPrefix: isAibom ? "sda" : "sd",
    persistTo: "urlParams",
    tabKeys: validTabKeys,
    defaultActiveTab: { tabKey: "vulnerabilities" },
  });

  const {
    state: tabState,
    derivedState: tabDerivedState,
    propHelpers: { getTabsProps, getTabProps, getTabContentProps },
  } = tabControls;

  React.useEffect(() => {
    const active = tabState.activeTab?.tabKey;
    if (active && !validTabKeys.includes(active)) {
      tabDerivedState.setActiveTab("vulnerabilities");
    }
  }, [validTabKeys, tabState.activeTab?.tabKey, tabDerivedState]);

  const infoTabRef = React.createRef<HTMLElement>();
  const packagesTabRef = React.createRef<HTMLElement>();
  const vulnerabilitiesTabRef = React.createRef<HTMLElement>();
  const cryptographyTabRef = React.createRef<HTMLElement>();
  const modelsTabRef = React.createRef<HTMLElement>();

  const vulnerabilitiesTabPopoverRef = React.createRef<HTMLElement>();

  const [drawerItem, setDrawerItem] = React.useState<DrawerItem | null>(null);

  const drawerHeader = React.useMemo(() => {
    if (!drawerItem) return undefined;
    const label =
      drawerItem.kind === "crypto"
        ? drawerItem.asset.algorithm
        : drawerItem.model.name;
    return (
      <Title headingLevel="h2" size="lg">
        {label}
      </Title>
    );
  }, [drawerItem]);

  const drawerBody = React.useMemo(() => {
    if (!drawerItem) return <></>;
    if (drawerItem.kind === "crypto") {
      return <CryptoDetailContent asset={drawerItem.asset} />;
    }
    return <ModelDetailDrawer model={drawerItem.model} />;
  }, [drawerItem]);

  const tabsProps = getTabsProps();
  const active = tabState.activeTab?.tabKey;
  const tabsActiveKey: SbomDetailsTabKey =
    active && validTabKeys.includes(active) ? active : "vulnerabilities";
  const onTabsSelect: React.ComponentProps<typeof Tabs>["onSelect"] = (
    event,
    tabKey,
  ) => {
    tabsProps.onSelect(event, tabKey);
    setDrawerItem(null);
  };

  return (
    <>
      <PageDrawerContent
        isExpanded={!!drawerItem}
        onCloseClick={() => setDrawerItem(null)}
        pageKey="sbom-details"
        header={drawerHeader}
      >
        {drawerBody}
      </PageDrawerContent>

      <DocumentMetadata title={sbom?.name} />
      <PageSection type="breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={Paths.sboms}>SBOMs</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>SBOM details</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection>
        <Split>
          <SplitItem isFilled>
            <Flex>
              <FlexItem spacer={{ default: "spacerSm" }}>
                <Content>
                  <Content component="h1">{sbom?.name ?? sbomId ?? ""}</Content>
                </Content>
              </FlexItem>
              <FlexItem>
                {sbom?.labels.type && (
                  <Label color="blue">{sbom?.labels.type}</Label>
                )}
              </FlexItem>
            </Flex>
          </SplitItem>
          <SplitItem>
            {sbom && (
              <Dropdown
                isOpen={isActionsDropdownOpen}
                onSelect={() => setIsActionsDropdownOpen(false)}
                onOpenChange={(isOpen) => setIsActionsDropdownOpen(isOpen)}
                popperProps={{ position: "right" }}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={handleActionsDropdownToggle}
                    isExpanded={isActionsDropdownOpen}
                  >
                    Actions
                  </MenuToggle>
                )}
                ouiaId="BasicDropdown"
                shouldFocusToggleOnSelect
              >
                <DropdownList>
                  <DropdownItem
                    key="sbom"
                    onClick={() => {
                      if (sbomId) {
                        downloadSBOM(
                          sbomId,
                          sbom?.name ? `${sbom?.name}.json` : `${sbomId}.json`,
                        );
                      }
                    }}
                  >
                    Download SBOM
                  </DropdownItem>
                  <DropdownItem
                    key="license"
                    onClick={() => {
                      if (sbomId) {
                        downloadSBOMLicenses(sbomId);
                      }
                    }}
                  >
                    Download License Report
                  </DropdownItem>
                  <Divider component="li" key="separator" />
                  <DropdownItem
                    key="delete"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    Delete
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
            )}
          </SplitItem>
        </Split>
      </PageSection>
      <PageSection>
        <Tabs
          {...tabsProps}
          activeKey={tabsActiveKey}
          onSelect={onTabsSelect}
          aria-label="Tabs that contain the SBOM information"
          role="region"
        >
          <Tab
            {...getTabProps("vulnerabilities")}
            title={<TabTitleText>Vulnerabilities</TabTitleText>}
            tabContentRef={vulnerabilitiesTabRef}
            actions={
              <>
                <TabAction ref={vulnerabilitiesTabPopoverRef}>
                  <HelpIcon />
                </TabAction>
                <Popover
                  triggerRef={vulnerabilitiesTabPopoverRef}
                  bodyContent={
                    <div>
                      Any found vulnerabilities related to this SBOM. Fixed
                      vulnerabilities are not listed.
                    </div>
                  }
                />
              </>
            }
          />
          <Tab
            {...getTabProps("packages")}
            title={<TabTitleText>Packages</TabTitleText>}
            tabContentRef={packagesTabRef}
          />
          <Tab
            {...getTabProps("info")}
            title={<TabTitleText>Info</TabTitleText>}
            tabContentRef={infoTabRef}
          />
          {validTabKeys.includes("cryptography") && (
            <Tab
              {...getTabProps("cryptography")}
              title={<TabTitleText>Cryptography</TabTitleText>}
              tabContentRef={cryptographyTabRef}
            />
          )}
          {validTabKeys.includes("models") && (
            <Tab
              {...getTabProps("models")}
              title={<TabTitleText>Models</TabTitleText>}
              tabContentRef={modelsTabRef}
            />
          )}
        </Tabs>
      </PageSection>
      <PageSection>
        <TabContent
          {...getTabContentProps("vulnerabilities")}
          ref={vulnerabilitiesTabRef}
          aria-label="Vulnerabilities within the SBOM"
        >
          {sbomId && <VulnerabilitiesBySbom sbomId={sbomId} />}
        </TabContent>
        <TabContent
          {...getTabContentProps("packages")}
          ref={packagesTabRef}
          aria-label="Packages within the SBOM"
        >
          {sbomId && <PackagesBySbom sbomId={sbomId} />}
        </TabContent>
        <TabContent
          {...getTabContentProps("info")}
          ref={infoTabRef}
          aria-label="Information of the SBOM"
        >
          <LoadingWrapper isFetching={isFetching} fetchError={fetchError}>
            {sbom && <Overview sbom={sbom} />}
          </LoadingWrapper>
        </TabContent>
        {validTabKeys.includes("cryptography") && (
          <TabContent
            {...getTabContentProps("cryptography")}
            ref={cryptographyTabRef}
            aria-label="Cryptographic libraries in the SBOM"
          >
            {sbomId && (
              <Cryptography
                sbomId={sbomId}
                onSelectAsset={(asset) =>
                  setDrawerItem(asset ? { kind: "crypto", asset } : null)
                }
              />
            )}
          </TabContent>
        )}
        {validTabKeys.includes("models") && (
          <TabContent
            {...getTabContentProps("models")}
            ref={modelsTabRef}
            aria-label="AI models in the SBOM"
          >
            <ModelList
              models={sbomModels}
              onSelectModel={(model) =>
                setDrawerItem(model ? { kind: "model", model } : null)
              }
            />
          </TabContent>
        )}
      </PageSection>

      <ConfirmDialog
        {...sbomDeleteDialogProps(sbom)}
        inProgress={isDeleting}
        titleIconVariant="warning"
        isOpen={isDeleteDialogOpen}
        confirmBtnVariant={ButtonVariant.danger}
        confirmBtnLabel="Delete"
        cancelBtnLabel="Cancel"
        onCancel={() => setIsDeleteDialogOpen(false)}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          if (sbom) {
            deleteSbom(sbom.id);
          }
        }}
      />
    </>
  );
};
