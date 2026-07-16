import type { Group, PaginatedResultsGroupDetails } from "@app/client";

import { mockSboms } from "./sboms";

export type MockSbomGroup = PaginatedResultsGroupDetails["items"][number];

/** Prototype SBOM groups for GitHub Pages / local mock mode. */
export const mockSbomGroups: MockSbomGroup[] = [
  {
    id: "group-rhel-975",
    name: "Red Hat Enterprise Linux 9.7.5",
    description: "View and manage SBOMs associated with this group",
    parent: null,
    labels: { Product: "" },
    number_of_sboms: 10,
    number_of_groups: 0,
  },
  {
    id: "group-rhel-portfolio",
    name: "RHEL portfolio",
    description: "Red Hat Enterprise Linux product family SBOMs",
    parent: null,
    labels: {},
    number_of_sboms: 1,
    number_of_groups: 0,
  },
  {
    id: "group-openshift",
    name: "OpenShift",
    description: "OpenShift Container Platform and related SBOMs",
    parent: null,
    labels: {},
    number_of_sboms: 1,
    number_of_groups: 0,
  },
  {
    id: "group-ai-models",
    name: "AI & models",
    description: "AIBOM and model-related SBOMs",
    parent: null,
    labels: {},
    number_of_sboms: 1,
    number_of_groups: 0,
  },
];

/** Which mock SBOMs belong to each group (by SBOM id). */
const MOCK_GROUP_SBOM_IDS: Record<string, string[]> = {
  "group-rhel-975": [
    "a1b2c3d4-0001-4000-8000-000000000001",
    "a1b2c3d4-0002-4000-8000-000000000002",
    "a1b2c3d4-0003-4000-8000-000000000003",
    "a1b2c3d4-0004-4000-8000-000000000004",
    "a1b2c3d4-0005-4000-8000-000000000005",
    "a1b2c3d4-0006-4000-8000-000000000006",
    "a1b2c3d4-0007-4000-8000-000000000007",
    "a1b2c3d4-0008-4000-8000-000000000008",
    "a1b2c3d4-0009-4000-8000-000000000009",
    "a1b2c3d4-0010-4000-8000-000000000010",
  ],
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
