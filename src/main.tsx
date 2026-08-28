import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import Home from './pages/Home.tsx';
import APropos from './pages/APropos.tsx';
import FormationsPage from './pages/FormationsPage.tsx';
import GaleriePage from './pages/GaleriePage.tsx';
import ContactPage from './pages/ContactPage.tsx';
import ClientLogin from './pages/client/Login.tsx';
import ClientSignup from './pages/client/Signup.tsx';
import ClientProtectedRoute from './pages/client/ClientProtectedRoute.tsx';
import MonCompte from './pages/client/MonCompte.tsx';
import NouvelleDemande from './pages/client/NouvelleDemande.tsx';
import Formations from './pages/admin/Formations.tsx';
import OffresSpeciales from './pages/admin/OffresSpeciales.tsx';
import PersonnelAdmin from './pages/admin/Personnel.tsx';
import Galerie from './pages/admin/Galerie.tsx';
import Inscriptions from './pages/admin/Inscriptions.tsx';
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
          <Route path="/galerie" element={<GaleriePage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Espace Client */}
        <Route path="/connexion" element={<ClientLogin />} />
        <Route path="/inscription" element={<ClientSignup />} />
        <Route path="/mon-compte" element={<ClientProtectedRoute><MonCompte /></ClientProtectedRoute>} />
        <Route path="/mon-compte/nouvelle-demande" element={<ClientProtectedRoute><NouvelleDemande /></ClientProtectedRoute>} />

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