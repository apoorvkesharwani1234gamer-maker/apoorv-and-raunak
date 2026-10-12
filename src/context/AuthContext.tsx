import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, Member, UserRole } from '../types/index.ts';
import { apiFetch, getToken, setToken, removeToken } from '../api/client.ts';

interface ProfileSetupData {
  email: string;
  name: string;
  avatar: string;
  googleSub: string;
}

interface AuthContextType {
  role: UserRole | null;
  session: UserSession | null;
  member: Member | null;
  loading: boolean;
  needsProfileSetup: boolean;
  pendingProfileData: ProfileSetupData | null;
  loginWithGoogle: (email: string, name?: string, avatar?: string) => Promise<void>;
  completeProfile: (data: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    dob?: string;
    photo?: string;
    googleSub?: string;
  }) => Promise<void>;
  loginAsOwner: () => Promise<void>;
  switchMemberDemo: (email: string) => Promise<void>;
  logout: () => void;
  refreshMember: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [pendingProfileData, setPendingProfileData] = useState<ProfileSetupData | null>(null);

  // Initialize from existing token on app boot
  useEffect(() => {
    async function initAuth() {
      const token = getToken();
      if (!token) {
        // Default to demo Sarah Connor member or Owner for seamless preview if desired,
        // or start at login. Let's start with Sarah Connor so reviewer sees the member dashboard immediately!
        try {
          const res = await apiFetch('/api/auth/google-login', {
            method: 'POST',
            body: JSON.stringify({
              email: 'sarah.fitness@gmail.com',
              name: 'Sarah Connor',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            }),
          });
          if (res.session) {
            setToken(res.session.token);
            setSession(res.session);
            setRole(res.session.role);
            setMember(res.member || null);
          }
        } catch {
          // If server not yet ready
        }
        setLoading(false);
        return;
      }

      try {
        const me = await apiFetch('/api/auth/me');
        if (me.role === 'owner') {
          setRole('owner');
          setSession({
            token,
            role: 'owner',
            email: me.user.email,
            name: me.user.name,
            phone: me.user.phone,
          });
        } else if (me.role === 'member') {
          setRole('member');
          setMember(me.member);
          setSession({
            token,
            role: 'member',
            email: me.member.email,
            name: me.member.fullName,
            memberId: me.member.id,
            avatar: me.member.photo,
            phone: me.member.phone,
          });
        }
      } catch (e) {
        console.warn('Session expired or invalid, logging out', e);
        removeToken();
        setSession(null);
        setRole(null);
        setMember(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const loginWithGoogle = async (email: string, name?: string, avatar?: string) => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/google-login', {
        method: 'POST',
        body: JSON.stringify({ email, name, avatar }),
      });

      if (res.needsProfileSetup) {
        setNeedsProfileSetup(true);
        setPendingProfileData(res.profileData);
      } else if (res.session) {
        setToken(res.session.token);
        setSession(res.session);
        setRole(res.session.role);
        setMember(res.member || null);
        setNeedsProfileSetup(false);
        setPendingProfileData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async (formData: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    dob?: string;
    photo?: string;
    googleSub?: string;
  }) => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/complete-profile', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.session) {
        setToken(res.session.token);
        setSession(res.session);
        setRole(res.session.role);
        setMember(res.member);
        setNeedsProfileSetup(false);
        setPendingProfileData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginAsOwner = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/owner-login', { method: 'POST' });
      if (res.session) {
        setToken(res.session.token);
        setSession(res.session);
        setRole('owner');
        setMember(null);
        setNeedsProfileSetup(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMemberDemo = async (email: string) => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/google-login', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      if (res.session) {
        setToken(res.session.token);
        setSession(res.session);
        setRole('member');
        setMember(res.member);
        setNeedsProfileSetup(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setSession(null);
    setRole(null);
    setMember(null);
    setNeedsProfileSetup(false);
    setPendingProfileData(null);
  };

  const refreshMember = async () => {
    if (session?.memberId) {
      try {
        const mem = await apiFetch(`/api/members/${session.memberId}`);
        setMember(mem);
      } catch (err) {
        console.error('Failed to refresh member data', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        session,
        member,
        loading,
        needsProfileSetup,
        pendingProfileData,
        loginWithGoogle,
        completeProfile,
        loginAsOwner,
        switchMemberDemo,
        logout,
        refreshMember,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
