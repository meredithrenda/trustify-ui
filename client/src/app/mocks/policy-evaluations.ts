export type PolicyEvaluationOutcome = "pass" | "warn" | "fail";

/** Policies available from admin-configured sources (prototype; not editable in TPA). */
export interface ConfiguredPolicy {
  id: string;
  label: string;
}

export const mockConfiguredPolicies: ConfiguredPolicy[] = [
  {
    id: "org-release-minimal@v1.4.0",
    label: "org-release-minimal@v1.4.0",
  },
  {
    id: "github-federated-builds@v1.2.1",
    label: "github-federated-builds@v1.2.1",
  },
];

export interface PendingPolicyEvaluationRequest {
  sbomIds: string[];
  policy: string;
  /** Unique per navigation; prevents duplicate runs when React Strict Mode re-runs effects. */
  requestId: string;
}

export interface InProgressPolicyEvaluationRun {
  runId: string;
  started: string;
  policy: string;
  evaluated: number;
  sbomIds: string[];
}

export const createInProgressPolicyRun = (
  request: PendingPolicyEvaluationRequest,
): InProgressPolicyEvaluationRun => {
  const run: InProgressPolicyEvaluationRun = {
    runId: `eval-${Date.now()}`,
    started: new Date().toISOString(),
    policy: request.policy,
    evaluated: request.sbomIds.length,
    sbomIds: request.sbomIds,
  };
  registerInProgressPolicyRun(run);
  return run;
};

const inProgressPolicyRuns = new Map<string, InProgressPolicyEvaluationRun>();
const inProgressPolicyRunsByRequestId = new Map<
  string,
  InProgressPolicyEvaluationRun
>();
const deletedSbomPolicyRunKeys = new Set<string>();

const sbomPolicyRunKey = (sbomId: string, runId: string) =>
  `${sbomId}:${runId}`;

/** Starts an in-progress run once per navigation request (Strict Mode safe). */
export const beginPolicyEvaluationFromNavigation = (
  request: PendingPolicyEvaluationRequest,
): InProgressPolicyEvaluationRun => {
  const existing = inProgressPolicyRunsByRequestId.get(request.requestId);
  if (existing) {
    return existing;
  }

  const run = createInProgressPolicyRun(request);
  inProgressPolicyRunsByRequestId.set(request.requestId, run);
  return run;
};

export const registerInProgressPolicyRun = (
  run: InProgressPolicyEvaluationRun,
): void => {
  inProgressPolicyRuns.set(run.runId, run);
};

export const findInProgressPolicyRun = (
  runId: string,
): InProgressPolicyEvaluationRun | undefined => inProgressPolicyRuns.get(runId);

export const listInProgressPolicyRuns = (): InProgressPolicyEvaluationRun[] =>
  [...inProgressPolicyRuns.values()].sort(
    (a, b) => new Date(b.started).getTime() - new Date(a.started).getTime(),
  );

/** Start an evaluation from SBOM context or bulk actions (shared registry). */
export const beginPolicyEvaluation = (
  request: PendingPolicyEvaluationRequest,
): InProgressPolicyEvaluationRun =>
  beginPolicyEvaluationFromNavigation(request);

export type PolicyRuleVerdict = "pass" | "warn" | "fail";

export interface PolicyRuleResult {
  rule: string;
  verdict: PolicyRuleVerdict;
  message?: string;
}

export interface SbomPolicyRunView {
  runId: string;
  started: string;
  policy: string;
  status: "complete" | "in_progress";
  duration?: string;
  /** SBOM-level outcome for this run (one SBOM, one policy). */
  outcome?: PolicyEvaluationOutcome;
  rules?: PolicyRuleResult[];
}

export interface MockPolicyEvaluationRun {
  runId: string;
  started: string;
  policy: string;
  evaluated: number;
  pass: number;
  warn: number;
  fail: number;
  duration: string;
  sbomsByOutcome: Record<PolicyEvaluationOutcome, string[]>;
}

/** Prototype SBOM IDs assigned per evaluation outcome (mutually exclusive). */
const SBOM = {
  rhel94: "a1b2c3d4-0001-4000-8000-000000000001",
  ocp416: "a1b2c3d4-0002-4000-8000-000000000002",
  quarkus: "a1b2c3d4-0003-4000-8000-000000000003",
  ubi9: "a1b2c3d4-0004-4000-8000-000000000004",
  postgres: "a1b2c3d4-0005-4000-8000-000000000005",
  nginx: "a1b2c3d4-0006-4000-8000-000000000006",
  nodeApp: "a1b2c3d4-0007-4000-8000-000000000007",
  springBoot: "a1b2c3d4-0008-4000-8000-000000000008",
  customerPortal: "a1b2c3d4-0009-4000-8000-000000000009",
  legacyService: "a1b2c3d4-0010-4000-8000-000000000010",
} as const;

