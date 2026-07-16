import type { Group, PaginatedResultsGroupDetails } from "@app/client";

import { mockSboms } from "./sboms";

export type MockSbomGroup = PaginatedResultsGroupDetails["items"][number];

/** Prototype SBOM groups for GitHub Pages / local mock mode. */
export const mockSbomGroups: MockSbomGroup[] = [
  {
    id: "group-rhel-portfolio",
    name: "RHEL portfolio",
    description: "Red Hat Enterprise Linux product family SBOMs",
    parent: null,
    labels: { product: "rhel" },
    number_of_sboms: 1,
    number_of_groups: 0,
  },
  {
    id: "group-openshift",
    name: "OpenShift",
    description: "OpenShift Container Platform and related SBOMs",
    parent: null,
    labels: { product: "openshift" },
    number_of_sboms: 1,
    number_of_groups: 0,
  },
  {
    id: "group-ai-models",
    name: "AI & models",
    description: "AIBOM and model-related SBOMs",
    parent: null,
    labels: { product: "ai" },
    number_of_sboms: 1,
    number_of_groups: 0,
  },
];

/** Which mock SBOMs belong to each group (by SBOM id). */
const MOCK_GROUP_SBOM_IDS: Record<string, string[]> = {
  "group-rhel-portfolio": ["a1b2c3d4-0001-4000-8000-000000000001"],
  "group-openshift": ["a1b2c3d4-0002-4000-8000-000000000002"],
  "group-ai-models": ["a1b2c3d4-0004-4000-8000-000000000004"],
};

export const getMockSbomIdsForGroup = (groupId: string): Set<string> =>
  new Set(MOCK_GROUP_SBOM_IDS[groupId] ?? []);

export const getMockSbomGroupById = (id: string): Group | null =>
  mockSbomGroups.find((group) => group.id === id) ?? null;

/** Ensure counts stay in sync with membership for demos. */
export const getMockSbomGroupsWithCounts = (): MockSbomGroup[] =>
  mockSbomGroups.map((group) => ({
    ...group,
    number_of_sboms: getMockSbomIdsForGroup(group.id).size,
    number_of_groups: group.number_of_groups ?? 0,
  }));

export const getMockSbomsForGroup = (groupId: string) => {
  const allowed = getMockSbomIdsForGroup(groupId);
  return mockSboms.filter((sbom) => allowed.has(sbom.id));
};
