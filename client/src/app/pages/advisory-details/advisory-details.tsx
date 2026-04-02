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
  Split,
  SplitItem,
  Tab,
  TabContent,
  Tabs,
  TabTitleText,
} from "@patternfly/react-core";

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

  const csafTabKeys = [
    "csaf-overview",
    "csaf-vulnerabilities",
    "csaf-products",
    "csaf-relationships",
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
            <Flex>
              <FlexItem spacer={{ default: "spacerSm" }}>
                <Content>
                  <Content component="h1">
                    {advisory?.document_id ?? advisoryId ?? ""}
                  </Content>
                  <Content component="p">Advisory detail information</Content>
                </Content>
              </FlexItem>
              <FlexItem>
                {advisory?.labels.type && (
                  <Label color="blue">{advisory?.labels.type}</Label>
                )}
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
              <CsafTabContent activeTab="csaf-overview" />
            </TabContent>
            <TabContent
              {...getTabContentProps("csaf-vulnerabilities")}
              ref={csafVulnerabilitiesRef}
              aria-label="CSAF Vulnerabilities"
            >
              <CsafTabContent activeTab="csaf-vulnerabilities" />
            </TabContent>
            <TabContent
              {...getTabContentProps("csaf-products")}
              ref={csafProductsRef}
              aria-label="CSAF Products"
            >
              <CsafTabContent activeTab="csaf-products" />
            </TabContent>
            <TabContent
              {...getTabContentProps("csaf-relationships")}
              ref={csafRelationshipsRef}
              aria-label="CSAF Relationship Tree"
            >
              <CsafTabContent activeTab="csaf-relationships" />
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