export const mockPolicyEvaluationRuns: MockPolicyEvaluationRun[] = [
  {
    runId: "eval-20260513-full",
    started: "2026-05-13T02:00:00Z",
    policy: "org-release-minimal@v1.4.0",
    evaluated: 10,
    pass: 8,
    warn: 2,
    fail: 0,
    duration: "18m 42s",
    sbomsByOutcome: {
      pass: [
        SBOM.rhel94,
        SBOM.ocp416,
        SBOM.quarkus,
        SBOM.ubi9,
        SBOM.postgres,
        SBOM.nodeApp,
        SBOM.customerPortal,
        SBOM.legacyService,
      ],
      warn: [SBOM.nginx, SBOM.springBoot],
      fail: [],
    },
  },
  {
    runId: "eval-20260512-full",
    started: "2026-05-12T02:00:00Z",
    policy: "org-release-minimal@v1.4.0",
    evaluated: 8,
    pass: 7,
    warn: 1,
    fail: 0,
    duration: "17m 05s",
    sbomsByOutcome: {
      pass: [
        SBOM.rhel94,
        SBOM.ocp416,
        SBOM.quarkus,
        SBOM.ubi9,
        SBOM.postgres,
        SBOM.nodeApp,
        SBOM.springBoot,
      ],
      warn: [SBOM.nginx],
      fail: [],
    },
  },
  {
    runId: "eval-20260511-rhel",
    started: "2026-05-11T18:22:00Z",
    policy: "org-release-minimal@v1.3.9",
    evaluated: 3,
    pass: 3,
    warn: 0,
    fail: 0,
    duration: "4m 11s",
    sbomsByOutcome: {
      pass: [SBOM.rhel94, SBOM.ubi9, SBOM.postgres],
      warn: [],
      fail: [],
    },
  },
  {
    runId: "eval-20260510-github",
    started: "2026-05-10T14:30:00Z",
    policy: "github-federated-builds@v1.2.1",
    evaluated: 6,
    pass: 5,
    warn: 0,
    fail: 1,
    duration: "12m 18s",
    sbomsByOutcome: {
      pass: [SBOM.rhel94, SBOM.ocp416, SBOM.quarkus, SBOM.ubi9, SBOM.nginx],
      warn: [],
      fail: [SBOM.springBoot],
    },
  },
  {
    runId: "eval-20260509-full",
    started: "2026-05-09T02:00:00Z",
    policy: "org-release-minimal@v1.4.0",
    evaluated: 8,
    pass: 7,
    warn: 1,
    fail: 0,
    duration: "19m 03s",
    sbomsByOutcome: {
      pass: [
        SBOM.rhel94,
        SBOM.ocp416,
        SBOM.quarkus,
        SBOM.ubi9,
        SBOM.postgres,
        SBOM.nginx,
        SBOM.springBoot,
      ],
      warn: [SBOM.nodeApp],
      fail: [],
    },
  },
  {
    runId: "eval-20260508-portal",
    started: "2026-05-08T11:05:00Z",
    policy: "github-federated-builds@v1.2.1",
    evaluated: 4,
    pass: 3,
    warn: 1,
    fail: 0,
    duration: "6m 44s",
    sbomsByOutcome: {
      pass: [SBOM.customerPortal, SBOM.legacyService, SBOM.nodeApp],
      warn: [SBOM.springBoot],
      fail: [],
    },
  },
  {
    runId: "eval-20260507-full",
    started: "2026-05-07T02:00:00Z",
    policy: "org-release-minimal@v1.4.0",
    evaluated: 8,
    pass: 6,
    warn: 1,
    fail: 1,
    duration: "16m 29s",
    sbomsByOutcome: {
      pass: [
        SBOM.rhel94,
        SBOM.ocp416,
        SBOM.quarkus,
        SBOM.ubi9,
        SBOM.postgres,
        SBOM.nginx,
      ],
      warn: [SBOM.nodeApp],
      fail: [SBOM.springBoot],
    },
  },
  {
    runId: "eval-20260506-github",
    started: "2026-05-06T09:40:00Z",
    policy: "github-federated-builds@v1.2.1",
    evaluated: 7,
    pass: 5,
    warn: 2,
    fail: 0,
    duration: "8m 52s",
    sbomsByOutcome: {
      pass: [
        SBOM.rhel94,
        SBOM.quarkus,
        SBOM.ubi9,
        SBOM.nginx,
        SBOM.customerPortal,
      ],
      warn: [SBOM.ocp416, SBOM.postgres],
      fail: [],
    },
  },
  {
    runId: "eval-20260505-full",
    started: "2026-05-05T02:00:00Z",
    policy: "org-release-minimal@v1.4.0",
    evaluated: 8,
    pass: 6,
    warn: 1,
    fail: 1,
    duration: "18m 11s",
    sbomsByOutcome: {
      pass: [
        SBOM.rhel94,
        SBOM.ocp416,
        SBOM.quarkus,
        SBOM.ubi9,
        SBOM.postgres,
        SBOM.nginx,
      ],
      warn: [SBOM.nodeApp],
      fail: [SBOM.springBoot],
    },
  },
  {
    runId: "eval-20260504-minimal",
    started: "2026-05-04T02:00:00Z",
    policy: "org-release-minimal@v1.3.9",
    evaluated: 8,
    pass: 6,
    warn: 1,
    fail: 1,
    duration: "15m 37s",
    sbomsByOutcome: {
      pass: [
        SBOM.rhel94,
        SBOM.ocp416,
        SBOM.ubi9,
        SBOM.postgres,
        SBOM.quarkus,
        SBOM.nginx,
      ],
      warn: [SBOM.nodeApp],
      fail: [SBOM.springBoot],
    },
  },
];

