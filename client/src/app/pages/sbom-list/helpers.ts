import type { Path } from "react-router-dom";

import { TablePersistenceKeyPrefixes } from "@app/Constants";
import type { PolicyEvaluationOutcome } from "@app/mocks/policy-evaluations";
import { serializeFilterUrlParams } from "@app/hooks/table-controls";
import { trimAndStringifyUrlParams } from "@app/hooks/useUrlParams";
import { Paths } from "@app/Routes";

const sbomTableParamPrefix = (key: string) =>
  `${TablePersistenceKeyPrefixes.sboms}:${key}`;

export const getSbomFilteredByPolicyRunUrl = (
  runId: string,
  outcome?: PolicyEvaluationOutcome,
): Pick<Path, "pathname" | "search"> => {
  const filterValue = outcome ? `${runId}:${outcome}` : runId;

  const filterParams = serializeFilterUrlParams({
    policyRun: [filterValue],
  });

  return {
    pathname: Paths.sboms,
    search: trimAndStringifyUrlParams({
      newPrefixedSerializedParams: {
        [sbomTableParamPrefix("filters")]: filterParams.filters,
      },
    }),
  };
};

export const getSbomFilteredByLicenseUrl = (
  licenses: string[],
): Pick<Path, "pathname" | "search"> => {
  const filterParams = serializeFilterUrlParams({
    license: licenses,
  });

  const params = `${trimAndStringifyUrlParams({
    newPrefixedSerializedParams: {
      [sbomTableParamPrefix("filters")]: filterParams.filters,
    },
  })}`;

  return {
    pathname: Paths.sboms,
    search: params,
  };
};

export const getSbomFilteredByAlgorithmUrl = (
  algorithms: string[],
): Pick<Path, "pathname" | "search"> => {
  const filterParams = serializeFilterUrlParams({
    algorithm: algorithms,
  });

  const params = `${trimAndStringifyUrlParams({
    newPrefixedSerializedParams: {
      [sbomTableParamPrefix("filters")]: filterParams.filters,
    },
  })}`;

  return {
    pathname: Paths.sboms,
    search: params,
  };
};
