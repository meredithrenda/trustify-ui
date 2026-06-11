export const HOME_PAGE_VERSIONS = {
  final: "final",
  middleGround: "middle-ground",
} as const;

export type HomePageVersion =
  (typeof HOME_PAGE_VERSIONS)[keyof typeof HOME_PAGE_VERSIONS];

export const HOME_PAGE_VERSION_LABELS: Record<HomePageVersion, string> = {
  [HOME_PAGE_VERSIONS.final]: "Final home page",
  [HOME_PAGE_VERSIONS.middleGround]: "Middle-ground home page",
};

export const HOME_PAGE_VERSION_SHORT_LABELS: Record<HomePageVersion, string> =
  {
    [HOME_PAGE_VERSIONS.final]: "Final",
    [HOME_PAGE_VERSIONS.middleGround]: "Middle-ground",
  };

export const HOME_PAGE_VERSION_STORAGE_KEY = "trustify-home-page-version";

export const isHomePageVersion = (value: string): value is HomePageVersion =>
  Object.values(HOME_PAGE_VERSIONS).includes(value as HomePageVersion);

export const readStoredHomePageVersion = (): HomePageVersion => {
  if (typeof sessionStorage === "undefined") {
    return HOME_PAGE_VERSIONS.final;
  }

  const stored = sessionStorage.getItem(HOME_PAGE_VERSION_STORAGE_KEY);

  if (stored && isHomePageVersion(stored)) {
    return stored;
  }

  return HOME_PAGE_VERSIONS.final;
};

export const writeStoredHomePageVersion = (version: HomePageVersion): void => {
  sessionStorage.setItem(HOME_PAGE_VERSION_STORAGE_KEY, version);
};
