import { useEffect } from "react";

import { useLocation, useParams } from "react-router-dom";

import { PathParam } from "@app/Routes";

import { useTpaAgent } from "./TpaAgentContext";
import { resolveTpaPageContext } from "./pageContext";

/** Keeps agent page context in sync with the current route. */
export const TpaAgentPageContextSync = () => {
  const { pathname } = useLocation();
  const params = useParams();
  const { setPageContext, clearContextFocus } = useTpaAgent();

  useEffect(() => {
    clearContextFocus();
    setPageContext(
      resolveTpaPageContext(pathname, {
        sbomId: params[PathParam.SBOM_ID],
        advisoryId: params[PathParam.ADVISORY_ID],
        vulnerabilityId: params[PathParam.VULNERABILITY_ID],
        packageId: params[PathParam.PACKAGE_ID],
        licenseName: params[PathParam.LICENSE_NAME],
      }),
    );
  }, [pathname, params, setPageContext, clearContextFocus]);

  return null;
};
