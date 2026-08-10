import React from "react";

import { Flex, FlexItem } from "@patternfly/react-core";

import { PackageVersionSwitcher } from "./components/PackageVersionSwitcher";
import { NewProposalPackageList } from "./new-proposal-package-list";
import { OriginalPackageList } from "./original-package-list";
import {
  PACKAGE_PAGE_VERSIONS,
  type PackagePageVersion,
  readStoredPackagePageVersion,
  writeStoredPackagePageVersion,
} from "./package-versions";

import "./components/package-version-switcher.css";

export const PackageList: React.FC = () => {
  const [packagePageVersion, setPackagePageVersion] =
    React.useState<PackagePageVersion>(readStoredPackagePageVersion);

  const handlePackagePageVersionChange = (version: PackagePageVersion) => {
    setPackagePageVersion(version);
    writeStoredPackagePageVersion(version);
  };

  return (
    <>
      <Flex
        justifyContent={{ default: "justifyContentFlexEnd" }}
        className="package-version-switcher-bar"
      >
        <FlexItem>
          <PackageVersionSwitcher
            value={packagePageVersion}
            onChange={handlePackagePageVersionChange}
          />
        </FlexItem>
      </Flex>

      {packagePageVersion === PACKAGE_PAGE_VERSIONS.newProposal ? (
        <NewProposalPackageList />
      ) : (
        <OriginalPackageList />
      )}
    </>
  );
};
