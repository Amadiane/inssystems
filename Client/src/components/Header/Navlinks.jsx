import React, { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Search, Menu, X, Users, ChevronDown, ArrowRight, ShoppingBag, Sparkles, Phone, Info } from "lucide-react";

// Hook responsive
const useResponsive = () => {
  const [viewport, setViewport] = useState({
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
  });
  
  useEffect(() => {
    const handleResize = () => {
      setViewport({
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  return viewport;
};

const NAV = {
  bg:        "rgba(255,255,255,0.97)",
  border:    "#EDE5CC",
  gold:      "#C9A84C",
  goldLight: "#8A6A20",
  goldDark:  "#5C3D00",
  surface:   "#FDFAF4",
  text:      "#1A1208",
  textMuted: "#8A6A20",
};

const WAsvg = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.528 5.855L.057 23.643a.5.5 0 0 0 .61.61l5.788-1.471A11.941 11.941 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.791-.57-5.33-1.548l-.383-.232-3.968 1.01 1.01-3.968-.232-.383A9.937 9.937 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
);

const Navlinks = () => {
  const navigate = useNavigate();
  const { isMobile, isDesktop } = useResponsive();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen]         = useState(false);
  const [scrolled, setScrolled]             = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery]       = useState("");
  const dropdownRef     = useRef(null);
  const dropdownTimeout = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    const onClick  = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setActiveDropdown(null);
    };
    window.addEventListener("scroll", onScroll);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousedown", onClick);
      if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    };
  }, []);

  const onEnter = (i) => { if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current); setActiveDropdown(i); };
  const onLeave = () => { dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 300); };

  const navItems = [
    {
      title: "Boutique", path: "/boutique", hasDropdown: true,
    },
    {
      title: "À propos", path: "/nosMissions", hasDropdown: true,
      subItems: [
        { title: "Qui sommes-nous", path: "/nosMissions", icon: Info,  color: NAV.gold, bg: "rgba(201,168,76,0.12)" },
        { title: "Notre équipe",    path: "/notreEquipe", icon: Users, color: NAV.gold, bg: "rgba(201,168,76,0.12)" },
      ],
    },
    { title: "Contact", path: "/contacternous" },
  ];

  const genreLinks = [
    { label: "👔 Hommes",      path: "/boutique?cat=hommes",      color: "#1d4ed8", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)"  },
    { label: "👗 Femmes",      path: "/boutique?cat=femmes",      color: "#be185d", bg: "rgba(236,72,153,0.08)",  border: "rgba(236,72,153,0.2)"  },
    { label: "🧒 Enfants",     path: "/boutique?cat=enfants",     color: "#15803d", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.2)"   },
    { label: "👜 Accessoires", path: "/boutique?cat=accessoires", color: "#7c3aed", bg: "rgba(168,85,247,0.08)",  border: "rgba(168,85,247,0.2)"  },
  ];

  const ouvrirWA = () => window.open(`https://wa.me/224620762508?text=${encodeURIComponent("Bonjour Santa'Style ! 👋\nJe souhaite avoir des informations sur vos articles.")}`, "_blank");
  const handleSearch = (q) => { navigate(`/boutique?q=${encodeURIComponent(q)}`); setSearchOpen(false); setSearchQuery(""); };

  const hoverBg = `${NAV.gold}14`;

  return (
    <>
      {/* ── BARRE NAV ── */}
      <div style={{ background: NAV.bg, backdropFilter: "blur(20px)", borderBottom: `1px solid ${NAV.border}`, boxShadow: scrolled ? "0 2px 16px rgba(201,168,76,0.10)" : "none", transition: "box-shadow 0.3s", width: "100%", position: "relative", zIndex: 100 }}>
        <div style={{ maxWidth: "1500px", margin: "0 auto", padding: isMobile ? "8px 16px" : "10px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <a href="/" style={{ textDecoration: "none" }}>
            <div style={{ padding: isMobile ? "5px 12px 5px 6px" : "6px 16px 6px 8px", borderRadius: "30px", display: "flex", alignItems: "center", gap: isMobile ? "6px" : "8px", background: "linear-gradient(135deg, #8A6A20, #C9A84C)", boxShadow: "0 2px 12px rgba(201,168,76,0.3)", transition: "opacity 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              <div style={{ width: isMobile ? "24px" : "28px", height: isMobile ? "24px" : "28px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: "#fff", fontSize: isMobile ? "12px" : "14px", fontWeight: "900", fontFamily: "serif", lineHeight: 1 }}>S</span>
              </div>
              <div>
                <div style={{ fontSize: isMobile ? "12px" : "14px", fontWeight: "800", color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1, whiteSpace: "nowrap" }}>Santa'Style</div>
                <div style={{ fontSize: isMobile ? "7px" : "8px", color: "rgba(255,255,255,0.7)", letterSpacing: "0.14em", textTransform: "uppercase", lineHeight: 1, marginTop: "2px" }}>Mode · Accessoires</div>
              </div>
            </div>
          </a>

          {/* Nav desktop */}
          {isDesktop && (
            <nav style={{ display: "flex", alignItems: "center", gap: "2px" }} ref={dropdownRef}>
              {navItems.map((item, idx) => {
                if (item.title === "Boutique") return (
                  <div key={idx} style={{ position: "relative" }}
                    onMouseEnter={() => onEnter(idx)} onMouseLeave={onLeave}>
                    <button style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", borderRadius: "10px", background: activeDropdown === idx ? hoverBg : "transparent", border: "none", cursor: "pointer", color: NAV.goldDark, fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", transition: "all 0.2s" }}>
                      {item.title}
                      <ChevronDown size={12} style={{ transition: "transform 0.25s", transform: activeDropdown === idx ? "rotate(180deg)" : "none", color: activeDropdown === idx ? NAV.gold : "inherit" }} />
                    </button>

                    {activeDropdown === idx && (
                      <div style={{ position: "absolute", top: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)", width: "260px", zIndex: 200 }}
                        onMouseEnter={() => onEnter(idx)} onMouseLeave={onLeave}>
                        <div style={{ position: "absolute", top: "-5px", left: "50%", transform: "translateX(-50%) rotate(45deg)", width: "10px", height: "10px", background: "#FFFFFF", border: `1px solid ${NAV.border}`, borderBottom: "none", borderRight: "none" }} />
                        <div style={{ background: "#FFFFFF", border: `1px solid ${NAV.border}`, borderRadius: "16px", overflow: "hidden", boxShadow: "0 16px 40px rgba(201,168,76,0.16), 0 4px 12px rgba(0,0,0,0.06)" }}>
                          <div style={{ height: "2px", background: "linear-gradient(90deg, #8A6A20, #C9A84C, #E8C96A, #C9A84C, #8A6A20)" }} />
                          <div style={{ padding: "10px" }}>
                            <NavLink to="/boutique?filtre=nouveau" onClick={() => setActiveDropdown(null)}
                              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", borderRadius: "10px", textDecoration: "none", background: "rgba(201,168,76,0.08)", border: `1px solid ${NAV.border}`, marginBottom: "8px", transition: "background 0.15s" }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.15)"}
                              onMouseLeave={e => e.currentTarget.style.background = "rgba(201,168,76,0.08)"}>
                              <Sparkles size={14} color={NAV.gold} />
                              <span style={{ fontSize: "13px", fontWeight: "700", color: NAV.goldDark }}>Nouveautés</span>
                              <span style={{ marginLeft: "auto", fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: NAV.gold, color: "#fff", fontWeight: "700" }}>New</span>
                            </NavLink>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
                              {genreLinks.map((g, i) => (
                                <NavLink key={i} to={g.path} onClick={() => setActiveDropdown(null)}
                                  style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "9px 8px", borderRadius: "9px", textDecoration: "none", background: g.bg, border: `1px solid ${g.border}`, color: g.color, fontSize: "12px", fontWeight: "700", gap: "4px", transition: "opacity 0.15s" }}
                                  onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                                  {g.label}
                                </NavLink>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );

                if (item.hasDropdown) return (
                  <div key={idx} style={{ position: "relative" }}
                    onMouseEnter={() => onEnter(idx)} onMouseLeave={onLeave}>
                    <button style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", borderRadius: "10px", background: activeDropdown === idx ? hoverBg : "transparent", border: "none", cursor: "pointer", color: NAV.goldDark, fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", transition: "all 0.2s" }}>
                      {item.title}
                      <ChevronDown size={12} style={{ transition: "transform 0.25s", transform: activeDropdown === idx ? "rotate(180deg)" : "none" }} />
                    </button>
                    {activeDropdown === idx && (
                      <div style={{ position: "absolute", top: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)", width: "200px", zIndex: 200 }}
                        onMouseEnter={() => onEnter(idx)} onMouseLeave={onLeave}>
                        <div style={{ position: "absolute", top: "-5px", left: "50%", transform: "translateX(-50%) rotate(45deg)", width: "10px", height: "10px", background: "#FFFFFF", border: `1px solid ${NAV.border}`, borderBottom: "none", borderRight: "none" }} />
                        <div style={{ background: "#FFFFFF", border: `1px solid ${NAV.border}`, borderRadius: "14px", overflow: "hidden", boxShadow: "0 16px 40px rgba(201,168,76,0.14)" }}>
                          <div style={{ height: "2px", background: "linear-gradient(90deg, #8A6A20, #C9A84C, #E8C96A)" }} />
                          <div style={{ padding: "6px" }}>
                            {item.subItems.map((sub, i) => {
                              const Icon = sub.icon;
                              return (
                                <NavLink key={i} to={sub.path} onClick={() => setActiveDropdown(null)}
                                  style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px", borderRadius: "9px", textDecoration: "none", transition: "background 0.15s" }}
                                  onMouseEnter={e => e.currentTarget.style.background = NAV.surface}
                                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                  <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: sub.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Icon size={13} color={sub.color} />
                                  </div>
                                  <span style={{ fontSize: "13px", fontWeight: "600", color: NAV.text, flex: 1 }}>{sub.title}</span>
                                  <ArrowRight size={11} color={NAV.gold} style={{ opacity: 0.4 }} />
                                </NavLink>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );

                return (
                  <NavLink key={idx} to={item.path}
                    style={({ isActive }) => ({ padding: "8px 14px", borderRadius: "10px", textDecoration: "none", color: NAV.goldDark, background: isActive ? hoverBg : "transparent", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", transition: "all 0.2s" })}
                    onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    {item.title}
                  </NavLink>
                );
              })}
            </nav>
          )}

          {/* Actions droite */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* WhatsApp - masqué sur mobile */}
            {!isMobile && (
              <button onClick={ouvrirWA} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 14px", borderRadius: "10px", background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.3)", color: "#1A6B3C", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(37,211,102,0.22)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(37,211,102,0.12)"}>
                <WAsvg size={13} color="#1A6B3C" /> WhatsApp
              </button>
            )}

            {/* Boutique - toujours visible */}
            <NavLink to="/boutique" style={({ isActive }) => ({ display: "flex", alignItems: "center", gap: "6px", padding: isMobile ? "7px 12px" : "8px 16px", borderRadius: "10px", background: isActive ? "linear-gradient(135deg, #5C3D00, #8A6A20)" : "linear-gradient(135deg, #8A6A20, #C9A84C)", color: "#fff", fontSize: isMobile ? "11px" : "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", textDecoration: "none", transition: "opacity 0.2s", boxShadow: "0 2px 10px rgba(201,168,76,0.35)" })}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              <ShoppingBag size={14} /> {!isMobile && "Boutique"}
            </NavLink>

            {/* Search */}
            <button onClick={() => setSearchOpen(true)} style={{ padding: "9px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", background: NAV.surface, border: `1px solid ${NAV.border}`, transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = `${NAV.gold}15`}
              onMouseLeave={e => e.currentTarget.style.background = NAV.surface}>
              <Search size={16} color={NAV.goldLight} />
            </button>

            {/* Menu mobile */}
            {isMobile && (
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ padding: "9px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", background: NAV.surface, border: `1px solid ${NAV.border}` }}>
                {mobileMenuOpen ? <X size={18} color={NAV.goldDark} /> : <Menu size={18} color={NAV.goldDark} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MENU MOBILE */}
      {isMobile && mobileMenuOpen && (
        <div style={{ margin: "8px 16px", padding: "12px", borderRadius: "18px", background: "#FFFFFF", border: `1px solid ${NAV.border}`, boxShadow: "0 8px 32px rgba(201,168,76,0.14)", position: "relative", zIndex: 99 }}>
          <NavLink to="/boutique" onClick={() => setMobileMenuOpen(false)}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "12px", marginBottom: "6px", background: "linear-gradient(135deg, #8A6A20, #C9A84C)", color: "#fff", textDecoration: "none", fontSize: "14px", fontWeight: "700" }}>
            <ShoppingBag size={16} /> Boutique Santa'Style
          </NavLink>
          <button onClick={() => { ouvrirWA(); setMobileMenuOpen(false); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "12px", marginBottom: "10px", background: "#D4EDDF", border: "1px solid rgba(26,107,60,0.2)", color: "#1A6B3C", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
            <WAsvg size={16} color="#1A6B3C" /> Commander sur WhatsApp
          </button>
          <div style={{ height: "1px", background: NAV.border, margin: "4px 0 10px" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "10px" }}>
            {genreLinks.map((g, i) => (
              <NavLink key={i} to={g.path} onClick={() => setMobileMenuOpen(false)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 8px", borderRadius: "10px", textDecoration: "none", background: g.bg, border: `1px solid ${g.border}`, color: g.color, fontSize: "12px", fontWeight: "700" }}>
                {g.label}
              </NavLink>
            ))}
          </div>
          <div style={{ height: "1px", background: NAV.border, margin: "4px 0 8px" }} />
          <NavLink to="/nosMissions" onClick={() => setMobileMenuOpen(false)}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", textDecoration: "none", color: NAV.goldDark, fontSize: "14px", fontWeight: "600" }}>
            <Info size={15} color={NAV.gold} /> À propos
          </NavLink>
          <NavLink to="/contacternous" onClick={() => setMobileMenuOpen(false)}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", textDecoration: "none", color: NAV.goldDark, fontSize: "14px", fontWeight: "600" }}>
            <Phone size={15} color={NAV.gold} /> Contact
          </NavLink>
        </div>
      )}

      {/* SEARCH MODAL */}
      {searchOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,18,8,0.75)", backdropFilter: "blur(12px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: isMobile ? "60px" : "100px", zIndex: 300 }}
          onClick={() => setSearchOpen(false)}>
          <div style={{ width: "100%", maxWidth: isMobile ? "calc(100% - 32px)" : "520px", margin: "0 16px", background: "#FFFFFF", borderRadius: "20px", padding: isMobile ? "20px" : "24px", border: `1px solid ${NAV.border}`, boxShadow: "0 24px 64px rgba(201,168,76,0.2)", position: "relative" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, #8A6A20, #C9A84C, #E8C96A, #C9A84C, #8A6A20)", borderRadius: "20px 20px 0 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: NAV.goldDark, textTransform: "uppercase", letterSpacing: "0.1em" }}>Rechercher</span>
              <button onClick={() => setSearchOpen(false)} style={{ padding: "6px", borderRadius: "8px", background: NAV.surface, border: `1px solid ${NAV.border}`, cursor: "pointer" }}>
                <X size={15} color={NAV.goldLight} />
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: NAV.surface, border: `1px solid ${NAV.border}`, borderRadius: "12px", marginBottom: "16px" }}>
              <Search size={16} color={NAV.gold} />
              <input autoFocus placeholder="Robe, bazin, abaya..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && searchQuery.trim()) handleSearch(searchQuery.trim()); }}
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: NAV.text, fontSize: "14px" }} />
              {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={14} color={NAV.textMuted} /></button>}
            </div>
            <div style={{ fontSize: "11px", color: NAV.textMuted, marginBottom: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.07em" }}>Populaires</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["Robe", "Bazin", "Abaya", "Veste", "Sac", "Bijoux"].map(s => (
                <button key={s} onClick={() => handleSearch(s)}
                  style={{ padding: "6px 14px", borderRadius: "20px", background: NAV.surface, border: `1px solid ${NAV.border}`, color: NAV.goldDark, fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = NAV.gold; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = NAV.gold; }}
                  onMouseLeave={e => { e.currentTarget.style.background = NAV.surface; e.currentTarget.style.color = NAV.goldDark; e.currentTarget.style.borderColor = NAV.border; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navlinks;