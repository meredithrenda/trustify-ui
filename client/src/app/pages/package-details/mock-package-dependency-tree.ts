import type { EChartsTreeNode } from "@app/pages/advisory-details/helpers/csaf-tree-helpers";

const COLORS = {
  product: "#C9190B",
  parent: "#EC7A08",
  package: "#0066CC",
  dependency: "#5752D1",
  leaf: "#009596",
} as const;

export type PackageDependencyTreeOptions = {
  packageName: string;
  packageId: string;
  includeAncestors: boolean;
  includeDescendants: boolean;
};

const styleNode = (
  name: string,
  color: string,
  value?: string,
  children?: EChartsTreeNode[],
): EChartsTreeNode => ({
  name,
  value,
  itemStyle: { color, borderColor: color },
  children,
});

/**
 * Prototype mock dependency hierarchy for package details.
 * Mirrors the CSAF relationship-tree presentation with package-centric data.
 */
export const buildMockPackageDependencyTree = ({
  packageName,
  packageId,
  includeAncestors,
  includeDescendants,
}: PackageDependencyTreeOptions): EChartsTreeNode => {
  const packageNode = styleNode(
    packageName,
    COLORS.package,
    packageId,
    includeDescendants
      ? [
          styleNode(`${packageName}-common`, COLORS.dependency, undefined, [
            styleNode("leaf-util", COLORS.leaf),
            styleNode("logging-facade", COLORS.leaf),
          ]),
          styleNode(`${packageName}-crypto`, COLORS.dependency, undefined, [
            styleNode("openssl-compat", COLORS.leaf),
          ]),
        ]
      : undefined,
  );

  if (!includeAncestors) {
    return packageNode;
  }

  return styleNode("product-build", COLORS.product, undefined, [
    styleNode("parent-component", COLORS.parent, undefined, [packageNode]),
  ]);
};
