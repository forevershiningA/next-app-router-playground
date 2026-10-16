'use client';

import SaveDesignModal from '#/components/designer/actions/SaveDesignModal';
import ConfirmModal from '#/components/shared/ConfirmModal';
import GuestCheckoutModal from '#/components/checkout/GuestCheckoutModal';
import type { useDesignerSaveWorkflow } from '#/components/designer/navigation/useDesignerSaveWorkflow';

type WorkflowState = ReturnType<typeof useDesignerSaveWorkflow>;
type DesignerWorkflowModalsProps = Pick<
  WorkflowState,
  | 'showSaveDesignModal'
  | 'setShowSaveDesignModal'
  | 'showNewDesignConfirm'
  | 'setShowNewDesignConfirm'
  | 'isSavingDesign'
  | 'showGuestCheckout'
  | 'setShowGuestCheckout'
  | 'handleSaveDesign'
  | 'handleConfirmNewDesign'
  | 'handleGuestCheckoutSuccess'
>;

export default function DesignerWorkflowModals({
  showSaveDesignModal,
  setShowSaveDesignModal,
  showNewDesignConfirm,
  setShowNewDesignConfirm,
  isSavingDesign,
  showGuestCheckout,
  setShowGuestCheckout,
  handleSaveDesign,
  handleConfirmNewDesign,
  handleGuestCheckoutSuccess,
}: DesignerWorkflowModalsProps) {
  return (
    <>
      <SaveDesignModal
        isOpen={showSaveDesignModal}
        onClose={() => setShowSaveDesignModal(false)}
        onSave={handleSaveDesign}
        isSaving={isSavingDesign}
      />
      <GuestCheckoutModal
        isOpen={showGuestCheckout}
        onClose={() => setShowGuestCheckout(false)}
        onSuccess={handleGuestCheckoutSuccess}
      />
      <ConfirmModal
        isOpen={showNewDesignConfirm}
        onClose={() => setShowNewDesignConfirm(false)}
        onConfirm={handleConfirmNewDesign}
        title="Start New Design"
        message="Are you sure you want to start a new design? This will remove all inscriptions, additions, motifs, and reset dimensions to defaults."
        confirmLabel="Start New"
        cancelLabel="Keep Current"
      />
    </>
  );
}
