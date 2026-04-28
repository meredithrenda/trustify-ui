import type React from "react";

import type { IToggleFilterCategory } from "../FilterToolbar";
import { ToggleFilterBody } from "../FilterToolbar/ToggleFilterBody";
import type { IFilterControlProps } from "./FilterControl";

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
  isDisabled = false,
}: React.PropsWithChildren<
  IToggleFilterControlProps<TItem, TFilterCategoryKey>
>): React.JSX.Element | null => {
  return (
    <ToggleFilterBody
      category={category}
      filterValue={filterValue}
      setFilterValue={setFilterValue}
      isDisabled={isDisabled}
    />
  );
};
