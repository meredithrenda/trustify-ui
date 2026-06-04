import type React from "react";

import tpaAgentBotIconSmall from "@app/images/rh-ui-ai-chatbot-small.png";

/** Red Hat UI AI chatbot icon — launcher FAB and inline affordances. */
export const TpaAgentChatIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <img
    alt=""
    aria-hidden
    className={className}
    src={tpaAgentBotIconSmall}
  />
);
