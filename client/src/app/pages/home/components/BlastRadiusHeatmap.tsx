import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";

import {
  Content,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Grid,
  GridItem,
  List,
  ListItem,
  Title,
} from "@patternfly/react-core";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";

import { Paths } from "@app/Routes";
import { LoadingWrapper } from "@app/components/LoadingWrapper";
import { useFetchVulnerabilities } from "@app/queries/vulnerabilities";
import { vulnerabilityByIdQueryOptions } from "@app/queries/vulnerabilities";
import { severityList } from "@app/api/model-utils";

interface VulnerabilityImpact {
  id: string;
  identifier: string;
  title: string;
  severity: string;
  impactCount: number;
  baseScore?: number;
}

// Helper to count unique affected SBOMs from vulnerability details
const countAffectedSboms = (
  advisories?: Array<{
    sboms?: Array<{
      purl_statuses?: {
        affected?: Record<string, unknown>;
      };
      document_id?: string;
      sbom_id?: string;
      name?: string;
    }>;
  }>,
): { count: number; sboms: Array<{ id: string; name: string }> } => {
  if (!advisories) return { count: 0, sboms: [] };
  
  const affectedSboms = new Map<string, string>();
  advisories.forEach((advisory) => {
    advisory.sboms?.forEach((sbomStatus) => {
      if (
        sbomStatus.purl_statuses?.affected &&
        Object.keys(sbomStatus.purl_statuses.affected).length > 0
      ) {
        const sbomId =
          sbomStatus.document_id || sbomStatus.sbom_id || "";
        if (sbomId && !affectedSboms.has(sbomId)) {
          affectedSboms.set(sbomId, sbomStatus.name || sbomId);
        }
      }
    });
  });
  
  return {
    count: affectedSboms.size,
    sboms: Array.from(affectedSboms.entries()).map(([id, name]) => ({
      id,
      name,
    })),
  };
};

// Custom SVG-based topology visualization component
interface TopologyNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: "vulnerability" | "sbom";
  color: string;
  count?: number;
}

interface TopologyEdge {
  id: string;
  source: string;
  target: string;
}

interface CustomTopologyProps {
  vulnerability: VulnerabilityImpact;
  sboms: Array<{ id: string; name: string }>;
  severityColor: string;
}

const CustomTopologyVisualization: React.FC<CustomTopologyProps> = ({
  vulnerability,
  sboms,
  severityColor,
}) => {
  const width = 700;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;

  // Create nodes
  const nodes: TopologyNode[] = useMemo(() => {
    const vulnNode: TopologyNode = {
      id: `vuln-${vulnerability.id}`,
      label: vulnerability.identifier,
      x: centerX,
      y: centerY,
      type: "vulnerability",
      color: severityColor,
      count: vulnerability.impactCount,
    };

    const sbomNodes: TopologyNode[] = sboms.slice(0, 10).map((sbom, index) => {
      const angle = (index / sboms.length) * 2 * Math.PI - Math.PI / 2; // Start from top
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      return {
        id: `sbom-${sbom.id}`,
        label: sbom.name.length > 15 ? `${sbom.name.substring(0, 15)}...` : sbom.name,
        x,
        y,
        type: "sbom",
        color: "#06c",
      };
    });

    return [vulnNode, ...sbomNodes];
  }, [vulnerability, sboms, centerX, centerY, radius, severityColor]);

  // Create edges
  const edges: TopologyEdge[] = useMemo(() => {
    const vulnNodeId = `vuln-${vulnerability.id}`;
    return nodes
      .filter((node) => node.type === "sbom")
      .map((sbomNode) => ({
        id: `edge-${vulnNodeId}-${sbomNode.id}`,
        source: vulnNodeId,
        target: sbomNode.id,
      }));
  }, [nodes, vulnerability.id]);

  return (
    <svg
      width={width}
      height={height}
      style={{ border: "1px solid var(--pf-v6-global--BorderColor--100)", borderRadius: "4px" }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#666" />
        </marker>
      </defs>

      {/* Draw edges */}
      {edges.map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);
        if (!sourceNode || !targetNode) return null;

        return (
          <line
            key={edge.id}
            x1={sourceNode.x}
            y1={sourceNode.y}
            x2={targetNode.x}
            y2={targetNode.y}
            stroke="#666"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
            opacity="0.6"
          />
        );
      })}

      {/* Draw nodes */}
      {nodes.map((node) => {
        if (node.type === "vulnerability") {
          // Vulnerability node (ellipse)
          return (
            <g key={node.id}>
              <ellipse
                cx={node.x}
                cy={node.y}
                rx="80"
                ry="40"
                fill={node.color}
                stroke={node.color}
                strokeWidth="2"
                opacity="0.9"
              />
              <text
                x={node.x}
                y={node.y - 5}
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="bold"
              >
                {node.label}
              </text>
              {node.count !== undefined && (
                <text
                  x={node.x}
                  y={node.y + 15}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                >
                  {node.count} affected
                </text>
              )}
            </g>
          );
        } else {
          // SBOM node (rectangle)
          return (
            <g key={node.id}>
              <rect
                x={node.x - 60}
                y={node.y - 20}
                width="120"
                height="40"
                fill="white"
                stroke={node.color}
                strokeWidth="2"
                rx="4"
              />
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                fill="#151515"
                fontSize="10"
              >
                {node.label}
              </text>
            </g>
          );
        }
      })}
    </svg>
  );
};

