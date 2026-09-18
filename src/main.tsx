import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import Home from './pages/Home.tsx';
import APropos from './pages/APropos.tsx';
import FormationsPage from './pages/FormationsPage.tsx';
import Permis from './pages/Permis.tsx';
import GaleriePage from './pages/GaleriePage.tsx';
import ContactPage from './pages/ContactPage.tsx';
import NouvelleDemande from './pages/client/NouvelleDemande.tsx';
import SuiviDossier from './pages/client/SuiviDossier.tsx';
import PaiementRetour from './pages/client/PaiementRetour.tsx';
import Formations from './pages/admin/Formations.tsx';
import OffresSpeciales from './pages/admin/OffresSpeciales.tsx';
import PersonnelAdmin from './pages/admin/Personnel.tsx';
import Galerie from './pages/admin/Galerie.tsx';
import Inscriptions from './pages/admin/Inscriptions.tsx';
import SuivreDemande from './pages/client/SuivreDemande.tsx';
import Messages from './pages/admin/Messages.tsx';
import Infos from './pages/admin/Infos.tsx';
import Login from './pages/admin/Login.tsx';
import ProtectedRoute from './pages/admin/ProtectedRoute.tsx';
import AdminLayout from './pages/admin/AdminLayout.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Site Vitrine — pages publiques */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/a-propos" element={<APropos />} />
          <Route path="/formations" element={<FormationsPage />} />
          <Route path="/permis" element={<Permis />} />
          <Route path="/galerie" element={<GaleriePage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Formulaire d'inscription — sans compte requis */}
        <Route path="/inscription" element={<NouvelleDemande />} />
        <Route path="/suivre-ma-demande" element={<SuivreDemande />} />
        <Route path="/suivi/:numeroDossier" element={<SuiviDossier />} />
        <Route path="/paiement/retour" element={<PaiementRetour />} />

        {/* Espace Administration */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="formations" replace />} />
          <Route path="formations" element={<Formations />} />
          <Route path="offres" element={<OffresSpeciales />} />
          <Route path="personnel" element={<PersonnelAdmin />} />
          <Route path="galerie" element={<Galerie />} />
          <Route path="inscriptions" element={<Inscriptions />} />
          <Route path="messages" element={<Messages />} />
          <Route path="infos" element={<Infos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);