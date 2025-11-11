import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login1 from "@/components/ui/login-1";
import Tawk from '../contexts/Tawk';
import { GooeyText } from "../components/ui/gooey-text-morphing";

const Login: React.FC = () => {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/dashboard');
      } else {
        await signup(name, email, password);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`${visible ? "" : "hidden"} min-h-screen bg-black h-full flex items-center justify-center`}>
        <GooeyText
          texts={["Leave", "Approval", "Portal"]}
          morphTime={1}
          cooldownTime={0.25}
          className="font-bold"
        />
      </div>
      <div className={`${!visible ? "" : "hidden"}`}>
        <div className="w-full flex flex-col items-center">
          <div className="flex gap-2 mb-4">
            <button
              className={`px-4 py-1 rounded-md ${mode === 'login' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300'}`}
              onClick={() => setMode('login')}
            >
              Log in
            </button>
            <button
              className={`px-4 py-1 rounded-md ${mode === 'signup' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300'}`}
              onClick={() => setMode('signup')}
            >
              Sign up
            </button>
          </div>

          {mode === 'login' ? (
            <Login1
              email={email}
              password={password}
              error={error}
              loading={loading}
              onEmailChange={(e) => setEmail(e.target.value)}
              onPasswordChange={(e) => setPassword(e.target.value)}
              onSubmit={handleSubmit}
            />
          ) : (
            <div className="w-full flex items-center justify-center py-8">
              <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-lg p-6 grid gap-4 text-white"
              >
                <h2 className="text-2xl font-semibold">Create an account</h2>
                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-3 py-2 rounded-md text-sm">
                    {error}
                  </div>
                )}
                <input
                  className="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 outline-none"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  className="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 outline-none"
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  className="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 outline-none"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-500 transition-colors rounded-md px-4 py-2 disabled:opacity-50"
                >
                  {loading ? 'Signing up...' : 'Sign up'}
                </button>
              </form>
            </div>
          )}

        </div>
        <Tawk />
      </div>
    </>
  );
};

export default Login;