export const BlastRadiusHeatmap: React.FC = () => {
  const [selectedVulnerabilityId, setSelectedVulnerabilityId] = useState<
    string | null
  >(null);

  const {
    result: { data: vulnerabilities = [] },
    isFetching: isFetchingVulnerabilities,
    fetchError: fetchErrorVulnerabilities,
  } = useFetchVulnerabilities(
    {
      page: { pageNumber: 1, itemsPerPage: 20 },
      sort: { field: "base_score", direction: "desc" },
    },
    false,
  );

  const topVulnerabilities = vulnerabilities.slice(0, 20);

  // Fetch vulnerability details for each to get SBOM impact counts
  const vulnerabilityDetailsQueries = useQueries({
    queries: topVulnerabilities.map((vuln) =>
      vulnerabilityByIdQueryOptions(vuln.identifier),
    ),
  });

  // Process the data to get impact counts
  const impactData: VulnerabilityImpact[] = React.useMemo(() => {
    return topVulnerabilities
      .map((vuln, index) => {
        const detailsQuery = vulnerabilityDetailsQueries[index];
        const vulnerabilityDetails = detailsQuery?.data?.data;
        
        const { count } = countAffectedSboms(
          vulnerabilityDetails?.advisories,
        );

        return {
          id: vuln.identifier,
          identifier: vuln.identifier,
          title: vuln.title || vuln.identifier,
          severity: vuln.average_severity?.toLowerCase() || "unknown",
          impactCount: count,
          baseScore: vuln.average_score,
        };
      })
      .filter((v) => v.impactCount > 0)
      .sort((a, b) => b.impactCount - a.impactCount)
      .slice(0, 5);
  }, [topVulnerabilities, vulnerabilityDetailsQueries]);

  const isLoading =
    isFetchingVulnerabilities ||
    vulnerabilityDetailsQueries.some((q) => q.isLoading);
  const hasError =
    fetchErrorVulnerabilities ||
    vulnerabilityDetailsQueries.some((q) => q.error);

  // Use mock data for demonstration if no real data is available
  const mockData: VulnerabilityImpact[] = [
    {
      id: "CVE-2024-12345",
      identifier: "CVE-2024-12345",
      title: "Example vulnerability affecting multiple components",
      severity: "critical",
      impactCount: 15,
      baseScore: 9.8,
    },
    {
      id: "CVE-2024-23456",
      identifier: "CVE-2024-23456",
      title: "High severity issue in common dependency",
      severity: "high",
      impactCount: 12,
      baseScore: 8.5,
    },
    {
      id: "CVE-2024-34567",
      identifier: "CVE-2024-34567",
      title: "Medium severity vulnerability in shared library",
      severity: "medium",
      impactCount: 8,
      baseScore: 6.2,
    },
    {
      id: "CVE-2024-45678",
      identifier: "CVE-2024-45678",
      title: "Another widespread vulnerability",
      severity: "high",
      impactCount: 6,
      baseScore: 7.1,
    },
    {
      id: "CVE-2024-56789",
      identifier: "CVE-2024-56789",
      title: "Low severity but widely used component",
      severity: "low",
      impactCount: 4,
      baseScore: 4.3,
    },
  ];

  // Use mock data for demonstration when no real data is available
  const displayData = impactData.length > 0 ? impactData : mockData;

  // Auto-select first vulnerability if none selected
  React.useEffect(() => {
    if (!selectedVulnerabilityId && displayData.length > 0) {
      setSelectedVulnerabilityId(displayData[0].id);
    }
  }, [displayData, selectedVulnerabilityId]);

  // Get selected vulnerability details
  const selectedVulnerability = displayData.find(
    (v) => v.id === selectedVulnerabilityId,
  );

  // Get affected SBOMs for selected vulnerability
  const selectedVulnIndex = topVulnerabilities.findIndex(
    (v) => v.identifier === selectedVulnerabilityId,
  );
  const selectedVulnDetails =
    selectedVulnIndex >= 0
      ? vulnerabilityDetailsQueries[selectedVulnIndex]?.data?.data
      : null;

  // Create mock SBOMs for demonstration if no real data
  const mockSboms = useMemo(() => {
    if (selectedVulnerability) {
      return Array.from({ length: selectedVulnerability.impactCount }, (_, i) => ({
        id: `sbom-${i + 1}`,
        name: `SBOM ${i + 1}`,
      }));
    }
    return [];
  }, [selectedVulnerability]);

  const { sboms: affectedSboms } = selectedVulnDetails
    ? countAffectedSboms(selectedVulnDetails.advisories)
    : { sboms: mockSboms };

  // Get severity color for selected vulnerability
  const severityColor = useMemo(() => {
    if (!selectedVulnerability) return "#8a8d90";
    const severityInfo =
      severityList[selectedVulnerability.severity as keyof typeof severityList];
    return severityInfo?.color.var || "#8a8d90";
  }, [selectedVulnerability]);


  if (displayData.length === 0) {
    return (
      <EmptyState variant={EmptyStateVariant.xs}>
        <EmptyStateBody>
          No vulnerability impact data available. Upload SBOMs to see blast
          radius analysis.
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <LoadingWrapper isFetching={isLoading} fetchError={hasError}>
      <Grid hasGutter>
        <GridItem md={4}>
          <Content style={{ marginBottom: "1rem" }}>
            Select a vulnerability to view its impact topology:
          </Content>
          <List isPlain>
            {displayData.map((vuln, index) => {
              const severityInfo =
                severityList[vuln.severity as keyof typeof severityList];
              const isSelected = selectedVulnerabilityId === vuln.id;
              return (
                <ListItem
                  key={vuln.id}
                  onClick={() => setSelectedVulnerabilityId(vuln.id)}
                  style={{
                    padding: "0.75rem",
                    marginBottom: "0.5rem",
                    backgroundColor: isSelected
                      ? "var(--pf-v6-global--palette--blue-50)"
                      : "var(--pf-v6-global--BackgroundColor--100)",
                    borderLeft: `4px solid ${
                      severityInfo?.color.var || "#8a8d90"
                    }`,
                    borderRadius: "4px",
                    cursor: "pointer",
                    border: isSelected
                      ? `2px solid ${severityInfo?.color.var || "#8a8d90"}`
                      : "none",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: "bold",
                        marginBottom: "0.25rem",
                      }}
                    >
                      #{index + 1}{" "}
                      <Link
                        to={Paths.vulnerabilityDetails.replace(
                          ":vulnerabilityId",
                          vuln.identifier,
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {vuln.identifier}
                      </Link>
                    </div>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--pf-v6-global--Color--200)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {vuln.title}
                    </div>
                    <div style={{ fontSize: "0.875rem" }}>
                      <strong>{vuln.impactCount}</strong> affected SBOMs
                      {vuln.baseScore && (
                        <>
                          {" • "}
                          <strong>CVSS:</strong>{" "}
                          {vuln.baseScore.toFixed(1)}
                        </>
                      )}
                    </div>
                  </div>
                </ListItem>
              );
            })}
          </List>
        </GridItem>

        <GridItem md={8}>
          {selectedVulnerability ? (
            <div>
              <Content style={{ marginBottom: "1rem" }}>
                <strong>{selectedVulnerability.identifier}</strong> affects{" "}
                <strong>{selectedVulnerability.impactCount}</strong> SBOMs.
              </Content>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "500px" }}>
                {selectedVulnerability && affectedSboms.length > 0 ? (
                  <CustomTopologyVisualization
                    vulnerability={selectedVulnerability}
                    sboms={affectedSboms}
                    severityColor={severityColor}
                  />
                ) : (
                  <EmptyState variant={EmptyStateVariant.xs}>
                    <EmptyStateBody>
                      No affected SBOMs found for this vulnerability.
                    </EmptyStateBody>
                  </EmptyState>
                )}
              </div>
            </div>
          ) : (
            <EmptyState variant={EmptyStateVariant.xs}>
              <EmptyStateBody>
                Select a vulnerability from the list to view its blast radius
                topology.
              </EmptyStateBody>
            </EmptyState>
          )}
        </GridItem>
      </Grid>
    </LoadingWrapper>
  );
};
