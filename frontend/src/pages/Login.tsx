import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Heart, Mail, Lock } from 'lucide-react';
import UnivetLogo from '@/assets/univet-logo.png';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);
    const loggedUser = await login(email, password, 'tutor'); 
    // OBS: esse "tutor" não importa mais; a role real vem do backend.
    setLoading(false);

    if (loggedUser) {
      toast.success('Login realizado com sucesso!');

      if (loggedUser.type === 'veterinarian') {
        navigate('/vet/dashboard');
      } else {
        navigate('/tutor/dashboard');
      }
    } else {
      toast.error('Credenciais inválidas');
    }
  };

  return (
    <div className="mobile-container gradient-hero min-h-screen">
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <img
            src={UnivetLogo}
            alt="UnVet"
            className="mx-auto mb-4 w-40 max-w-[70%]"
          />
          <p className="text-muted-foreground text-sm">
            Sistema Integrado de Gestão Veterinária
          </p>
        </div>



        {/* Login Form */}
        <div className="w-full max-w-sm mobile-card space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
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
            <Label htmlFor="password">Senha</Label>
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

          <div className="pt-2">
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-12 text-base font-semibold gradient-primary"
            >
              Realizar login
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

      </div>
    </div>
  );
};

export default Login;
