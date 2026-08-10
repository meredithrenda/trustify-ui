import React from "react";

import {
  Card,
  CardBody,
  Checkbox,
  Content,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Label,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import CubesIcon from "@patternfly/react-icons/dist/esm/icons/cubes-icon";

import { CsafTreeChart } from "@app/pages/advisory-details/components/CsafTreeChart";
import { ThemeContext } from "@tsd-ui/core";

import { buildMockPackageDependencyTree } from "./mock-package-dependency-tree";

interface DependenciesByPackageProps {
  packageId: string;
  packageName: string;
}

const LEGEND = [
  { label: "Product build", color: "#C9190B" },
  { label: "Parent component", color: "#EC7A08" },
  { label: "This package", color: "#0066CC" },
  { label: "Dependency", color: "#5752D1" },
  { label: "Transitive", color: "#009596" },
] as const;

/**
 * Package dependency tree — same interaction model as Advisory CSAF Relationship Tree.
 * Tab content: no PageSection wrapper (parent detail page provides it).
 */
export const DependenciesByPackage: React.FC<DependenciesByPackageProps> = ({
  packageId,
  packageName,
}) => {
  const { isDark } = React.useContext(ThemeContext);
  const [includeAncestors, setIncludeAncestors] = React.useState(true);
  const [includeDescendants, setIncludeDescendants] = React.useState(true);

  const treeData = React.useMemo(
    () =>
      buildMockPackageDependencyTree({
        packageName,
        packageId,
        includeAncestors,
        includeDescendants,
      }),
    [packageName, packageId, includeAncestors, includeDescendants],
  );

  if (!packageName) {
    return (
      <EmptyState
        titleText="No dependency data"
        headingLevel="h2"
        icon={CubesIcon}
        variant={EmptyStateVariant.sm}
      >
        <EmptyStateBody>
          Dependency relationships are not available for this package.
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <Card>
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h3" size="md">
              Dependency tree
            </Title>
            <Content component="small">
              Hover to highlight a path. Click a node to expand or collapse. Drag
              to pan, scroll to zoom. (Prototype mock data.)
            </Content>
          </StackItem>
          <StackItem>
            <Flex
              gap={{ default: "gapMd" }}
              flexWrap={{ default: "wrap" }}
              alignItems={{ default: "alignItemsCenter" }}
            >
              <FlexItem>
                <Checkbox
                  id="package-deps-ancestors"
                  label="Include ancestors (blast radius)"
                  isChecked={includeAncestors}
                  onChange={(_event, checked) => setIncludeAncestors(checked)}
                />
              </FlexItem>
              <FlexItem>
                <Checkbox
                  id="package-deps-descendants"
                  label="Include descendants (sub-dependencies)"
                  isChecked={includeDescendants}
                  onChange={(_event, checked) =>
                    setIncludeDescendants(checked)
                  }
                />
              </FlexItem>
            </Flex>
          </StackItem>
          <StackItem>
            <Flex
              gap={{ default: "gapSm" }}
              flexWrap={{ default: "wrap" }}
              alignItems={{ default: "alignItemsCenter" }}
            >
              {LEGEND.map((item) => (
                <FlexItem key={item.label}>
                  <Label
                    variant="outline"
                    isCompact
                    icon={
                      <span
                        style={{
                          display: "inline-block",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: item.color,
                        }}
                      />
                    }
                  >
                    {item.label}
                  </Label>
                </FlexItem>
              ))}
            </Flex>
          </StackItem>
          <StackItem>
            <CsafTreeChart
              treeData={treeData}
              initialTreeDepth={3}
              chartMinHeight={520}
              leafMultiplier={28}
              chartPadding={{ left: "6%", right: "22%" }}
              fontSize={11}
              lineColor={isDark ? "#5c5c5c" : "#C9C9C9"}
            />
          </StackItem>
        </Stack>
      </CardBody>
    </Card>
  );
};
