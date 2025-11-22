import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Auth
import Login from "./pages/Login";
import Register from "./pages/Register";

// Tutor
import TutorDashboard from "./pages/tutor/Dashboard";
import Animals from "./pages/tutor/Animals";
import AnimalNew from "./pages/tutor/AnimalNew";
import AnimalDetails from "./pages/tutor/AnimalDetails";
import AnimalEdit from "./pages/tutor/AnimalEdit";
import AnimalHistory from "./pages/tutor/AnimalHistory";
import Triage from "./pages/tutor/Triage";
import Appointments from "./pages/tutor/Appointments";
import AppointmentNew from "./pages/tutor/AppointmentNew";
import AppointmentDetail from "./pages/tutor/AppointmentDetail";
import TutorConsultationDetail from "./pages/tutor/ConsultationDetail";
import Education from "./pages/tutor/Education";
import EducationDetail from "./pages/tutor/EducationDetail";
import Notifications from "./pages/tutor/Notifications";
import Profile from "./pages/tutor/Profile";
import ProfileEdit from "./pages/tutor/ProfileEdit";
import ProfileContact from "./pages/tutor/ProfileContact";
import ProfileAddresses from "./pages/tutor/ProfileAddresses";

// Veterinarian
import VetDashboard from "./pages/vet/Dashboard";
import ConsultationNew from "./pages/vet/ConsultationNew";
import Consultations from "./pages/vet/Consultations";
import ConsultationDetail from "./pages/vet/ConsultationDetail";
import VetAppointments from "./pages/vet/VetAppointments";
import VetAppointmentDetail from "./pages/vet/AppointmentDetail";
import VetNotifications from "./pages/vet/Notifications";
import VetProfile from "./pages/vet/Profile";
import VetProfileEdit from "./pages/vet/ProfileEdit";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/* PROTEÇÃO DE ROTAS */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redireciona root → login */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Acesso público */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ---------------------- */}
            {/* ROTAS DO TUTOR */}
            {/* ---------------------- */}
            <Route
              path="/tutor/dashboard"
              element={
                <ProtectedRoute>
                  <TutorDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tutor/animals"
              element={
                <ProtectedRoute>
                  <Animals />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tutor/animal/new"
              element={
                <ProtectedRoute>
                  <AnimalNew />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tutor/animal/:id"
              element={
                <ProtectedRoute>
                  <AnimalDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tutor/animal/:id/edit"
              element={
                <ProtectedRoute>
                  <AnimalEdit />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tutor/animal/:id/history"
              element={
                <ProtectedRoute>
                  <AnimalHistory />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tutor/triage"
              element={
                <ProtectedRoute>
                  <Triage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tutor/appointments"
              element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tutor/appointment/new"
              element={
                <ProtectedRoute>
                  <AppointmentNew />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tutor/appointment/:id"
              element={
                <ProtectedRoute>
                  <AppointmentDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tutor/consultation/:id"
              element={
                <ProtectedRoute>
                  <TutorConsultationDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tutor/education"
              element={
                <ProtectedRoute>
                  <Education />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tutor/education/:id"
              element={
                <ProtectedRoute>
                  <EducationDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tutor/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tutor/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tutor/profile/edit"
              element={
                <ProtectedRoute>
                  <ProfileEdit />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tutor/profile/contact"
              element={
                <ProtectedRoute>
                  <ProfileContact />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tutor/profile/addresses"
              element={
                <ProtectedRoute>
                  <ProfileAddresses />
                </ProtectedRoute>
              }
            />

            {/* ---------------------- */}
            {/* ROTAS DO VETERINÁRIO */}
            {/* ---------------------- */}
            <Route
              path="/vet/dashboard"
              element={
                <ProtectedRoute>
                  <VetDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vet/consultation/new"
              element={
                <ProtectedRoute>
                  <ConsultationNew />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vet/consultations"
              element={
                <ProtectedRoute>
                  <Consultations />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vet/consultation/:id"
              element={
                <ProtectedRoute>
                  <ConsultationDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vet/appointments"
              element={
                <ProtectedRoute>
                  <VetAppointments />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vet/appointment/:id"
              element={
                <ProtectedRoute>
                  <VetAppointmentDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vet/notifications"
              element={
                <ProtectedRoute>
                  <VetNotifications />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vet/profile"
              element={
                <ProtectedRoute>
                  <VetProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vet/profile/edit"
              element={
                <ProtectedRoute>
                  <VetProfileEdit />
                </ProtectedRoute>
              }
            />

            {/* rota catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
