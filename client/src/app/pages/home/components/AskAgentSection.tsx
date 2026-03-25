import React from "react";

import {
  Button,
  Card,
  CardBody,
  Content,
  Flex,
  FlexItem,
  InputGroup,
  InputGroupItem,
  Label,
  Spinner,
  Stack,
  StackItem,
  TextInput,
  Title,
} from "@patternfly/react-core";
import ArrowRightIcon from "@patternfly/react-icons/dist/esm/icons/arrow-right-icon";
import SearchIcon from "@patternfly/react-icons/dist/esm/icons/search-icon";
import TimesIcon from "@patternfly/react-icons/dist/esm/icons/times-icon";

import type { AgentResponse } from "./mockResponses";
import { getAgentResponse } from "./mockResponses";

const SUGGESTED_PROMPTS = [
  "Which products are affected by CVE-2024-12345?",
  "Show me unpatched critical CVEs",
  "Summarize the latest VEX for RHEL 9",
  "Which SBOMs contain log4j?",
  "Show license conflicts in my latest upload",
];

const severityColor = (
  severity?: string
): "red" | "orange" | "gold" | "blue" => {
  switch (severity) {
    case "critical":
      return "red";
    case "high":
      return "orange";
    case "medium":
      return "gold";
    default:
      return "blue";
  }
};

export const AskAgentSection: React.FC = () => {
  const [query, setQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [response, setResponse] = React.useState<AgentResponse | null>(null);
  const [submittedQuery, setSubmittedQuery] = React.useState("");

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setSubmittedQuery(trimmed);
    setResponse(null);
    setIsLoading(true);

    setTimeout(() => {
      setResponse(getAgentResponse(trimmed));
      setIsLoading(false);
    }, 1500);
  };

  const handleClear = () => {
    setResponse(null);
    setSubmittedQuery("");
    setQuery("");
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Card>
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            <Flex
              alignItems={{ default: "alignItemsCenter" }}
              gap={{ default: "gapSm" }}
            >
              <FlexItem>
                <SearchIcon
                  size="md"
                  style={{ color: "var(--pf-v6-global--primary-color--100)" }}
                />
              </FlexItem>
              <FlexItem>
                <Title headingLevel="h1" size="xl">
                  Ask TPA Agent
                </Title>
              </FlexItem>
            </Flex>
            <Content style={{ marginTop: "var(--pf-v6-global--spacer--xs)" }}>
              Ask a question about your software supply chain and get a direct
              answer.
            </Content>
          </StackItem>

          <StackItem>
            <InputGroup>
              <InputGroupItem isFill>
                <TextInput
                  type="text"
                  aria-label="Ask TPA Agent"
                  placeholder="Try &quot;Which products are affected by CVE-2024-12345?&quot;"
                  value={query}
                  onChange={(_event, value) => setQuery(value)}
                  onKeyDown={handleKeyDown}
                  isDisabled={isLoading}
                />
              </InputGroupItem>
              <InputGroupItem>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  icon={<ArrowRightIcon />}
                  isDisabled={isLoading || !query.trim()}
                >
                  Ask
                </Button>
              </InputGroupItem>
            </InputGroup>
          </StackItem>

          {isLoading && (
            <StackItem>
              <Flex
                alignItems={{ default: "alignItemsCenter" }}
                gap={{ default: "gapSm" }}
              >
                <FlexItem>
                  <Spinner size="md" />
                </FlexItem>
                <FlexItem>
                  <Content
                    component="p"
                    style={{ color: "var(--pf-v6-global--Color--200)" }}
                  >
                    Searching across SBOMs, advisories, and VEX data...
                  </Content>
                </FlexItem>
              </Flex>
            </StackItem>
          )}

          {response && !isLoading && (
            <StackItem>
              <Card isPlain>
                <CardBody>
                  <Stack hasGutter>
                    <StackItem>
                      <Flex
                        justifyContent={{
                          default: "justifyContentSpaceBetween",
                        }}
                        alignItems={{ default: "alignItemsFlexStart" }}
                      >
                        <FlexItem>
                          <Content
                            component="small"
                            style={{
                              color: "var(--pf-v6-global--Color--200)",
                            }}
                          >
                            You asked: &quot;{submittedQuery}&quot;
                          </Content>
                        </FlexItem>
                        <FlexItem>
                          <Button
                            variant="plain"
                            aria-label="Clear response"
                            onClick={handleClear}
                            icon={<TimesIcon />}
                          />
                        </FlexItem>
                      </Flex>
                    </StackItem>

                    <StackItem>
                      <Flex
                        alignItems={{ default: "alignItemsCenter" }}
                        gap={{ default: "gapSm" }}
                      >
                        {response.severity && (
                          <FlexItem>
                            <Label color={severityColor(response.severity)}>
                              {response.severity.toUpperCase()}
                            </Label>
                          </FlexItem>
                        )}
                        <FlexItem>
                          <Content component="p">
                            <strong>{response.answer}</strong>
                          </Content>
                        </FlexItem>
                      </Flex>
                    </StackItem>

                    <StackItem>
                      <Content
                        component="p"
                        style={{
                          color: "var(--pf-v6-global--Color--200)",
                          fontSize: "var(--pf-v6-global--FontSize--sm)",
                        }}
                      >
                        {response.detail}
                      </Content>
                    </StackItem>

                    {response.items && response.items.length > 0 && (
                      <StackItem>
                        <Content
                          component="small"
                          style={{
                            color: "var(--pf-v6-global--Color--200)",
                            fontWeight: 600,
                          }}
                        >
                          Affected items
                        </Content>
                        <ul
                          style={{
                            margin: "var(--pf-v6-global--spacer--xs) 0 0 var(--pf-v6-global--spacer--md)",
                            padding: 0,
                            fontSize: "var(--pf-v6-global--FontSize--sm)",
                          }}
                        >
                          {response.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </StackItem>
                    )}

                    {response.sources.length > 0 && (
                      <StackItem>
                        <Content
                          component="small"
                          style={{
                            color: "var(--pf-v6-global--Color--200)",
                            fontWeight: 600,
                          }}
                        >
                          Sources
                        </Content>
                        <Flex
                          gap={{ default: "gapSm" }}
                          wrap={{ default: "wrap" }}
                          style={{
                            marginTop: "var(--pf-v6-global--spacer--xs)",
                          }}
                        >
                          {response.sources.map((source) => (
                            <FlexItem key={source}>
                              <Label variant="outline" color="blue">
                                {source}
                              </Label>
                            </FlexItem>
                          ))}
                        </Flex>
                      </StackItem>
                    )}
                  </Stack>
                </CardBody>
              </Card>
            </StackItem>
          )}

          {!isLoading && !response && (
            <StackItem>
              <Content
                component="small"
                style={{ color: "var(--pf-v6-global--Color--200)" }}
              >
                Suggested questions
              </Content>
              <Flex
                gap={{ default: "gapSm" }}
                wrap={{ default: "wrap" }}
                style={{ marginTop: "var(--pf-v6-global--spacer--xs)" }}
              >
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <FlexItem key={prompt}>
                    <Label
                      variant="outline"
                      onClick={() => setQuery(prompt)}
                      style={{ cursor: "pointer" }}
                    >
                      {prompt}
                    </Label>
                  </FlexItem>
                ))}
              </Flex>
            </StackItem>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
};
