import type React from "react";

import {
  Alert,
  Button,
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

import { MOCK_AGENT_PROMPTS } from "./constants";

export const PromptManager: React.FC = () => {
  return (
    <>
      <DocumentMetadata title="Prompt manager" />

      <PageSection variant="light">
        <Stack hasGutter>
          <StackItem>
            <Title headingLevel="h1" size="2xl">
              Prompt manager
            </Title>
          </StackItem>
          <StackItem>
            <Alert
              title="Prototype"
              variant="info"
              isInline
            >
              Manage reusable prompts for TPA Agent. Changes here are for
              layout review only and are not persisted.
            </Alert>
          </StackItem>
        </Stack>
      </PageSection>

      <PageSection>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <Button icon={<PlusIcon />} isDisabled variant="primary">
                Create prompt
              </Button>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>

        <Table aria-label="TPA Agent prompts">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Description</Th>
              <Th>Scope</Th>
              <Th>Updated</Th>
            </Tr>
          </Thead>
          <Tbody>
            {MOCK_AGENT_PROMPTS.map((prompt) => (
              <Tr key={prompt.id}>
                <Td dataLabel="Name">
                  <TableText wrapModifier="nowrap">{prompt.name}</TableText>
                </Td>
                <Td dataLabel="Description">{prompt.description}</Td>
                <Td dataLabel="Scope">{prompt.scope}</Td>
                <Td dataLabel="Updated">{prompt.updatedAt}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </PageSection>
    </>
  );
};
