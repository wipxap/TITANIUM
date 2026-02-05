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
import { AdminUsersPage, AdminMachinesPage, AdminReportsPage, AdminProductsPage } from "./pages/admin"
import { CheckinPage, POSPage, SalesHistoryPage } from "./pages/reception"
import { ProtectedRoute } from "./components/common"
import { useCapacitor } from "@/hooks"

function App() {
  useCapacitor()

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
      <Route path="/my" element={<ProtectedRoute><MyDashboardPage /></ProtectedRoute>} />
      <Route path="/my/routine" element={<ProtectedRoute><MyRoutinePage /></ProtectedRoute>} />
      <Route path="/my/routine/generate" element={<ProtectedRoute><GenerateRoutinePage /></ProtectedRoute>} />
      <Route path="/my/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsersPage /></ProtectedRoute>} />
      <Route path="/admin/machines" element={<ProtectedRoute allowedRoles={["admin"]}><AdminMachinesPage /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={["admin"]}><AdminReportsPage /></ProtectedRoute>} />
      <Route path="/admin/products" element={<ProtectedRoute allowedRoles={["admin"]}><AdminProductsPage /></ProtectedRoute>} />

      {/* Reception Routes */}
      <Route path="/reception/checkin" element={<ProtectedRoute allowedRoles={["admin", "reception"]}><CheckinPage /></ProtectedRoute>} />
      <Route path="/reception/pos" element={<ProtectedRoute allowedRoles={["admin", "reception"]}><POSPage /></ProtectedRoute>} />
      <Route path="/reception/sales" element={<ProtectedRoute allowedRoles={["admin", "reception"]}><SalesHistoryPage /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  )
}

export default App
