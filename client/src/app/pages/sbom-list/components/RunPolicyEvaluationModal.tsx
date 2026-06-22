import React from "react";

import {
  Button,
  Content,
  Form,
  FormGroup,
  MenuToggle,
  type MenuToggleElement,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  SelectList,
  SelectOption,
} from "@patternfly/react-core";

import { mockConfiguredPolicies } from "@app/mocks/policy-evaluations";

interface RunPolicyEvaluationModalProps {
  isOpen: boolean;
  introText?: string;
  selectedPolicyId: string;
  onClose: () => void;
  onPolicyChange: (policyId: string) => void;
  onConfirm: () => void;
}

export const RunPolicyEvaluationModal: React.FC<
  RunPolicyEvaluationModalProps
> = ({
  isOpen,
  introText,
  selectedPolicyId,
  onClose,
  onPolicyChange,
  onConfirm,
}) => {
  const [isPolicySelectOpen, setIsPolicySelectOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setIsPolicySelectOpen(false);
    }
  }, [isOpen]);

  const selectedPolicy = mockConfiguredPolicies.find(
    (policy) => policy.id === selectedPolicyId,
  );

  const policyToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      id="run-policy-select"
      aria-label="Policy"
      isExpanded={isPolicySelectOpen}
      isFullWidth
      onClick={() => setIsPolicySelectOpen((open) => !open)}
    >
      {selectedPolicy?.label ?? "Select a policy"}
    </MenuToggle>
  );

  return (
    <Modal
      aria-label="Run policy evaluation"
      isOpen={isOpen}
      onClose={onClose}
      variant="small"
    >
      <ModalHeader title="Run policy evaluation" />
      <ModalBody>
        <Content component="p">
          {introText ?? "Evaluate selected SBOM(s) against a policy."}
        </Content>
        <Form>
          <FormGroup label="Policy" isRequired fieldId="run-policy-select">
            <Select
              aria-label="Policy"
              isOpen={isPolicySelectOpen}
              onOpenChange={setIsPolicySelectOpen}
              selected={selectedPolicyId}
              onSelect={(_event, value) => {
                onPolicyChange(value as string);
                setIsPolicySelectOpen(false);
              }}
              shouldFocusToggleOnSelect
              toggle={policyToggle}
            >
              <SelectList>
                {mockConfiguredPolicies.map((policy) => (
                  <SelectOption
                    key={policy.id}
                    isSelected={policy.id === selectedPolicyId}
                    value={policy.id}
                  >
                    {policy.label}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          key="run"
          variant="primary"
          isDisabled={!selectedPolicyId}
          onClick={onConfirm}
        >
          Run evaluation
        </Button>
        <Button key="cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
