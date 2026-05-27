import type React from "react";

import {
  Alert,
  Button,
  Label,
  PageSection,
  Stack,
  StackItem,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import PlusIcon from "@patternfly/react-icons/dist/esm/icons/plus-icon";
import {
  Table,
  TableText,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";

import { DocumentMetadata } from "@app/components/DocumentMetadata";

import { MOCK_MCP_SERVERS } from "./constants";

const mcpStatusColor = (status: string) => {
  if (status === "Connected") {
    return "green";
  }
  return "grey";
};

export const McpSettings: React.FC = () => {
  return (
    <>
      <DocumentMetadata title="MCP settings" />

      <PageSection variant="light">
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h1" size="2xl">
              MCP settings
            </Title>
          </StackItem>
          <StackItem>
            <Alert title="Prototype" variant="info" isInline>
              Configure Model Context Protocol servers for TPA Agent tool
              calling. Settings shown here are illustrative and not wired to a
              backend.
            </Alert>
          </StackItem>
        </Stack>
      </PageSection>

      <PageSection>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <Button icon={<PlusIcon />} isDisabled variant="primary">
                Add MCP server
              </Button>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>

        <Table aria-label="MCP servers">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Transport</Th>
              <Th>Endpoint</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {MOCK_MCP_SERVERS.map((server) => (
              <Tr key={server.id}>
                <Td dataLabel="Name">
                  <TableText wrapModifier="nowrap">{server.name}</TableText>
                </Td>
                <Td dataLabel="Transport">{server.transport}</Td>
                <Td dataLabel="Endpoint">
                  <TableText wrapModifier="truncate">{server.endpoint}</TableText>
                </Td>
                <Td dataLabel="Status">
                  <Label color={mcpStatusColor(server.status)} isCompact>
                    {server.status}
                  </Label>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </PageSection>
    </>
  );
};