export const findPolicyEvaluationRun = (
  runId: string,
): MockPolicyEvaluationRun | undefined =>
  mockPolicyEvaluationRuns.find((run) => run.runId === runId);

export const getPolicyRunSbomIds = (filterValue: string): Set<string> => {
  const [runId, outcome] = filterValue.split(":") as [
    string,
    PolicyEvaluationOutcome | undefined,
  ];

  const inProgressRun = findInProgressPolicyRun(runId);
  if (inProgressRun) {
    return outcome ? new Set() : new Set(inProgressRun.sbomIds);
  }

  const run = findPolicyEvaluationRun(runId);
  if (!run) {
    return new Set();
  }

  if (!outcome) {
    return new Set([
      ...run.sbomsByOutcome.pass,
      ...run.sbomsByOutcome.warn,
      ...run.sbomsByOutcome.fail,
    ]);
  }

  return new Set(run.sbomsByOutcome[outcome]);
};

export const formatPolicyRunFilterLabel = (filterValue: string): string => {
  const [runId, outcome] = filterValue.split(":");
  const inProgressRun = findInProgressPolicyRun(runId);
  if (inProgressRun) {
    const started = new Date(inProgressRun.started).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

    if (!outcome) {
      return `All SBOMs from ${inProgressRun.policy} run (${started})`;
    }

    return filterValue;
  }

  const run = findPolicyEvaluationRun(runId);
  if (!run) {
    return filterValue;
  }

  const started = new Date(run.started).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  if (!outcome) {
    return `All SBOMs from ${run.policy} run (${started})`;
  }

  const outcomeLabel =
    outcome === "pass" ? "passed" : outcome === "warn" ? "warnings" : "failed";

  return `SBOMs with ${outcomeLabel} — ${run.policy} (${started})`;
};

const variantRulesForSbom = (variant: number): PolicyRuleResult[] => {
  const passRules: PolicyRuleResult[] = [
    {
      rule: "slsa_provenance_available__attestation_predicate_type_accepted",
      verdict: "pass",
    },
    { rule: "sbom_cyclonedx__valid_cdx_1_5", verdict: "pass" },
    { rule: "tasks__successful_pipeline_tasks", verdict: "pass" },
  ];
  const warnRule: PolicyRuleResult = {
    rule: "cve__unpatched_cve_warnings",
    verdict: "warn",
    message:
      "SBOM lists CVE-2024-1234 without a fixed version in an affected component.",
  };
  const failRule: PolicyRuleResult = {
    rule: "base_image_registries__base_image_permitted",
    verdict: "fail",
    message:
      "Base image registry quay.io/example is not in the permitted registry list.",
  };

  if (variant === 0) {
    return [...passRules, warnRule];
  }
  if (variant === 1) {
    return [
      ...passRules,
      warnRule,
      {
        rule: "slsa_provenance_available__materials_missing",
        verdict: "warn",
        message: "One build material is missing a digest in the attestation.",
      },
    ];
  }

  return [...passRules, warnRule, failRule];
};

const summarizeRules = (rules: PolicyRuleResult[]) => {
  const outcome: PolicyEvaluationOutcome = rules.some(
    (row) => row.verdict === "fail",
  )
    ? "fail"
    : rules.some((row) => row.verdict === "warn")
      ? "warn"
      : "pass";

  return { outcome };
};

