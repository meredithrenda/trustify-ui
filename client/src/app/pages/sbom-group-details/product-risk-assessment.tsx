import React from "react";

import type { DropEvent } from "@patternfly/react-core";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Checkbox,
  Content,
  Flex,
  FlexItem,
  Icon,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  MultipleFileUpload,
  MultipleFileUploadMain,
  Timestamp,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import CheckCircleIcon from "@patternfly/react-icons/dist/esm/icons/check-circle-icon";
import SeverityCriticalIcon from "@patternfly/react-icons/dist/esm/icons/severity-critical-icon";
import SeverityImportantIcon from "@patternfly/react-icons/dist/esm/icons/severity-important-icon";
import SeverityMinorIcon from "@patternfly/react-icons/dist/esm/icons/severity-minor-icon";
import SeverityModerateIcon from "@patternfly/react-icons/dist/esm/icons/severity-moderate-icon";
import SeverityNoneIcon from "@patternfly/react-icons/dist/esm/icons/severity-none-icon";
import UploadIcon from "@patternfly/react-icons/dist/esm/icons/upload-icon";
import {
  t_global_icon_color_severity_critical_default as criticalColor,
  t_global_icon_color_severity_important_default as importantColor,
  t_global_icon_color_severity_minor_default as minorColor,
  t_global_icon_color_severity_moderate_default as moderateColor,
  t_global_icon_color_severity_none_default as noneColor,
} from "@patternfly/react-tokens";

import {
  ALL_PRA_DOCUMENT_IDS,
  createMockAssessment,
  getOverallRiskScore,
  getRenormalizedWeights,
  PRA_DOCUMENTS,
  PRA_INTRO,
  type Completeness,
  type PraAssessment,
  type PraDocumentId,
  type RiskLevel,
} from "./product-risk-assessment-data";

import "./product-risk-assessment.css";

type PraView = "document" | "overall";

const RISK_LEVEL_VISUAL: Record<
  RiskLevel,
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- PF icon components
    icon: React.ComponentType<any>;
    color: string;
  }
> = {
  "Very high": { icon: SeverityCriticalIcon, color: criticalColor.var },
  High: { icon: SeverityImportantIcon, color: importantColor.var },
  Moderate: { icon: SeverityModerateIcon, color: moderateColor.var },
  Low: { icon: SeverityMinorIcon, color: minorColor.var },
  "Very low": { icon: SeverityNoneIcon, color: noneColor.var },
};

const RiskLevelDisplay: React.FC<{ level: RiskLevel }> = ({ level }) => {
  const { icon: SeverityIcon, color } = RISK_LEVEL_VISUAL[level];

  return (
    <span className="pra__risk-level">
      <Icon isInline>
        <SeverityIcon color={color} />
      </Icon>
      <span>{level}</span>
    </span>
  );
};

const CompletenessLabel: React.FC<{ value: Completeness }> = ({ value }) => {
  if (value === "Missing") {
    return (
      <Label color="yellow" variant="filled">
        {value}
      </Label>
    );
  }
  if (value === "Complete") {
    return (
      <Label color="green" variant="filled">
        {value}
      </Label>
    );
  }
  return (
    <Label color="grey" variant="filled">
      {value}
    </Label>
  );
};

const formatLastSaved = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/New_York",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const rawZone = get("timeZoneName");
  const displayZone = /EDT/i.test(rawZone)
    ? "EDT"
    : /EST/i.test(rawZone)
      ? "EST"
      : /GMT-4|UTC-4/i.test(rawZone)
        ? "EDT"
        : "EST";

  return `${get("day")} ${get("month")} ${get("year")}, ${get("hour")}:${get("minute")} ${get("dayPeriod")} ${displayZone}`;
};

