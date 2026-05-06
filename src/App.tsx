import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { LoginPage } from '@/pages/LoginPage'
import { HomePage } from '@/pages/HomePage'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { UsersPage } from '@/pages/UsersPage'
import { RolesPage } from '@/pages/RolesPage'
import { AppsPage } from '@/pages/AppsPage'
import { ServicesPage } from '@/pages/ServicesPage'
import { DocumentiPage } from '@/pages/DocumentiPage'
import { DocumentoDetailPage } from '@/pages/DocumentoDetailPage'
import { DocumentoUploadPage } from '@/pages/DocumentoUploadPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/roles" element={<RolesPage />} />
                <Route path="/apps" element={<AppsPage />} />
                <Route path="/services" element={<ServicesPage />} />
                {/* Modulo Documentale */}
                <Route path="/documenti" element={<DocumentiPage />} />
                <Route path="/documenti/upload" element={<DocumentoUploadPage />} />
                <Route path="/documenti/:id" element={<DocumentoDetailPage />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
