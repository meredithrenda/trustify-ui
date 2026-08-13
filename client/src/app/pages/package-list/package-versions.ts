export const PACKAGE_PAGE_VERSIONS = {
  original: "original",
  newProposal: "new-proposal",
} as const;

export type PackagePageVersion =
  (typeof PACKAGE_PAGE_VERSIONS)[keyof typeof PACKAGE_PAGE_VERSIONS];

export const PACKAGE_PAGE_VERSION_LABELS: Record<PackagePageVersion, string> = {
  [PACKAGE_PAGE_VERSIONS.original]: "Original",
  [PACKAGE_PAGE_VERSIONS.newProposal]: "New proposal",
};

export const PACKAGE_PAGE_VERSION_SHORT_LABELS: Record<
  PackagePageVersion,
  string
> = {
  [PACKAGE_PAGE_VERSIONS.original]: "Original",
  [PACKAGE_PAGE_VERSIONS.newProposal]: "New proposal",
};

export const PACKAGE_PAGE_VERSION_STORAGE_KEY =
  "trustify-package-page-version";

/** URL query param to deep-link a specific packages page variant. */
export const PACKAGE_PAGE_VERSION_URL_PARAM = "packageView";

export const resolvePackagePageVersionFromSearch = (
  search: string,
): PackagePageVersion | undefined => {
  const value = new URLSearchParams(search).get(PACKAGE_PAGE_VERSION_URL_PARAM);
  if (value && isPackagePageVersion(value)) {
    return value;
  }
  return undefined;
};

export const isPackagePageVersion = (
  value: string,
): value is PackagePageVersion =>
  Object.values(PACKAGE_PAGE_VERSIONS).includes(value as PackagePageVersion);

export const readStoredPackagePageVersion = (): PackagePageVersion => {
  if (typeof sessionStorage === "undefined") {
    return PACKAGE_PAGE_VERSIONS.original;
  }

  const stored = sessionStorage.getItem(PACKAGE_PAGE_VERSION_STORAGE_KEY);

  if (stored && isPackagePageVersion(stored)) {
    return stored;
  }

  return PACKAGE_PAGE_VERSIONS.original;
};

export const writeStoredPackagePageVersion = (
  version: PackagePageVersion,
): void => {
  sessionStorage.setItem(PACKAGE_PAGE_VERSION_STORAGE_KEY, version);
};
