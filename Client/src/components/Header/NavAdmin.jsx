import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Calculator,
  Truck,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Bell,
  Clock,
  X,
  BarChart2,
  Settings,
} from "lucide-react";
import CONFIG from "../../config/config.js";
import { useTheme } from "../../context/ThemeContext";

const SIDEBAR_WIDTH = 256;
const SIDEBAR_COLLAPSED = 68;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
};

// ── Palette INS-Guinée : inspirée du logo (drapeau + bâtiment doré) ──
const C = {
  // Drapeau guinéen
  rouge:       "#CE1126",
  rougeLight:  "#FF3347",
  rougePale:   "#FFF0F2",

  jaune:       "#FCD116",
  jauneDeep:   "#C9A000",

  vert:        "#009A44",
  vertLight:   "#00C457",
  vertPale:    "#E8FFF3",

  // Bâtiment doré du logo
  or:          "#B8860B",
  orLight:     "#D4A017",
  orPale:      "#FDF6E3",

  // Neutres
  gris:        "#F4F6F9",
  grisDark:    "#1A2332",
  grisText:    "#4A5568",
  border:      "#E2E8F0",
};

// Couleur par service
const SERVICE_COLORS = {
  secretariat: { main: C.rouge,  light: C.rougePale,  label: "Secrétariat DG" },
  comptabilite:{ main: C.or,     light: C.orPale,     label: "Comptabilité"   },
  logistique:  { main: C.vert,   light: C.vertPale,   label: "Logistique"     },
  rh:          { main: C.jaune,  light: "#FFFBEA",    label: "Ressources Humaines" },
};

// Logo INS inline SVG (représentation du bâtiment + couleurs drapeau)
const INSLogo = ({ size = 38 }) => (
  <svg width={size} height={size} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="38" height="38" rx="10" fill="#1A2332"/>
    {/* Drapeau tricolore en bande horizontale */}
    <rect x="2" y="2" width="10.5" height="34" rx="2" fill={C.rouge}/>
    <rect x="13.75" y="2" width="10.5" height="34" fill={C.jaune}/>
    <rect x="25.5" y="2" width="10.5" height="34" rx="2" fill={C.vert}/>
    {/* Bâtiment blanc centré */}
    <rect x="15" y="18" width="8" height="12" rx="1" fill="white" opacity="0.95"/>
    <rect x="17" y="13" width="4" height="7" rx="0.5" fill="white" opacity="0.95"/>
    <rect x="18.5" y="10" width="1" height="4" rx="0.3" fill="white" opacity="0.95"/>
    {/* Point lumineux en haut */}
    <circle cx="19" cy="9.5" r="1.2" fill={C.jaune}/>
    {/* Fenêtres */}
    <rect x="16" y="20" width="2" height="2.5" rx="0.3" fill={C.grisDark} opacity="0.4"/>
    <rect x="20" y="20" width="2" height="2.5" rx="0.3" fill={C.grisDark} opacity="0.4"/>
    <rect x="16" y="24" width="2" height="2.5" rx="0.3" fill={C.grisDark} opacity="0.4"/>
    <rect x="20" y="24" width="2" height="2.5" rx="0.3" fill={C.grisDark} opacity="0.4"/>
  </svg>
);

// Badge de service coloré
const ServiceBadge = ({ service, collapsed }) => {
  const s = SERVICE_COLORS[service] || {};
  if (collapsed) return null;
  return (
    <div style={{
      fontSize: "9px", fontWeight: "800", letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: s.main,
      background: s.light,
      border: `1px solid ${s.main}30`,
      borderRadius: "6px",
      padding: "2px 7px",
      display: "inline-block",
      marginTop: "2px",
    }}>
      {s.label}
    </div>
  );
};

