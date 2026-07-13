import type { LpMetricsQuery } from "@/types";

export function buildLpMetricsQuery(query: LpMetricsQuery): string {
  const params = new URLSearchParams();
  if (query.from && query.to) {
    params.set("from", query.from);
    params.set("to", query.to);
  } else if (query.days != null) {
    params.set("days", String(query.days));
  }
  if (query.utmSource) params.set("utmSource", query.utmSource);
  if (query.event) params.set("event", query.event);
  if (query.sessionId) params.set("sessionId", query.sessionId);
  if (query.path) params.set("path", query.path);
  return params.toString();
}

export const LP_EVENT_LABELS: Record<string, string> = {
  page_view: "Visualizações",
  cta_install: "Clique instalar",
  cta_app: "Clique ir ao app",
  cta_register: "Clique cadastro",
  install_banner_click: "Banner instalar",
  install_modal_open: "Modal instalação",
};

export const LP_DAY_PRESETS = [7, 14, 30, 60, 90] as const;
