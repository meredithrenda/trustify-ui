export interface AIModel {
  id: string;
  name: string;
  purl: string;
  publisher: string;
  license: string;
  risk: "High risk" | "Medium risk" | "Low risk";
  modelType: string;
  primaryPurpose: string;
  suppliedBy: string;
  sbomFormat: string;
  sbomSpecVersion: string;
  serialNumber: string;
  manifestVersion: string;
  externalReferences: {
    website?: { label: string; url: string };
    distribution?: { label: string; url: string };
    llmAnalysisReport?: { label: string; url: string };
  };
  sbomId: string;
  sbomName: string;
  sbomCount: number;
}
