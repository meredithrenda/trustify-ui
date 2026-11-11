import "./workflow-tours.css";

import React from "react";

import { PrototypeModeProvider } from "@app/components/prototype-mode";

import { WorkflowToursBar } from "./WorkflowToursBar";
import { WorkflowTourSpotlight } from "./WorkflowTourSpotlight";
import { WorkflowToursProvider } from "./WorkflowToursProvider";

/** Demo chrome: bar above masthead + spotlight panel. */
export const WorkflowToursChrome: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <PrototypeModeProvider>
    <WorkflowToursProvider>
      <div className="workflow-tours-shell">
        <WorkflowToursBar />
        {children}
        <WorkflowTourSpotlight />
      </div>
    </WorkflowToursProvider>
  </PrototypeModeProvider>
);
