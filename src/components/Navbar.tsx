import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleTheme, isDark } = useTheme();

  const links = [
    { label: "Home", path: "/" },
    { label: "English", path: "/english" },
    { label: "తెలుగు", path: "/telugu" },
  ];

  return (
    <nav
      style={{
        background: "var(--nav-bg)",
        padding: "0 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 0 rgba(255,255,255,0.06), var(--shadow)",
        height: 60,
      }}
    >
      {/* Brand */}
      <div
        onClick={() => navigate("/")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
          textDecoration: "none",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/sda-symbol.svg"
            alt="SDA"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: `brightness(0) invert(1)
        drop-shadow(0 0 8px rgba(255,255,255,0.7))
      `,
            }}
          />
        </div>
        <div>
          <div
            style={{
              color: "var(--nav-text)",
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}
          >
            SDA Hymnal
          </div>
          <div
            style={{
              color: "var(--nav-text-muted)",
              fontSize: 10,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Seventh-day Adventist
          </div>
        </div>
      </div>

      {/* Links */}
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              style={{
                background: isActive ? "var(--nav-active-bg)" : "transparent",
                border: "none",
                color: isActive ? "var(--nav-text)" : "var(--nav-text-muted)",
                padding: "7px 14px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                fontFamily: "inherit",
                letterSpacing: link.path === "/telugu" ? "0.02em" : 0,
                transition: "all 0.15s",
              }}
            >
              {link.label}
            </button>
          );
        })}
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={toggleTheme}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        style={{
          background: "var(--nav-active-bg)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "var(--nav-text)",
          width: 38,
          height: 38,
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 17,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
          flexShrink: 0,
        }}
      >
        {isDark ? "☀" : "☽"}
      </button>
    </nav>
  );
}
