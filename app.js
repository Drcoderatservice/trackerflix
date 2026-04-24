:root {
  --bg: #090511;
  --surface: rgba(23, 11, 36, 0.86);
  --surface-strong: rgba(29, 14, 46, 0.94);
  --surface-soft: rgba(43, 20, 63, 0.85);
  --text: #f7f1ff;
  --muted: #c5b6da;
  --accent: #ff4f88;
  --accent-soft: rgba(168, 85, 247, 0.22);
  --success: #ff5c8a;
  --warning: #b678ff;
  --danger: #ff3d6e;
  --border: rgba(255, 255, 255, 0.12);
  --shadow: 0 22px 70px rgba(8, 0, 20, 0.45);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text);
  background: var(--bg);
  position: relative;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  background:
    radial-gradient(circle at top left, rgba(255, 70, 120, 0.2), transparent 32%),
    radial-gradient(circle at top right, rgba(162, 72, 255, 0.18), transparent 28%),
    linear-gradient(180deg, rgba(12, 5, 20, 0.52), rgba(9, 4, 18, 0.94)),
    url("dragon-bg.jpg") center top / cover no-repeat;
  z-index: 0;
}

body > * {
  position: relative;
  z-index: 1;
}

button,
input,
select {
  font: inherit;
}

header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 18px 24px;
  background: rgba(16, 7, 26, 0.78);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 50;
  overflow: visible;
}

.logo {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #fff3fb;
  text-shadow: 0 0 18px rgba(255, 79, 136, 0.28);
  text-transform: uppercase;
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

nav button {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03)),
    linear-gradient(135deg, rgba(255, 79, 136, 0.12), rgba(143, 70, 255, 0.12));
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #f7ecff;
  cursor: pointer;
  font-size: 14px;
  padding: 10px 14px;
  border-radius: 999px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    0 10px 22px rgba(16, 2, 28, 0.2);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease;
}

nav button:hover {
  border-color: rgba(255, 255, 255, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04)),
    linear-gradient(135deg, rgba(255, 79, 136, 0.32), rgba(143, 70, 255, 0.3));
  color: #fff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.24),
    0 14px 28px rgba(27, 4, 43, 0.28);
}

nav button:focus-visible {
  outline: none;
  border-color: rgba(212, 148, 255, 0.5);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    0 0 0 3px rgba(168, 85, 247, 0.22);
}

.search-area {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.search-area input,
.modal-content input,
.modal-content select,
.login-popup input {
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
  outline: none;
}

.modal-content select {
  color-scheme: dark;
}

.modal-content select option {
  background: #ffffff;
  color: #111827;
}

.search-area input {
  width: min(280px, 80vw);
}

.search-area button,
.modal-content button,
.login-btn,
.hero-btn {
  border: none;
  color: white;
  padding: 12px 18px;
  border-radius: 14px;
  cursor: pointer;
  transition: transform 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease;
}

.search-area button:hover,
.modal-content button:hover,
.login-btn:hover,
.hero-btn:hover {
  transform: translateY(-1px);
  opacity: 0.96;
}

.add-series-btn,
.hero-btn {
  background: linear-gradient(135deg, #ff4d6d, #8f46ff);
  font-weight: 700;
  box-shadow: 0 18px 34px rgba(162, 72, 255, 0.24);
}

section {
  padding: 28px 24px;
}

section h2 {
  margin: 0 0 18px;
  font-size: 26px;
}

.row,
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(165px, 190px));
  gap: 16px;
  justify-content: start;
}

.currently .row {
  grid-template-columns: none;
  grid-auto-flow: column;
  grid-auto-columns: minmax(165px, 190px);
  justify-content: start;
  align-items: stretch;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 10px;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.currently .row .card {
  min-width: 0;
  height: 100%;
}

.currently .row .empty-panel {
  min-width: min(100%, 720px);
}

.currently .row::-webkit-scrollbar {
  height: 10px;
}

.currently .row::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 999px;
}

.currently .row::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 999px;
}

.currently .row::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.28);
}

.card,
.empty-panel {
  background: linear-gradient(180deg, rgba(25, 10, 37, 0.96), rgba(38, 16, 58, 0.9));
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 12px;
  box-shadow: var(--shadow);
}

.card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card img,
.card-poster {
  width: 100%;
  height: 210px;
  object-fit: cover;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255, 77, 109, 0.2), rgba(143, 70, 255, 0.2));
}

.card-poster.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  font-weight: 700;
}

