import type React from "react";

import { Content, PageSection } from "@patternfly/react-core";

import { DocumentMetadata } from "@app/components/DocumentMetadata";

import { PackageSearchProvider } from "./package-provider";
import { PackageTable } from "./package-table";
import { PackageToolbar } from "./package-toolbar";

/** Today's Packages page — keep stable while iterating on New proposal. */
export const OriginalPackageList: React.FC = () => {
  return (
    <>
      <DocumentMetadata title="Packages" />
      <PageSection hasBodyWrapper={false}>
        <Content>
          <Content component="h1">Packages</Content>
        </Content>
      </PageSection>
      <PageSection hasBodyWrapper={false}>
        <div>
          <PackageSearchProvider>
            <PackageToolbar showFilters />
            <PackageTable />
          </PackageSearchProvider>
        </div>
      </PageSection>
    </>
  );
};
