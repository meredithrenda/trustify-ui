import type React from "react";

import {
  Button,
  Content,
  Flex,
  FlexItem,
  Popover,
} from "@patternfly/react-core";
import { OutlinedQuestionCircleIcon } from "@patternfly/react-icons";

interface CorrelationFailedInfoProps {
  /** Optional short reason shown in the popover. */
  message?: string;
}

/**
 * Row-level correlation failure: plain "Failed" text + info popover.
 */
export const CorrelationFailedInfo: React.FC<CorrelationFailedInfoProps> = ({
  message = "Correlation could not be completed for this vulnerability. The status is unavailable until correlation succeeds. Try again later, or contact your administrator if the problem continues.",
}) => {
  return (
    <Flex
      spaceItems={{ default: "spaceItemsXs" }}
      alignItems={{ default: "alignItemsCenter" }}
      flexWrap={{ default: "nowrap" }}
    >
      <FlexItem>Failed</FlexItem>
      <FlexItem>
        <Popover
          aria-label="Why correlation failed"
          headerContent="Correlation failed"
          hasAutoWidth
          bodyContent={<Content component="p">{message}</Content>}
        >
          <Button
            variant="link"
            isInline
            aria-label="Why correlation failed"
            icon={<OutlinedQuestionCircleIcon />}
          />
        </Popover>
      </FlexItem>
    </Flex>
  );
};