.tag {
  align-self: flex-start;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--muted);
  font-size: 12px;
}

.card h3 {
  margin: 0;
  font-size: 14px;
  line-height: 1.35;
}

.progress {
  color: var(--muted);
  font-size: 12px;
  margin: 0;
}

.actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 7px;
  margin-top: auto;
}

.actions button {
  position: relative;
  overflow: hidden;
  padding: 10px 0;
  border-radius: 16px;
  font-weight: 700;
  font-size: 11px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.32),
    inset 0 -10px 20px rgba(255, 255, 255, 0.05),
    0 12px 24px rgba(7, 1, 18, 0.28);
  backdrop-filter: blur(18px) saturate(150%);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease,
    background 0.22s ease;
}

.actions button::before {
  content: "";
  position: absolute;
  inset: 1px 1px auto 1px;
  height: 48%;
  border-radius: 14px 14px 10px 10px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.08));
  opacity: 0.75;
  pointer-events: none;
}

.actions button::after {
  content: "";
  position: absolute;
  inset: -35% auto auto -18%;
  width: 72%;
  height: 160%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.24), transparent);
  transform: rotate(18deg);
  opacity: 0.45;
  pointer-events: none;
}

.actions button:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -12px 24px rgba(255, 255, 255, 0.07),
    0 16px 28px rgba(7, 1, 18, 0.34);
  border-color: rgba(255, 255, 255, 0.28);
}

.green {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.04)),
    linear-gradient(135deg, rgba(255, 79, 136, 0.86), rgba(217, 70, 239, 0.74));
  color: #fff4fb;
}

.white {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.38), rgba(255, 255, 255, 0.14)),
    linear-gradient(135deg, rgba(255, 245, 255, 0.88), rgba(235, 222, 255, 0.74));
  color: #2b143d;
}

.yellow {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.04)),
    linear-gradient(135deg, rgba(182, 120, 255, 0.82), rgba(143, 70, 255, 0.74));
  color: #fdf8ff;
}

.red {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.04)),
    linear-gradient(135deg, rgba(255, 54, 95, 0.84), rgba(255, 79, 136, 0.74));
  color: #fff1f5;
}

.modal,
.login-modal {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(circle at top, rgba(255, 79, 136, 0.18), transparent 35%),
    radial-gradient(circle at bottom right, rgba(143, 70, 255, 0.16), transparent 32%),
    rgba(4, 6, 10, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 10000;
}

.toast-container {
  position: fixed;
  top: 96px;
  right: 22px;
  width: min(360px, calc(100vw - 28px));
  display: grid;
  gap: 12px;
  z-index: 12000;
}

.toast {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(180deg, rgba(24, 10, 36, 0.97), rgba(37, 16, 56, 0.94));
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(18px);
  animation: toast-in 0.28s ease;
}

.toast.is-closing {
  animation: toast-out 0.22s ease forwards;
}

.toast-badge {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  color: white;
}

.toast-copy {
  min-width: 0;
}

.toast-title,
.toast-message {
  margin: 0;
}

.toast-title {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);
}

.toast-message {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.94);
  line-height: 1.45;
  font-size: 14px;
}

.toast-close {
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.72);
  cursor: pointer;
}

.toast-success .toast-badge {
  background: linear-gradient(135deg, #ff4f88, #d946ef);
  color: #fff4fb;
}

.toast-error .toast-badge {
  background: linear-gradient(135deg, #ff365f, #ff4f88);
}

.toast-info .toast-badge {
  background: linear-gradient(135deg, #8f46ff, #c96bff);
}

.toast-warning .toast-badge {
  background: linear-gradient(135deg, #b678ff, #8f46ff);
  color: #fdf8ff;
}

.hidden {
  display: none !important;
}

.modal-content,
.login-popup {
  width: min(460px, 100%);
  background: var(--surface-strong);
  color: var(--text);
  padding: 26px;
  border-radius: 26px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  position: relative;
}

.modal-content {
  text-align: center;
}

.modal-content.small {
  width: min(340px, 100%);
}

.edit-modal {
  width: min(540px, 100%);
  text-align: left;
}

.confirm-modal {
  width: min(460px, 100%);
  text-align: left;
}

.modal-content h2,
.modal-content h3,
.login-popup h2 {
  margin-top: 0;
}

.modal-content select,
.login-popup input,
.modal-content input {
  width: 100%;
  margin: 10px 0;
}

.modal-content button {
  width: 100%;
  margin-top: 10px;
  background: rgba(255, 255, 255, 0.08);
}

.modal-subtext {
  margin: -4px 0 18px;
  color: var(--muted);
  line-height: 1.6;
}

.edit-form {
  display: grid;
  gap: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.field-group {
  display: grid;
  gap: 8px;
}

.field-group .input-label {
  margin: 0;
}

.field-group input,
.field-group select {
  margin: 0;
}

.choice-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-start;
}

.choice-btn {
  width: auto !important;
  flex: 0 0 auto;
  margin: 0 !important;
  padding: 10px 14px;
  min-height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.choice-btn:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.18);
}

.choice-btn.active {
  background: linear-gradient(135deg, #ff4f88, #8f46ff);
  border-color: rgba(255, 255, 255, 0.2);
  color: #fff8fd;
  box-shadow: 0 12px 24px rgba(162, 72, 255, 0.2);
}

#categoryModal .modal-content.small {
  width: min(420px, 100%);
  max-height: min(78vh, 720px);
  overflow-y: auto;
}

#categoryModal .field-group {
  margin-top: 12px;
}

#categoryModal .choice-group {
  margin-top: 2px;
}

#categoryModal .modal-content button:not(.choice-btn) {
  width: 100%;
}

