import type React from "react";

import {
  Flex,
  FlexItem,
  ToggleGroup,
  ToggleGroupItem,
} from "@patternfly/react-core";

import {
  CRYPTOGRAPHY_PAGE_VIEW_LABELS,
  CRYPTOGRAPHY_PAGE_VIEWS,
  type CryptographyPageView,
} from "./cryptographyPageViews";

interface CryptographyPageViewSwitcherProps {
  value: CryptographyPageView;
  onChange: (view: CryptographyPageView) => void;
}

const CRYPTOGRAPHY_PAGE_VIEW_OPTIONS = [
  CRYPTOGRAPHY_PAGE_VIEWS.default,
  CRYPTOGRAPHY_PAGE_VIEWS.updatedPolicy,
] as const;

export const CryptographyPageViewSwitcher: React.FC<
  CryptographyPageViewSwitcherProps
> = ({ value, onChange }) => (
  <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
    <FlexItem>
      <span>View</span>
    </FlexItem>
    <FlexItem>
      <ToggleGroup isCompact aria-label="Cryptography page view">
        {CRYPTOGRAPHY_PAGE_VIEW_OPTIONS.map((view) => (
          <ToggleGroupItem
            key={view}
            text={CRYPTOGRAPHY_PAGE_VIEW_LABELS[view]}
            aria-label={CRYPTOGRAPHY_PAGE_VIEW_LABELS[view]}
            isSelected={value === view}
            onChange={(_event, selected) => {
              if (selected) {
                onChange(view);
              }
            }}
          />
        ))}
      </ToggleGroup>
    </FlexItem>
  </Flex>
);
