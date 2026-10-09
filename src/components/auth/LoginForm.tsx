import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { auth } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

interface LoginFormProps {
  onNavigateToRegister: () => void;
  onSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onNavigateToRegister, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Por favor, informe seu e-mail.');
      return;
    }

    if (!password) {
      setErrorMessage('Por favor, informe sua senha.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await auth.signIn.email({
        email: cleanEmail,
        password: password,
      });

      if (response?.error) {
        let msg = 'Falha ao autenticar. Verifique suas credenciais.';
        const errStr = (response.error.message || '').toLowerCase();
        if (errStr.includes('invalid') || errStr.includes('credential') || errStr.includes('password') || errStr.includes('user not found')) {
          msg = 'E-mail ou senha incorretos. Por favor, tente novamente.';
        } else if (response.error.message) {
          msg = response.error.message;
        }
        setErrorMessage(msg);
        return;
      }

      onSuccess();
    } catch (err: unknown) {
      console.error('Erro de login:', err);
      let friendlyMsg = 'Não foi possível realizar o login. Verifique sua conexão e credenciais.';
      if (err instanceof Error) {
        const msg = err.message.toLowerCase();
        if (msg.includes('invalid') || msg.includes('credential') || msg.includes('password') || msg.includes('user not found')) {
          friendlyMsg = 'E-mail ou senha incorretos. Por favor, tente novamente.';
        } else if (err.message) {
          friendlyMsg = err.message;
        }
      }
      setErrorMessage(friendlyMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/95 backdrop-blur-xl border border-teal-100 rounded-3xl p-8 shadow-xl shadow-teal-900/5">
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size="lg" className="mb-4" />
          <h1 className="text-2xl font-bold text-teal-950">Bem-vindo(a) de volta</h1>
          <p className="text-sm text-teal-700/70 mt-1">
            Acesse o sistema de gestão do seu consultório
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200/80 flex items-start gap-3 text-red-800 text-sm animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="login-email"
            type="email"
            label="E-mail"
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            autoComplete="email"
            required
            disabled={isLoading}
          />

          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            label="Senha"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-teal-600/60 hover:text-teal-800 transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            autoComplete="current-password"
            required
            disabled={isLoading}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full mt-2 font-semibold text-base flex items-center justify-center gap-2"
            isLoading={isLoading}
          >
            <span>Entrar</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-teal-100/80 text-center">
          <p className="text-sm text-teal-800/80">
            Não tem conta?{' '}
            <button
              type="button"
              onClick={onNavigateToRegister}
              disabled={isLoading}
              className="font-semibold text-teal-600 hover:text-teal-700 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20 rounded-md px-1"
            >
              Cadastre-se
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
