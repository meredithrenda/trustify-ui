import type React from "react";
import { Link } from "react-router-dom";

import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Content,
  Grid,
  GridItem,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import {
  PlusCircleIcon,
  FileAltIcon,
  SecurityIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
} from "@patternfly/react-icons";

import { Paths } from "@app/Routes";

export const GettingStartedSection: React.FC = () => {
  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2" size="lg">
          Get started
        </Title>
        <Content>
          Start analyzing your software supply chain security with these key
          actions.
        </Content>
      </StackItem>

      <StackItem>
        <Grid hasGutter>
          <GridItem md={4}>
            <Card isFullHeight>
              <CardBody>
                <Stack hasGutter>
                  <StackItem>
                    <PlusCircleIcon
                      size="xl"
                      style={{
                        color: "var(--pf-v6-global--primary-color--100)",
                      }}
                    />
                  </StackItem>
                  <StackItem>
                    <CardTitle>Upload an SBOM</CardTitle>
                  </StackItem>
                  <StackItem>
                    <Content>
                      Upload a Software Bill of Materials (SBOM) to analyze
                      your software components and identify potential
                      vulnerabilities in your supply chain.
                    </Content>
                  </StackItem>
                  <StackItem>
                    <Link to={Paths.sbomUpload}>
                      <Button variant="primary">Upload SBOM →</Button>
                    </Link>
                  </StackItem>
                </Stack>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem md={4}>
            <Card isFullHeight>
              <CardBody>
                <Stack hasGutter>
                  <StackItem>
                    <SecurityIcon
                      size="xl"
                      style={{
                        color: "var(--pf-v6-global--primary-color--100)",
                      }}
                    />
                  </StackItem>
                  <StackItem>
                    <CardTitle>Generate VEX Report</CardTitle>
                  </StackItem>
                  <StackItem>
                    <Content>
                      Create a Vulnerability Exploitability eXchange (VEX)
                      report to document which vulnerabilities are exploitable
                      in your products.
                    </Content>
                  </StackItem>
                  <StackItem>
                    <Link to={Paths.sboms}>
                      <Button variant="primary">Generate VEX →</Button>
                    </Link>
                  </StackItem>
                </Stack>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem md={4}>
            <Card isFullHeight>
              <CardBody>
                <Stack hasGutter>
                  <StackItem>
                    <FileAltIcon
                      size="xl"
                      style={{
                        color: "var(--pf-v6-global--primary-color--100)",
                      }}
                    />
                  </StackItem>
                  <StackItem>
                    <CardTitle>Vulnerability Report</CardTitle>
                  </StackItem>
                  <StackItem>
                    <Content>
                      Generate a comprehensive vulnerability report for an SBOM
                      with detailed analysis of affected packages and severity
                      assessments.
                    </Content>
                  </StackItem>
                  <StackItem>
                    <Link to={Paths.sboms}>
                      <Button variant="primary">View Reports →</Button>
                    </Link>
                  </StackItem>
                </Stack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </StackItem>

      <StackItem>
        <Grid hasGutter>
          <GridItem md={6}>
            <Card isFullHeight>
              <CardBody>
                <Stack hasGutter>
                  <StackItem>
                    <ExclamationTriangleIcon
                      size="xl"
                      style={{
                        color: "var(--pf-v6-global--warning-color--100)",
                      }}
                    />
                  </StackItem>
                  <StackItem>
                    <CardTitle>Top Vulnerabilities</CardTitle>
                  </StackItem>
                  <StackItem>
                    <Content>
                      View the most critical vulnerabilities affecting your
                      software supply chain, prioritized by severity and
                      exploitability.
                    </Content>
                  </StackItem>
                  <StackItem>
                    <Link to={Paths.vulnerabilities}>
                      <Button variant="primary">View Vulnerabilities →</Button>
                    </Link>
                  </StackItem>
                </Stack>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem md={6}>
            <Card isFullHeight>
              <CardBody>
                <Stack hasGutter>
                  <StackItem>
                    <BookOpenIcon
                      size="xl"
                      style={{
                        color: "var(--pf-v6-global--primary-color--100)",
                      }}
                    />
                  </StackItem>
                  <StackItem>
                    <CardTitle>Documentation</CardTitle>
                  </StackItem>
                  <StackItem>
                    <Content>
                      Learn how to use Red Hat Trusted Product Advisor to
                      manage supply chain security, understand SBOM analysis,
                      and interpret vulnerability reports.
                    </Content>
                  </StackItem>
                  <StackItem>
                    <a
                      href="https://www.redhat.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="primary">View Documentation →</Button>
                    </a>
                  </StackItem>
                </Stack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </StackItem>
    </Stack>
  );
};