.modal-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 6px;
}

.modal-content .modal-actions button {
  width: 100%;
  margin-top: 0;
}

.secondary-btn,
.primary-btn {
  min-height: 48px;
  border-radius: 16px;
  font-weight: 700;
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.primary-btn {
  background: linear-gradient(135deg, #ff4f88, #8f46ff);
  box-shadow: 0 18px 34px rgba(162, 72, 255, 0.26);
}

.danger-btn {
  min-height: 48px;
  border-radius: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #ff365f, #ff4f88);
  box-shadow: 0 18px 34px rgba(255, 79, 136, 0.22);
}

.modal-content .top-close {
  width: 40px;
  height: 40px;
  margin-top: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  z-index: 2;
}

.top-close,
.close-login {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: white;
  cursor: pointer;
}

.login-popup {
  position: relative;
  overflow: hidden;
  width: min(520px, 100%);
  padding: 92px 30px 30px;
  background:
    linear-gradient(180deg, rgba(20, 9, 32, 0.97), rgba(31, 13, 46, 0.93)),
    var(--surface-strong);
  animation: login-pop 0.35s ease;
}

.login-popup::before {
  content: "";
  position: absolute;
  inset: -140px auto auto -120px;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 79, 136, 0.38), transparent 68%);
  filter: blur(12px);
}

.login-popup::after {
  content: "";
  position: absolute;
  inset: auto -80px 36px auto;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(143, 70, 255, 0.26), transparent 70%);
  filter: blur(14px);
}

.login-popup h2,
.login-popup input,
.login-btn,
.login-popup p,
.login-brand,
.login-form,
.login-meta {
  position: relative;
  z-index: 1;
}

.login-brand {
  margin-bottom: 24px;
}

.login-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.86);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.login-brand h2 {
  margin: 18px 0 10px;
  font-size: clamp(32px, 5vw, 42px);
  line-height: 1.05;
  font-family: Georgia, "Times New Roman", serif;
  letter-spacing: 0.01em;
}

.inline-note {
  margin: 0;
  color: rgba(255, 255, 255, 0.74);
  font-size: 14px;
  line-height: 1.65;
  max-width: 420px;
}

.login-form {
  display: grid;
  gap: 12px;
}

.input-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.input-shell {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;
}

.input-shell:focus-within {
  border-color: rgba(188, 109, 255, 0.62);
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.input-icon {
  width: 18px;
  flex: 0 0 18px;
  color: rgba(255, 255, 255, 0.58);
  font-weight: 700;
  text-align: center;
}

.login-popup input {
  margin: 0;
  padding: 16px 0;
  border: none;
  background: transparent;
  border-radius: 0;
}

.login-popup input:focus {
  outline: none;
}

.login-popup input::placeholder {
  color: rgba(255, 255, 255, 0.38);
}

.login-btn {
  width: 100%;
  margin-top: 10px;
  padding: 15px 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(135deg, #ff4f88, #8f46ff);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.02em;
  box-shadow: 0 18px 34px rgba(162, 72, 255, 0.26);
}

.login-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.login-chip {
  padding: 9px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
}

.login-footer {
  margin: 22px 0 0;
  color: var(--muted);
}

.login-footer span {
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.search-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px;
  background: var(--surface-soft);
  margin-top: 12px;
  border-radius: 16px;
  text-align: left;
}

.search-item h3,
.search-item p {
  margin: 0;
}

.search-item p,
.muted {
  color: var(--muted);
}

.search-item button {
  width: auto;
  min-width: 78px;
  margin-top: 0;
  background: linear-gradient(135deg, #ff4f88, #8f46ff);
}

.profile-menu {
  position: relative;
}

.profile-icon {
  width: 54px;
  height: 54px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04)),
    linear-gradient(135deg, rgba(255, 79, 136, 0.24), rgba(143, 70, 255, 0.24));
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.24),
    0 12px 24px rgba(18, 2, 28, 0.22);
  color: white;
  font-size: 22px;
  cursor: pointer;
}

