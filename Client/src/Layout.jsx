import { useState, useEffect } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import NavAdmin from "./components/Header/NavAdmin";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { useTheme } from "./context/ThemeContext";
import { Menu } from "lucide-react";

const SIDEBAR_EXPANDED  = 256; // mis à jour selon le nouveau NavAdmin INS
const SIDEBAR_COLLAPSED = 68;

const useScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    const root = document.getElementById("root");
    if (root) root.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname, location.search]);
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
};

const App = () => {
  const location = useLocation();
  const token    = localStorage.getItem("access");
  const { tokens } = useTheme();
  const isMobile = useIsMobile();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen]     = useState(false);

  useScrollToTop();

  const adminPaths = [
    "/ventes", "/listeContacts", "/listeRejoindre",
    "/listePostulantsCommunity", "/listPartners",
    "/listeAbonnement", "/platformPost", "/valeurPost",
    "/dashboardAdmin", "/vendeurDashboard",
    "/teamMessage", "/missionPost",
    "/register-employee", "/homePost", "/stocks",
    "/servicePost", "/categories", "/produits",
    "/activity",
    // ── Nouveaux chemins INS ──
    "/dashboard", "/monDashboard", "/statistiques",
    "/secretariat/courriers", "/secretariat/agenda", "/secretariat/documents",
    "/comptabilite/budget", "/comptabilite/depenses", "/comptabilite/rapports",
    "/logistique/materiels", "/logistique/missions", "/logistique/stocks",
    "/rh/agents", "/rh/conges", "/rh/formations",
    "/admin/utilisateurs", "/admin/historique", "/gestionCourriers", "/courriersArrives",
  ];

  const isAdminPage = adminPaths.includes(location.pathname);
  const isLoginPage = location.pathname === "/login";

  if (isAdminPage && !token) return <Navigate to="/login" replace />;

  const sidebarW = isMobile ? 0 : (sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED);

  // ── Styles CSS globaux ───────────────────────────────────
  const baseStyles = `
    html { overflow: hidden; width: 100%; height: 100%; }
    body { overflow: hidden; width: 100%; height: 100%; margin: 0; padding: 0; }
    #root { overflow-y: auto; overflow-x: hidden; width: 100%; height: 100%; -webkit-overflow-scrolling: touch; }
    * { box-sizing: border-box; }
  `;

  // Sur la page login : position fixed sur #root aussi → zéro scroll
  const loginStyles = `
    html, body { overflow: hidden; width: 100%; height: 100%; margin: 0; padding: 0; }
    #root { overflow: hidden; width: 100%; height: 100%; }
    * { box-sizing: border-box; }
  `;

  const adminStyles = `
    ${baseStyles}
    body { background: ${tokens.bg}; }
    #root {
      scrollbar-width: thin;
      scrollbar-color: #009A44 #E8FFF3;
    }
    #root::-webkit-scrollbar { width: 7px; }
    #root::-webkit-scrollbar-track { background: #E8FFF3; border-radius: 10px; }
    #root::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #009A44 0%, #005C28 100%); border-radius: 10px; border: 2px solid #E8FFF3; }
    html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
    input::placeholder { color: ${tokens.textDim}; }
    select option { background: ${tokens.surface}; color: ${tokens.text}; }
  `;

  const publicStyles = `
    ${baseStyles}
    body { background: #FFFFFF; }
    #root { scrollbar-width: thin; scrollbar-color: #009A44 #E8FFF3; }
    #root::-webkit-scrollbar { width: 7px; }
    #root::-webkit-scrollbar-track { background: #E8FFF3; border-radius: 10px; }
    #root::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #009A44 0%, #005C28 100%); border-radius: 10px; border: 2px solid #E8FFF3; }
    html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
  `;

  const getStyles = () => {
    if (isLoginPage)  return loginStyles;
    if (isAdminPage)  return adminStyles;
    return publicStyles;
  };

  return (
    <I18nextProvider i18n={i18n}>
      <style>{getStyles()}</style>

      {isAdminPage ? (
        <div style={{ background: tokens.bg, minHeight: "100vh", width: "100%", display: "flex", position: "relative" }}>

          {/* Bouton menu mobile flottant */}
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{
                position: "fixed", top: "16px", left: "16px",
                width: "46px", height: "46px", borderRadius: "11px",
                background: "linear-gradient(135deg, #005C28, #009A44)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 900,
                boxShadow: "0 4px 12px rgba(0,154,68,0.35)",
                transition: "transform 0.2s",
              }}
              onMouseDown={e => e.currentTarget.style.transform = "scale(0.94)"}
              onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <Menu size={22} color="#fff"/>
            </button>
          )}

          {/* Sidebar INS */}
          <NavAdmin
            onToggle={setSidebarCollapsed}
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />

          {/* Contenu principal */}
          <main style={{
            marginLeft: `${sidebarW}px`,
            flex: 1,
            minHeight: "100vh",
            background: tokens.bg,
            transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
            position: "relative",
            overflow: "hidden",
            paddingTop: isMobile ? "70px" : "0",
          }}>
            {/* Halos décoratifs INS */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, #009A4408 0%, transparent 70%)" }}/>
              <div style={{ position: "absolute", bottom: 0, left: 0, width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, #CE112606 0%, transparent 70%)" }}/>
            </div>
            <div style={{
              position: "relative",
              maxWidth: "1600px",
              margin: "0 auto",
              padding: isMobile ? "12px 16px 24px" : "32px 28px 40px",
            }}>
              <Outlet/>
            </div>
          </main>
        </div>

      ) : isLoginPage ? (
        /* Page login : rendu direct sans wrapper scrollable */
        <Outlet/>

      ) : (
        <div style={{ minHeight: "100vh", width: "100%", background: "#FFFFFF" }}>
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}>
            <Header logoColor="#009A44"/>
          </div>
          <main style={{ position: "relative", paddingBottom: "4rem" }}>
            <Outlet/>
          </main>
          <Footer/>
        </div>
      )}
    </I18nextProvider>
  );
};

export default App;