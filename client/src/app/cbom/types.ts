/** Single detection site; aligns with CycloneDX crypto-asset evidence. */
export type CryptoEvidenceEntry = {
  location: string;
  line: number;
  context?: string;
};

export type CryptoDetectionRule = {
  technique?: string;
  value: string;
  confidence?: number;
};

/** CycloneDX `cryptoProperties.assetType` (e.g. algorithm, related-crypto-material). */
export type CryptoAssetType = string;

export type CryptoUsageType = "Usage in source" | "Declared capability";

export interface CryptographicAssetSbomLink {
  id: string;
  name: string;
}

export interface CryptographicAsset {
  id: string;
  /** CycloneDX component name (e.g. SHA-256, private-key). */
  name: string;
  /** Display alias; same as `name`. */
  algorithm: string;
  assetType: CryptoAssetType;
  materialType?: string;
  description?: string;
  primitive?: string;
  cryptoFunctions?: string[];
  parameterSetIdentifier?: string;
  oid?: string;
  executionEnvironment?: string;
  implementationPlatform?: string;
  discoverySource: string;
  scannerName?: string;
  scannerVersion?: string;
  usageType: CryptoUsageType;
  occurrenceCount: number;
  evidence?: CryptoEvidenceEntry[];
  detectionRules?: CryptoDetectionRule[];
  sboms?: CryptographicAssetSbomLink[];
}

export interface CbomScannerInfo {
  name: string;
  version?: string;
  group?: string;
}

export interface ParsedCbomDocument {
  serialNumber?: string;
  specVersion?: string;
  scanner?: CbomScannerInfo;
  assets: CryptographicAsset[];
}
