export type PraDocumentId =
  | "sar"
  | "threat-model"
  | "pentesting"
  | "sast"
  | "dast"
  | "vex";

export type Completeness = "Partial" | "Missing" | "Complete";

export type RiskLevel = "Very high" | "High" | "Moderate" | "Low" | "Very low";

export type PraCriterion = {
  id: string;
  name: string;
  completeness: Completeness;
  riskLevel: RiskLevel;
  score: number;
};

export type PraAssessment = {
  /** Lower is better (product risk). Shown as X/100 on summary views. */
  riskScorePercent: number;
  submittedAt: string;
  lastSavedAt: string;
  criteria: PraCriterion[];
};

export type PraDocument = {
  id: PraDocumentId;
  title: string;
  description: string;
  /** Relative weight when all documents are selected (sums to 100). */
  baseWeight: number;
};

export const PRA_INTRO =
  "The NIST 800-30 Product Risk Assessment (PRA) is a methodology used to assess and manage product risks. Its primary goal is to help organizations increase product transparency and meet compliance requirements.";

export const PRA_DOCUMENTS: PraDocument[] = [
  {
    id: "sar",
    title: "Security Architecture Review (SAR)",
    description:
      "Security Architecture Reviews evaluate the overall security design of your system, including security controls, data flow, authentication mechanisms, and compliance with security best practices.",
    baseWeight: 20,
  },
  {
    id: "threat-model",
    title: "Threat Model",
    description:
      "Threat models identify potential security threats, vulnerabilities, and attack vectors in your system architecture. They help prioritize security controls and mitigation strategies.",
    baseWeight: 5,
  },
  {
    id: "pentesting",
    title: "Pentesting (PT)",
    description:
      "Penetration testing validates security controls through simulated attacks, identifying exploitable weaknesses before adversaries do.",
    baseWeight: 25,
  },
  {
    id: "sast",
    title: "Static Application Security Testing (SAST)",
    description:
      "SAST analyzes source code and binaries for security flaws without executing the application.",
    baseWeight: 15,
  },
  {
    id: "dast",
    title: "Dynamic Application Security Testing (DAST)",
    description:
      "DAST probes running applications for vulnerabilities exposed through interfaces and runtime behavior.",
    baseWeight: 15,
  },
  {
    id: "vex",
    title: "Vulnerability Exploitability Exchange (VEX) File",
    description:
      "VEX files communicate whether known vulnerabilities are exploitable in a product, supporting risk prioritization and disclosure.",
    baseWeight: 20,
  },
];

export const ALL_PRA_DOCUMENT_IDS: PraDocumentId[] = PRA_DOCUMENTS.map(
  (doc) => doc.id,
);

/** Mock SAR criteria — low overall risk example for demos. */
export const MOCK_SAR_CRITERIA: PraCriterion[] = [
  {
    id: "scope",
    name: "System scope and boundaries",
    completeness: "Partial",
    riskLevel: "Low",
    score: 3,
  },
  {
    id: "components",
    name: "System components and architecture",
    completeness: "Partial",
    riskLevel: "Moderate",
    score: 4.5,
  },
  {
    id: "data-flows",
    name: "Data flows and information movement",
    completeness: "Partial",
    riskLevel: "Low",
    score: 3.5,
  },
  {
    id: "assets",
    name: "Asset identification and classification",
    completeness: "Partial",
    riskLevel: "Moderate",
    score: 4,
  },
  {
    id: "sensitivity",
    name: "Information sensitivity and classification",
    completeness: "Partial",
    riskLevel: "Low",
    score: 3,
  },
  {
    id: "purpose",
    name: "System purpose, business context, and mission criticality",
    completeness: "Partial",
    riskLevel: "Low",
    score: 2.5,
  },
  {
    id: "interfaces",
    name: "System interfaces and external connections",
    completeness: "Partial",
    riskLevel: "Moderate",
    score: 4,
  },
  {
    id: "controls",
    name: "Security controls and protections",
    completeness: "Partial",
    riskLevel: "Low",
    score: 3,
  },
  {
    id: "compliance",
    name: "Security and compliance requirements",
    completeness: "Partial",
    riskLevel: "Low",
    score: 2.5,
  },
  {
    id: "environment",
    name: "System environment and operational context",
    completeness: "Partial",
    riskLevel: "Low",
    score: 2,
  },
  {
    id: "known-issues",
    name: "Known issues, vulnerabilities and weaknesses",
    completeness: "Partial",
    riskLevel: "Moderate",
    score: 4,
  },
  {
    id: "documentation",
    name: "Documentation quality and completeness",
    completeness: "Partial",
    riskLevel: "Low",
    score: 3,
  },
];

const MOCK_DOC_SCORES: Partial<Record<PraDocumentId, number>> = {
  "threat-model": 12,
  sar: 22,
  pentesting: 8,
  sast: 15,
  dast: 18,
  vex: 10,
};

export const createMockAssessment = (
  documentId: PraDocumentId,
): PraAssessment => {
  const now = new Date();
  const submitted = now.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const lastSaved = now.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });

  if (documentId === "sar") {
    return {
      riskScorePercent: MOCK_DOC_SCORES.sar ?? 22,
      submittedAt: submitted,
      lastSavedAt: lastSaved,
      criteria: MOCK_SAR_CRITERIA,
    };
  }

  return {
    riskScorePercent: MOCK_DOC_SCORES[documentId] ?? 42,
    submittedAt: submitted,
    lastSavedAt: lastSaved,
    criteria: MOCK_SAR_CRITERIA.slice(0, 5).map((c, i) => ({
      ...c,
      id: `${documentId}-${c.id}`,
      score: Math.max(3, c.score - i * 0.25),
    })),
  };
};

/** Renormalize base weights so selected docs always sum to 100. */
export const getRenormalizedWeights = (
  selectedIds: PraDocumentId[],
): Record<PraDocumentId, number> => {
  const selected = PRA_DOCUMENTS.filter((doc) => selectedIds.includes(doc.id));
  const total = selected.reduce((sum, doc) => sum + doc.baseWeight, 0);
  const weights = {} as Record<PraDocumentId, number>;

  for (const doc of selected) {
    weights[doc.id] =
      total === 0 ? 0 : Math.round((doc.baseWeight / total) * 1000) / 10;
  }

  // Fix rounding drift on the last item so weights sum to 100.
  if (selected.length > 0) {
    const last = selected[selected.length - 1];
    const others = selected
      .slice(0, -1)
      .reduce((sum, doc) => sum + weights[doc.id], 0);
    weights[last.id] = Math.round((100 - others) * 10) / 10;
  }

  return weights;
};

/** Weighted overall risk from completed assessments among the selected set. */
export const getOverallRiskScore = (
  selectedIds: PraDocumentId[],
  assessments: Partial<Record<PraDocumentId, PraAssessment>>,
): {
  score: number | null;
  completedCount: number;
  selectedCount: number;
  isPartial: boolean;
} => {
  const completed = selectedIds.filter((id) => assessments[id]);
  const selectedCount = selectedIds.length;
  const completedCount = completed.length;

  if (completedCount === 0) {
    return { score: null, completedCount, selectedCount, isPartial: false };
  }

  const weights = getRenormalizedWeights(completed);
  const score =
    Math.round(
      completed.reduce((sum, id) => {
        const assessment = assessments[id];
        return sum + (assessment?.riskScorePercent ?? 0) * (weights[id] / 100);
      }, 0) * 10,
    ) / 10;

  return {
    score,
    completedCount,
    selectedCount,
    isPartial: completedCount < selectedCount,
  };
};