export const ProductRiskAssessment: React.FC = () => {
  const [selectedIds, setSelectedIds] = React.useState<PraDocumentId[]>(
    ALL_PRA_DOCUMENT_IDS,
  );
  const [draftSelectedIds, setDraftSelectedIds] = React.useState<
    PraDocumentId[]
  >(ALL_PRA_DOCUMENT_IDS);
  const [isCustomizeOpen, setIsCustomizeOpen] = React.useState(false);
  const [view, setView] = React.useState<PraView>("document");
  const [activeId, setActiveId] = React.useState<PraDocumentId>("sar");
  const [assessments, setAssessments] = React.useState<
    Partial<Record<PraDocumentId, PraAssessment>>
  >({});
  const [lastSavedAt, setLastSavedAt] = React.useState(() => new Date());

  const selectedDocs = PRA_DOCUMENTS.filter((doc) =>
    selectedIds.includes(doc.id),
  );
  const weights = getRenormalizedWeights(selectedIds);
  const overall = getOverallRiskScore(selectedIds, assessments);
  const activeDoc =
    selectedDocs.find((doc) => doc.id === activeId) ?? selectedDocs[0];
  const assessment = activeDoc ? assessments[activeDoc.id] : undefined;

  const markSaved = () => {
    setLastSavedAt(new Date());
  };

  const openCustomize = () => {
    setDraftSelectedIds(selectedIds);
    setIsCustomizeOpen(true);
  };

  const applyCustomize = () => {
    if (draftSelectedIds.length === 0) {
      return;
    }
    setSelectedIds(draftSelectedIds);
    if (!draftSelectedIds.includes(activeId)) {
      setActiveId(draftSelectedIds[0]);
    }
    setView("document");
    setIsCustomizeOpen(false);
    markSaved();
  };

  const toggleDraftDoc = (id: PraDocumentId, checked: boolean) => {
    setDraftSelectedIds((prev) => {
      if (checked) {
        return ALL_PRA_DOCUMENT_IDS.filter(
          (docId) => prev.includes(docId) || docId === id,
        );
      }
      return prev.filter((docId) => docId !== id);
    });
  };

  const handleUpload = (_event: DropEvent, files: File[]) => {
    if (!activeDoc || files.length === 0) {
      return;
    }
    setAssessments((prev) => ({
      ...prev,
      [activeDoc.id]: createMockAssessment(activeDoc.id),
    }));
    markSaved();
  };

  const startNewAssessment = () => {
    if (!activeDoc) {
      return;
    }
    setAssessments((prev) => {
      const next = { ...prev };
      delete next[activeDoc.id];
      return next;
    });
    markSaved();
  };

  const downloadAssessment = () => {
    if (!activeDoc || !assessment) {
      return;
    }
    const payload = {
      document: activeDoc.title,
      riskScorePercent: assessment.riskScorePercent,
      submittedAt: assessment.submittedAt,
      criteria: assessment.criteria,
      recommendations:
        "Review incomplete criteria, remediate high-risk findings, then upload an updated PDF for re-assessment.",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${activeDoc.id}-risk-assessment.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadOverallAssessment = () => {
    const payload = {
      overallRiskScore: overall.score,
      completedCount: overall.completedCount,
      selectedCount: overall.selectedCount,
      isPartial: overall.isPartial,
      weights,
      assessments: selectedIds.map((id) => {
        const doc = PRA_DOCUMENTS.find((item) => item.id === id);
        return {
          id,
          title: doc?.title,
          weightPercent: weights[id],
          assessment: assessments[id] ?? null,
        };
      }),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "product-risk-assessment-overall.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const startNewOverallAssessment = () => {
    setAssessments((prev) => {
      const next = { ...prev };
      for (const id of selectedIds) {
        delete next[id];
      }
      return next;
    });
    setView("document");
    markSaved();
  };

  return (
    <div className="pra">
      <Content component="p">{PRA_INTRO}</Content>

      <Flex
        className="pra__toolbar"
        justifyContent={{ default: "justifyContentFlexEnd" }}
        alignItems={{ default: "alignItemsCenter" }}
        flexWrap={{ default: "wrap" }}
        gap={{ default: "gapMd" }}
      >
        <FlexItem>
          <Flex gap={{ default: "gapMd" }}>
            <FlexItem>
              <Button variant="secondary" onClick={openCustomize}>
                Customize assessments
              </Button>
            </FlexItem>
            <FlexItem>
              {view === "overall" ? (
                <Button variant="primary" onClick={() => setView("document")}>
                  Continue assessments
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  isDisabled={overall.completedCount === 0}
                  onClick={() => setView("overall")}
                >
                  View overall score
                </Button>
              )}
            </FlexItem>
          </Flex>
        </FlexItem>
      </Flex>

      {view === "overall" && overall.score != null ? (
        <div className="pra__overall">
          <Card className="pra__risk-card">
            <CardTitle>Product Risk Assessment Score</CardTitle>
            <CardBody>
              <div className="pra__risk-score">
                <span
                  className={`pra__risk-score-value ${
                    overall.score <= 33
                      ? "pra__risk-score-value--low"
                      : overall.score <= 66
                        ? "pra__risk-score-value--medium"
                        : "pra__risk-score-value--high"
                  }`}
                >
                  {overall.score}
                </span>
                <span className="pra__risk-score-total">/100</span>
              </div>
              <Content component="small">
                {overall.isPartial
                  ? `Based on ${overall.completedCount} of ${overall.selectedCount} selected assessments (partial)`
                  : `Based on ${overall.completedCount} of ${overall.selectedCount} selected assessments`}
              </Content>
              <Flex className="pra__risk-actions" gap={{ default: "gapMd" }}>
                <FlexItem>
                  <Button
                    variant="secondary"
                    onClick={startNewOverallAssessment}
                  >
                    Start New Assessment
                  </Button>
                </FlexItem>
                <FlexItem>
                  <Button variant="primary" onClick={downloadOverallAssessment}>
                    Download Assessment
                  </Button>
                </FlexItem>
              </Flex>
            </CardBody>
          </Card>

          <Card>
            <CardTitle>Individual Assessment Scores</CardTitle>
            <CardBody>
              <ul className="pra__overall-list">
                {selectedDocs.map((doc) => {
                  const docAssessment = assessments[doc.id];
                  return (
                    <li key={doc.id} className="pra__overall-row">
                      <span className="pra__overall-row-main">
                        {docAssessment ? (
                          <span
                            className="pra__nav-check"
                            aria-label="Assessment complete"
                          >
                            <CheckCircleIcon />
                          </span>
                        ) : (
                          <span className="pra__overall-pending" />
                        )}
                        <button
                          type="button"
                          className="pra__overall-link"
                          onClick={() => {
                            setActiveId(doc.id);
                            setView("document");
                          }}
                        >
                          {doc.title}
                        </button>
                        <Label color="grey" variant="filled" isCompact>
                          {weights[doc.id]}% weight
                        </Label>
                      </span>
                      <span className="pra__overall-score">
                        {docAssessment
                          ? `${docAssessment.riskScorePercent}/100`
                          : "Not started"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>

          <div className="pra__footer pra__footer--standalone">
            <Timestamp date={lastSavedAt}>
              {`Last saved ${formatLastSaved(lastSavedAt)}`}
            </Timestamp>
          </div>
        </div>
      ) : (
        <div className="pra__shell">
          <nav
            className="pra__nav"
            aria-label="Product risk assessment documents"
          >
            {selectedDocs.map((doc) => {
              const isActive = view === "document" && doc.id === activeId;
              const isComplete = !!assessments[doc.id];
              return (
                <button
                  key={doc.id}
                  type="button"
                  className={`pra__nav-item${isActive ? " pra__nav-item--active" : ""}`}
                  onClick={() => {
                    setActiveId(doc.id);
                    setView("document");
                  }}
                  aria-current={isActive ? "step" : undefined}
                >
                  <span className="pra__nav-title">{doc.title}</span>
                  {isComplete ? (
                    <span
                      className="pra__nav-check"
                      aria-label="Assessment complete"
                    >
                      <CheckCircleIcon />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="pra__main">
            <div className="pra__body">
              {activeDoc ? (
                <>
                  <div className="pra__step-header">
                    <Content component="h2">{activeDoc.title}</Content>
                    <Content component="small">
                      {activeDoc.description}
                    </Content>
                  </div>

                  {assessment ? (
                    <>
                      <Card className="pra__risk-card">
                        <CardTitle>Risk Score</CardTitle>
                        <CardBody>
                          <div className="pra__risk-score">
                            {assessment.riskScorePercent}%
                          </div>
                          <Content component="small">
                            Submitted on {assessment.submittedAt}
                          </Content>
                          <Flex
                            className="pra__risk-actions"
                            gap={{ default: "gapMd" }}
                          >
                            <FlexItem>
                              <Button
                                variant="secondary"
                                onClick={startNewAssessment}
                              >
                                Start New Assessment
                              </Button>
                            </FlexItem>
                            <FlexItem>
                              <Button
                                variant="primary"
                                onClick={downloadAssessment}
                              >
                                Download Assessment
                              </Button>
                            </FlexItem>
                          </Flex>
                        </CardBody>
                      </Card>

                      <Card>
                        <CardTitle>Criteria Summary</CardTitle>
                        <CardBody>
                          <Table
                            aria-label="Assessment criteria summary"
                            variant="compact"
                          >
                            <Thead>
                              <Tr>
                                <Th width={40}>Criterion</Th>
                                <Th width={20}>Completeness</Th>
                                <Th width={25}>Risk level</Th>
                                <Th width={15}>Score</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {assessment.criteria.map((row) => (
                                <Tr key={row.id}>
                                  <Td dataLabel="Criterion">{row.name}</Td>
                                  <Td dataLabel="Completeness">
                                    <CompletenessLabel
                                      value={row.completeness}
                                    />
                                  </Td>
                                  <Td dataLabel="Risk level">
                                    <RiskLevelDisplay level={row.riskLevel} />
                                  </Td>
                                  <Td dataLabel="Score">{row.score}</Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </CardBody>
                      </Card>
                    </>
                  ) : (
                    <MultipleFileUpload
                      onFileDrop={handleUpload}
                      dropzoneProps={{
                        multiple: false,
                        useFsAccessApi: false,
                      }}
                    >
                      <MultipleFileUploadMain
                        titleIcon={<UploadIcon />}
                        titleText="Drag and drop files here"
                        titleTextSeparator="or"
                        browseButtonText="Upload"
                        infoText="Accepted file types: PDF"
                      />
                    </MultipleFileUpload>
                  )}
                </>
              ) : (
                <Content component="p">
                  Select at least one assessment document to get started.
                </Content>
              )}
            </div>

            <div className="pra__footer">
              <Timestamp date={lastSavedAt}>
                {`Last saved ${formatLastSaved(lastSavedAt)}`}
              </Timestamp>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        variant="small"
        aria-label="Customize assessments"
      >
        <ModalHeader title="Customize assessments" />
        <ModalBody>
          <Content component="p">
            Select which documents to assess for this product. Weights adjust
            automatically when you change the selection.
          </Content>
          <div className="pra__customize-list">
            {PRA_DOCUMENTS.map((doc) => (
              <Checkbox
                key={doc.id}
                id={`pra-select-${doc.id}`}
                label={doc.title}
                description={`${doc.baseWeight}% base weight`}
                isChecked={draftSelectedIds.includes(doc.id)}
                onChange={(_event, checked) => toggleDraftDoc(doc.id, checked)}
              />
            ))}
          </div>
          {draftSelectedIds.length === 0 ? (
            <Content component="small">
              Select at least one assessment document.
            </Content>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="primary"
            onClick={applyCustomize}
            isDisabled={draftSelectedIds.length === 0}
          >
            Save selection
          </Button>
          <Button variant="link" onClick={() => setIsCustomizeOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
