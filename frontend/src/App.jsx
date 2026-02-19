import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext, useEffect, lazy, Suspense } from 'react';
import { AuthContext } from './context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

// Helper to handle ChunkLoadError/MIME errors after new deployments
const lazyRetry = (componentImport) => {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error('Sequence Mismatch: Dynamic module fetch failed. Re-synchronizing node...', error);
      // Only reload once to prevent infinite loops
      const hasReloaded = window.localStorage.getItem('sync_retry_active');
      if (!hasReloaded) {
        window.localStorage.setItem('sync_retry_active', 'true');
        window.location.reload();
        return;
      }
      throw error;
    }
  });
};

// Lazy load components with error recovery
const Login = lazyRetry(() => import('./components/Login'));
const Register = lazyRetry(() => import('./components/Register'));
const Dashboard = lazyRetry(() => import('./components/Dashboard'));
const Profile = lazyRetry(() => import('./components/Profile'));
const ForgotPassword = lazyRetry(() => import('./components/ForgotPassword'));
const ResetPassword = lazyRetry(() => import('./components/ResetPassword'));
const ActivityLogs = lazyRetry(() => import('./components/ActivityLogs'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-[70vh] flex items-center justify-center p-6">
    <motion.div
      animate={{
        rotate: 360
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }}
      className="w-10 h-10 border-2 border-white/5 border-t-blue-500 rounded-full"
    />
  </div>
);

const AnimatedRoutes = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/dashboard" /> : <Register />}
          />
          <Route
            path="/forgot-password"
            element={user ? <Navigate to="/dashboard" /> : <ForgotPassword />}
          />
          <Route
            path="/reset-password"
            element={user ? <Navigate to="/dashboard" /> : <ResetPassword />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/activity-logs"
            element={user ? <ActivityLogs /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={<Navigate to={user ? "/dashboard" : "/login"} />}
          />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

function App() {
  const { loading } = useContext(AuthContext);

  // Clear sync retry flag on successful mount
  useEffect(() => {
    window.localStorage.removeItem('sync_retry_active');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020305] flex items-center justify-center p-6 select-none">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
              borderRadius: ["20%", "50%", "20%"]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-12 h-12 border-2 border-white/10 border-t-white rounded-2xl shadow-2xl mb-8"
          />
          <div className="text-center">
            <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] animate-pulse">Initializing_Sync</h2>
            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-2">Connecting to secure node...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App selection:bg-blue-500/30">
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;
