"use client";

import { useEffect } from "react";

const SCRIPT_MARKER = "data-overporten-project-widget";

type OverportenWidgetProps = {
  hubUrl: string;
  projectSlug: string;
};

function normalizeHubUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

export function OverportenWidget({
  hubUrl,
  projectSlug,
}: OverportenWidgetProps) {
  const normalizedHubUrl = normalizeHubUrl(hubUrl);

  useEffect(() => {
    if (!projectSlug) {
      return;
    }

    if (document.querySelector(`script[${SCRIPT_MARKER}="${projectSlug}"]`)) {
      return;
    }

    const script = document.createElement("script");
    script.src = `${normalizedHubUrl}/api/project-briefing/embed?projectSlug=${encodeURIComponent(projectSlug)}`;
    script.defer = true;
    script.setAttribute(SCRIPT_MARKER, projectSlug);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [normalizedHubUrl, projectSlug]);

  return null;
}
