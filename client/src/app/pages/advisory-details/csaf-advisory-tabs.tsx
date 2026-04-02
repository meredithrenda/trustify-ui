import React from "react";

import {
  Card,
  CardBody,
  Content,
  Stack,
  StackItem,
} from "@patternfly/react-core";

import type { CsafDocument } from "@app/pages/csaf-visualizer/types";
import { mockCsafDocument } from "@app/mocks/csaf-document";
import { DocumentOverview } from "@app/pages/csaf-visualizer/components/DocumentOverview";
import { VulnerabilitySection } from "@app/pages/csaf-visualizer/components/VulnerabilitySection";
import { ProductsTable } from "@app/pages/csaf-visualizer/components/ProductsTable";
import { RelationshipTree } from "@app/pages/csaf-visualizer/components/RelationshipTree";

function getCsafData(): CsafDocument {
  return mockCsafDocument;
}

interface CsafTabContentProps {
  activeTab: string;
}

export const CsafTabContent: React.FC<CsafTabContentProps> = ({
  activeTab,
}) => {
  const csafData = getCsafData();

  return (
    <Stack hasGutter>
      {activeTab === "csaf-overview" && (
        <>
          <StackItem>
            <DocumentOverview data={csafData} />
          </StackItem>
          {csafData.document.notes && csafData.document.notes.length > 0 && (
            <StackItem>
              <Card>
                <CardBody>
                  <Content component="h3">Notes</Content>
                  {csafData.document.notes.map((note) => (
                    <div
                      key={note.title}
                      style={{
                        marginTop: "var(--pf-v6-global--spacer--sm)",
                      }}
                    >
                      <Content component="p">
                        <strong>{note.title}</strong>
                      </Content>
                      <Content
                        component="p"
                        style={{
                          color: "var(--pf-v6-global--Color--200)",
                          fontSize: "var(--pf-v6-global--FontSize--sm)",
                        }}
                      >
                        {note.text}
                      </Content>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </StackItem>
          )}
        </>
      )}
      {activeTab === "csaf-vulnerabilities" && (
        <StackItem>
          <VulnerabilitySection
            vulnerabilities={csafData.vulnerabilities}
            productTree={csafData.product_tree}
          />
        </StackItem>
      )}
      {activeTab === "csaf-products" && (
        <StackItem>
          <ProductsTable data={csafData} />
        </StackItem>
      )}
      {activeTab === "csaf-relationships" && (
        <StackItem>
          <RelationshipTree data={csafData} />
        </StackItem>
      )}
    </Stack>
  );
};
