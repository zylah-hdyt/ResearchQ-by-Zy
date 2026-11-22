import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { DataProvider } from './store/DataProvider';
import { ToastProvider } from './components/Toast';
import { Layout } from './components/Layout';
import { AuthPage } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Accounts } from './pages/Accounts';
import { WalletDetail } from './pages/WalletDetail';
import { Budgets } from './pages/Budgets';
import { Reports } from './pages/Reports';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LegalPage } from './pages/Legal';
import { ConfirmProvider } from './components/Confirm';
import { ConsentScreen } from './pages/Consent';
import { TERMS_VERSION } from './lib/legal';

function Gate() {
  const { profile, ready } = useAuth();
  if (!ready) return null;
  if (!profile) return <AuthPage />;
  if (profile.termsVersion !== TERMS_VERSION) return <ConsentScreen />;
  return (
    <DataProvider key={profile.userId}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="accounts/:id" element={<WalletDetail />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </DataProvider>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <AuthProvider>
          <ErrorBoundary>
           <ConfirmProvider>
            <Routes>
              <Route path="/terms" element={<LegalPage kind="terms" />} />
              <Route path="/privacy" element={<LegalPage kind="privacy" />} />
              <Route path="*" element={<Gate />} />
            </Routes>
           </ConfirmProvider>
          </ErrorBoundary>
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  );
}
