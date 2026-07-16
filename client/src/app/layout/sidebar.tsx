import type React from "react";
import { NavLink } from "react-router-dom";

import {
  Nav,
  NavExpandable,
  NavList,
  PageSidebar,
  PageSidebarBody,
} from "@patternfly/react-core";
import { css } from "@patternfly/react-styles";
import nav from "@patternfly/react-styles/css/components/Nav/nav";

import { Paths } from "@app/Routes";

import "./sidebar.css";

const LINK_CLASS = nav.navLink;
const ACTIVE_LINK_CLASS = nav.modifiers.current;

const navLinkClass = (isActive: boolean) =>
  css(LINK_CLASS, isActive ? ACTIVE_LINK_CLASS : "");

export const SidebarApp: React.FC = () => {
  const renderMainNav = () => (
    <Nav aria-label="Primary">
      <NavList>
        <li className={nav.navItem}>
          <NavLink to="/" className={({ isActive }) => navLinkClass(isActive)}>
            Home
          </NavLink>
        </li>
        <li className={nav.navItem}>
          <NavLink
            to={Paths.search}
            className={({ isActive }) => navLinkClass(isActive)}
          >
            Search
          </NavLink>
        </li>
        <NavExpandable title="SBOMs" isExpanded>
          <li className={nav.navItem}>
            <NavLink
              to={Paths.sboms}
              className={({ isActive }) => navLinkClass(isActive)}
            >
              All SBOMs
            </NavLink>
          </li>
          <li className={nav.navItem}>
            <NavLink
              to={Paths.sbomGroups}
              className={({ isActive }) => navLinkClass(isActive)}
            >
              Groups
            </NavLink>
          </li>
        </NavExpandable>
        <li className={nav.navItem}>
          <NavLink
            to={Paths.vulnerabilities}
            className={({ isActive }) => navLinkClass(isActive)}
          >
            Vulnerabilities
          </NavLink>
        </li>
        <li className={nav.navItem}>
          <NavLink
            to={Paths.packages}
            className={({ isActive }) => navLinkClass(isActive)}
          >
            Packages
          </NavLink>
        </li>
        <li className={nav.navItem}>
          <NavLink
            to={Paths.policy}
            className={({ isActive }) => navLinkClass(isActive)}
          >
            Policies
          </NavLink>
        </li>
        <li className={nav.navItem}>
          <NavLink
            to={Paths.models}
            className={({ isActive }) => navLinkClass(isActive)}
          >
            Models
          </NavLink>
        </li>
        <li className={nav.navItem}>
          <NavLink
            to={Paths.cbomInventory}
            className={({ isActive }) => navLinkClass(isActive)}
          >
            Cryptography
          </NavLink>
        </li>
        <li className={nav.navItem}>
          <NavLink
            to={Paths.licenses}
            className={({ isActive }) => navLinkClass(isActive)}
          >
            Licenses
          </NavLink>
        </li>
        <li className={nav.navItem}>
          <NavLink
            to={Paths.advisories}
            className={({ isActive }) => navLinkClass(isActive)}
          >
            Advisories
          </NavLink>
        </li>
        <li className={nav.navItem}>
          <NavLink
            to={Paths.importers}
            className={({ isActive }) => navLinkClass(isActive)}
          >
            Importers
          </NavLink>
        </li>
      </NavList>
    </Nav>
  );

  const renderAgentSettingsNav = () => (
    <Nav aria-label="Agent settings">
      <NavList>
        <NavExpandable title="Agent Settings" isExpanded={false}>
          <li className={nav.navItem}>
            <NavLink
              to={Paths.tpaAgentPrompts}
              className={({ isActive }) => navLinkClass(isActive)}
            >
              Prompt manager
            </NavLink>
          </li>
          <li className={nav.navItem}>
            <NavLink
              to={Paths.tpaAgentMcp}
              className={({ isActive }) => navLinkClass(isActive)}
            >
              MCP settings
            </NavLink>
          </li>
        </NavExpandable>
      </NavList>
    </Nav>
  );

  return (
    <PageSidebar>
      <PageSidebarBody isFilled className="sidebar-app">
        <div className="sidebar-app__main">{renderMainNav()}</div>
        <div className="sidebar-app__settings">{renderAgentSettingsNav()}</div>
      </PageSidebarBody>
    </PageSidebar>
  );
};
