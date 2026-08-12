import React from "react";
import { generatePath, NavLink } from "react-router-dom";

import { Label } from "@patternfly/react-core";
import type { OnSort } from "@patternfly/react-table";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";

import { PackageQualifiers } from "@app/components/PackageQualifiers";
import { Paths } from "@app/Routes";

import type { NewProposalPackageRow } from "./filter-mock-packages";
import type { NewProposalSortBy } from "./new-proposal-table-controls";

interface NewProposalPackageTableProps {
  packages: NewProposalPackageRow[];
  sortBy: NewProposalSortBy;
  onSort: OnSort;
}

/** List-only table. Dependency exploration lives on package details → Dependencies. */
export const NewProposalPackageTable: React.FC<
  NewProposalPackageTableProps
> = ({ packages, sortBy, onSort }) => {
  const thSort = (columnIndex: number) => ({
    columnIndex,
    onSort,
    sortBy: {
      index: sortBy.index,
      direction: sortBy.direction,
      defaultDirection: "asc" as const,
    },
  });

  return (
    <Table aria-label="Packages table">
      <Thead>
        <Tr>
          <Th sort={thSort(0)}>Name</Th>
          <Th sort={thSort(1)}>Namespace</Th>
          <Th sort={thSort(2)}>Version</Th>
          <Th sort={thSort(3)}>Type</Th>
          <Th sort={thSort(4)}>CPE</Th>
          <Th sort={thSort(5)}>Licenses</Th>
          <Th sort={thSort(6)}>Qualifiers</Th>
          <Th sort={thSort(7)}>Vulnerabilities</Th>
        </Tr>
      </Thead>
      <Tbody>
        {packages.map((pkg) => (
          <Tr key={pkg.uuid}>
            <Td dataLabel="Name" modifier="breakWord">
              <NavLink
                to={`${generatePath(Paths.packageDetails, {
                  packageId: pkg.uuid,
                })}?pd:activeTab=dependencies`}
              >
                {pkg.name}
              </NavLink>
            </Td>
            <Td dataLabel="Namespace" modifier="truncate">
              {pkg.namespace || "—"}
            </Td>
            <Td dataLabel="Version" modifier="truncate">
              {pkg.version}
            </Td>
            <Td dataLabel="Type" modifier="truncate">
              {pkg.type}
            </Td>
            <Td dataLabel="CPE" modifier="truncate">
              {pkg.cpe || "—"}
            </Td>
            <Td dataLabel="Licenses" modifier="truncate">
              {pkg.licensesLabel}
            </Td>
            <Td dataLabel="Qualifiers">
              {pkg.qualifiers && Object.keys(pkg.qualifiers).length > 0 ? (
                <PackageQualifiers value={pkg.qualifiers} />
              ) : (
                "—"
              )}
            </Td>
            <Td dataLabel="Vulnerabilities">
              {pkg.hasVulnerabilities ? (
                <Label color="red">Has vulnerabilities</Label>
              ) : (
                <Label color="green">None known</Label>
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
