import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import i18next from './i18n.js';
import './index.css';
import { ThemeProvider } from './context/ThemeContext.jsx';

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from 'react-router-dom';

import App from './Layout.jsx';

// Pages publiques
import Home from './components/HeaderSection/Home.jsx';
import Createpost from './components/Createpost/Createpost.jsx';
import Login from './components/Login/Login.jsx';
import Forgetpassword from './components/Forgotpassword/Forgotpassword.jsx';
import Blogdetail from './components/Blogdetail/Blogdetail.jsx';
import Quisommesnous from './components/Footer/Quisommesnous.jsx';
import Contacternous from './components/Footer/Contacternous.jsx';
import NousRejoindre from './components/Footer/Nousrejoindre.jsx';
import MotPresident from './components/HeaderSection/MotPresident.jsx';
import NosValeurs from './components/HeaderSection/NosValeurs.jsx';
import NosMissions from './components/HeaderSection/NosMissions.jsx';
import NotreEquipe from './components/HeaderSection/NotreEquipe.jsx';
import Programs from './components/HeaderSection/Programs.jsx';
import Community from './components/HeaderSection/Community.jsx';
import Partner from './components/HeaderSection/Partner.jsx';
import Plateforms from './components/HeaderSection/Plateforms.jsx';
import Videotheque from './components/HeaderSection/Videotheque.jsx';
import Phototheque from './components/HeaderSection/Phototheque.jsx';
import Document from './components/HeaderSection/Document.jsx';
import HomePost from './components/Admin/HomePost.jsx';
import Actualites from './components/HeaderSection/Actualites.jsx';
import NousRejoindreHeader from './components/HeaderSection/NousRejoindreHeader.jsx';
import Activities from './components/HeaderSection/Activities.jsx';
import ProfessionalArea from './components/HeaderSection/ProfessionalArea.jsx';
import Portfolio from './components/HeaderSection/Portfolio.jsx';
import ThonRecipes from './components/HeaderSection/ThonRecipes.jsx';
import Services from './components/HeaderSection/Services.jsx';
import ThonProduct from './components/HeaderSection/ThonProduct.jsx';
import BoutiquePage from './components/HeaderSection/BoutiquePage.jsx';
import ProduitDetail from './components/HeaderSection/ProduitDetail.jsx';

// Admin — routes protégées
import PrivateRoute from './components/Routes/PrivateRoute.jsx';
import DashboardAdmin from './components/Admin/DashboardAdmin.jsx';
import VendeurDashboard from './components/Admin/VendeurDashboard.jsx'; // ✅ nouveau
import Categories from './components/Admin/Categories.jsx';
import TeamMessage from './components/Admin/TeamPost.jsx';
import MissionPost from './components/Admin/MissionPost.jsx';
import ListeRejoindre from './components/Admin/ListeRejoindre.jsx';
import ListeContacts from './components/Admin/ListeContacts.jsx';
import ListePostulantsCommunity from './components/Admin/ListeCommunity.jsx';
import ListPartners from './components/Admin/ListePartner.jsx';
import ListeAbonnement from './components/Admin/ListeAbonnement.jsx';
import PlatformPost from './components/Admin/PlatformPost.jsx';
import ValeurPost from './components/Admin/ValeurPost.jsx';
import MotPresidentPost from './components/Admin/MotPresidentPost.jsx';
import VideoPost from './components/Admin/VideoPost.jsx';
import Stocks from './components/Admin/Stocks.jsx';
import Produits from './components/Admin/Produits.jsx';
import ProgramPost from './components/Admin/ProgramPost.jsx';
import RegisterEmployee from './components/Admin/RegisterEmployee.jsx';
import PartnerPost from './components/Admin/PartnerPost.jsx';
import Ventes from './components/Admin/Ventes.jsx';
import ProfessionalAreaPost from './components/Admin/ProfessionalAreaPost.jsx';
import ThonRecipesPost from './components/Admin/ThonRecipesPost.jsx';
import PortfolioPost from './components/Admin/PortfolioPost.jsx';
import ServicePost from './components/Admin/ServicePost.jsx';
import ThonProductPost from './components/Admin/ThonProductPost.jsx';
import Activity from './components/Admin/Activity.jsx';






