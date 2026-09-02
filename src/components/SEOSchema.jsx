import { useEffect } from "react";

export default function SEOSchema({ schema, id }) {
  useEffect(() => {
    if (!schema) return undefined;
    const schemaId = `ld-${id || schema["@type"] || "schema"}`;

    const existing = document.getElementById(schemaId);
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = schemaId;
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(schemaId);
      if (el) el.remove();
    };
  }, [schema, id]);

  return null;
}
