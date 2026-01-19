
import React, { useState } from 'react';
import { Mail, Lock, LogIn, Palette, AlertCircle, UserPlus, ArrowLeft, Shield, Eye, EyeOff, Sparkles, UserCircle } from 'lucide-react';
import { translations } from '../translations';

interface LoginProps {
  t: typeof translations.en;
  onLogin: (email: string) => void;
}

interface StoredUser {
  email: string;
  password: string;
}

// Conturi Pro predefinite solicitate de utilizator
export const PREDEFINED_PRO_ACCOUNTS: Record<string, string> = {
  'pro2@madrun.net': 'Madrun@Pro2$$',
  'pro3@madrun.net': 'Madrun@Pro3$$',
  'pro4@madrun.net': 'Madrun@Pro4$$',
};

export const Login: React.FC<LoginProps> = ({ t, onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getLocalUsers = (): StoredUser[] => {
    const users = localStorage.getItem('studio-local-users');
    return users ? JSON.parse(users) : [];
  };

  const saveLocalUser = (user: StoredUser) => {
    const users = getLocalUsers();
    users.push(user);
    localStorage.setItem('studio-local-users', JSON.stringify(users));
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin('trial-user@madrun.ai');
    }, 600);
  };

  const autofillAdmin = () => {
    setEmail('doru373@gmail.com');
    setPassword('Madrun@373$$');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate network delay
    setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase();

      // 1. ADMIN CHECK
      if (normalizedEmail === 'doru373@gmail.com' && password === 'Madrun@373$$') {
        onLogin(normalizedEmail);
        return;
      }

      // 2. PREDEFINED PRO ACCOUNTS CHECK
      if (PREDEFINED_PRO_ACCOUNTS[normalizedEmail] && PREDEFINED_PRO_ACCOUNTS[normalizedEmail] === password) {
        onLogin(normalizedEmail);
        return;
      }

      if (isRegistering) {
        // Registration Logic
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setIsLoading(false);
          return;
        }

        const users = getLocalUsers();
        if (users.some(u => u.email.toLowerCase() === normalizedEmail) || normalizedEmail === 'doru373@gmail.com' || PREDEFINED_PRO_ACCOUNTS[normalizedEmail]) {
          setError('An account with this email already exists.');
          setIsLoading(false);
          return;
        }

        saveLocalUser({ email: normalizedEmail, password });
        onLogin(normalizedEmail);
      } else {
        // Regular User Login Logic
        const users = getLocalUsers();
        const foundUser = users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === password);
        
        if (foundUser) {
          onLogin(normalizedEmail);
        } else {
          setError('Invalid email or password. Please try again.');
          setIsLoading(false);
        }
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950 overflow-y-auto p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[160px] bg-indigo-600/20" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[160px] bg-purple-600/20" />
      </div>

      <div className="relative w-full max-w-md my-auto py-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 mb-6 rounded-3xl bg-indigo-600 shadow-2xl shadow-indigo-500/40">
            <Palette size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">{t.appTitle}</h1>
          <p className="text-slate-400 font-medium">
            {isRegistering ? 'Create your free account' : 'Sign in to your account'}
          </p>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm animate-in shake-in-x duration-300">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Password</label>
                {!isRegistering && (
                  <button type="button" onClick={autofillAdmin} className="text-[10px] text-indigo-400/50 hover:text-indigo-400 transition-colors uppercase font-black">Admin Autofill</button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pl-11 pr-12 text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-600 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isRegistering && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600">
                    <Shield size={18} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pl-11 pr-12 text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-600 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] mt-2"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : isRegistering ? (
                <>
                  <UserPlus size={20} />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {!isRegistering && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]"><span className="bg-slate-950 px-4 text-slate-600">Or continue as</span></div>
            </div>
          )}

          {!isRegistering && (
            <button
              onClick={handleGuestLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 hover:bg-slate-800 border border-white/5 text-indigo-400 font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.98]"
            >
              <Sparkles size={20} />
              {t.startTrialBtn}
            </button>
          )}

          <div className="text-center pt-4">
            {isRegistering ? (
              <button 
                onClick={() => { setIsRegistering(false); setError(null); setShowPassword(false); setShowConfirmPassword(false); }}
                className="inline-flex items-center gap-2 text-slate-500 text-xs hover:text-indigo-400 transition-colors group uppercase font-black tracking-wider"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Already have an account? <span className="text-indigo-400">Sign In</span>
              </button>
            ) : (
              <p className="text-slate-500 text-xs uppercase font-black tracking-wider">
                Don't have an account? 
                <button 
                  onClick={() => { setIsRegistering(true); setError(null); setShowPassword(false); }}
                  className="ml-2 text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Start for free
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
