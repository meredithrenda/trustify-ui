import React from "react";

import {
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from "@patternfly/react-core";

import {
  CORRELATION_FRESHNESS_LABELS,
  CORRELATION_FRESHNESS_OPTIONS,
  type CorrelationFreshnessState,
} from "./correlationFreshness";

export type CorrelationFreshnessSwitcherProps = {
  state: CorrelationFreshnessState;
  onChange: (state: CorrelationFreshnessState) => void;
};

/**
 * Prototype-only control so reviewers can preview one freshness banner at a
 * time without changing the rest of the SBOM details layout.
 */
export const CorrelationFreshnessSwitcher: React.FC<
  CorrelationFreshnessSwitcherProps
> = ({ state, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Select
      id="correlation-freshness-banner-preview"
      isOpen={isOpen}
      selected={state}
      onOpenChange={(open) => setIsOpen(open)}
      onSelect={(_event, value) => {
        onChange(value as CorrelationFreshnessState);
        setIsOpen(false);
      }}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsOpen(!isOpen)}
          isExpanded={isOpen}
          aria-label="Banner preview"
        >
          {`Banner: ${CORRELATION_FRESHNESS_LABELS[state]}`}
        </MenuToggle>
      )}
      shouldFocusToggleOnSelect
    >
      <SelectList>
        {CORRELATION_FRESHNESS_OPTIONS.map((option) => (
          <SelectOption
            key={option}
            value={option}
            isSelected={state === option}
            data-testid={`correlation-freshness-${option}`}
          >
            {CORRELATION_FRESHNESS_LABELS[option]}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};
