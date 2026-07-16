import type React from "react";
import { Outlet } from "react-router-dom";
import "./App.css";

import { NotificationsProvider } from "./components/NotificationsContext";
import { ReadOnlyProvider } from "./components/ReadOnlyContext";
import { DefaultLayout } from "./layout";

import "@patternfly/patternfly/patternfly.css";
import "@patternfly/patternfly/patternfly-addons.css";
import "@patternfly/patternfly/patternfly-charts.css";
import "@patternfly/chatbot/dist/css/main.css";
import "@app/components/tpa-agent/tpa-agent.css";

const App: React.FC = () => {
  return (
    <ReadOnlyProvider>
      <NotificationsProvider>
        <DefaultLayout>
          <Outlet />
        </DefaultLayout>
      </NotificationsProvider>
    </ReadOnlyProvider>
  );
};

export default App;
