import type React from "react";

import { DocumentMetadata } from "@app/components/DocumentMetadata";

import { FinalHomePage } from "./final-home-page";

export const Home: React.FC = () => {
  return (
    <>
      <DocumentMetadata title={"Home"} />
      <FinalHomePage />
    </>
  );
};
