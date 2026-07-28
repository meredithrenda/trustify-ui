import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  WORKFLOW_TOUR_ACTION_EVENT,
  type WorkflowTourActionDetail,
} from "./notify-tour-action";
import { getWorkflowTour, type WorkflowTour } from "./tours";

type WorkflowToursContextValue = {
  activeTour: WorkflowTour | null;
  stepIndex: number;
  startTour: (tourId: string) => void;
  clearTour: () => void;
  nextStep: () => void;
  dismissTour: () => void;
};

const WorkflowToursContext =
  React.createContext<WorkflowToursContextValue | null>(null);

export const WorkflowToursProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTour, setActiveTour] = React.useState<WorkflowTour | null>(null);
  const [stepIndex, setStepIndex] = React.useState(0);
  const bootstrapped = React.useRef(false);
  const activeTourRef = React.useRef(activeTour);
  const stepIndexRef = React.useRef(stepIndex);

  activeTourRef.current = activeTour;
  stepIndexRef.current = stepIndex;

  const clearTourParam = React.useCallback(() => {
    if (!searchParams.has("tour")) {
      return;
    }
    const next = new URLSearchParams(searchParams);
    next.delete("tour");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const startTour = React.useCallback(
    (tourId: string) => {
      const tour = getWorkflowTour(tourId);
      if (!tour) {
        return;
      }
      setActiveTour(tour);
      setStepIndex(0);
      if (tour.startPath) {
        navigate(tour.startPath);
      }
      const next = new URLSearchParams(searchParams);
      next.set("tour", tour.id);
      setSearchParams(next, { replace: true });
    },
    [navigate, searchParams, setSearchParams],
  );

  const clearTour = React.useCallback(() => {
    setActiveTour(null);
    setStepIndex(0);
    clearTourParam();
  }, [clearTourParam]);

  const dismissTour = clearTour;

  const nextStep = React.useCallback(() => {
    setStepIndex((current) => {
      const tour = activeTourRef.current;
      if (!tour) {
        return current;
      }
      if (current >= tour.steps.length - 1) {
        setActiveTour(null);
        clearTourParam();
        return 0;
      }
      return current + 1;
    });
  }, [clearTourParam]);

  React.useEffect(() => {
    const onTourAction = (event: Event) => {
      const { tourAttr } = (event as CustomEvent<WorkflowTourActionDetail>)
        .detail;
      const tour = activeTourRef.current;
      const index = stepIndexRef.current;
      if (!tour || !tourAttr) {
        return;
      }
      const current = tour.steps[index];
      if (!current || current.advanceOn !== "action") {
        return;
      }
      const expected =
        current.tourAttr ?? `${tour.id}.${current.id}`;
      if (tourAttr !== expected) {
        return;
      }
      nextStep();
    };

    window.addEventListener(WORKFLOW_TOUR_ACTION_EVENT, onTourAction);
    return () => {
      window.removeEventListener(WORKFLOW_TOUR_ACTION_EVENT, onTourAction);
    };
  }, [nextStep]);

  React.useEffect(() => {
    if (bootstrapped.current) {
      return;
    }
    bootstrapped.current = true;
    const tourId = searchParams.get("tour");
    if (!tourId) {
      return;
    }
    const tour = getWorkflowTour(tourId);
    if (!tour) {
      return;
    }
    setActiveTour(tour);
    setStepIndex(0);
    if (tour.startPath) {
      navigate(tour.startPath, { replace: true });
    }
  }, [navigate, searchParams]);

  const value = React.useMemo(
    () => ({
      activeTour,
      stepIndex,
      startTour,
      clearTour,
      nextStep,
      dismissTour,
    }),
    [activeTour, stepIndex, startTour, clearTour, nextStep, dismissTour],
  );

  return (
    <WorkflowToursContext.Provider value={value}>
      {children}
    </WorkflowToursContext.Provider>
  );
};

export const useWorkflowTours = (): WorkflowToursContextValue => {
  const context = React.useContext(WorkflowToursContext);
  if (!context) {
    throw new Error(
      "useWorkflowTours must be used within WorkflowToursProvider",
    );
  }
  return context;
};

/** Safe outside WorkflowToursProvider (e.g. masthead when tours are off). */
export const useWorkflowToursOptional =
  (): WorkflowToursContextValue | null =>
    React.useContext(WorkflowToursContext);
