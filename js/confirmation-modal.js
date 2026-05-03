import { toggleModal } from "./ui.js";

export function createConfirmationController({ dom, notify }) {
  let pendingConfirmation = null;

  function bindEvents() {
    dom.confirmOkButton?.addEventListener("click", () => settle(true));
    dom.confirmCancelButton?.addEventListener("click", () => settle(false));

    dom.confirmModal?.addEventListener("click", (event) => {
      if (event.target === dom.confirmModal) {
        settle(false);
      }
    });
  }

  function request({
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    tone = "danger",
  }) {
    if (!dom.confirmModal) {
      notify(
        "error",
        "Confirmacion no disponible",
        "No se encontro el modal de confirmacion en la pagina."
      );
      return Promise.resolve(false);
    }

    if (pendingConfirmation) {
      settle(false);
    }

    const activeElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    dom.confirmTitle.textContent = title;
    dom.confirmMessage.textContent = message;
    dom.confirmOkButton.textContent = confirmText;
    dom.confirmCancelButton.textContent = cancelText;
    dom.confirmOkButton.className = `btn ${
      tone === "danger" ? "app-danger-button" : "app-primary-button"
    }`;
    dom.confirmIcon.dataset.tone = tone;
    dom.confirmIcon.innerHTML =
      tone === "danger"
        ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
        : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>';

    toggleModal(dom.confirmModal, true);
    window.setTimeout(() => dom.confirmCancelButton.focus(), 0);

    return new Promise((resolve) => {
      pendingConfirmation = { resolve, activeElement };
    });
  }

  function settle(confirmed) {
    if (!pendingConfirmation) {
      return;
    }

    const { resolve, activeElement } = pendingConfirmation;
    pendingConfirmation = null;
    toggleModal(dom.confirmModal, false);
    resolve(confirmed);
    activeElement?.focus?.();
  }

  function handleEscape() {
    if (isOpen()) {
      settle(false);
      return true;
    }

    return false;
  }

  function isOpen() {
    return Boolean(dom.confirmModal && !dom.confirmModal.hidden);
  }

  return {
    bindEvents,
    request,
    settle,
    handleEscape,
    isOpen,
  };
}
