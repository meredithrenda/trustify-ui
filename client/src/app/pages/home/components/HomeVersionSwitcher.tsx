import type React from "react";

import {
  Flex,
  FlexItem,
  ToggleGroup,
  ToggleGroupItem,
} from "@patternfly/react-core";

import {
  HOME_PAGE_VERSION_LABELS,
  HOME_PAGE_VERSION_SHORT_LABELS,
  HOME_PAGE_VERSIONS,
  type HomePageVersion,
} from "../home-versions";

import "./home-version-switcher.css";

interface HomeVersionSwitcherProps {
  value: HomePageVersion;
  onChange: (version: HomePageVersion) => void;
}

const HOME_PAGE_VERSION_OPTIONS = [
  HOME_PAGE_VERSIONS.final,
  HOME_PAGE_VERSIONS.middleGround,
] as const;

export const HomeVersionSwitcher: React.FC<HomeVersionSwitcherProps> = ({
  value,
  onChange,
}) => {
  return (
    <Flex
      alignItems={{ default: "alignItemsCenter" }}
      gap={{ default: "gapSm" }}
      className="home-version-switcher"
    >
      <FlexItem>
        <span className="home-version-switcher__label">View</span>
      </FlexItem>
      <FlexItem>
        <ToggleGroup isCompact aria-label="Home page version">
          {HOME_PAGE_VERSION_OPTIONS.map((version) => (
            <ToggleGroupItem
              key={version}
              text={HOME_PAGE_VERSION_SHORT_LABELS[version]}
              aria-label={HOME_PAGE_VERSION_LABELS[version]}
              isSelected={value === version}
              data-testid={`home-page-version-${version}`}
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
