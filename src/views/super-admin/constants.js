export const MODULE_OPTIONS = [
  { id: 'crm', label: 'CRM' },
  { id: 'finance', label: 'Finance' },
  { id: 'hrms', label: 'HR' },
  { id: 'legalos', label: 'LegalOS' },
  { id: 'projectsLite', label: 'Projects Lite' },
  { id: 'projectsMax', label: 'Projects Max' },
  { id: 'academy', label: 'Academy' },
  { id: 'ecommerce', label: 'Ecommerce' },
]

export const emptyCreateForm = {
  companyName: '',
  adminEmail: '',
  adminPassword: '',
  adminName: '',
  plan: 'trial',
  trialDays: 14,
  enabledModules: ['crm'],
}

export const SUPER_ADMIN_CSS = `
  .sa-root {
    min-height: 100vh;
    background: #f4f6f8;
    color: #0f172a;
    font-family: "Segoe UI", ui-sans-serif, system-ui, sans-serif;
  }
  .sa-login-root {
    display: grid;
    place-items: center;
    padding: 24px;
    background:
      radial-gradient(1200px 600px at 10% -10%, rgba(15, 118, 110, 0.18), transparent 60%),
      linear-gradient(180deg, #0b1220 0%, #122033 100%);
  }
  .sa-login-panel {
    width: min(440px, 100%);
    background: #fff;
    border-radius: 18px;
    padding: 28px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.28);
  }
  .sa-brand { display: flex; gap: 14px; align-items: center; margin-bottom: 22px; }
  .sa-brand h1 { margin: 0; font-size: 1.55rem; letter-spacing: -0.02em; }
  .sa-lead { margin: 4px 0 0; color: #64748b; font-size: 0.92rem; }
  .sa-brand-logo-wrap {
    display: inline-flex; align-items: center; justify-content: center;
    background: #0b1220; border-radius: 14px; padding: 10px 14px;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
  }
  .sa-brand-logo-wrap-sm { border-radius: 12px; padding: 6px 10px; }
  .sa-brand-logo {
    display: block; height: 36px; width: auto; max-width: 160px;
    object-fit: contain;
  }
  .sa-brand-logo-sm { height: 28px; max-width: 120px; }
  .sa-kicker {
    margin: 0; text-transform: uppercase; letter-spacing: 0.08em;
    font-size: 0.72rem; color: #0f766e; font-weight: 700;
  }
  .sa-topbar {
    display: flex; justify-content: space-between; align-items: center; gap: 16px;
    padding: 18px 24px; background: #fff; border-bottom: 1px solid #e2e8f0;
    position: sticky; top: 0; z-index: 10;
  }
  .sa-topbar h1 { margin: 2px 0 0; font-size: 1.35rem; }
  .sa-topbar-left { display: flex; gap: 12px; align-items: center; }
  .sa-topbar-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .sa-main { max-width: 1200px; margin: 0 auto; padding: 24px 16px 56px; }
  .sa-stats { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
  .sa-stat {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 18px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .sa-stat strong { font-size: 1.5rem; }
  .sa-stat span { color: #64748b; font-size: 0.82rem; }
  .sa-tabs { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
  .sa-tab {
    border: 1px solid #cbd5e1; background: #fff; border-radius: 999px;
    padding: 8px 14px; cursor: pointer; font-weight: 600; color: #334155;
    text-decoration: none; display: inline-flex; align-items: center;
  }
  .sa-tab.active { background: #0f766e; border-color: #0f766e; color: #fff; }
  .sa-panel {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px;
  }
  .sa-panel h2 { margin: 0 0 6px; font-size: 1.15rem; }
  .sa-help { margin: 0 0 16px; color: #64748b; font-size: 0.92rem; }
  .sa-form { display: flex; flex-direction: column; gap: 12px; }
  .sa-form label { display: flex; flex-direction: column; gap: 6px; font-size: 0.88rem; font-weight: 600; }
  .sa-form input, .sa-form select, .sa-form textarea {
    border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px 12px;
    font: inherit; font-weight: 400; background: #fff;
  }
  .sa-form textarea { min-height: 80px; resize: vertical; }
  .sa-form input:focus, .sa-form select:focus, .sa-form textarea:focus {
    outline: 2px solid rgba(15, 118, 110, 0.25); border-color: #0f766e;
  }
  .sa-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .sa-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .sa-label { margin: 4px 0 0; font-size: 0.88rem; font-weight: 600; }
  .sa-modules { display: flex; flex-wrap: wrap; gap: 8px; }
  .sa-chip {
    display: inline-flex; align-items: center; gap: 6px;
    border: 1px solid #cbd5e1; border-radius: 999px; padding: 6px 10px;
    font-size: 0.85rem; font-weight: 500; background: #f8fafc;
  }
  .sa-btn {
    border: 0; border-radius: 10px; padding: 10px 14px; font-weight: 700; cursor: pointer;
    font: inherit;
  }
  .sa-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .sa-btn-primary { background: #0f766e; color: #fff; width: fit-content; }
  .sa-btn-ghost { background: #f1f5f9; color: #0f172a; border: 1px solid #e2e8f0; }
  .sa-btn-danger { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
  .sa-btn-warn { background: #fff7ed; color: #9a3412; border: 1px solid #fed7aa; }
  .sa-alert { border-radius: 12px; padding: 12px 14px; margin-bottom: 14px; font-size: 0.92rem; }
  .sa-alert-error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
  .sa-alert-ok { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
  .sa-banner {
    display: flex; justify-content: space-between; gap: 16px; align-items: flex-start;
    background: #ecfeff; border: 1px solid #a5f3fc; border-radius: 14px; padding: 16px; margin-bottom: 14px;
  }
  .sa-banner h2 { margin: 0 0 6px; font-size: 1rem; }
  .sa-impersonation {
    background: #7f1d1d; color: #fff; padding: 10px 16px;
    display: flex; justify-content: space-between; align-items: center; gap: 12px;
    position: sticky; top: 0; z-index: 20;
  }
  .sa-impersonation button {
    background: #fff; color: #7f1d1d; border: 0; border-radius: 8px;
    padding: 8px 12px; font-weight: 700; cursor: pointer;
  }
  .sa-filters {
    display: grid; grid-template-columns: 2fr repeat(3, 1fr) auto; gap: 10px;
    margin-bottom: 14px; align-items: end;
  }
  .sa-filters label { display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; font-weight: 600; }
  .sa-filters input, .sa-filters select {
    border: 1px solid #cbd5e1; border-radius: 10px; padding: 9px 11px; font: inherit;
  }
  .sa-table-wrap { overflow-x: auto; margin-top: 12px; }
  .sa-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  .sa-table th {
    text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em;
    color: #64748b; padding: 10px 8px; border-bottom: 1px solid #e2e8f0;
  }
  .sa-table td { padding: 12px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
  .sa-table tr.sa-clickable { cursor: pointer; }
  .sa-table tr.sa-clickable:hover { background: #f8fafc; }
  .sa-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.82rem; }
  .sa-muted { color: #64748b; font-size: 0.8rem; }
  .sa-pill { border-radius: 999px; padding: 2px 8px; font-size: 0.75rem; font-weight: 700; text-transform: capitalize; }
  .sa-pill.ok, .sa-pill.active, .sa-pill.healthy { background: #dcfce7; color: #166534; }
  .sa-pill.bad, .sa-pill.suspended, .sa-pill.critical, .sa-pill.deleted { background: #fee2e2; color: #991b1b; }
  .sa-pill.trial, .sa-pill.at_risk { background: #ffedd5; color: #9a3412; }
  .sa-pill.expired { background: #fef3c7; color: #92400e; }
  .sa-row-actions { display: flex; flex-wrap: wrap; gap: 6px; }
  .sa-row-actions button, .sa-actions button {
    border: 1px solid #cbd5e1; background: #fff; border-radius: 8px;
    padding: 6px 8px; font-size: 0.75rem; cursor: pointer;
  }
  .sa-actions { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0; }
  .sa-empty { color: #64748b; padding: 20px 8px !important; }
  .sa-pagination {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 14px; gap: 12px; flex-wrap: wrap;
  }
  .sa-cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-top: 14px; }
  .sa-card {
    border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; background: #fff;
  }
  .sa-card h3 { margin: 0 0 10px; font-size: 0.95rem; }
  .sa-dl { display: grid; gap: 8px; font-size: 0.9rem; }
  .sa-dl div { display: flex; justify-content: space-between; gap: 12px; }
  .sa-dl dt { color: #64748b; }
  .sa-dl dd { margin: 0; font-weight: 600; text-align: right; }
  .sa-audit { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
  .sa-audit li {
    border-left: 3px solid #0f766e; padding: 8px 12px; background: #f8fafc; border-radius: 0 10px 10px 0;
  }
  .sa-header-row { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; flex-wrap: wrap; }
  @media (max-width: 1000px) {
    .sa-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .sa-filters { grid-template-columns: 1fr 1fr; }
    .sa-cards { grid-template-columns: 1fr; }
    .sa-grid-3 { grid-template-columns: 1fr; }
  }
  @media (max-width: 800px) {
    .sa-grid { grid-template-columns: 1fr; }
    .sa-topbar { flex-direction: column; align-items: flex-start; }
  }
`