import GestionCourriers from './components/Admin/GestionCourriers.jsx';
import CourriersArrives from './components/Admin/CourriersArrives.jsx';









const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>

      {/* ── Routes publiques ── */}
      <Route index element={<BoutiquePage />} />
      <Route path="boutique"      element={<BoutiquePage />} />
      <Route path="boutique/:id"  element={<ProduitDetail />} />
      <Route path="createpost"    element={<Createpost />} />
      <Route path="forgotpassword" element={<Forgetpassword />} />
      <Route path="blogdetail/:blogid" element={<Blogdetail />} />
      <Route path="login"         element={<Login />} />
      <Route path="qui-sommes-nous-" element={<Quisommesnous />} />
      <Route path="contacternous" element={<Contacternous />} />
      <Route path="nous-rejoindre" element={<NousRejoindre />} />
      <Route path="motPresident"  element={<MotPresident />} />
      <Route path="nosValeurs"    element={<NosValeurs />} />
      <Route path="nosMissions"   element={<NosMissions />} />
      <Route path="notreEquipe"   element={<NotreEquipe />} />
      <Route path="programs"      element={<Programs />} />
      <Route path="community"     element={<Community />} />
      <Route path="partner"       element={<Partner />} />
      <Route path="plateforms"    element={<Plateforms />} />
      <Route path="videotheque"   element={<Videotheque />} />
      <Route path="phototheque"   element={<Phototheque />} />
      <Route path="document"      element={<Document />} />
      <Route path="homePost"      element={<HomePost />} />
      <Route path="actualites"    element={<Actualites />} />
      <Route path="nousRejoindreHeader" element={<NousRejoindreHeader />} />
      <Route path="activities"    element={<Activities />} />
      <Route path="professionalArea" element={<ProfessionalArea />} />
      <Route path="portfolio"     element={<Portfolio />} />
      <Route path="thonRecipes"   element={<ThonRecipes />} />
      <Route path="services"      element={<Services />} />
      <Route path="thonProduct"   element={<ThonProduct />} />

      {/* ── Routes admin protégées ── */}
      <Route element={<PrivateRoute />}>
        {/* ✅ Dashboard selon rôle */}
        <Route path="dashboardAdmin"    element={<DashboardAdmin />} />
        <Route path="vendeurDashboard"  element={<VendeurDashboard />} />

        <Route path="teamMessage"       element={<TeamMessage />} />
        <Route path="missionPost"       element={<MissionPost />} />
        <Route path="listeRejoindre"    element={<ListeRejoindre />} />
        <Route path="listeContacts"     element={<ListeContacts />} />
        <Route path="listePostulantsCommunity" element={<ListePostulantsCommunity />} />
        <Route path="listPartners"      element={<ListPartners />} />
        <Route path="listeAbonnement"   element={<ListeAbonnement />} />
        <Route path="platformPost"      element={<PlatformPost />} />
        <Route path="valeurPost"        element={<ValeurPost />} />
        <Route path="motPresidentPost"  element={<MotPresidentPost />} />
        <Route path="videoPost"         element={<VideoPost />} />
        <Route path="stocks"            element={<Stocks />} />
        <Route path="produits"          element={<Produits />} />
        <Route path="categories"        element={<Categories />} />
        <Route path="programPost"       element={<ProgramPost />} />
        <Route path="register-employee" element={<RegisterEmployee />} />
        <Route path="partnerPost"       element={<PartnerPost />} />
        <Route path="ventes"            element={<Ventes />} />
        <Route path="professionalAreaPost" element={<ProfessionalAreaPost />} />
        <Route path="thonRecipesPost"   element={<ThonRecipesPost />} />
        <Route path="portfolioPost"     element={<PortfolioPost />} />
        <Route path="servicePost"       element={<ServicePost />} />
        <Route path="thonProductPost"   element={<ThonProductPost />} />
        <Route path="activity"          element={<Activity />} />


        <Route path="courriersArrives"          element={<CourriersArrives />} />
         <Route path="gestionCourriers"          element={<GestionCourriers />} />



      </Route>

    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nextProvider i18n={i18next}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </I18nextProvider>
  </StrictMode>
);