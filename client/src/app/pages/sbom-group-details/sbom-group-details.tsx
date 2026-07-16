import React from "react";
import { Link } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  Content,
  Flex,
  FlexItem,
  Label,
  PageSection,
  Tab,
  TabContent,
  Tabs,
  TabTitleText,
} from "@patternfly/react-core";

import { PRODUCT_LABEL_KEY } from "@app/Constants.ts";
import { PathParam, Paths, useRouteParams } from "@app/Routes";
import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { useTabControls } from "@app/hooks/tab-controls";
import { useSuspenseSBOMGroupById } from "@app/queries/sbom-groups";

import { SbomSearchProvider } from "../sbom-list/sbom-provider";
import { SbomTable } from "../sbom-list/sbom-table";
import { SbomToolbar } from "../sbom-list/sbom-toolbar";
import { ProductRiskAssessment } from "./product-risk-assessment";

type ProductGroupTabKey = "group-sboms" | "product-risk-assessment";

export const SBOMGroupDetails: React.FC = () => {
  const sbomGroupId = useRouteParams(PathParam.SBOM_GROUP_ID);

  const { sbomGroup } = useSuspenseSBOMGroupById(sbomGroupId);

  const isProduct = PRODUCT_LABEL_KEY in (sbomGroup?.labels ?? {});

  const {
    propHelpers: { getTabsProps, getTabProps, getTabContentProps },
  } = useTabControls<ProductGroupTabKey>({
    persistenceKeyPrefix: "sgd",
    persistTo: "urlParams",
    tabKeys: ["group-sboms", "product-risk-assessment"],
    defaultActiveTab: { tabKey: "group-sboms" },
  });

  const groupSbomsTabRef = React.createRef<HTMLElement>();
  const productRiskTabRef = React.createRef<HTMLElement>();

  const groupSbomsContent = (
    <SbomSearchProvider sbomGroupId={sbomGroupId}>
      <SbomToolbar showFilters />
      <SbomTable />
    </SbomSearchProvider>
  );

  return (
    <>
      <DocumentMetadata title={sbomGroup?.name} />
      <PageSection type="breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={Paths.sbomGroups}>Groups</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Group details</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection>
        <Flex>
          <FlexItem>
            <Content component="h1">{sbomGroup?.name} </Content>
          </FlexItem>
          <FlexItem>
            {isProduct ? (
              <Label color="purple" isCompact>
                {PRODUCT_LABEL_KEY}
              </Label>
            ) : null}
          </FlexItem>
        </Flex>
        <Content component="p">{sbomGroup?.description} </Content>
      </PageSection>
      {isProduct ? (
        <>
          <PageSection>
            <Tabs
              mountOnEnter
              unmountOnExit
              {...getTabsProps()}
              aria-label="Tabs that contain the product group information"
              role="region"
            >
              <Tab
                {...getTabProps("group-sboms")}
                title={<TabTitleText>Group SBOMs</TabTitleText>}
                tabContentRef={groupSbomsTabRef}
              />
              <Tab
                {...getTabProps("product-risk-assessment")}
                title={<TabTitleText>Product Risk Assessment</TabTitleText>}
                tabContentRef={productRiskTabRef}
              />
            </Tabs>
          </PageSection>
          <PageSection>
            <TabContent
              {...getTabContentProps("group-sboms")}
              ref={groupSbomsTabRef}
              aria-label="SBOMs in this product group"
            >
              {groupSbomsContent}
            </TabContent>
            <TabContent
              {...getTabContentProps("product-risk-assessment")}
              ref={productRiskTabRef}
              aria-label="Product risk assessment"
            >
              <ProductRiskAssessment />
            </TabContent>
          </PageSection>
        </>
      ) : (
        <PageSection>{groupSbomsContent}</PageSection>
      )}
    </>
  );
};
