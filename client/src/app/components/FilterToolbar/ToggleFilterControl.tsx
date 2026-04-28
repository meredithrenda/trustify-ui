import type React from "react";

import { ToolbarFilter } from "@patternfly/react-core";

import type { IFilterControlProps } from "./FilterControl";
import type { IToggleFilterCategory } from "./FilterToolbar";
import { ToggleFilterBody } from "./ToggleFilterBody";

export interface IToggleFilterControlProps<
  TItem,
  TFilterCategoryKey extends string,
> extends IFilterControlProps<TItem, TFilterCategoryKey> {
  category: IToggleFilterCategory<TItem, TFilterCategoryKey>;
}

export const ToggleFilterControl = <TItem, TFilterCategoryKey extends string>({
  category,
  filterValue,
  setFilterValue,
  showToolbarItem,
  isDisabled = false,
}: React.PropsWithChildren<
  IToggleFilterControlProps<TItem, TFilterCategoryKey>
>): React.JSX.Element | null => {
  return (
    <ToolbarFilter
      labels={filterValue?.map((value) => ({ key: value, node: value })) || []}
      deleteLabel={() => setFilterValue(null)}
      categoryName={category.title}
      showToolbarItem={showToolbarItem}
    >
      <ToggleFilterBody
        category={category}
        filterValue={filterValue}
        setFilterValue={setFilterValue}
        isDisabled={isDisabled}
      />
    </ToolbarFilter>
  );
};
