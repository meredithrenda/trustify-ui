import React from "react";
import { Link, useNavigate } from "react-router-dom";

import type { AxiosError } from "axios";

import {
  Breadcrumb,
  BreadcrumbItem,
  ButtonVariant,
  CodeBlock,
  CodeBlockCode,
  Content,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  MenuToggle,
  type MenuToggleElement,
  PageSection,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Tab,
  TabContent,
  Tabs,
  TabTitleText,
} from "@patternfly/react-core";
import ExternalLinkAltIcon from "@patternfly/react-icons/dist/esm/icons/external-link-alt-icon";

import {
  advisoryDeletedErrorMessage,
  advisoryDeleteDialogProps,
  advisoryDeletedSuccessMessage,
} from "@app/Constants";
import { PathParam, Paths, useRouteParams } from "@app/Routes";
import type { AdvisorySummary } from "@app/client";
import { ConfirmDialog } from "@app/components/ConfirmDialog";
import { LoadingWrapper } from "@app/components/LoadingWrapper";
import { NotificationsContext } from "@app/components/NotificationsContext";
import { useDownload } from "@app/hooks/domain-controls/useDownload";
import { useTabControls } from "@app/hooks/tab-controls";
import {
  useDeleteAdvisoryMutation,
  useFetchAdvisoryById,
} from "@app/queries/advisories";
import { mockCsafDocument } from "@app/mocks/csaf-document";

import { Overview } from "./overview";
import { VulnerabilitiesByAdvisory } from "./vulnerabilities-by-advisory";
import { CsafTabContent } from "./csaf-advisory-tabs";
import { DocumentMetadata } from "@app/components/DocumentMetadata";

