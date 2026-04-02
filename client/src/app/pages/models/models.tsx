import React from "react";
import { Link } from "react-router-dom";

import {
  Content,
  PageSection,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  TextInput,
  InputGroup,
  InputGroupItem,
  Button,
} from "@patternfly/react-core";
import SearchIcon from "@patternfly/react-icons/dist/esm/icons/search-icon";
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";

import { PageDrawerContent } from "@app/components/PageDrawerContext";
import { mockModels } from "@app/mocks/models";

import type { AIModel } from "./types";
import { ModelDetailDrawer } from "./components/ModelDetailDrawer";

export const Models: React.FC = () => {
  const [searchValue, setSearchValue] = React.useState("");
  const [selectedModel, setSelectedModel] = React.useState<AIModel | null>(
    null,
  );

  const filteredModels = React.useMemo(() => {
    if (!searchValue.trim()) return mockModels;
    const term = searchValue.toLowerCase();
    return mockModels.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        m.suppliedBy.toLowerCase().includes(term) ||
        m.license.toLowerCase().includes(term),
    );
  }, [searchValue]);

  return (
    <>
      <PageDrawerContent
        isExpanded={!!selectedModel}
        onCloseClick={() => setSelectedModel(null)}
        pageKey="models-standalone"
        header={
          selectedModel ? (
            <Title headingLevel="h2" size="lg">
              {selectedModel.name}
            </Title>
          ) : undefined
        }
      >
        {selectedModel ? (
          <ModelDetailDrawer model={selectedModel} />
        ) : (
          <></>
        )}
      </PageDrawerContent>

      <PageSection>
        <Title headingLevel="h1" size="2xl">
          Models
        </Title>
      </PageSection>
      <PageSection>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <InputGroup>
                <InputGroupItem>
                  <TextInput
                    type="search"
                    aria-label="Search models"
                    placeholder="Search"
                    value={searchValue}
                    onChange={(_e, val) => setSearchValue(val)}
                  />
                </InputGroupItem>
                <InputGroupItem>
                  <Button variant="control" aria-label="Search">
                    <SearchIcon />
                  </Button>
                </InputGroupItem>
              </InputGroup>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>

        <Table aria-label="Models table" variant="compact">
          <Thead>
            <Tr>
              <Th sort={{ columnIndex: 0, sortBy: {}, onSort: () => {} }}>
                Name
              </Th>
              <Th>Supplied by</Th>
              <Th>License</Th>
              <Th>SBOMs</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredModels.map((model) => (
              <Tr key={model.id}>
                <Td dataLabel="Name">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedModel(model);
                    }}
                  >
                    {model.name}
                  </a>
                </Td>
                <Td dataLabel="Supplied by">{model.suppliedBy}</Td>
                <Td dataLabel="License">{model.license}</Td>
                <Td dataLabel="SBOMs">
                  <Link to="#" onClick={(e) => e.preventDefault()}>
                    {model.sbomCount} SBOM{model.sbomCount !== 1 ? "s" : ""}
                  </Link>
                </Td>
              </Tr>
            ))}
            {filteredModels.length === 0 && (
              <Tr>
                <Td colSpan={4}>
                  <Content component="p">No models found.</Content>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </PageSection>
    </>
  );
};
