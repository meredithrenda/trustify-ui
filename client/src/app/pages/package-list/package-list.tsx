import React from "react";
import { useLocation } from "react-router-dom";

import { Flex, FlexItem } from "@patternfly/react-core";

import { PackageVersionSwitcher } from "./components/PackageVersionSwitcher";
import { NewProposalPackageList } from "./new-proposal-package-list";
import { OriginalPackageList } from "./original-package-list";
import {
  PACKAGE_PAGE_VERSIONS,
  type PackagePageVersion,
  readStoredPackagePageVersion,
  resolvePackagePageVersionFromSearch,
  writeStoredPackagePageVersion,
} from "./package-versions";

import "./components/package-version-switcher.css";

const readInitialPackagePageVersion = (): PackagePageVersion => {
  if (typeof window !== "undefined") {
    const fromUrl = resolvePackagePageVersionFromSearch(window.location.search);
    if (fromUrl) {
      writeStoredPackagePageVersion(fromUrl);
      return fromUrl;
    }
  }

  return readStoredPackagePageVersion();
};

export const PackageList: React.FC = () => {
  const location = useLocation();
  const [packagePageVersion, setPackagePageVersion] =
    React.useState<PackagePageVersion>(readInitialPackagePageVersion);

  React.useEffect(() => {
    const fromUrl = resolvePackagePageVersionFromSearch(location.search);
    if (!fromUrl) {
      return;
    }
    setPackagePageVersion(fromUrl);
    writeStoredPackagePageVersion(fromUrl);
  }, [location.search]);

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
