import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Heart, Mail, Lock } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (type: 'tutor' | 'veterinarian') => {
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);
    const success = await login(email, password, type);
    setLoading(false);

    if (success) {
      toast.success('Login realizado com sucesso!');
      navigate(type === 'tutor' ? '/tutor/dashboard' : '/vet/dashboard');
    } else {
      toast.error('Erro ao fazer login');
    }
  };

  return (
    <div className="mobile-container gradient-hero min-h-screen">
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-primary rounded-3xl flex items-center justify-center shadow-lg">
            <Heart className="w-10 h-10 text-primary-foreground" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">UNIVET</h1>
          <p className="text-muted-foreground text-sm">
            Sistema Integrado de Gestão Veterinária
          </p>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-sm mobile-card space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              E-mail
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              onClick={() => handleLogin('tutor')}
              disabled={loading}
              className="w-full h-12 text-base font-semibold gradient-primary"
            >
              Entrar como Tutor
            </Button>
            
            <Button
              onClick={() => handleLogin('veterinarian')}
              disabled={loading}
              variant="outline"
              className="w-full h-12 text-base font-semibold"
            >
              Entrar como Veterinário
            </Button>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => navigate('/register')}
              className="text-sm text-primary font-medium hover:underline"
            >
              Não tem conta? Cadastre-se
            </button>
          </div>
        </div>

        {/* Demo info */}
        <div className="mt-6 text-center text-xs text-muted-foreground max-w-sm">
          <p>Use qualquer e-mail e senha para criar uma conta demo</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