export const AdvisoryDetails: React.FC = () => {
  const navigate = useNavigate();
  const { pushNotification } = React.useContext(NotificationsContext);

  const advisoryId = useRouteParams(PathParam.ADVISORY_ID);
  const { advisory, isFetching, fetchError } = useFetchAdvisoryById(advisoryId);

  const isCsaf = advisory?.labels.type === "csaf";

  const [isActionsDropdownOpen, setIsActionsDropdownOpen] =
    React.useState(false);

  const handleActionsDropdownToggle = () => {
    setIsActionsDropdownOpen(!isActionsDropdownOpen);
  };

  const { downloadAdvisory } = useDownload();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const onDeleteAdvisorySuccess = (advisory: AdvisorySummary) => {
    setIsDeleteDialogOpen(false);
    pushNotification({
      title: advisoryDeletedSuccessMessage(advisory),
      variant: "success",
    });
    navigate("/advisories");
  };

  const onDeleteAdvisoryError = (error: AxiosError) => {
    pushNotification({
      title: advisoryDeletedErrorMessage(error),
      variant: "danger",
    });
  };

  const { mutate: deleteAdvisory, isPending: isDeleting } =
    useDeleteAdvisoryMutation(onDeleteAdvisorySuccess, onDeleteAdvisoryError);

  const csafData = React.useMemo(() => {
    if (!isCsaf || !advisory) return null;
    const advisoryCveIds = new Set(
      advisory.vulnerabilities.map((v) => v.identifier),
    );
    return {
      ...mockCsafDocument,
      vulnerabilities: mockCsafDocument.vulnerabilities.filter((v) =>
        advisoryCveIds.has(v.cve),
      ),
    };
  }, [isCsaf, advisory]);

  const selfReference = csafData?.document.references?.find(
    (ref) => ref.category === "self",
  );

  const csafTabKeys = [
    "csaf-overview",
    "csaf-vulnerabilities",
    "csaf-products",
    "csaf-relationships",
    "csaf-source",
  ] as const;

  const defaultTabKeys = ["info", "vulnerabilities"] as const;

  const csafTabs = useTabControls({
    persistenceKeyPrefix: "adc",
    persistTo: "urlParams",
    tabKeys: [...csafTabKeys],
  });

  const defaultTabs = useTabControls({
    persistenceKeyPrefix: "ad",
    persistTo: "urlParams",
    tabKeys: [...defaultTabKeys],
  });

  const tabControls = isCsaf ? csafTabs : defaultTabs;

  const {
    propHelpers: { getTabsProps, getTabProps, getTabContentProps },
  } = tabControls;

  const infoTabRef = React.createRef<HTMLElement>();
  const vulnerabilitiesTabRef = React.createRef<HTMLElement>();
  const csafOverviewRef = React.createRef<HTMLElement>();
  const csafVulnerabilitiesRef = React.createRef<HTMLElement>();
  const csafProductsRef = React.createRef<HTMLElement>();
  const csafRelationshipsRef = React.createRef<HTMLElement>();
  const csafSourceRef = React.createRef<HTMLElement>();

  return (
    <>
      <DocumentMetadata title={advisory?.document_id} />
      <PageSection type="breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={Paths.advisories}>Advisories</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Advisory details</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection>
        <Split>
          <SplitItem isFilled>
            <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }}>
              <FlexItem>
                <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapMd" }}>
                  <FlexItem>
                    <Content>
                      <Content component="h1">
                        {advisory?.document_id ?? advisoryId ?? ""}
                      </Content>
                    </Content>
                  </FlexItem>
                  <FlexItem>
                    <LabelGroup>
                      {advisory?.labels &&
                        Object.entries(advisory.labels).map(([key, value]) => (
                          <Label
                            key={key}
                            color={key === "severity" ? "orange" : "blue"}
                          >
                            {key}={value}
                          </Label>
                        ))}
                    </LabelGroup>
                  </FlexItem>
                </Flex>
              </FlexItem>
            </Flex>
          </SplitItem>
          <SplitItem>
            {advisory && (
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
                    key="advisory"
                    onClick={() => {
                      if (advisoryId) {
                        downloadAdvisory(
                          advisoryId,
                          advisory?.identifier
                            ? `${advisory?.identifier}.json`
                            : `${advisoryId}.json`,
                        );
                      }
                    }}
                  >
                    Download Advisory
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
          mountOnEnter
          {...getTabsProps()}
          aria-label="Tabs that contain the Advisory information"
          role="region"
        >
          {isCsaf ? (
            <>
              <Tab
                {...getTabProps("csaf-overview")}
                title={<TabTitleText>Overview</TabTitleText>}
                tabContentRef={csafOverviewRef}
              />
              <Tab
                {...getTabProps("csaf-vulnerabilities")}
                title={<TabTitleText>Vulnerabilities</TabTitleText>}
                tabContentRef={csafVulnerabilitiesRef}
              />
              <Tab
                {...getTabProps("csaf-products")}
                title={<TabTitleText>Products</TabTitleText>}
                tabContentRef={csafProductsRef}
              />
              <Tab
                {...getTabProps("csaf-relationships")}
                title={<TabTitleText>Relationship Tree</TabTitleText>}
                tabContentRef={csafRelationshipsRef}
              />
              <Tab
                {...getTabProps("csaf-source")}
                title={<TabTitleText>Source</TabTitleText>}
                tabContentRef={csafSourceRef}
              />
            </>
          ) : (
            <>
              <Tab
                {...getTabProps("info")}
                title={<TabTitleText>Info</TabTitleText>}
                tabContentRef={infoTabRef}
              />
              <Tab
                {...getTabProps("vulnerabilities")}
                title={<TabTitleText>Vulnerabilities</TabTitleText>}
                tabContentRef={vulnerabilitiesTabRef}
              />
            </>
          )}
        </Tabs>
      </PageSection>
      <PageSection>
        {isCsaf ? (
          <>
            <TabContent
              {...getTabContentProps("csaf-overview")}
              ref={csafOverviewRef}
              aria-label="CSAF Overview"
            >
              <CsafTabContent activeTab="csaf-overview" csafData={csafData!} />
            </TabContent>
            <TabContent
              {...getTabContentProps("csaf-vulnerabilities")}
              ref={csafVulnerabilitiesRef}
              aria-label="CSAF Vulnerabilities"
            >
              <CsafTabContent activeTab="csaf-vulnerabilities" csafData={csafData!} />
            </TabContent>
            <TabContent
              {...getTabContentProps("csaf-products")}
              ref={csafProductsRef}
              aria-label="CSAF Products"
            >
              <CsafTabContent activeTab="csaf-products" csafData={csafData!} />
            </TabContent>
            <TabContent
              {...getTabContentProps("csaf-relationships")}
              ref={csafRelationshipsRef}
              aria-label="CSAF Relationship Tree"
            >
              <CsafTabContent activeTab="csaf-relationships" csafData={csafData!} />
            </TabContent>
            <TabContent
              {...getTabContentProps("csaf-source")}
              ref={csafSourceRef}
              aria-label="CSAF Source JSON"
            >
              <Stack hasGutter>
                {selfReference && (
                  <StackItem>
                    <Content>
                      <a
                        href={selfReference.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        View original advisory{" "}
                        <ExternalLinkAltIcon style={{ fontSize: "var(--pf-v6-global--FontSize--xs)" }} />
                      </a>
                    </Content>
                  </StackItem>
                )}
                <StackItem>
                  <CodeBlock>
                    <CodeBlockCode>
                      {JSON.stringify(csafData, null, 2)}
                    </CodeBlockCode>
                  </CodeBlock>
                </StackItem>
              </Stack>
            </TabContent>
          </>
        ) : (
          <>
            <TabContent
              {...getTabContentProps("info")}
              ref={infoTabRef}
              aria-label="Information of the Advisory"
            >
              <LoadingWrapper isFetching={isFetching} fetchError={fetchError}>
                {advisory && <Overview advisory={advisory} />}
              </LoadingWrapper>
            </TabContent>
            <TabContent
              {...getTabContentProps("vulnerabilities")}
              ref={vulnerabilitiesTabRef}
              aria-label="Vulnerabilities within the Advisory"
            >
              <VulnerabilitiesByAdvisory
                isFetching={isFetching}
                fetchError={fetchError}
                vulnerabilities={advisory?.vulnerabilities || []}
              />
            </TabContent>
          </>
        )}
      </PageSection>

      <ConfirmDialog
        {...advisoryDeleteDialogProps(advisory)}
        inProgress={isDeleting}
        titleIconVariant="warning"
        isOpen={isDeleteDialogOpen}
        confirmBtnVariant={ButtonVariant.danger}
        confirmBtnLabel="Delete"
        cancelBtnLabel="Cancel"
        onCancel={() => setIsDeleteDialogOpen(false)}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          if (advisory) {
            deleteAdvisory(advisory.uuid);
          }
        }}
      />
    </>
  );
};
