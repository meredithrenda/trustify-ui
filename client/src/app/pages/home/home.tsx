import React from "react";

import { Flex, FlexItem } from "@patternfly/react-core";

import { DocumentMetadata } from "@app/components/DocumentMetadata";

import { HomeVersionSwitcher } from "./components/HomeVersionSwitcher";
import { FinalHomePage } from "./final-home-page";
import {
  HOME_PAGE_VERSIONS,
  type HomePageVersion,
  readStoredHomePageVersion,
  writeStoredHomePageVersion,
} from "./home-versions";
import { MiddleGroundHomePage } from "./middle-ground-home-page";

export const Home: React.FC = () => {
  const [homePageVersion, setHomePageVersion] =
    React.useState<HomePageVersion>(readStoredHomePageVersion);

  const handleHomePageVersionChange = (version: HomePageVersion) => {
    setHomePageVersion(version);
    writeStoredHomePageVersion(version);
  };

  return (
    <>
      <DocumentMetadata title={"Home"} />

      <Flex
        justifyContent={{ default: "justifyContentFlexEnd" }}
        className="home-version-switcher-bar"
      >
        <FlexItem>
          <HomeVersionSwitcher
            value={homePageVersion}
            onChange={handleHomePageVersionChange}
          />
        </FlexItem>
      </Flex>

      {homePageVersion === HOME_PAGE_VERSIONS.final ? (
        <FinalHomePage />
      ) : (
        <MiddleGroundHomePage />
      )}
    </>
  );
};
