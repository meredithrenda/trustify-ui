import type React from "react";

import {
  Button,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextArea,
} from "@patternfly/react-core";

interface BulkPurlModalProps {
  isOpen: boolean;
  bulkPurls: string;
  onBulkPurlsChange: (value: string) => void;
  onClose: () => void;
  onAnalyze: () => void;
}

export const BulkPurlModal: React.FC<BulkPurlModalProps> = ({
  isOpen,
  bulkPurls,
  onBulkPurlsChange,
  onClose,
  onAnalyze,
}) => {
  return (
    <Modal
      aria-label="Bulk PURL search"
      isOpen={isOpen}
      onClose={onClose}
      variant="medium"
    >
      <ModalHeader title="Bulk PURL search" />
      <ModalBody>
        <Form>
          <FormGroup
            fieldId="bulk-purls-input"
            label="Paste PURLs or scanner output"
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
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button key="analyze" variant="primary" onClick={onAnalyze}>
          Apply to filters
        </Button>
        <Button key="cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
