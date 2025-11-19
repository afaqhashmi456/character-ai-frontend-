import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './lib/store/store';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ChatPage } from './pages/ChatPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { ROUTES } from './shared/constants';
import { UserRole } from './shared/types';

function AppContent() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route
          path={ROUTES.CHAT}
          element={
            <ProtectedRoute requiredRole={UserRole.MEMBER}>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN.USERS}
          element={
            <ProtectedRoute requiredRole={UserRole.ADMIN}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

export default App;
