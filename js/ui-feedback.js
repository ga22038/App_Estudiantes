import { escapeHtml } from "./ui-table.js";

export function showFeedback(container, config) {
  const alert = document.createElement("article");
  alert.className = "app-alert";
  alert.dataset.tone = config.tone;
  alert.innerHTML = `
    <div>
      <strong>${escapeHtml(config.title)}</strong>
      <p>${escapeHtml(config.message)}</p>
    </div>
    <button type="button" class="btn-close" aria-label="Cerrar mensaje"></button>
  `;

  const closeButton = alert.querySelector(".btn-close");
  closeButton?.addEventListener("click", () => alert.remove());

  container.prepend(alert);

  window.setTimeout(() => {
    alert.remove();
  }, 5000);
}
