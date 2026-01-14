// src/components/ui/Tabs.tsx
import { ReactNode, useEffect, useId, useState } from "react";

export type TabDef = { key: string; label: string; content: ReactNode; disabled?: boolean; badge?: number | boolean };
export default function Tabs({ tabs, initial }: { tabs: TabDef[]; initial?: string }) {
  const [active, setActive] = useState(initial ?? tabs[0]?.key);
  const id = useId();

  useEffect(() => { if (!tabs.find(t => t.key === active)) setActive(tabs[0]?.key); }, [tabs, active]);

  return (
    <div>
      <div role="tablist" aria-label="Tabs">
        {tabs.map((t) => {
          const btnId = `${id}-tab-${t.key}`;
          const panelId = `${id}-panel-${t.key}`;
          return (
            <button
              key={t.key}
              id={btnId}
              role="tab"
              aria-selected={active === t.key}
              aria-controls={panelId}
              tabIndex={active === t.key ? 0 : -1}
              disabled={t.disabled}
              onClick={() => setActive(t.key)}
              type="button"
              className={active === t.key ? "tab active" : "tab"}
            >
              {t.label}{t.badge ? <span className="badge">{typeof t.badge === "number" ? t.badge : ""}</span> : null}
            </button>
          );
        })}
      </div>
      {tabs.map(t => {
        const panelId = `${id}-panel-${t.key}`;
        const btnId = `${id}-tab-${t.key}`;
        return (
          <div
            key={t.key}
            id={panelId}
            role="tabpanel"
            aria-labelledby={btnId}
            hidden={active !== t.key}
            className="tab-panel"
          >
            {t.content}
          </div>
        );
      })}
    </div>
  );
}
