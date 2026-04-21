import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Mail, Phone, MapPin, Send, Facebook, Instagram,
  Linkedin, Youtube, ArrowRight, Sparkles, ShoppingBag,
  Package, Heart, ExternalLink, X
} from "lucide-react";
import CONFIG from "../../config/config.js";

// Hook responsive
const useResponsive = () => {
  const [viewport, setViewport] = React.useState({
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
  });
  
  React.useEffect(() => {
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

const WAIcon = ({ size = 16, color = "#1A6B3C" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.528 5.855L.057 23.643a.5.5 0 0 0 .61.61l5.788-1.471A11.941 11.941 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.791-.57-5.33-1.548l-.383-.232-3.968 1.01 1.01-3.968-.232-.383A9.937 9.937 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
);

const SS = {
  bg:        "#FFFFFF",
  surface:   "#FDFAF4",
  card:      "#F7F2E8",
  border:    "#EDE5CC",
  gold:      "#C9A84C",
  goldLight: "#8A6A20",
  goldDark:  "#5C3D00",
  text:      "#1A1208",
  textMuted: "#8A6A20",
  textDim:   "#C8A85A",
  success:   "#1A6B3C",
  successBg: "#D4EDDF",
};

const NUMERO_WA = "224620762508";

const ouvrirWA = (msg) => {
  window.open(
    `https://api.whatsapp.com/send?phone=${NUMERO_WA}&text=${encodeURIComponent(msg)}`,
    "_blank"
  );
};

const keyframes = `
  @keyframes shrink {
    from { width: 100%; }
    to   { width: 0%; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const Footer = () => {
  const { isMobile, isTablet } = useResponsive();
  const [email, setEmail]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);

  const footerRef = React.useRef(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    if (footerRef.current) obs.observe(footerRef.current);
    return () => obs.disconnect();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const res  = await fetch(CONFIG.API_NEWSLETTER_CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Merci ! Vous êtes inscrit à notre newsletter.", "success");
        setEmail("");
      } else {
        showToast(data.error || "Une erreur est survenue.", "error");
      }
    } catch {
      showToast("Erreur de connexion. Réessayez plus tard.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const boutique = [
    { label: "Tous les articles", path: "/boutique",                  icon: ShoppingBag },
    { label: "Nouveautés",        path: "/boutique?filtre=nouveau",   icon: Sparkles    },
    { label: "Hommes",            path: "/boutique?cat=hommes",       icon: Package     },
    { label: "Femmes",            path: "/boutique?cat=femmes",       icon: Package     },
    { label: "Enfants",           path: "/boutique?cat=enfants",      icon: Package     },
    { label: "Accessoires",       path: "/boutique?cat=accessoires",  icon: Package     },
  ];

  const infos = [
    { label: "À propos",     path: "/nosMissions"   },
    { label: "Notre équipe", path: "/notreEquipe"   },
    { label: "Boutique",     path: "/boutique"      },
    { label: "Contact",      path: "/contacternous" },
  ];

  const contacts = [
    { icon: MapPin, label: "Conakry, Guinée",       href: "https://maps.app.goo.gl/2gya1yBW9QCu4Lt36", ext: true  },
    { icon: Phone,  label: "+224 620 762 508",       href: "tel:+224620762508",                          ext: false },
    { icon: Mail,   label: "contact@santastyle.gn",  href: "mailto:contact@santastyle.gn",               ext: false },
  ];

  const socials = [
    { name: "Facebook",  icon: Facebook,  url: "https://facebook.com",  bg: "#1877F2" },
    { name: "Instagram", icon: Instagram, url: "https://instagram.com", bg: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" },
    { name: "LinkedIn",  icon: Linkedin,  url: "https://linkedin.com",  bg: "#0A66C2" },
    { name: "YouTube",   icon: Youtube,   url: "https://youtube.com",   bg: "#FF0000" },
  ];

  const waButtons = [
    { label: "Commander un article", msg: "Bonjour Santa'Style !\nJe souhaite commander un article." },
    { label: "Demander un devis",    msg: "Bonjour Santa'Style !\nJe souhaite obtenir un devis." },
  ];

  return (
    <>
      <style>{keyframes}</style>

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position: "fixed", top: "24px", right: isMobile ? "16px" : "24px", left: isMobile ? "16px" : "auto", zIndex: 9999, maxWidth: isMobile ? "none" : "360px", animation: "fadeUp 0.3s ease" }}>
          <div style={{ background: toast.type === "success" ? `linear-gradient(135deg, ${SS.goldDark}, ${SS.goldLight})` : "#A32020", borderRadius: "14px", padding: "16px 18px", border: `1px solid ${toast.type === "success" ? SS.gold : "#C0392B"}`, boxShadow: `0 8px 32px ${toast.type === "success" ? SS.gold : "#A32020"}30`, display: "flex", alignItems: "flex-start", gap: "12px", position: "relative" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {toast.type === "success"
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              }
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff", marginBottom: "3px" }}>
                {toast.type === "success" ? "Succès !" : "Erreur"}
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>{toast.msg}</div>
            </div>
            <button onClick={() => setToast(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", padding: 0, display: "flex" }}>
              <X size={16} />
            </button>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "rgba(255,255,255,0.2)", borderRadius: "0 0 14px 14px", overflow: "hidden" }}>
              <div style={{ height: "100%", background: "rgba(255,255,255,0.6)", animation: "shrink 5s linear forwards" }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer
        ref={footerRef}
        style={{
          background: SS.bg,
          borderTop: `1px solid ${SS.border}`,
          fontFamily: "var(--font-sans, sans-serif)",
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(16px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Déco fond */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "320px", height: "320px", borderRadius: "50%", background: `radial-gradient(circle, ${SS.gold}08 0%, transparent 70%)` }} />
          <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "260px", height: "260px", borderRadius: "50%", background: `radial-gradient(circle, ${SS.gold}06 0%, transparent 70%)` }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, ${SS.gold}10 1px, transparent 1px)`, backgroundSize: "40px 40px", opacity: 0.5 }} />
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: isMobile ? "40px 16px 0" : "56px 24px 0", position: "relative" }}>

          {/* ── Section principale — Brand + Newsletter ── */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "32px" : "48px", marginBottom: isMobile ? "32px" : "48px", paddingBottom: isMobile ? "32px" : "48px", borderBottom: `1px solid ${SS.border}` }}>

            {/* Gauche — Brand + contacts + réseaux */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Brand */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ width: isMobile ? "40px" : "44px", height: isMobile ? "40px" : "44px", borderRadius: "11px", background: `linear-gradient(135deg, ${SS.goldDark}, ${SS.gold})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px ${SS.gold}35` }}>
                    <span style={{ color: "#fff", fontSize: isMobile ? "20px" : "22px", fontWeight: "900", fontFamily: "serif" }}>S</span>
                  </div>
                  <div>
                    <div style={{ fontSize: isMobile ? "18px" : "20px", fontWeight: "800", color: SS.goldDark, letterSpacing: "-0.02em" }}>Santa'Style</div>
                    <div style={{ fontSize: "12px", color: SS.textMuted, fontWeight: "500" }}>Inspirer · Porter · Rayonner</div>
                  </div>
                </div>
                <p style={{ fontSize: isMobile ? "12px" : "13px", color: SS.textMuted, lineHeight: 1.7, maxWidth: "340px" }}>
                  Boutique de vêtements et accessoires pour{" "}
                  <span style={{ color: SS.goldLight, fontWeight: "600" }}>Hommes</span>,{" "}
                  <span style={{ color: SS.goldLight, fontWeight: "600" }}>Femmes</span>,{" "}
                  <span style={{ color: SS.goldLight, fontWeight: "600" }}>Enfants</span> et{" "}
                  <span style={{ color: SS.goldLight, fontWeight: "600" }}>Accessoires</span> à Conakry.
                  Commandez facilement via WhatsApp.
                </p>
              </div>

              {/* Contacts */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {contacts.map((c, i) => {
                  const Icon = c.icon;
                  const inner = (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: isMobile ? "9px 12px" : "10px 14px", borderRadius: "10px", background: SS.surface, border: `1px solid ${SS.border}`, transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = SS.gold; e.currentTarget.style.background = SS.card; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = SS.border; e.currentTarget.style.background = SS.surface; }}>
                      <div style={{ width: isMobile ? "28px" : "32px", height: isMobile ? "28px" : "32px", borderRadius: "8px", background: `${SS.gold}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={15} color={SS.gold} />
                      </div>
                      <span style={{ fontSize: isMobile ? "12px" : "13px", color: SS.textMuted, fontWeight: "500", flex: 1 }}>{c.label}</span>
                      {c.ext && <ExternalLink size={12} color={SS.textDim} />}
                    </div>
                  );
                  return c.href ? (
                    <a key={i} href={c.href} target={c.ext ? "_blank" : undefined} rel={c.ext ? "noopener noreferrer" : undefined} style={{ textDecoration: "none" }}>
                      {inner}
                    </a>
                  ) : <div key={i}>{inner}</div>;
                })}
              </div>

              {/* Réseaux sociaux */}
              <div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: SS.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Suivez-nous</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {socials.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                        style={{ width: "38px", height: "38px", borderRadius: "9px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.15s, box-shadow 0.15s", textDecoration: "none" }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.18)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                        <Icon size={16} color="#fff" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Droite — Newsletter */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ background: SS.surface, border: `1px solid ${SS.gold}35`, borderRadius: "16px", padding: isMobile ? "24px" : "28px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${SS.goldDark}, ${SS.gold}, ${SS.goldDark})` }} />

                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "20px", background: `${SS.gold}15`, border: `1px solid ${SS.gold}35`, marginBottom: "14px" }}>
                  <Sparkles size={13} color={SS.gold} />
                  <span style={{ fontSize: "11px", fontWeight: "700", color: SS.goldLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>Newsletter</span>
                </div>

                <h4 style={{ fontSize: isMobile ? "16px" : "18px", fontWeight: "700", color: SS.goldDark, margin: "0 0 8px", lineHeight: 1.3 }}>
                  Restez informé des <span style={{ color: SS.gold }}>nouveautés</span>
                </h4>
                <p style={{ fontSize: isMobile ? "12px" : "13px", color: SS.textMuted, marginBottom: "20px", lineHeight: 1.6 }}>
                  Recevez nos dernières collections, promotions et actualités directement dans votre boîte mail.
                </p>

                <form onSubmit={handleSubscribe} style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "8px" : "0" }}>
                  <input type="email" value={email} placeholder="votre@email.com"
                    onChange={e => setEmail(e.target.value)} required disabled={submitting}
                    style={{ flex: 1, padding: "11px 14px", background: "#fff", border: `1px solid ${SS.border}`, borderRight: isMobile ? `1px solid ${SS.border}` : "none", borderRadius: isMobile ? "10px" : "10px 0 0 10px", color: SS.text, fontSize: "13px", outline: "none", transition: "border-color 0.2s" }}
                    onFocus={e => e.target.style.borderColor = SS.gold}
                    onBlur={e => e.target.style.borderColor = SS.border} />
                  <button type="submit" disabled={submitting}
                    style={{ padding: "11px 18px", borderRadius: isMobile ? "10px" : "0 10px 10px 0", background: `linear-gradient(135deg, ${SS.goldDark}, ${SS.gold})`, border: "none", color: "#fff", fontWeight: "700", fontSize: "13px", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", whiteSpace: "nowrap" }}>
                    {submitting
                      ? <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />
                      : <><Send size={14} /> S'inscrire</>
                    }
                  </button>
                </form>

                <button onClick={() => ouvrirWA("Bonjour Santa'Style !\nJe souhaite recevoir vos nouveautes et promotions.")}
                  style={{ marginTop: "12px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "11px", borderRadius: "10px", border: `1px solid ${SS.success}35`, background: SS.successBg, color: SS.success, fontSize: isMobile ? "12px" : "13px", fontWeight: "700", cursor: "pointer", transition: "opacity 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  <WAIcon size={15} color={SS.success} /> {isMobile ? "WhatsApp" : "Nous contacter sur WhatsApp"}
                </button>
              </div>
            </div>
          </div>

          {/* ── Liens grille ── */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr", gap: isMobile ? "24px" : "32px", marginBottom: isMobile ? "32px" : "40px" }}>

            {/* Boutique */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <div style={{ width: "3px", height: "18px", borderRadius: "2px", background: `linear-gradient(180deg, ${SS.goldDark}, ${SS.gold})` }} />
                <span style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: "800", color: SS.goldDark, textTransform: "uppercase", letterSpacing: "0.07em" }}>Boutique</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                {boutique.map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <li key={i}>
                      <NavLink to={b.path}
                        style={({ isActive }) => ({ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", fontSize: isMobile ? "12px" : "13px", fontWeight: "500", color: isActive ? SS.gold : SS.textMuted, transition: "all 0.15s" })}
                        onMouseEnter={e => { e.currentTarget.style.color = SS.gold; e.currentTarget.style.paddingLeft = "4px"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = SS.textMuted; e.currentTarget.style.paddingLeft = "0"; }}>
                        <Icon size={13} color={SS.gold} style={{ flexShrink: 0 }} />
                        {b.label}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Informations */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <div style={{ width: "3px", height: "18px", borderRadius: "2px", background: `linear-gradient(180deg, ${SS.gold}, ${SS.goldLight})` }} />
                <span style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: "800", color: SS.goldDark, textTransform: "uppercase", letterSpacing: "0.07em" }}>Informations</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                {infos.map((l, i) => (
                  <li key={i}>
                    <NavLink to={l.path}
                      style={({ isActive }) => ({ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", fontSize: isMobile ? "12px" : "13px", fontWeight: "500", color: isActive ? SS.gold : SS.textMuted, transition: "all 0.15s" })}
                      onMouseEnter={e => { e.currentTarget.style.color = SS.gold; e.currentTarget.style.paddingLeft = "4px"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = SS.textMuted; e.currentTarget.style.paddingLeft = "0"; }}>
                      <ArrowRight size={12} color={SS.gold} style={{ flexShrink: 0 }} />
                      {l.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Commander */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <div style={{ width: "3px", height: "18px", borderRadius: "2px", background: `linear-gradient(180deg, ${SS.success}, ${SS.gold})` }} />
                <span style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: "800", color: SS.goldDark, textTransform: "uppercase", letterSpacing: "0.07em" }}>Commander</span>
              </div>
              <div style={{ background: SS.surface, border: `1px solid ${SS.border}`, borderRadius: "12px", padding: isMobile ? "14px" : "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "12px", color: SS.textMuted, lineHeight: 1.6 }}>
                  Passez votre commande directement sur WhatsApp. Réponse rapide garantie !
                </div>
                {waButtons.map((btn, i) => (
                  <button key={i} onClick={() => ouvrirWA(btn.msg)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${i === 0 ? SS.success : SS.border}40`, background: i === 0 ? SS.successBg : "#fff", color: i === 0 ? SS.success : SS.textMuted, fontSize: isMobile ? "11px" : "12px", fontWeight: "600", cursor: "pointer", width: "100%", transition: "opacity 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                    <WAIcon size={13} color={i === 0 ? SS.success : SS.textMuted} />
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Bottom ── */}
          <div style={{ borderTop: `1px solid ${SS.border}`, padding: isMobile ? "16px 0 20px" : "20px 0 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", flexDirection: isMobile ? "column" : "row", textAlign: isMobile ? "center" : "left" }}>
              <div style={{ fontSize: "12px", color: SS.textDim }}>
                © {new Date().getFullYear()}{" "}
                <span style={{ fontWeight: "700", color: SS.goldLight }}>Santa'Style</span>
                {" "}— Tous droits réservés.
              </div>
              {!isMobile && (
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {["Mentions légales", "Confidentialité", "CGV"].map((l, i) => (
                    <a key={i} href="#" style={{ fontSize: "12px", color: SS.textDim, textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.color = SS.gold}
                      onMouseLeave={e => e.currentTarget.style.color = SS.textDim}>
                      {l}
                    </a>
                  ))}
                </div>
              )}
              <div style={{ fontSize: "12px", color: SS.textDim, display: "flex", alignItems: "center", gap: "4px" }}>
                Créé avec <Heart size={12} color="#A32020" style={{ margin: "0 2px" }} /> à Conakry
              </div>
            </div>
          </div>
        </div>

        {/* Barre dorée bas */}
        <div style={{ height: "3px", background: `linear-gradient(90deg, ${SS.goldDark}, ${SS.gold}, ${SS.goldDark})` }} />
      </footer>
    </>
  );
};

export default Footer;