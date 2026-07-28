declare const __MOCK_DATA__: boolean;
declare const __GITHUB_PAGES__: boolean;

/** Demo / Pages prototypes only — not the real product. */
export const isWorkflowToursEnabled = (): boolean => {
  const mock =
    typeof __MOCK_DATA__ !== "undefined" && __MOCK_DATA__ === true;
  const pages =
    typeof __GITHUB_PAGES__ !== "undefined" && __GITHUB_PAGES__ === true;
  return mock || pages;
};
