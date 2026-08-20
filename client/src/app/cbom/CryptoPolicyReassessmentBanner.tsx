import type React from "react";

import { Alert, AlertActionCloseButton, Content } from "@patternfly/react-core";

import type {
  CryptographyPolicyReassessmentPhase,
  CryptographyPolicyReassessmentProgress,
} from "./useCryptographyPolicyReassessment";

interface CryptoPolicyReassessmentBannerProps {
  phase: CryptographyPolicyReassessmentPhase;
  progress: CryptographyPolicyReassessmentProgress;
  onDismissComplete?: () => void;
}

export const CryptoPolicyReassessmentBanner: React.FC<
  CryptoPolicyReassessmentBannerProps
> = ({ phase, progress, onDismissComplete }) => {
  if (phase === "reassessing") {
    return (
      <Alert
        isInline
        variant="info"
        title="Algorithms are being reassessed against the updated policy configuration"
      >
        <Content component="p">
          Results will update automatically as assessments complete (
          {progress.assessedCount} of {progress.totalCount} algorithms
          assessed).
        </Content>
      </Alert>
    );
  }

  return (
    <Alert
      isInline
      variant="success"
      title="Policy reassessment complete"
      actionClose={
        onDismissComplete ? (
          <AlertActionCloseButton onClose={onDismissComplete} />
        ) : undefined
      }
    >
      <Content component="p">
        Algorithm policy results now reflect the updated policy configuration.
      </Content>
    </Alert>
  );
};
