import type { Path } from "react-router-dom";

import { TablePersistenceKeyPrefixes } from "@app/Constants";
import { serializeFilterUrlParams } from "@app/hooks/table-controls";
import { trimAndStringifyUrlParams } from "@app/hooks/useUrlParams";
import { Paths } from "@app/Routes";

import {
  PACKAGE_PAGE_VERSIONS,
  PACKAGE_PAGE_VERSION_URL_PARAM,
} from "./package-versions";

export const getPackageFilteredByLicenseUrl = (
  licenses: string[],
): Pick<Path, "pathname" | "search"> => {
  const prefix = (key: string) =>
    `${TablePersistenceKeyPrefixes.packages}:${key}`;

  const filterParams = serializeFilterUrlParams({
    license: licenses,
  });

  const params = `${trimAndStringifyUrlParams({
    newPrefixedSerializedParams: {
      [prefix("filters")]: filterParams.filters,
    },
  })}`;

  return {
    pathname: Paths.packages,
    search: params,
  };
};

export const getPackageFilteredByAlgorithmUrl = (
  algorithms: string[],
): Pick<Path, "pathname" | "search"> => {
  const prefix = (key: string) =>
    `${TablePersistenceKeyPrefixes.packages}:${key}`;

  const filterParams = serializeFilterUrlParams({
    algorithm: algorithms,
  });

  const params = `${trimAndStringifyUrlParams({
    newPrefixedSerializedParams: {
      [prefix("filters")]: filterParams.filters,
      [PACKAGE_PAGE_VERSION_URL_PARAM]: PACKAGE_PAGE_VERSIONS.original,
    },
  })}`;

  return {
    pathname: Paths.packages,
    search: params,
  };
};
