import type React from "react";
import { Link } from "react-router-dom";

import { Content } from "@patternfly/react-core";

import { getPackageFilteredByAlgorithmUrl } from "@app/pages/package-list/helpers";
import { getSbomFilteredByAlgorithmUrl } from "@app/pages/sbom-list/helpers";

import type { CryptographicAsset } from "./types";

const subtleSmallContent = (
  message: string,
): React.ReactNode => (
  <Content
    component="small"
    style={{ color: "var(--pf-t--global--text--color--subtle)" }}
  >
    {message}
  </Content>
);

export const renderCryptoPackagesCell = (
  asset: CryptographicAsset,
): React.ReactNode => {
  if (!asset.packages || asset.packages.length === 0) {
    return subtleSmallContent("Not linked to a package");
  }

  return (
    <Link to={getPackageFilteredByAlgorithmUrl([asset.algorithm])}>
      {asset.packages.length} package
      {asset.packages.length !== 1 ? "s" : ""}
    </Link>
  );
};

export const renderCryptoSbomsCell = (
  asset: CryptographicAsset,
): React.ReactNode => {
  if (!asset.sboms || asset.sboms.length === 0) {
    return subtleSmallContent("Not linked to an SBOM");
  }

  return (
    <Link to={getSbomFilteredByAlgorithmUrl([asset.algorithm])}>
      {asset.sboms.length} SBOM
      {asset.sboms.length !== 1 ? "s" : ""}
    </Link>
  );
};
