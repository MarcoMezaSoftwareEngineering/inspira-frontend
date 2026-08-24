import { navigate } from "../../../services/navigate";

// Item del menú móvil. Los items con `children` se muestran como grupo
// expandido (título + sub-enlaces), no como dropdown.
export default function NavItem({ item, onClick }) {
  const base = "block py-2 text-sm font-semibold transition-colors";
  const normal = "text-primary hover:text-accent";
  const highlight = "text-accent hover:text-accent-dark";

  const go = (e, href) => {
    e.preventDefault();
    navigate(href);
    window.scrollTo({ top: 0, behavior: "instant" });
    onClick?.();
  };

  if (!item.children) {
    if (item.externo) {
      return (
        <li>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClick}
            className={
              item.cta
                ? "mt-1 flex items-center justify-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-accent-dark"
                : `${base} ${normal}`
            }
          >
            {item.cta && "📅"} {item.label}
          </a>
        </li>
      );
    }
    if (item.badge) {
      return (
        <li>
          <a
            href={item.href}
            onClick={(e) => go(e, item.href)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white rounded-full transition-all hover:opacity-90 hover:scale-105"
            style={{ background: "#1D6A4A", boxShadow: "0 2px 10px rgba(29,106,74,0.35)" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400" />
            </span>
            {item.label}
          </a>
        </li>
      );
    }

    return (
      <li>
        <a
          href={item.href}
          onClick={(e) => go(e, item.href)}
          className={`${base} ${item.highlight ? highlight : normal}`}
        >
          {item.label}
        </a>
      </li>
    );
  }

  return (
    <li>
      <span className="block pt-2 pb-1 text-[11px] font-extrabold uppercase tracking-widest text-accent">
        {item.label}
      </span>
      <ul className="border-l-2 border-secondary pl-3">
        {item.children.map((child) => (
          <li key={child.label}>
            <a
              href={child.href}
              onClick={(e) => go(e, child.href)}
              className="block py-1.5 text-sm text-neutral-900 hover:text-primary"
            >
              {child.label}
            </a>
          </li>
        ))}
      </ul>
    </li>
  );
}
