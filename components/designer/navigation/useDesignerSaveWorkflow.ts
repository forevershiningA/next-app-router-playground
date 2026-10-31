'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { clearLocalDesignDraft } from '#/lib/use-local-design-draft';
import { saveDesignerProject } from '#/lib/save-designer-project';

export function useDesignerSaveWorkflow() {
  const resetDesign = useHeadstoneStore((state) => state.resetDesign);
  const pathname = usePathname();
  const router = useRouter();
  const [showSaveDesignModal, setShowSaveDesignModal] = React.useState(false);
  const [showNewDesignConfirm, setShowNewDesignConfirm] = React.useState(false);
  const [isSavingDesign, setIsSavingDesign] = React.useState(false);
  const [saveError, setSaveError] = React.useState('');
  const [showGuestCheckout, setShowGuestCheckout] = React.useState(false);

  const openSaveDesign = React.useCallback(async () => {
    setSaveError('');
    const response = await fetch('/api/auth/session');
    if (!response.ok) {
      const returnTo = encodeURIComponent(pathname + '?action=save-design');
      router.push(`/my-account?returnTo=${returnTo}`);
      return;
    }
    setShowSaveDesignModal(true);
  }, [pathname, router]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') !== 'save-design') return;

    let cancelled = false;
    const openAfterSessionCheck = async () => {
      const response = await fetch('/api/auth/session');
      if (cancelled) return;

      params.delete('action');
      const query = params.toString();
      window.history.replaceState(
        {},
        '',
        pathname + (query ? `?${query}` : ''),
      );

      if (response.ok) setShowSaveDesignModal(true);
    };

    void openAfterSessionCheck();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const handleSaveDesign = React.useCallback(
    async (designName: string, proceedToPurchase = false) => {
      setIsSavingDesign(true);
      setSaveError('');
      try {
        const { project } = await saveDesignerProject(designName);
        setShowSaveDesignModal(false);
        if (proceedToPurchase) {
          router.push(`/my-account/designs/${project.id}/buy`);
        } else {
          router.push('/my-account');
        }
      } catch (error) {
        setSaveError(
          error instanceof Error
            ? error.message
            : 'Could not save your design. Please try again.',
        );
        setShowSaveDesignModal(true);
        console.error('Error saving design:', error);
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
      } finally {
        setIsSavingDesign(false);
      }
    },
    [router],
  );

  const handleSaveDesignRef = React.useRef(handleSaveDesign);
  handleSaveDesignRef.current = handleSaveDesign;

  const handleProceedToPurchase = React.useCallback(async () => {
    if (isSavingDesign) return;

    const response = await fetch('/api/auth/session');
    if (!response.ok) {
      setShowGuestCheckout(true);
      return;
    }

    const state = useHeadstoneStore.getState();
    const orderTitle =
      state.currentProjectTitle?.trim() ||
      `Online order ${new Intl.DateTimeFormat('en-AU').format(new Date())}`;
    await handleSaveDesignRef.current(orderTitle, true);
  }, [isSavingDesign]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shouldResume = params.get('action') === 'proceed-purchase';

    const onProceed = () => void handleProceedToPurchase();
    window.addEventListener('proceedToPurchase', onProceed);

    if (shouldResume) {
      params.delete('action');
      const query = params.toString();
      window.history.replaceState(
        {},
        '',
        pathname + (query ? `?${query}` : ''),
      );
      void handleProceedToPurchase();
    }

    return () => window.removeEventListener('proceedToPurchase', onProceed);
  }, [handleProceedToPurchase, pathname]);

  const handleNewDesign = (event: React.MouseEvent) => {
    event.preventDefault();
    setShowNewDesignConfirm(true);
  };

  const handleConfirmNewDesign = () => {
    void clearLocalDesignDraft();
    resetDesign();
  };

  const handleGuestCheckoutSuccess = () => {
    setShowGuestCheckout(false);
    void handleProceedToPurchase();
  };

  return {
    showSaveDesignModal,
    setShowSaveDesignModal,
    showNewDesignConfirm,
    setShowNewDesignConfirm,
    isSavingDesign,
    saveError,
    showGuestCheckout,
    setShowGuestCheckout,
    openSaveDesign,
    handleSaveDesign,
    handleProceedToPurchase,
    handleNewDesign,
    handleConfirmNewDesign,
    handleGuestCheckoutSuccess,
  };
}
