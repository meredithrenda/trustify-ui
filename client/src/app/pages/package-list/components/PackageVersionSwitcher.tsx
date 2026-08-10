import type React from "react";

import {
  Flex,
  FlexItem,
  ToggleGroup,
  ToggleGroupItem,
} from "@patternfly/react-core";

import {
  PACKAGE_PAGE_VERSION_LABELS,
  PACKAGE_PAGE_VERSION_SHORT_LABELS,
  PACKAGE_PAGE_VERSIONS,
  type PackagePageVersion,
} from "../package-versions";

import "./package-version-switcher.css";

interface PackageVersionSwitcherProps {
  value: PackagePageVersion;
  onChange: (version: PackagePageVersion) => void;
}

const PACKAGE_PAGE_VERSION_OPTIONS = [
  PACKAGE_PAGE_VERSIONS.original,
  PACKAGE_PAGE_VERSIONS.newProposal,
] as const;

export const PackageVersionSwitcher: React.FC<
  PackageVersionSwitcherProps
> = ({ value, onChange }) => {
  return (
    <Flex
      alignItems={{ default: "alignItemsCenter" }}
      gap={{ default: "gapSm" }}
      className="package-version-switcher"
    >
      <FlexItem>
        <span className="package-version-switcher__label">View</span>
      </FlexItem>
      <FlexItem>
        <ToggleGroup isCompact aria-label="Packages page version">
          {PACKAGE_PAGE_VERSION_OPTIONS.map((version) => (
            <ToggleGroupItem
              key={version}
              text={PACKAGE_PAGE_VERSION_SHORT_LABELS[version]}
              aria-label={PACKAGE_PAGE_VERSION_LABELS[version]}
              isSelected={value === version}
              data-testid={`package-page-version-${version}`}
              onChange={(_event, selected) => {
                if (selected) {
                  onChange(version);
                }
              }}
            />
          ))}
        </ToggleGroup>
      </FlexItem>
    </Flex>
  );
};
