import type { TrustificationEnvType } from "@trustify-ui/common";
import { buildTrustificationEnv, decodeEnv } from "@trustify-ui/common";

const decodedEnv = decodeEnv(
  typeof window !== "undefined" && window._env ? window._env : "",
) as Partial<TrustificationEnvType>;

const fromDocument = buildTrustificationEnv(decodedEnv);

const mockFromHtmlBootstrap =
  typeof window !== "undefined" && window.__TRUSTIFY_UI_MOCK_DATA__ === true;

/**
 * Mock dev / GitHub Pages: turn auth off when either (1) `index.html` set
 * `window.__TRUSTIFY_UI_MOCK_DATA__` at parse time, or (2) Rsbuild `define` replaced
 * `__MOCK_DATA__` in the bundle (fallback).
 */
const useNoAuth =
  mockFromHtmlBootstrap ||
  (typeof __MOCK_DATA__ !== "undefined" && __MOCK_DATA__ === true);

export const ENV = useNoAuth
  ? buildTrustificationEnv({ ...fromDocument, AUTH_REQUIRED: "false" })
  : fromDocument;

export default ENV;
