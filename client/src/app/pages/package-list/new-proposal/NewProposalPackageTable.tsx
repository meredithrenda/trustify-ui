import React from "react";
import { generatePath, NavLink } from "react-router-dom";

import { Label } from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";

import { PackageQualifiers } from "@app/components/PackageQualifiers";
import { Paths } from "@app/Routes";

import type { NewProposalPackageRow } from "./filter-mock-packages";

interface NewProposalPackageTableProps {
  packages: NewProposalPackageRow[];
}

/** List-only table. Dependency exploration lives on package details → Dependencies. */
export const NewProposalPackageTable: React.FC<
  NewProposalPackageTableProps
> = ({ packages }) => {
  return (
    <Table aria-label="Packages table">
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Namespace</Th>
          <Th>Version</Th>
          <Th>Type</Th>
          <Th>CPE</Th>
          <Th>Licenses</Th>
          <Th>Qualifiers</Th>
          <Th>Vulnerabilities</Th>
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
