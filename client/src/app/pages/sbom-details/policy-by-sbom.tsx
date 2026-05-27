import type React from "react";

import {
  Alert,
  Card,
  CardBody,
  CardTitle,
  Content,
  Grid,
  GridItem,
  Label,
  PageSection,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import {
  Table,
  TableText,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";

interface PolicyBySbomProps {
  sbomId: string;
}

/** Static per-SBOM demo rows; replace with API when DTUX-2803 lands. */
const mockRuleRowsForSbom = (sbomId: string) => {
  const seed = sbomId.length % 3;
  const verdicts: ("Pass" | "Warn" | "Fail")[] =
    seed === 0
      ? ["Pass", "Pass", "Warn", "Fail", "Pass"]
      : seed === 1
        ? ["Pass", "Warn", "Warn", "Pass", "Pass"]
        : ["Pass", "Pass", "Pass", "Warn", "Pass"];
  const rules = [
    "slsa_provenance_available__attestation_predicate_type_accepted",
    "sbom_cyclonedx__valid_cdx_1_5",
    "cve__unpatched_cve_warnings",
    "base_image_registries__base_image_permitted",
    "tasks__successful_pipeline_tasks",
  ];
  return rules.map((rule, i) => ({
    rule,
    verdict: verdicts[i] ?? "Pass",
  }));
};

const verdictLabel = (v: "Pass" | "Warn" | "Fail") => {
  if (v === "Pass") return <Label color="green">{v}</Label>;
  if (v === "Warn") return <Label color="orange">{v}</Label>;
  return <Label color="red">{v}</Label>;
};

export const PolicyBySbom: React.FC<PolicyBySbomProps> = ({ sbomId }) => {
  const rows = mockRuleRowsForSbom(sbomId);
  const failCount = rows.filter((r) => r.verdict === "Fail").length;
  const warnCount = rows.filter((r) => r.verdict === "Warn").length;
  const overall =
    failCount > 0
      ? "Non-compliant"
      : warnCount > 0
        ? "Compliant (warnings)"
        : "Compliant";

  return (
    <PageSection hasBodyWrapper={false}>
      <Stack hasGutter>
        <StackItem>
          <Content>
            <Content component="h2">Policy for this SBOM</Content>
            <Content component="p">
              Conforma / Enterprise Contract-style rule outcomes for this
              document (DTUX-2803). SBOM identifier: {sbomId}
            </Content>
          </Content>
        </StackItem>
        <StackItem>
          <Alert isInline variant="info" title="Prototype data">
            Verdicts below are generated for layout only; they are not from live
            policy evaluation.
          </Alert>
        </StackItem>
        <StackItem>
          <Stack hasGutter>
            <StackItem>
              <Title headingLevel="h3" size="md">
                Summary
              </Title>
            </StackItem>
            <StackItem>
              <Grid hasGutter>
                <GridItem sm={6} md={4}>
                  <Card isFullHeight>
                    <CardTitle>Overall</CardTitle>
                    <CardBody>
                      <Title headingLevel="h4" size="lg">
                        {overall}
                      </Title>
                    </CardBody>
                  </Card>
                </GridItem>
                <GridItem sm={6} md={4}>
                  <Card isFullHeight>
                    <CardTitle>Blocking failures</CardTitle>
                    <CardBody>
                      <Title headingLevel="h4" size="2xl">
                        {failCount}
                      </Title>
                    </CardBody>
                  </Card>
                </GridItem>
                <GridItem sm={6} md={4}>
                  <Card isFullHeight>
                    <CardTitle>Rule warnings</CardTitle>
                    <CardBody>
                      <Title headingLevel="h4" size="2xl">
                        {warnCount}
                      </Title>
                    </CardBody>
                  </Card>
                </GridItem>
              </Grid>
            </StackItem>
          </Stack>
        </StackItem>
        <StackItem>
          <Title headingLevel="h3" size="md">
            Rule results (sample)
          </Title>
          <Content component="p" className="pf-v-u-mb-md-on-md">
            Latest evaluation by rule (prototype data).
          </Content>
          <Table aria-label="SBOM policy rule results" variant="compact">
            <Thead>
              <Tr>
                <Th>Rule</Th>
                <Th>Verdict</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((row) => (
                <Tr key={row.rule}>
                  <Td dataLabel="Rule" modifier="breakWord">
                    <TableText wrapModifier="breakWord">{row.rule}</TableText>
                  </Td>
                  <Td dataLabel="Verdict">{verdictLabel(row.verdict)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </StackItem>
      </Stack>
    </PageSection>
  );
};
