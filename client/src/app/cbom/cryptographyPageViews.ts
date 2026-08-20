export const CRYPTOGRAPHY_PAGE_VIEWS = {
  default: "default",
  updatedPolicy: "updatedPolicy",
} as const;

export type CryptographyPageView =
  (typeof CRYPTOGRAPHY_PAGE_VIEWS)[keyof typeof CRYPTOGRAPHY_PAGE_VIEWS];

export const CRYPTOGRAPHY_PAGE_VIEW_LABELS: Record<CryptographyPageView, string> =
  {
    default: "Default",
    updatedPolicy: "Updated policy",
  };
