import { lazy, Suspense, useState } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { DataProvider } from './store/DataProvider';
import { ToastProvider } from './components/Toast';
import { Layout } from './components/Layout';
import { AuthPage } from './pages/Auth';
import { Welcome, hasWelcomed } from './pages/Welcome';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ConfirmProvider } from './components/Confirm';
import { ConsentScreen } from './pages/Consent';
import { TERMS_VERSION } from './lib/legal';
import { PageFallback } from './components/PageFallback';

// The dashboard and sign-in are in the main bundle; other pages load on first visit.
const named = <K extends string>(load: () => Promise<Record<K, React.ComponentType<any>>>, key: K) => lazy(() => load().then((m) => ({ default: m[key] })));
const Transactions = named(() => import('./pages/Transactions'), 'Transactions');
const Accounts = named(() => import('./pages/Accounts'), 'Accounts');
const WalletDetail = named(() => import('./pages/WalletDetail'), 'WalletDetail');
const Budgets = named(() => import('./pages/Budgets'), 'Budgets');
const Reports = named(() => import('./pages/Reports'), 'Reports');
const Profile = named(() => import('./pages/Profile'), 'Profile');
const Settings = named(() => import('./pages/Settings'), 'Settings');
const LegalPage = named(() => import('./pages/Legal'), 'LegalPage');
const ExportHub = named(() => import('./pages/ExportHub'), 'ExportHub');
const Business = named(() => import('./pages/Business'), 'Business');

function Gate() {
  const { profile, ready, recovery, fromAuthLink } = useAuth();
  const [entry, setEntry] = useState<'in' | 'up' | null>(() => (hasWelcomed() || fromAuthLink ? 'in' : null));
  if (!ready) return null;
  if (!profile) return entry ? <AuthPage initialMode={entry} /> : <Welcome onDone={setEntry} />;
  if (recovery) return <ResetPassword />;
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
          <Route path="export" element={<ExportHub />} />
          <Route path="business" element={<Business />} />
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
            <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/terms" element={<LegalPage kind="terms" />} />
              <Route path="/privacy" element={<LegalPage kind="privacy" />} />
              <Route path="*" element={<Gate />} />
            </Routes>
            </Suspense>
           </ConfirmProvider>
          </ErrorBoundary>
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  );
}
