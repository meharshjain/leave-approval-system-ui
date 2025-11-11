import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login1 from "@/components/ui/login-1";
import Tawk from '../contexts/Tawk';
import { GooeyText } from "../components/ui/gooey-text-morphing";

const Login: React.FC = () => {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
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
        <Login1
          email={email}
          password={password}
          error={error}
          loading={loading}
          onEmailChange={(e) => setEmail(e.target.value)}
          onPasswordChange={(e) => setPassword(e.target.value)}
          onSubmit={handleSubmit}
        />
        <Tawk />
      </div>
    </>
  );
};

export default Login;
