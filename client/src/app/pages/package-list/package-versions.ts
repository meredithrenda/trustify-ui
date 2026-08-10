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
