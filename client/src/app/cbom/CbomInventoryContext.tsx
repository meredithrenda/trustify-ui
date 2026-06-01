import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { FIXTURE_CRYPTOGRAPHIC_ASSETS, mergeInventoryAssets } from "./cbomData";
import { parseCycloneDxCbomJson } from "./parseCycloneDxCbom";
import type { CryptographicAsset } from "./types";

interface CbomInventoryContextValue {
  assets: CryptographicAsset[];
  /** Returns true when assets were added successfully. */
  addUploadedCbom: (fileName: string, json: string) => boolean;
  uploadError: string | null;
  clearUploadError: () => void;
}

const CbomInventoryContext = createContext<CbomInventoryContextValue | null>(
  null,
);

export const CbomInventoryProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [uploadedAssets, setUploadedAssets] = useState<CryptographicAsset[]>(
    [],
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  const addUploadedCbom = useCallback((fileName: string, json: string) => {
    try {
      const parsed = parseCycloneDxCbomJson(json, fileName);
      if (parsed.assets.length === 0) {
        setUploadError("No cryptographic-asset components found in this BOM.");
        return false;
      }
      const uploadId = `uploaded-${Date.now()}`;
      const withLinks = parsed.assets.map((asset) => ({
        ...asset,
        sboms: [{ id: uploadId, name: fileName.replace(/\.json$/i, "") }],
      }));
      setUploadedAssets((prev) => [...withLinks, ...prev]);
      setUploadError(null);
      return true;
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Failed to parse CBOM file.",
      );
      return false;
    }
  }, []);

  const clearUploadError = useCallback(() => setUploadError(null), []);

  const assets = useMemo(
    () => mergeInventoryAssets(FIXTURE_CRYPTOGRAPHIC_ASSETS, uploadedAssets),
    [uploadedAssets],
  );

  const value = useMemo(
    () => ({
      assets,
      addUploadedCbom,
      uploadError,
      clearUploadError,
    }),
    [assets, addUploadedCbom, uploadError, clearUploadError],
  );

  return (
    <CbomInventoryContext.Provider value={value}>
      {children}
    </CbomInventoryContext.Provider>
  );
};

export function useCbomInventory(): CbomInventoryContextValue {
  const ctx = useContext(CbomInventoryContext);
  if (!ctx) {
    throw new Error(
      "useCbomInventory must be used within CbomInventoryProvider",
    );
  }
  return ctx;
}
