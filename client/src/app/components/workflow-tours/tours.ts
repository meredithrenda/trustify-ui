export type TourAdvanceOn = "action" | "next" | "route";

export type WorkflowTourStep = {
  id: string;
  title: string;
  body: string;
  /**
   * Optional “Design annotation” for developers — expectations, edge cases,
   * team design decisions. Not tour/spotlight instructions.
   */
  annotation?: string;
  advanceOn: TourAdvanceOn;
  /** Matches data-tour="<tour-id>.<step-id>" in the UI */
  tourAttr?: string;
};

export type WorkflowTour = {
  id: string;
  label: string;
  summary: string;
  /**
   * App path to open when the tour starts. Omit to start on the current page
   * (“start from anywhere”).
   */
  startPath?: string;
  steps: WorkflowTourStep[];
};

const GLASS_MODE_ANNOTATION =
  "Glass mode is designed to work across light and dark color schemes in both our Default and Project Felt themes. To enable glass, add the class .pf-v6-theme-glass to your application’s <html> tag. When implementing glass, it’s important to ensure that it does not harm the overall accessibility or usability of your product.";

/** Visual mock tours — Policy evaluation is the first designed example. */
export const WORKFLOW_TOURS: WorkflowTour[] = [
  {
    id: "policy-evaluation",
    label: "Policy evaluation",
    summary: "Select SBOMs, run a policy, then review the run on Policies.",
    startPath: "/sboms",
    steps: [
      {
        id: "select-sboms",
        title: "Select 2 SBOMs",
        body: "Select 2 SBOMs in the table by clicking their checkboxes.",
        advanceOn: "action",
        tourAttr: "policy-evaluation.select-sboms",
      },
      {
        id: "open-actions",
        title: "Open Actions",
        body: "Open the Actions menu in the toolbar.",
        advanceOn: "action",
        tourAttr: "policy-evaluation.open-actions",
      },
      {
        id: "run-policy",
        title: "Run policy evaluation",
        body: "Choose “Run policy evaluation”.",
        advanceOn: "action",
        tourAttr: "policy-evaluation.run-policy",
      },
      {
        id: "choose-policy",
        title: "Choose a policy",
        body: "Pick a policy in the modal, then click Run evaluation.",
        advanceOn: "action",
        tourAttr: "policy-evaluation.choose-policy",
      },
      {
        id: "see-run",
        title: "Review the run",
        body: "Your new evaluation appears as the in-progress row at the top of the table.",
        annotation:
          "In-progress runs show “—” for Pass/Warn/Fail until completion, do not show zeros.",
        advanceOn: "next",
        tourAttr: "policy-evaluation.see-run",
      },
    ],
  },
  {
    id: "switch-contrast-modes",
    label: "Switch contrast modes",
    summary:
      "Open display settings and try Glass, Dark, Light, and High contrast.",
    steps: [
      {
        id: "open-settings",
        title: "Open display settings",
        body: "Open display settings from the gear in the masthead.",
        advanceOn: "action",
        tourAttr: "switch-contrast-modes.open-settings",
      },
      {
        id: "choose-glass",
        title: "Choose Glass",
        body: "Choose “Glass”.",
        annotation: GLASS_MODE_ANNOTATION,
        advanceOn: "action",
        tourAttr: "switch-contrast-modes.choose-glass",
      },
      {
        id: "choose-dark",
        title: "Choose Dark",
        body: "Choose “Dark” (glass stays on).",
        advanceOn: "action",
        tourAttr: "switch-contrast-modes.choose-dark",
      },
      {
        id: "choose-light",
        title: "Choose Light",
        body: "Choose “Light”.",
        advanceOn: "action",
        tourAttr: "switch-contrast-modes.choose-light",
      },
      {
        id: "choose-high-contrast",
        title: "Choose High contrast",
        body: "Choose “High contrast”.",
        advanceOn: "action",
        tourAttr: "switch-contrast-modes.choose-high-contrast",
      },
    ],
  },
];

export const getWorkflowTour = (id: string): WorkflowTour | undefined =>
  WORKFLOW_TOURS.find((tour) => tour.id === id);
