import { Routes, Route } from "react-router-dom"
import {
  HomePage,
  PlanesPage,
  MaquinasPage,
  UbicacionPage,
  ContactoPage,
  LoginPage,
} from "./pages/public"
import { MyDashboardPage, MyRoutinePage, SettingsPage, GenerateRoutinePage, ProgressPage } from "./pages/protected"
import { AdminUsersPage, AdminMachinesPage } from "./pages/admin"
import { CheckinPage, POSPage } from "./pages/reception"

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/planes" element={<PlanesPage />} />
      <Route path="/maquinas" element={<MaquinasPage />} />
      <Route path="/ubicacion" element={<UbicacionPage />} />
      <Route path="/contacto" element={<ContactoPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes - User */}
      <Route path="/my" element={<MyDashboardPage />} />
      <Route path="/my/routine" element={<MyRoutinePage />} />
      <Route path="/my/routine/generate" element={<GenerateRoutinePage />} />
      <Route path="/my/progress" element={<ProgressPage />} />
      <Route path="/settings" element={<SettingsPage />} />

      {/* Admin Routes */}
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/admin/machines" element={<AdminMachinesPage />} />

      {/* Reception Routes */}
      <Route path="/reception/checkin" element={<CheckinPage />} />
      <Route path="/reception/pos" element={<POSPage />} />

      {/* 404 */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  )
}

export default App
