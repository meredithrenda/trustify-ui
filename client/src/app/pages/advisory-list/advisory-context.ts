import React from "react";

import type { AxiosError } from "axios";

import type { AdvisorySummary } from "@app/client";
import type { ITableControls } from "@app/hooks/table-controls";

export interface IAdvisorySearchContext {
  tableControls: ITableControls<
    AdvisorySummary,
    "identifier" | "title" | "type" | "labels" | "modified" | "vulnerabilities",
    "identifier" | "modified",
    "" | "average_severity" | "modified" | "labels" | "type",
    string
  >;

  totalItemCount: number;
  isFetching: boolean;
  fetchError: AxiosError | null;
}

const contextDefaultValue = {} as IAdvisorySearchContext;

export const AdvisorySearchContext =
  React.createContext<IAdvisorySearchContext>(contextDefaultValue);
