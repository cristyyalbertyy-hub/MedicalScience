import { runAccessGate } from "./auth-gate.js";

try {
  const allowed = await runAccessGate();
  if (allowed) {
    const { init } = await import("./app.js");
    init();
  }
} catch (error) {
  console.error("Information Processing failed to start:", error);
  const gate = document.getElementById("auth-gate");
  const shell = document.getElementById("app-shell");
  if (gate) {
    gate.hidden = false;
    gate.innerHTML =
      '<div class="auth-card"><h1>Information Processing</h1>' +
      '<p class="form-error">Não foi possível carregar a aplicação. Recarregue a página.</p></div>';
  }
  if (shell) shell.hidden = true;
}
