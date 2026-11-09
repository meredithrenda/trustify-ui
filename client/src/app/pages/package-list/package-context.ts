import type { DecomposedPurl } from "@app/api/models";
import type { PurlSummary } from "@app/client";
import type { ITableControls } from "@app/hooks/table-controls";
import type { AxiosError } from "axios";
import React from "react";

export interface PackageTableData extends PurlSummary {
	decomposedPurl?: DecomposedPurl;
}

export interface IPackageSearchContext {
	tableControls: ITableControls<
		PackageTableData,
		| "name"
		| "namespace"
		| "version"
		| "type"
		| "licenses"
		| "path"
		| "qualifiers"
		| "vulnerabilities"
		| "remediation",
		"name" | "namespace" | "version",
		"" | "type" | "arch" | "license" | "algorithm" | "has_vulnerabilities",
		string
	>;

	totalItemCount: number;
	isFetching: boolean;
	fetchError: AxiosError | null;
}

const contextDefaultValue = {} as IPackageSearchContext;

export const PackageSearchContext =
	React.createContext<IPackageSearchContext>(contextDefaultValue);
