import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, DollarSign, Layers,
  Tag, Users, LogOut, ChevronLeft, ChevronRight,
  Sun, Moon, Bell, Clock, Menu, X
} from "lucide-react";
import CONFIG from "../../config/config.js";
import { useTheme } from "../../context/ThemeContext";

const SIDEBAR_WIDTH     = 240;
const SIDEBAR_COLLAPSED = 68;

// Hook pour détecter mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  return isMobile;
};

// ── Palette dorée Santa'Style — identique au DashboardAdmin ──
const G = {
  gold:      "#C9A84C",
  goldLight: "#8A6A20",
  goldDark:  "#5C3D00",
  goldPale:  "#F7F2E8",
  goldBorder:"#EDE5CC",
};

const NavAdmin = ({ onToggle, isOpen, onClose }) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { toggleTheme, isLight, tokens } = useTheme();
  const isMobile  = useIsMobile();

  const [collapsed, setCollapsed] = useState(false);
  const [counts, setCounts]       = useState({ contacts: 0, community: 0, newsletter: 0 });

  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "admin";

  // ── Initiales du nom connecté ─────────────────────────
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

  // Sur mobile, fermer automatiquement après navigation
  useEffect(() => {
    if (isMobile && onClose) {
      onClose();
    }
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

  const navSections = [
    {
      label: "Dashboard",
      items: [
        { path: isAdmin ? "/dashboardAdmin" : "/vendeurDashboard", label: "Tableau de bord", icon: LayoutDashboard },
      ],
    },
    {
      label: "Boutique",
      items: [
        { path: "/categories", label: "Catégories", icon: Tag        },
        { path: "/produits",   label: "Produits",   icon: Package    },
        { path: "/stocks",     label: "Stocks",     icon: Layers     },
        { path: "/ventes",     label: "Ventes",     icon: DollarSign },
      ],
    },
    ...(isAdmin ? [
      {
        label: "Équipe",
        items: [{ path: "/register-employee", label: "Employés", icon: Users }],
      },
      {
        label: "Supervision",
        items: [{ path: "/activity", label: "Historique global", icon: Clock }],
      },
    ] : []),
  ];

  const totalNotifs = counts.contacts + counts.community + counts.newsletter;
  const w = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH;

  // Sur mobile, la sidebar est en overlay
  const sidebarStyle = isMobile ? {
    position: "fixed",
    top: 0,
    left: isOpen ? 0 : `-${SIDEBAR_WIDTH}px`,
    bottom: 0,
    width: `${SIDEBAR_WIDTH}px`,
    background: tokens.bg,
    borderRight: `1px solid ${tokens.border}`,
    display: "flex",
    flexDirection: "column",
    transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)",
    zIndex: 1000,
    boxShadow: isOpen ? "2px 0 8px rgba(0,0,0,0.15)" : "none",
  } : {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: `${w}px`,
    background: tokens.bg,
    borderRight: `1px solid ${tokens.border}`,
    display: "flex",
    flexDirection: "column",
    transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
    zIndex: 200,
    overflow: "hidden",
  };

  return (
    <>
      {/* Overlay sombre sur mobile quand sidebar ouverte */}
      {isMobile && isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 999,
            transition: "opacity 0.3s",
          }}
        />
      )}

      <aside style={sidebarStyle}>

        {/* ── Header — logo + nom app ── */}
        <div style={{
          height: "68px", padding: "0 14px",
          display: "flex", alignItems: "center", gap: "10px",
          borderBottom: `1px solid ${tokens.border}`,
          flexShrink: 0,
          position: "relative",
        }}>
          <Link to={isAdmin ? "/dashboardAdmin" : "/vendeurDashboard"} style={{ textDecoration: "none", flexShrink: 0 }}>
            {/* Logo identique à l'avatar du DashboardAdmin */}
            <div style={{
              width: "38px", height: "38px", borderRadius: "10px",
              background: `linear-gradient(135deg, ${G.goldDark}, ${G.gold})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 4px 12px ${G.gold}40`,
            }}>
              <span style={{ color: "#fff", fontSize: "17px", fontWeight: "900", fontFamily: "serif" }}>S</span>
            </div>
          </Link>

          {/* Sur mobile, toujours afficher le nom */}
          {(!collapsed || isMobile) && (
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: "15px", fontWeight: "800", color: G.goldDark, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.01em" }}>
                Santa'Style
              </div>
              <div style={{ fontSize: "11px", color: G.goldLight, fontWeight: "500" }}>
                {isAdmin ? "Administration" : "Espace vendeur"}
              </div>
            </div>
          )}

          {/* Bouton toggle - TOUJOURS VISIBLE avec position fixe quand collapsed */}
          {isMobile ? (
            <button onClick={onClose} style={{
              width: "38px", height: "38px", borderRadius: "10px",
              border: `1px solid ${tokens.border}`,
              background: tokens.surface,
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${G.gold}15`; e.currentTarget.style.borderColor = G.gold; }}
            onMouseLeave={e => { e.currentTarget.style.background = tokens.surface; e.currentTarget.style.borderColor = tokens.border; }}>
              <X size={18} color={G.goldLight} />
            </button>
          ) : (
            <button onClick={toggle} style={{
              // Position fixe quand collapsed pour rester visible
              position: collapsed ? "fixed" : "relative",
              left: collapsed ? "14px" : "auto",
              top: collapsed ? "15px" : "auto",
              zIndex: collapsed ? 250 : "auto",
              
              width: "38px", 
              height: "38px", 
              borderRadius: "10px",
              border: `2px solid ${collapsed ? G.gold : tokens.border}`,
              background: collapsed ? `linear-gradient(135deg, ${G.goldDark}EE, ${G.gold}EE)` : tokens.surface,
              cursor: "pointer", 
              display: "flex",
              alignItems: "center", 
              justifyContent: "center",
              flexShrink: 0, 
              marginLeft: collapsed ? 0 : "auto",
              transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
              boxShadow: collapsed ? `0 4px 12px ${G.gold}50` : "0 1px 3px rgba(0,0,0,0.1)",
            }}
            onMouseEnter={e => { 
              if (!collapsed) {
                e.currentTarget.style.background = `${G.gold}20`; 
                e.currentTarget.style.borderColor = G.gold;
              }
              e.currentTarget.style.transform = "scale(1.08)";
            }}
            onMouseLeave={e => { 
              if (!collapsed) {
                e.currentTarget.style.background = tokens.surface; 
                e.currentTarget.style.borderColor = tokens.border;
              }
              e.currentTarget.style.transform = "scale(1)";
            }}>
              {collapsed
                ? <ChevronRight size={18} color="#fff" strokeWidth={3} />
                : <ChevronLeft  size={18} color={G.goldDark} strokeWidth={2.5} />
              }
            </button>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "10px 8px", display: "flex", flexDirection: "column", gap: "2px" }}>
          {navSections.map((section, si) => (
            <div key={si} style={{ marginBottom: "6px" }}>

              {/* Label section */}
              {(!collapsed || isMobile) && (
                <div style={{
                  fontSize: "10px", fontWeight: "800", color: G.gold,
                  textTransform: "uppercase", letterSpacing: "0.12em",
                  padding: "8px 10px 4px",
                }}>
                  {section.label}
                </div>
              )}
              {collapsed && !isMobile && si > 0 && (
                <div style={{ height: "1px", background: tokens.border, margin: "8px 10px" }} />
              )}

              {section.items.map((item, ii) => {
                const isActive = location.pathname === item.path;
                const Icon     = item.icon;
                return (
                  <Link key={ii} to={item.path} title={collapsed && !isMobile ? item.label : ""}
                    style={{
                      display: "flex", alignItems: "center",
                      gap: (collapsed && !isMobile) ? 0 : "10px",
                      padding: (collapsed && !isMobile) ? "11px 0" : "10px 12px",
                      justifyContent: (collapsed && !isMobile) ? "center" : "flex-start",
                      borderRadius: "12px",
                      textDecoration: "none",
                      background: isActive
                        ? `linear-gradient(135deg, ${G.goldDark}, ${G.gold})`
                        : "transparent",
                      color: isActive ? "#fff" : G.goldLight,
                      fontSize: "13px", fontWeight: "600",
                      transition: "all 0.15s",
                      position: "relative",
                      marginBottom: "2px",
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = `${G.gold}15`;
                        e.currentTarget.style.color = G.goldDark;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = G.goldLight;
                      }
                    }}>
                    <Icon size={17} style={{ flexShrink: 0 }} />
                    {(!collapsed || isMobile) && (
                      <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.label}
                      </span>
                    )}
                    {/* Indicateur actif en mode plié desktop */}
                    {collapsed && !isMobile && isActive && (
                      <div style={{
                        position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
                        width: "3px", height: "22px", borderRadius: "2px 0 0 2px",
                        background: G.gold,
                      }} />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── Footer — profil + actions ── */}
        <div style={{
          borderTop: `1px solid ${tokens.border}`,
          padding: "10px 8px",
          display: "flex", flexDirection: "column", gap: "6px",
          flexShrink: 0,
        }}>

          {/* Thème + notifs */}
          <div style={{ display: "flex", gap: "6px", justifyContent: (collapsed && !isMobile) ? "center" : "flex-start" }}>
            <button onClick={toggleTheme} title={isLight ? "Mode sombre" : "Mode clair"}
              style={{ padding: "7px", borderRadius: "9px", border: `1px solid ${tokens.border}`, background: tokens.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = `${G.gold}15`; e.currentTarget.style.borderColor = G.gold; }}
              onMouseLeave={e => { e.currentTarget.style.background = tokens.surface; e.currentTarget.style.borderColor = tokens.border; }}>
              {isLight
                ? <Moon size={14} color={G.goldLight} />
                : <Sun  size={14} color={G.gold} />
              }
            </button>

            {isAdmin && (!collapsed || isMobile) && (
              <button title="Notifications" style={{ padding: "7px", borderRadius: "9px", border: `1px solid ${tokens.border}`, background: tokens.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = `${G.gold}15`; e.currentTarget.style.borderColor = G.gold; }}
                onMouseLeave={e => { e.currentTarget.style.background = tokens.surface; e.currentTarget.style.borderColor = tokens.border; }}>
                <Bell size={14} color={G.goldLight} />
                {totalNotifs > 0 && (
                  <span style={{
                    position: "absolute", top: "-4px", right: "-4px",
                    width: "16px", height: "16px", borderRadius: "50%",
                    background: G.gold, color: "#fff",
                    fontSize: "9px", fontWeight: "800",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {totalNotifs}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* ✅ Profil — avatar avec initiales comme dans DashboardAdmin */}
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: (collapsed && !isMobile) ? "8px 0" : "10px 10px",
            borderRadius: "12px",
            background: `${G.gold}10`,
            border: `1px solid ${tokens.border}`,
            justifyContent: (collapsed && !isMobile) ? "center" : "flex-start",
          }}>
            {/* Avatar initiales */}
            <div style={{
              width: "32px", height: "32px", borderRadius: "9px",
              background: `linear-gradient(135deg, ${G.goldDark}, ${G.gold})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              fontSize: "13px", fontWeight: "800", color: "#fff",
              boxShadow: `0 2px 8px ${G.gold}35`,
            }}>
              {initiales()}
            </div>
            {(!collapsed || isMobile) && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: G.goldDark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {nomAffiche}
                </div>
                <div style={{ fontSize: "10px", color: G.goldLight, fontWeight: "600" }}>
                  {isAdmin ? "Administrateur" : "Vendeur"}
                </div>
              </div>
            )}
          </div>

          {/* Déconnexion */}
          <button onClick={handleLogout} title="Déconnexion"
            style={{
              display: "flex", alignItems: "center",
              justifyContent: (collapsed && !isMobile) ? "center" : "flex-start",
              gap: "8px",
              padding: (collapsed && !isMobile) ? "9px 0" : "9px 12px",
              borderRadius: "10px",
              border: `1px solid ${tokens.danger}35`,
              background: `${tokens.danger}10`,
              color: tokens.danger,
              fontSize: "13px", fontWeight: "600",
              cursor: "pointer", width: "100%",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${tokens.danger}20`; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${tokens.danger}10`; }}>
            <LogOut size={15} style={{ flexShrink: 0 }} />
            {(!collapsed || isMobile) && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default NavAdmin;