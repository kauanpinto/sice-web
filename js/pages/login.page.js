import { authService } from "../services/auth.service.js";
const form = document.querySelector("#login-form");
const btn = document.querySelector('[data-role="login-btn"]');
const errorEl = document.querySelector('[data-role="login-error"]');

authService.onUserChange((user) => {
  if (user) window.location.href = "./painel.html";
});
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  btn.disabled = true;
  errorEl.hidden = true;

  try {
    const d = new FormData(form);

    await authService.login(d.get("email"), d.get("password"));
  } catch {
    errorEl.textContent = "E-mail ou senha incorretos";
    errorEl.hidden = false;
  } finally {
    btn.disabled = false;
  }
});
