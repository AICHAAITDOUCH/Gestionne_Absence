import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import FormateurDashboard from './pages/formateur/FormateurDashboard';
import MesGroupes from './pages/formateur/MesGroupes';
import MesModules from './pages/formateur/MesModules';
import MesSeances from './pages/formateur/MesSeances';
import FaireAppel from './pages/formateur/FaireAppel';
import StagiaireDashboard from './pages/stagiaire/StagiaireDashboard';
import StagiaireSeances from './pages/stagiaire/MesSeances';
import StagiaireAbsences from './pages/stagiaire/MesAbsences';
import StagiaireJustifications from './pages/stagiaire/Justifications';
import StagiaireProfil from './pages/stagiaire/ProfilStagiaire';

import AdminStagiaires from './pages/admin/AdminStagiaires';
import AdminFormateurs from './pages/admin/AdminFormateurs';
import AdminGroupes from './pages/admin/AdminGroupes';
import AdminModules from './pages/admin/AdminModules';
import AdminSeances from './pages/admin/AdminSeances';
import AdminJustifications from './pages/admin/AdminJustifications';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public & Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          {/* Admin Routes */}
          <Route path="/admin">
            <Route index element={<AdminDashboard />} />
            <Route path="stagiaires" element={<AdminStagiaires />} />
            <Route path="formateurs" element={<AdminFormateurs />} />
            <Route path="groupes" element={<AdminGroupes />} />
            <Route path="modules" element={<AdminModules />} />
            <Route path="seances" element={<AdminSeances />} />
            <Route path="justifications" element={<AdminJustifications />} />
          </Route>

          {/* Formateur Routes */}
          <Route path="/formateur">
            <Route index element={<FormateurDashboard />} />
            <Route path="groupes" element={<MesGroupes />} />
            <Route path="modules" element={<MesModules />} />
            <Route path="seances" element={<MesSeances />} />
            <Route path="faire-appel/:seanceId" element={<FaireAppel />} />
          </Route>

          {/* Stagiaire Routes */}
          <Route path="/stagiaire">
            <Route index element={<StagiaireDashboard />} />
            <Route path="seances" element={<StagiaireSeances />} />
            <Route path="absences" element={<StagiaireAbsences />} />
            <Route path="justifications" element={<StagiaireJustifications />} />
            <Route path="profil" element={<StagiaireProfil />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