const mockSbomPolicyRunHistory: Record<string, SbomPolicyRunView[]> = {
  [SBOM.rhel94]: [
    {
      runId: "eval-sbom-rhel94-recent",
      started: "2026-05-12T09:15:00Z",
      policy: "org-release-minimal@v1.4.0",
      status: "complete",
      duration: "38s",
      ...summarizeRules(variantRulesForSbom(1)),
      rules: variantRulesForSbom(1),
    },
    {
      runId: "eval-sbom-rhel94-previous",
      started: "2026-05-08T16:40:00Z",
      policy: "org-release-minimal@v1.3.9",
      status: "complete",
      duration: "41s",
      ...summarizeRules(variantRulesForSbom(0)),
      rules: variantRulesForSbom(0),
    },
  ],
  [SBOM.springBoot]: [
    {
      runId: "eval-sbom-springboot-recent",
      started: "2026-05-13T02:05:00Z",
      policy: "org-release-minimal@v1.4.0",
      status: "complete",
      duration: "45s",
      ...summarizeRules(variantRulesForSbom(2)),
      rules: variantRulesForSbom(2),
    },
  ],
};

const defaultHistoryForSbom = (sbomId: string): SbomPolicyRunView[] => {
  const rules = variantRulesForSbom(sbomId.length % 3);
  const summary = summarizeRules(rules);

  return [
    {
      runId: `eval-sbom-${sbomId.slice(0, 8)}-latest`,
      started: "2026-05-11T11:00:00Z",
      policy: "org-release-minimal@v1.4.0",
      status: "complete",
      duration: "35s",
      ...summary,
      rules,
    },
  ];
};

const inProgressRunToSbomView = (
  run: InProgressPolicyEvaluationRun,
  sbomId: string,
): SbomPolicyRunView | undefined => {
  if (!run.sbomIds.includes(sbomId)) {
    return undefined;
  }

  return {
    runId: run.runId,
    started: run.started,
    policy: run.policy,
    status: "in_progress",
  };
};

export const getPolicyRunsForSbom = (sbomId: string): SbomPolicyRunView[] => {
  const inProgress = listInProgressPolicyRuns()
    .map((run) => inProgressRunToSbomView(run, sbomId))
    .filter((run): run is SbomPolicyRunView => run !== undefined);

  const completed =
    mockSbomPolicyRunHistory[sbomId] ?? defaultHistoryForSbom(sbomId);

  return [...inProgress, ...completed]
    .filter(
      (run) =>
        !deletedSbomPolicyRunKeys.has(sbomPolicyRunKey(sbomId, run.runId)),
    )
    .sort(
      (a, b) => new Date(b.started).getTime() - new Date(a.started).getTime(),
    );
};

/** Removes a policy evaluation run from this SBOM's history (prototype). */
export const deletePolicyRunForSbom = (sbomId: string, runId: string): void => {
  deletedSbomPolicyRunKeys.add(sbomPolicyRunKey(sbomId, runId));

  const inProgress = inProgressPolicyRuns.get(runId);
  if (inProgress?.sbomIds.includes(sbomId)) {
    inProgressPolicyRuns.delete(runId);
    for (const [requestId, run] of inProgressPolicyRunsByRequestId.entries()) {
      if (run.runId === runId) {
        inProgressPolicyRunsByRequestId.delete(requestId);
      }
    }
  }
};

export const getRunAdditionalDetails = (
  run: SbomPolicyRunView,
): string | undefined => {
  if (run.status === "in_progress" || !run.rules?.length) {
    return undefined;
  }

  const failRule = run.rules.find(
    (rule) => rule.verdict === "fail" && rule.message,
  );
  if (failRule?.message) {
    return failRule.message;
  }

  const warnRule = run.rules.find(
    (rule) => rule.verdict === "warn" && rule.message,
  );
  return warnRule?.message;
};

export interface PolicyPortfolioPosture {
  compliantPct: number;
  evaluatedSboms: number;
  withWarnings: number;
  nonCompliant: number;
}

const sumRunOutcomeCounts = (runs: MockPolicyEvaluationRun[]) =>
  runs.reduce(
    (totals, run) => ({
      evaluated: totals.evaluated + run.evaluated,
      pass: totals.pass + run.pass,
      warn: totals.warn + run.warn,
      fail: totals.fail + run.fail,
    }),
    { evaluated: 0, pass: 0, warn: 0, fail: 0 },
  );

/** Portfolio posture totals derived from evaluation run rows on the Policy page. */
export const getPortfolioPolicyPosture = (): PolicyPortfolioPosture => {
  const completedTotals = sumRunOutcomeCounts(mockPolicyEvaluationRuns);
  const inProgressEvaluated = listInProgressPolicyRuns().reduce(
    (sum, run) => sum + run.evaluated,
    0,
  );

  const evaluatedSboms = completedTotals.evaluated + inProgressEvaluated;
  const pass = completedTotals.pass;
  const withWarnings = completedTotals.warn;
  const nonCompliant = completedTotals.fail;

  return {
    compliantPct:
      completedTotals.evaluated > 0
        ? Math.round((pass / completedTotals.evaluated) * 100)
        : 0,
    evaluatedSboms,
    withWarnings,
    nonCompliant,
  };
};
