/** Dispatched when a reviewer completes a tour step action in the UI. */
export const WORKFLOW_TOUR_ACTION_EVENT = "workflow-tour-action";

export type WorkflowTourActionDetail = {
  tourAttr: string;
};

/** Call from UI when the user completes the highlighted action. */
export const notifyTourAction = (tourAttr: string): void => {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(
    new CustomEvent<WorkflowTourActionDetail>(WORKFLOW_TOUR_ACTION_EVENT, {
      detail: { tourAttr },
    }),
  );
};
