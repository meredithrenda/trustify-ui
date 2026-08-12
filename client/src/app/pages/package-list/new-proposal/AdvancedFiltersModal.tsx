import type React from "react";

import {
  Button,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextArea,
  TextInput,
} from "@patternfly/react-core";

interface AdvancedFiltersModalProps {
  isOpen: boolean;
  mustMatchRegex: string;
  mustNotMatchRegex: string;
  bulkPurls: string;
  onMustMatchRegexChange: (value: string) => void;
  onMustNotMatchRegexChange: (value: string) => void;
  onBulkPurlsChange: (value: string) => void;
  onClose: () => void;
  onDone: () => void;
}

export const AdvancedFiltersModal: React.FC<AdvancedFiltersModalProps> = ({
  isOpen,
  mustMatchRegex,
  mustNotMatchRegex,
  bulkPurls,
  onMustMatchRegexChange,
  onMustNotMatchRegexChange,
  onBulkPurlsChange,
  onClose,
  onDone,
}) => {
  return (
    <Modal
      aria-label="Advanced filters"
      isOpen={isOpen}
      onClose={onClose}
      variant="medium"
    >
      <ModalHeader title="Advanced filters" />
      <ModalBody>
        <Form>
          <FormGroup fieldId="must-match-regex" label="Must match">
            <TextInput
              id="must-match-regex"
              value={mustMatchRegex}
              onChange={(_event, value) => onMustMatchRegexChange(value)}
              placeholder="e.g. ^openssl"
              validated={
                mustMatchRegex.trim() && isInvalidRegex(mustMatchRegex)
                  ? "error"
                  : "default"
              }
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem>
                  Include packages whose PURL matches this regular expression.
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>
          <FormGroup fieldId="must-not-match-regex" label="Must not match">
            <TextInput
              id="must-not-match-regex"
              value={mustNotMatchRegex}
              onChange={(_event, value) => onMustNotMatchRegexChange(value)}
              placeholder="e.g. debuginfo|arch=src"
              validated={
                mustNotMatchRegex.trim() && isInvalidRegex(mustNotMatchRegex)
                  ? "error"
                  : "default"
              }
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem>
                  Exclude packages whose PURL matches this regular expression.
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>
          <FormGroup
            fieldId="bulk-purls-input"
            label="Bulk PURL search"
          >
            <TextArea
              id="bulk-purls-input"
              value={bulkPurls}
              onChange={(_event, value) => onBulkPurlsChange(value)}
              rows={8}
              resizeOrientation="vertical"
              placeholder={
                "pkg:maven/org.apache.logging.log4j/log4j-core@2.23.1\npkg:npm/react@19.0.0"
              }
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem>
                  Paste PURLs or scanner output. Matching packages are included
                  when one line matches the package PURL.
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button key="done" variant="primary" onClick={onDone}>
          Done
        </Button>
        <Button key="cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const isInvalidRegex = (pattern: string): boolean => {
  try {
    // eslint-disable-next-line no-new -- validate only
    new RegExp(pattern);
    return false;
  } catch {
    return true;
  }
};
