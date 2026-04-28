import type React from "react";

import { Checkbox, Flex, Switch } from "@patternfly/react-core";

import { parseBooleanIfPossible } from "@app/utils/utils";

import type { IToggleFilterCategory } from "./FilterToolbar";

export interface IToggleFilterBodyProps<
  TItem,
  TFilterCategoryKey extends string,
> {
  category: IToggleFilterCategory<TItem, TFilterCategoryKey>;
  filterValue: string[] | null | undefined;
  setFilterValue: (newValue: string[] | null | undefined) => void;
  isDisabled?: boolean;
}

export const ToggleFilterBody = <TItem, TFilterCategoryKey extends string>({
  category,
  filterValue,
  setFilterValue,
  isDisabled = false,
}: IToggleFilterBodyProps<TItem, TFilterCategoryKey>): React.JSX.Element => {
  const isChecked = parseBooleanIfPossible(filterValue?.[0]);
  const onChange = (value: boolean) => {
    if (value) {
      setFilterValue([String(true)]);
    } else {
      setFilterValue(null);
    }
  };

  if (category.useSwitch) {
    const switchId = `filter-control-${category.categoryKey}`;
    const labelId = `${switchId}-label`;

    return (
      <Flex
        alignItems={{ default: "alignItemsCenter" }}
        spaceItems={{ default: "spaceItemsSm" }}
        flexWrap={{ default: "nowrap" }}
      >
        <Switch
          id={switchId}
          aria-labelledby={labelId}
          isChecked={isChecked}
          onChange={(_e, value) => onChange(value)}
          isDisabled={isDisabled}
        />
        <span id={labelId}>{category.label}</span>
      </Flex>
    );
  }

  return (
    <Checkbox
      id={`filter-control-${category.categoryKey}`}
      label={category.label}
      description={category.description}
      isChecked={isChecked}
      onChange={(_e, value) => onChange(value)}
      isDisabled={isDisabled}
    />
  );
};
