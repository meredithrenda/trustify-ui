import type { AvatarProps } from "@patternfly/react-core";

import userAvatar from "@app/images/avatar.svg";
import tpaAgentBotAvatarMedium from "@app/images/rh-ui-ai-chatbot-medium.png";

/** PatternFly chatbot demo user avatar (SVG). */
export const tpaAgentUserAvatarSrc = userAvatar;

/** Red Hat UI AI chatbot icon — message avatars (3rem). */
export const tpaAgentBotAvatarSrc = tpaAgentBotAvatarMedium;

export const tpaAgentUserAvatarProps: Omit<AvatarProps, "alt"> = {
  isBordered: true,
};