.profile-fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 24px;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.profile-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 210px;
  padding: 14px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  z-index: 999;
}

.profile-dropdown button {
  background: rgba(255, 255, 255, 0.07);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
  text-align: left;
}

.profile-dropdown button:hover {
  background: var(--accent-soft);
}

.empty-home {
  min-height: 62vh;
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(16, 4, 23, 0.22), rgba(18, 6, 31, 0.72)),
    url("dragon-bg.jpg") center / cover no-repeat;
  box-shadow: var(--shadow);
}

.overlay {
  width: min(560px, calc(100% - 32px));
  padding: 34px;
  border-radius: 24px;
  text-align: center;
  background: rgba(23, 8, 34, 0.58);
  backdrop-filter: blur(16px);
}

.overlay h2 {
  margin-bottom: 12px;
  font-size: clamp(30px, 5vw, 48px);
}

.overlay p {
  margin-bottom: 22px;
  color: rgba(255, 255, 255, 0.84);
  line-height: 1.6;
}

.empty-panel {
  grid-column: 1 / -1;
  text-align: center;
  padding: 28px;
}

.empty-panel h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.empty-panel p {
  margin: 0;
  color: var(--muted);
}

body.light-mode {
  --bg: #fff4fb;
  --surface: rgba(255, 255, 255, 0.9);
  --surface-strong: rgba(255, 251, 255, 0.97);
  --surface-soft: rgba(250, 239, 255, 0.96);
  --text: #341244;
  --muted: #6f4d7f;
  --border: rgba(118, 38, 120, 0.1);
  --shadow: 0 18px 50px rgba(120, 35, 112, 0.12);
}

body.light-mode::before {
  background:
    radial-gradient(circle at top left, rgba(255, 79, 136, 0.14), transparent 30%),
    radial-gradient(circle at top right, rgba(143, 70, 255, 0.14), transparent 26%),
    linear-gradient(180deg, rgba(255, 243, 250, 0.74), rgba(255, 246, 252, 0.96)),
    url("dragon-bg.jpg") center top / cover no-repeat;
}

body.light-mode nav button,
body.light-mode .profile-icon,
body.light-mode .profile-dropdown button,
body.light-mode .search-area input,
body.light-mode .modal-content input,
body.light-mode .modal-content select,
body.light-mode .login-popup input {
  background: rgba(17, 24, 39, 0.05);
  color: var(--text);
}

body.light-mode .input-shell {
  background: rgba(17, 24, 39, 0.05);
  border-color: rgba(17, 24, 39, 0.08);
}

body.light-mode .input-icon,
body.light-mode .login-kicker,
body.light-mode .login-chip {
  color: rgba(17, 24, 39, 0.72);
}

@media (max-width: 900px) {
  header {
    align-items: flex-start;
  }

  .search-area {
    justify-content: flex-start;
  }
}

@media (max-width: 600px) {
  .form-grid,
  .modal-actions {
    grid-template-columns: 1fr;
  }

  .choice-group {
    gap: 8px;
  }

  .choice-btn {
    padding: 9px 12px;
    font-size: 12px;
  }

  .toast-container {
    top: 78px;
    right: 14px;
    left: 14px;
    width: auto;
  }

  header,
  section {
    padding-left: 16px;
    padding-right: 16px;
  }

  .actions {
    grid-template-columns: repeat(2, 1fr);
  }

  .search-item {
    flex-direction: column;
    align-items: stretch;
  }

  .search-item button {
    width: 100%;
  }

  .overlay {
    padding: 24px;
  }

  .login-popup {
    padding: 84px 22px 22px;
  }

  .login-brand h2 {
    font-size: 30px;
  }
}

@keyframes login-pop {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(-12px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  to {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }
}
