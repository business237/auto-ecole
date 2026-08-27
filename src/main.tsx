import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.tsx';
import ClientLogin from './pages/client/Login.tsx';
import ClientSignup from './pages/client/Signup.tsx';
import ClientProtectedRoute from './pages/client/ClientProtectedRoute.tsx';
import MonCompte from './pages/client/MonCompte.tsx';
import NouvelleDemande from './pages/client/NouvelleDemande.tsx';
import Formations from './pages/admin/Formations.tsx';
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
        {/* Site Vitrine Principal */}
        <Route path="/" element={<App />} />

        {/* Espace Client */}
        <Route path="/connexion" element={<ClientLogin />} />
        <Route path="/inscription" element={<ClientSignup />} />
        <Route
          path="/mon-compte"
          element={
            <ClientProtectedRoute>
              <MonCompte />
            </ClientProtectedRoute>
          }
        />
        <Route
          path="/mon-compte/nouvelle-demande"
          element={
            <ClientProtectedRoute>
              <NouvelleDemande />
            </ClientProtectedRoute>
          }
        />

        {/* Espace Administration */}
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="formations" replace />} />
          <Route path="formations" element={<Formations />} />
          <Route path="galerie" element={<Galerie />} />
          <Route path="inscriptions" element={<Inscriptions />} />
          <Route path="messages" element={<Messages />} />
          <Route path="infos" element={<Infos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
