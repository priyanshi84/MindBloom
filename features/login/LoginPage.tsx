import React, { useState } from 'react';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login: any username/password works for this demo
    onLoginSuccess();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8 text-center relative overflow-hidden">
      {/* Background from LandingPage */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-blue-100 z-0"></div>
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-violet-200/50 via-transparent to-blue-200/50 animate-spin-slowest z-0"></div>

      <div className="animate-fade-in z-10 flex flex-col items-center">
        <div className="relative w-32 h-32 mb-6 flex items-center justify-center animate-bloom-pulse">
          <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 opacity-20 blur-2xl animate-spin-slow"></div>
          <div className="absolute w-3/4 h-3/4 rounded-full bg-gradient-to-br from-blue-300 to-violet-300 opacity-20 blur-xl animate-spin-slower"></div>
          <div className="w-20 h-20 bg-white/50 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-lg transform rotate-[-15deg]">
            <Icon name="Flower" className="w-10 h-10 text-violet-500 transform rotate-[15deg]" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-2 tracking-tight">
          Welcome Back
        </h1>
        <p className="text-md text-slate-600 max-w-lg mx-auto mb-8">
          Sign in to continue your journey.
        </p>
        
        <Card className="w-full max-w-sm p-6 md:p-8 text-left">
            <div className="space-y-4">
                <Button variant="outline" className="w-full" onClick={onLoginSuccess}>
                    <Icon name="Google" className="w-5 h-5 mr-3"/> Continue with Google
                </Button>
                <Button variant="outline" className="w-full !bg-slate-800 !text-white hover:!bg-slate-700" onClick={onLoginSuccess}>
                    <Icon name="Apple" className="w-5 h-5 mr-3"/> Continue with Apple
                </Button>
            </div>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-500 backdrop-blur-xl">Or continue with</span></div>
            </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon name="Mail" className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full rounded-md border-slate-300 bg-slate-100 pl-10 pr-3 py-2 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                    placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                 <label htmlFor="password"  className="block text-sm font-medium text-slate-700">Password</label>
                 <a href="#" className="text-sm text-violet-600 hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon name="Lock" className="h-5 w-5 text-slate-400" />
                 </div>
                <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full rounded-md border-slate-300 bg-slate-100 pl-10 pr-10 py-2 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                    placeholder="Your password"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                    <Icon name={showPassword ? 'EyeOff' : 'Eye'} className="h-5 w-5 text-slate-400" />
                </button>
              </div>
            </div>
            <div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
