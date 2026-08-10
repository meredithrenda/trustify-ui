export type PackageSearchType = "text" | "name" | "purl" | "cpe";

export const PACKAGE_SEARCH_TYPE_OPTIONS: {
  value: PackageSearchType;
  label: string;
}[] = [
  { value: "text", label: "Filter text" },
  { value: "name", label: "Name" },
  { value: "purl", label: "PURL" },
  { value: "cpe", label: "CPE" },
];

export const PACKAGE_TYPE_OPTIONS = [
  { value: "has-purl", label: "Has PURL" },
  { value: "source-rpm", label: "Source RPM" },
  { value: "binary-rpm", label: "Binary RPM" },
  { value: "source-archive", label: "Source archive" },
  { value: "jar-generic", label: "JAR / Generic" },
] as const;

export type PackageTypeOption =
  (typeof PACKAGE_TYPE_OPTIONS)[number]["value"];

/** Prototype-only package “kinds” for multi-select filtering (mock data). */
export const MOCK_PACKAGE_KINDS: Record<string, PackageTypeOption[]> = {
  "pkg-001": ["has-purl", "binary-rpm"],
  "pkg-002": ["has-purl", "binary-rpm"],
  "pkg-003": ["has-purl", "jar-generic"],
  "pkg-004": ["has-purl", "jar-generic"],
  "pkg-005": ["has-purl", "binary-rpm"],
  "pkg-006": ["has-purl", "jar-generic"],
  "pkg-007": ["has-purl", "jar-generic"],
  "pkg-008": ["has-purl", "binary-rpm"],
  "pkg-009": ["has-purl", "source-archive"],
  "pkg-010": ["has-purl", "binary-rpm"],
  // Synthetic source RPM row used only in New proposal filtering demos
  "pkg-011": ["has-purl", "source-rpm"],
};