const NavAdmin = ({ onToggle, isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleTheme, isLight, tokens } = useTheme();
  const isMobile = useIsMobile();

  const [collapsed, setCollapsed] = useState(false);
  const [counts, setCounts] = useState({ contacts: 0, community: 0, newsletter: 0 });

  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "admin";

  // Détermination du service de l'utilisateur
  const userService = user?.service || "secretariat"; // "secretariat" | "comptabilite" | "logistique" | "rh"
  const serviceInfo = SERVICE_COLORS[userService] || SERVICE_COLORS.secretariat;

  const nomAffiche = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim()
    || user?.username || "Utilisateur";
  const initiales = () => {
    const parts = nomAffiche.split(" ").filter(Boolean);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : (nomAffiche[0] || "?").toUpperCase();
  };

  useEffect(() => {
    if (!isAdmin) return;
    const fetchCounts = async () => {
      try {
        const r1 = await fetch(CONFIG.API_CONTACT_LIST);
        if (r1.ok) { const d = await r1.json(); setCounts(p => ({ ...p, contacts: (Array.isArray(d) ? d : d.results || []).length })); }
        const r2 = await fetch(CONFIG.API_POSTULANT_LIST);
        if (r2.ok) { const d = await r2.json(); setCounts(p => ({ ...p, community: (Array.isArray(d) ? d : d.results || []).length })); }
        const r3 = await fetch(CONFIG.API_ABONNEMENT_LIST);
        if (r3.ok) { const d = await r3.json(); setCounts(p => ({ ...p, newsletter: (Array.isArray(d) ? d : d.results || []).length })); }
      } catch {}
    };
    fetchCounts();
  }, [isAdmin]);

  useEffect(() => {
    if (isMobile && onClose) onClose();
  }, [location.pathname, isMobile]);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    onToggle?.(next);
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ── Sections de navigation par service ──────────────────────────
  const navSections = [
    {
      label: "Général",
      items: [
        {
          path: isAdmin ? "/dashboard" : "/monDashboard",
          label: "Tableau de bord",
          icon: LayoutDashboard,
          accent: C.vert,
        },
        {
          path: "/statistiques",
          label: "Statistiques",
          icon: BarChart2,
          accent: C.or,
        },
      ],
    },
    {
      label: "Secrétariat DG",
      color: C.rouge,
      items: [
        { path: "/gestionCourriers",  label: "Courriers",         icon: FileText, accent: C.rouge },
        { path: "/secretariat/agenda",     label: "Agenda du DG",      icon: Clock,    accent: C.rouge },
        { path: "/secretariat/documents",  label: "Documents officiels", icon: FileText, accent: C.rouge },
      ],
    },
    {
      label: "Comptabilité",
      color: C.or,
      items: [
        { path: "/comptabilite/budget",    label: "Budget",            icon: Calculator, accent: C.or },
        { path: "/comptabilite/depenses",  label: "Dépenses",          icon: Calculator, accent: C.or },
        { path: "/comptabilite/rapports",  label: "Rapports financiers", icon: FileText, accent: C.or },
      ],
    },
    {
      label: "Logistique",
      color: C.vert,
      items: [
        { path: "/logistique/materiels",   label: "Matériels",         icon: Truck,   accent: C.vert },
        { path: "/logistique/missions",    label: "Missions terrain",  icon: Truck,   accent: C.vert },
        { path: "/logistique/stocks",      label: "Stocks",            icon: Truck,   accent: C.vert },
      ],
    },
    {
      label: "Ressources Humaines",
      color: C.jauneDeep,
      items: [
        { path: "/rh/agents",              label: "Agents",            icon: Users,    accent: C.jauneDeep },
        { path: "/rh/conges",              label: "Congés",            icon: Clock,    accent: C.jauneDeep },
        { path: "/rh/formations",          label: "Formations",        icon: Users,    accent: C.jauneDeep },
      ],
    },
    ...(isAdmin ? [{
      label: "Administration",
      color: C.grisText,
      items: [
        { path: "/admin/utilisateurs",     label: "Utilisateurs",      icon: Settings, accent: C.grisText },
        { path: "/admin/historique",       label: "Historique global", icon: Clock,    accent: C.grisText },
      ],
    }] : []),
  ];

  const totalNotifs = counts.contacts + counts.community + counts.newsletter;
  const w = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH;

  const bg      = isLight ? "#FFFFFF" : C.grisDark;
  const surface = isLight ? C.gris    : "#243044";
  const border  = isLight ? C.border  : "#2D3F55";
  const textPri = isLight ? C.grisDark : "#EEF2F7";
  const textSec = isLight ? C.grisText : "#8FA0B5";
  const danger  = "#E53E3E";

  const sidebarStyle = isMobile
    ? {
        position: "fixed", top: 0, left: isOpen ? 0 : `-${SIDEBAR_WIDTH}px`,
        bottom: 0, width: `${SIDEBAR_WIDTH}px`,
        background: bg, borderRight: `1px solid ${border}`,
        display: "flex", flexDirection: "column",
        transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)",
        zIndex: 1000,
        boxShadow: isOpen ? "4px 0 24px rgba(0,0,0,0.18)" : "none",
      }
    : {
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: `${w}px`, background: bg,
        borderRight: `1px solid ${border}`,
        display: "flex", flexDirection: "column",
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
        zIndex: 200, overflow: "hidden",
      };

  return (
    <>
      {isMobile && isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 999, backdropFilter: "blur(2px)",
          }}
        />
      )}

      <aside style={sidebarStyle}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{
          height: "72px", padding: "0 14px",
          display: "flex", alignItems: "center", gap: "10px",
          borderBottom: `1px solid ${border}`,
          flexShrink: 0,
          background: isLight
            ? "linear-gradient(135deg, #1A2332 0%, #243044 100%)"
            : "linear-gradient(135deg, #0F1923 0%, #1A2332 100%)",
        }}>

          {/* Logo */}
          <Link to={isAdmin ? "/dashboard" : "/monDashboard"} style={{ textDecoration: "none", flexShrink: 0 }}>
            <INSLogo size={40} />
          </Link>

          {(!collapsed || isMobile) && (
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{
                fontSize: "14px", fontWeight: "900", color: "#FFFFFF",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}>
                INS – Guinée
              </div>
              <div style={{
                fontSize: "10px", color: C.jaune,
                fontWeight: "600", letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}>
                Plateforme de gestion
              </div>
            </div>
          )}

          {/* Bouton toggle */}
          {isMobile ? (
            <button onClick={onClose} style={{
              width: "34px", height: "34px", borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <X size={16} color="rgba(255,255,255,0.8)" />
            </button>
          ) : (
            <button onClick={toggle} style={{
              position: collapsed ? "fixed" : "relative",
              left: collapsed ? "14px" : "auto",
              top: collapsed ? "17px" : "auto",
              zIndex: collapsed ? 250 : "auto",
              width: "34px", height: "34px", borderRadius: "8px",
              border: collapsed ? `2px solid ${C.vert}` : "1px solid rgba(255,255,255,0.2)",
              background: collapsed
                ? `linear-gradient(135deg, ${C.vert}, ${C.vertLight})`
                : "rgba(255,255,255,0.1)",
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginLeft: collapsed ? 0 : "auto",
              transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
              boxShadow: collapsed ? `0 4px 12px ${C.vert}50` : "none",
            }}>
              {collapsed
                ? <ChevronRight size={16} color="#fff" strokeWidth={3} />
                : <ChevronLeft  size={16} color="rgba(255,255,255,0.9)" strokeWidth={2.5} />
              }
            </button>
          )}
        </div>

        {/* ── Bandeau tricolore décoratif ── */}
        <div style={{ display: "flex", height: "4px", flexShrink: 0 }}>
          <div style={{ flex: 1, background: C.rouge }} />
          <div style={{ flex: 1, background: C.jaune }} />
          <div style={{ flex: 1, background: C.vert  }} />
        </div>

        {/* ── Navigation ─────────────────────────────────────── */}
        <nav style={{
          flex: 1, overflowY: "auto", overflowX: "hidden",
          padding: "8px 8px", display: "flex", flexDirection: "column", gap: "1px",
        }}>
          {navSections.map((section, si) => (
            <div key={si} style={{ marginBottom: "4px" }}>

              {/* Label section */}
              {(!collapsed || isMobile) ? (
                <div style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 10px 4px",
                }}>
                  {section.color && (
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: section.color, flexShrink: 0,
                    }} />
                  )}
                  <span style={{
                    fontSize: "9.5px", fontWeight: "800", color: section.color || textSec,
                    textTransform: "uppercase", letterSpacing: "0.12em",
                  }}>
                    {section.label}
                  </span>
                </div>
              ) : (
                si > 0 && (
                  <div style={{
                    height: "2px", margin: "6px 12px",
                    background: section.color
                      ? `linear-gradient(90deg, ${section.color}60, transparent)`
                      : border,
                    borderRadius: "1px",
                  }} />
                )
              )}

              {section.items.map((item, ii) => {
                const isActive = location.pathname === item.path;
                const Icon     = item.icon;
                const accent   = item.accent || C.vert;

                return (
                  <Link
                    key={ii}
                    to={item.path}
                    title={collapsed && !isMobile ? item.label : ""}
                    style={{
                      display: "flex", alignItems: "center",
                      gap: (collapsed && !isMobile) ? 0 : "10px",
                      padding: (collapsed && !isMobile) ? "11px 0" : "9px 10px",
                      justifyContent: (collapsed && !isMobile) ? "center" : "flex-start",
                      borderRadius: "10px",
                      textDecoration: "none",
                      background: isActive
                        ? `linear-gradient(135deg, ${accent}22, ${accent}18)`
                        : "transparent",
                      color: isActive ? accent : textSec,
                      fontSize: "12.5px", fontWeight: isActive ? "700" : "500",
                      transition: "all 0.15s",
                      position: "relative",
                      marginBottom: "1px",
                      borderLeft: isActive && !collapsed
                        ? `3px solid ${accent}`
                        : "3px solid transparent",
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = `${accent}12`;
                        e.currentTarget.style.color = accent;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = textSec;
                      }
                    }}
                  >
                    <Icon size={16} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }} />
                    {(!collapsed || isMobile) && (
                      <span style={{
                        flex: 1, whiteSpace: "nowrap",
                        overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {item.label}
                      </span>
                    )}
                    {/* Point indicateur collapsed */}
                    {collapsed && !isMobile && isActive && (
                      <div style={{
                        position: "absolute", right: 0, top: "50%",
                        transform: "translateY(-50%)",
                        width: "3px", height: "20px",
                        borderRadius: "2px 0 0 2px",
                        background: accent,
                      }} />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div style={{
          borderTop: `1px solid ${border}`,
          padding: "10px 8px", display: "flex",
          flexDirection: "column", gap: "6px", flexShrink: 0,
        }}>

          {/* Thème + notifs */}
          <div style={{
            display: "flex", gap: "6px",
            justifyContent: (collapsed && !isMobile) ? "center" : "flex-start",
          }}>
            <button
              onClick={toggleTheme}
              title={isLight ? "Mode sombre" : "Mode clair"}
              style={{
                padding: "7px", borderRadius: "8px",
                border: `1px solid ${border}`,
                background: surface, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${C.vert}18`; e.currentTarget.style.borderColor = C.vert; }}
              onMouseLeave={e => { e.currentTarget.style.background = surface; e.currentTarget.style.borderColor = border; }}
            >
              {isLight
                ? <Moon size={14} color={textSec} />
                : <Sun  size={14} color={C.jaune} />
              }
            </button>

            {isAdmin && (!collapsed || isMobile) && (
              <button
                title="Notifications"
                style={{
                  padding: "7px", borderRadius: "8px",
                  border: `1px solid ${border}`, background: surface,
                  cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  position: "relative", transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${C.rouge}15`; e.currentTarget.style.borderColor = C.rouge; }}
                onMouseLeave={e => { e.currentTarget.style.background = surface; e.currentTarget.style.borderColor = border; }}
              >
                <Bell size={14} color={textSec} />
                {totalNotifs > 0 && (
                  <span style={{
                    position: "absolute", top: "-4px", right: "-4px",
                    width: "16px", height: "16px", borderRadius: "50%",
                    background: C.rouge, color: "#fff",
                    fontSize: "9px", fontWeight: "800",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {totalNotifs}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Profil avec badge service */}
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: (collapsed && !isMobile) ? "8px 0" : "10px 10px",
            borderRadius: "10px",
            background: isLight ? C.gris : surface,
            border: `1px solid ${border}`,
            justifyContent: (collapsed && !isMobile) ? "center" : "flex-start",
          }}>
            {/* Avatar avec couleur du service */}
            <div style={{
              width: "34px", height: "34px", borderRadius: "9px",
              background: `linear-gradient(135deg, ${serviceInfo.main}CC, ${serviceInfo.main})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, fontSize: "13px", fontWeight: "900", color: "#fff",
              boxShadow: `0 2px 8px ${serviceInfo.main}40`,
              letterSpacing: "-0.02em",
            }}>
              {initiales()}
            </div>

            {(!collapsed || isMobile) && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "13px", fontWeight: "700", color: textPri,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {nomAffiche}
                </div>
                <ServiceBadge service={userService} collapsed={false} />
              </div>
            )}
          </div>

          {/* Déconnexion */}
          <button
            onClick={handleLogout}
            title="Déconnexion"
            style={{
              display: "flex", alignItems: "center",
              justifyContent: (collapsed && !isMobile) ? "center" : "flex-start",
              gap: "8px",
              padding: (collapsed && !isMobile) ? "9px 0" : "9px 12px",
              borderRadius: "9px",
              border: `1px solid ${danger}35`,
              background: `${danger}0D`,
              color: danger,
              fontSize: "12.5px", fontWeight: "600",
              cursor: "pointer", width: "100%",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${danger}20`; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${danger}0D`; }}
          >
            <LogOut size={14} style={{ flexShrink: 0 }} />
            {(!collapsed || isMobile) && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default NavAdmin;