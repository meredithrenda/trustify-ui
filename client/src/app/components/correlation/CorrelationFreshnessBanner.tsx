import type React from "react";

import { Alert, AlertActionLink, Content } from "@patternfly/react-core";

import {
  CORRELATION_FRESHNESS_STATES,
  type CorrelationFreshnessState,
} from "./correlationFreshness";

export type CorrelationFreshnessBannerProps = {
  state: CorrelationFreshnessState;
  onLoadUpdatedResults?: () => void;
};

/**
 * SBOM-level correlation freshness banner. Only one state shows at a time;
 * Current renders nothing.
 */
export const CorrelationFreshnessBanner: React.FC<
  CorrelationFreshnessBannerProps
> = ({ state, onLoadUpdatedResults }) => {
  if (state === CORRELATION_FRESHNESS_STATES.current) {
    return null;
  }

  if (state === CORRELATION_FRESHNESS_STATES.not_computed) {
    return (
      <Alert
        variant="warning"
        isInline
        title="Correlation results are not available yet"
      >
        <Content component="p">
          Correlation has not finished for this SBOM. Statuses and evidence may
          be missing until processing completes.
        </Content>
      </Alert>
    );
  }

  if (state === CORRELATION_FRESHNESS_STATES.stale) {
    return (
      <Alert
        variant="warning"
        isInline
        title="Correlation results may be outdated"
      >
        <Content component="p">
          Data or matching settings changed after these results were computed.
          Statuses and evidence may be incomplete. No action is needed; updated
          results will appear here when processing finishes.
        </Content>
      </Alert>
    );
  }

  return (
    <Alert
      variant="info"
      isInline
      title="Updated correlation results are available"
      actionLinks={
        <AlertActionLink onClick={onLoadUpdatedResults}>
          Load updated results
        </AlertActionLink>
      }
    >
      <Content component="p">
        Newer results finished while you were on this page. Load them to
        replace the statuses and evidence shown below.
      </Content>
    </Alert>
  );
};
