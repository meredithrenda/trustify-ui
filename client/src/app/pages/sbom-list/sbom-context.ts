import React from "react";

import type { AxiosError } from "axios";

import type {
  RequestedFieldHashMapHashMap,
  SbomHead,
  SourceDocument,
} from "@app/client";
import type { BulkSelectionValues } from "@app/hooks/selection";
import type { ITableControls } from "@app/hooks/table-controls";

interface ISbomSearchContext {
  tableControls: ITableControls<
    SbomHead &
      SourceDocument & {
        described_by: Array<{
          group?: string | null;
          id: string;
          name: string;
          version?: string | null;
        }>;
        advisories?: RequestedFieldHashMapHashMap;
      },
    | "name"
    | "version"
    | "packages"
    | "published"
    | "supplier"
    | "labels"
    | "vulnerabilities",
    "name" | "published",
    "" | "published" | "labels" | "license" | "policyRun",
    string
  >;

  bulkSelection: {
    isEnabled: boolean;
    controls: BulkSelectionValues<
      SbomHead &
        SourceDocument & {
          described_by: Array<{
            group?: string | null;
            id: string;
            name: string;
            version?: string | null;
          }>;
        }
    >;
  };

  sbomGroupId?: string;
  totalItemCount: number;
  isFetching: boolean;
  fetchError: AxiosError | null;
  policyRunFilter?: string;
}

const contextDefaultValue = {} as ISbomSearchContext;

export const SbomSearchContext =
  React.createContext<ISbomSearchContext>(contextDefaultValue);
