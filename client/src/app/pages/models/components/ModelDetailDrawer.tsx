import React from "react";

import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import ExternalLinkAltIcon from "@patternfly/react-icons/dist/esm/icons/external-link-alt-icon";

import type { AIModel } from "../types";

interface Props {
  model: AIModel;
}

export const ModelDetailDrawer: React.FC<Props> = ({ model }) => {
  return (
    <Stack hasGutter>
      <StackItem>
        <Card>
          <CardTitle>Identity & Purpose</CardTitle>
          <CardBody>
            <DescriptionList
              isHorizontal
              isCompact
            >
              <DescriptionListGroup>
                <DescriptionListTerm>Model type</DescriptionListTerm>
                <DescriptionListDescription>
                  {model.modelType}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Primary purpose</DescriptionListTerm>
                <DescriptionListDescription>
                  <Label color="teal" isCompact>
                    {model.primaryPurpose}
                  </Label>
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>License</DescriptionListTerm>
                <DescriptionListDescription>
                  {model.license}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Supplied by</DescriptionListTerm>
                <DescriptionListDescription>
                  {model.suppliedBy}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>SBOM Metadata</CardTitle>
          <CardBody>
            <DescriptionList
              isHorizontal
              isCompact
            >
              <DescriptionListGroup>
                <DescriptionListTerm>Format</DescriptionListTerm>
                <DescriptionListDescription>
                  {model.sbomFormat}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Spec version</DescriptionListTerm>
                <DescriptionListDescription>
                  {model.sbomSpecVersion}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Serial number</DescriptionListTerm>
                <DescriptionListDescription>
                  <Content
                    component="small"
                    style={{ wordBreak: "break-all" }}
                  >
                    {model.serialNumber}
                  </Content>
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Manifest version</DescriptionListTerm>
                <DescriptionListDescription>
                  {model.manifestVersion}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card>
          <CardTitle>External References</CardTitle>
          <CardBody>
            <DescriptionList
              isHorizontal
              isCompact
            >
              {model.externalReferences.website && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Website</DescriptionListTerm>
                  <DescriptionListDescription>
                    <a
                      href={model.externalReferences.website.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {model.externalReferences.website.label}{" "}
                      <ExternalLinkAltIcon
                        style={{
                          fontSize: "var(--pf-v6-global--FontSize--xs)",
                        }}
                      />
                    </a>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {model.externalReferences.distribution && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Distribution</DescriptionListTerm>
                  <DescriptionListDescription>
                    <a
                      href={model.externalReferences.distribution.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {model.externalReferences.distribution.label}{" "}
                      <ExternalLinkAltIcon
                        style={{
                          fontSize: "var(--pf-v6-global--FontSize--xs)",
                        }}
                      />
                    </a>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {model.externalReferences.llmAnalysisReport && (
                <DescriptionListGroup>
                  <DescriptionListTerm>
                    LLM Analysis Report
                  </DescriptionListTerm>
                  <DescriptionListDescription>
                    <a
                      href={model.externalReferences.llmAnalysisReport.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {model.externalReferences.llmAnalysisReport.label}{" "}
                      <ExternalLinkAltIcon
                        style={{
                          fontSize: "var(--pf-v6-global--FontSize--xs)",
                        }}
                      />
                    </a>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
            </DescriptionList>
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Button variant="primary">
          Download
        </Button>
      </StackItem>
    </Stack>
  );
};
