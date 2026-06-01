import { formatEvidenceContext } from "./formatEvidence";
import type {
  CryptoDetectionRule,
  CryptoEvidenceEntry,
  CryptographicAsset,
  ParsedCbomDocument,
} from "./types";

type CycloneDxCbom = {
  bomFormat?: string;
  specVersion?: string;
  serialNumber?: string;
  metadata?: {
    tools?: {
      components?: Array<{
        type?: string;
        group?: string;
        name?: string;
        version?: string;
      }>;
    };
  };
  components?: CycloneDxComponent[];
};

type CycloneDxComponent = {
  "bom-ref"?: string;
  type?: string;
  name?: string;
  description?: string;
  evidence?: {
    identity?: Array<{
      field?: string;
      confidence?: number;
      methods?: Array<{
        technique?: string;
        confidence?: number;
        value?: string;
      }>;
    }>;
    occurrences?: Array<{
      location?: string;
      line?: number;
      additionalContext?: string;
    }>;
  };
  cryptoProperties?: {
    assetType?: string;
    oid?: string;
    algorithmProperties?: {
      primitive?: string;
      parameterSetIdentifier?: string;
      executionEnvironment?: string;
      implementationPlatform?: string;
      cryptoFunctions?: string[];
    };
    relatedCryptoMaterialProperties?: {
      type?: string;
    };
  };
};

function parseScanner(bom: CycloneDxCbom) {
  const tool = bom.metadata?.tools?.components?.[0];
  if (!tool?.name) {
    return undefined;
  }
  return {
    group: tool.group,
    name: tool.name,
    version: tool.version,
  };
}

function parseDetectionRules(
  component: CycloneDxComponent,
): CryptoDetectionRule[] {
  const rules: CryptoDetectionRule[] = [];
  const seen = new Set<string>();

  for (const identity of component.evidence?.identity ?? []) {
    for (const method of identity.methods ?? []) {
      if (!method.value || seen.has(method.value)) {
        continue;
      }
      seen.add(method.value);
      rules.push({
        technique: method.technique,
        value: method.value,
        confidence: method.confidence ?? identity.confidence,
      });
    }
  }

  return rules;
}

function parseEvidence(component: CycloneDxComponent): CryptoEvidenceEntry[] {
  return (component.evidence?.occurrences ?? [])
    .filter((occ) => occ.location != null && occ.line != null)
    .map((occ) => ({
      location: occ.location as string,
      line: occ.line as number,
      context: formatEvidenceContext(occ.additionalContext),
    }));
}

function mapComponent(
  component: CycloneDxComponent,
  discoverySource: string,
  scannerName?: string,
  scannerVersion?: string,
): CryptographicAsset | null {
  if (component.type !== "cryptographic-asset" || !component.name) {
    return null;
  }

  const id = component["bom-ref"] ?? `crypto-${component.name}`;
  const crypto = component.cryptoProperties;
  const assetType = crypto?.assetType ?? "algorithm";
  const algo = crypto?.algorithmProperties;
  const primitive = algo?.primitive;
  const evidence = parseEvidence(component);
  const occurrenceCount = evidence.length;
  const usageType =
    occurrenceCount > 0 ? "Usage in source" : "Declared capability";
  return {
    id,
    name: component.name,
    algorithm: component.name,
    assetType,
    materialType: crypto?.relatedCryptoMaterialProperties?.type,
    description: component.description,
    primitive,
    cryptoFunctions: algo?.cryptoFunctions,
    parameterSetIdentifier: algo?.parameterSetIdentifier,
    oid: crypto?.oid,
    executionEnvironment: algo?.executionEnvironment,
    implementationPlatform: algo?.implementationPlatform,
    discoverySource,
    scannerName,
    scannerVersion,
    usageType,
    occurrenceCount,
    evidence: evidence.length > 0 ? evidence : undefined,
    detectionRules: (() => {
      const rules = parseDetectionRules(component);
      return rules.length > 0 ? rules : undefined;
    })(),
  };
}

export function parseCycloneDxCbom(
  raw: unknown,
  discoverySource = "CycloneDX CBOM",
): ParsedCbomDocument {
  const bom = raw as CycloneDxCbom;

  if (bom.bomFormat && bom.bomFormat !== "CycloneDX") {
    throw new Error(`Unsupported BOM format: ${bom.bomFormat}`);
  }

  const scanner = parseScanner(bom);
  const scannerLabel = scanner
    ? [scanner.group, scanner.name].filter(Boolean).join(" ")
    : discoverySource;

  const assets: CryptographicAsset[] = [];

  for (const component of bom.components ?? []) {
    const asset = mapComponent(
      component,
      scannerLabel,
      scanner?.name,
      scanner?.version,
    );
    if (asset) {
      assets.push(asset);
    }
  }

  return {
    serialNumber: bom.serialNumber,
    specVersion: bom.specVersion,
    scanner,
    assets,
  };
}

export function parseCycloneDxCbomJson(
  json: string,
  discoverySource?: string,
): ParsedCbomDocument {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json) as unknown;
  } catch {
    throw new Error("Invalid JSON file.");
  }
  return parseCycloneDxCbom(parsed, discoverySource);
}
