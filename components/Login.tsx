
import React, { useState } from 'react';
import { Mail, Lock, LogIn, Palette, AlertCircle, UserPlus, ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react';
import { translations } from '../translations';

interface LoginProps {
  t: typeof translations.en;
  onLogin: (email: string) => void;
}

interface StoredUser {
  email: string;
  password: string;
}

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate network delay
    setTimeout(() => {
      if (isRegistering) {
        // Registration Logic
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setIsLoading(false);
          return;
        }

        const users = getLocalUsers();
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase()) || email === 'doru373@gmail.com') {
          setError('An account with this email already exists.');
          setIsLoading(false);
          return;
        }

        saveLocalUser({ email, password });
        onLogin(email);
      } else {
        // Login Logic
        const users = getLocalUsers();
        const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        
        if (email === 'doru373@gmail.com' && password === 'Madrun@373$$') {
          onLogin(email);
        } else if (foundUser) {
          onLogin(email);
        } else {
          setError('Invalid email or password. Please try again.');
          setIsLoading(false);
        }
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[160px] bg-indigo-600/20" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[160px] bg-purple-600/20" />
      </div>

      <div className="relative w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 mb-6 rounded-3xl bg-indigo-600 shadow-2xl shadow-indigo-500/40">
            <Palette size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t.appTitle}</h1>
          <p className="text-slate-400">
            {isRegistering ? 'Create your free account' : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm animate-in shake-in-x duration-300">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-slate-300">Password</label>
              {!isRegistering && (
                <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</a>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pl-11 pr-12 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isRegistering && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-medium text-slate-300 ml-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Shield size={18} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pl-11 pr-12 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] mt-2"
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

        <div className="mt-8 text-center">
          {isRegistering ? (
            <button 
              onClick={() => { setIsRegistering(false); setError(null); setShowPassword(false); setShowConfirmPassword(false); }}
              className="inline-flex items-center gap-2 text-slate-500 text-sm hover:text-indigo-400 transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Already have an account? <span className="font-semibold text-indigo-400">Sign In</span>
            </button>
          ) : (
            <p className="text-slate-500 text-sm">
              Don't have an account? 
              <button 
                onClick={() => { setIsRegistering(true); setError(null); setShowPassword(false); }}
                className="ml-1 text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
              >
                Start for free
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
