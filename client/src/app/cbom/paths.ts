/** Route paths for CBOM UI — kept separate from Routes.tsx to avoid circular imports. */
export const CBOM_ROUTE_PATHS = {
  policy: "/policy",
  sbomDetails: (sbomId: string) => `/sboms/${sbomId}`,
} as const;
