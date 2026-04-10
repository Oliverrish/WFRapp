"use client";

import { useEffect } from "react";

const PROJECT_SLUG = "wfrapp";
const DEFAULT_HUB_URL = "https://www.overporten.com";
const SCRIPT_MARKER = "data-overporten-project-widget";

function getHubUrl(): string {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hubUrl = (window as any).__OVERPORTEN_HUB_URL__;
    if (typeof hubUrl === "string") {
      const value = hubUrl.trim();
      if (value) return value;
    }
  }
  return DEFAULT_HUB_URL;
}

export function OverportenWidget() {
  useEffect(() => {
    if (document.querySelector(`script[${SCRIPT_MARKER}="${PROJECT_SLUG}"]`)) {
      return;
    }

    const script = document.createElement("script");
    script.src = `${getHubUrl()}/api/project-briefing/embed?projectSlug=${encodeURIComponent(PROJECT_SLUG)}`;
    script.defer = true;
    script.setAttribute(SCRIPT_MARKER, PROJECT_SLUG);
    document.head.appendChild(script);
  }, []);

  return null;
}
