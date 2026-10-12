/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { LoginScreen } from './components/auth/LoginScreen.tsx';
import { ProfileSetupScreen } from './components/auth/ProfileSetupScreen.tsx';
import { MemberHome } from './components/member/MemberHome.tsx';
import { OwnerDashboard } from './components/owner/OwnerDashboard.tsx';
import { Dumbbell } from 'lucide-react';

const AppContent: React.FC = () => {
  const { role, loading, needsProfileSetup } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center animate-bounce shadow-xl shadow-amber-500/25">
          <Dumbbell className="w-7 h-7 text-slate-950 font-bold" />
        </div>
        <p className="text-xs uppercase font-extrabold tracking-widest text-amber-400 mt-4 animate-pulse">
          FITPULSE
        </p>
      </div>
    );
  }

  // First time Google Sign-In needs profile details (Phone, Address, etc.)
  if (needsProfileSetup) {
    return <ProfileSetupScreen />;
  }

  // Not logged in -> Show Login
  if (!role) {
    return <LoginScreen />;
  }

  // Logged in
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      <Navbar />
      <main className="flex-1 pb-16">
        {role === 'owner' ? <OwnerDashboard /> : <MemberHome />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
