import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { auth } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

interface RegisterFormProps {
  onNavigateToLogin: () => void;
  onSuccess: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onNavigateToLogin, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }

    if (!cleanEmail) {
      setErrorMessage('Por favor, informe seu e-mail.');
      return;
    }

    // Regra do prompt 2: A senha deve ter no mínimo 9 caracteres
    if (password.length < 9) {
      setErrorMessage('A senha deve ter no mínimo 9 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem. Por favor, verifique.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await auth.signUp.email({
        email: cleanEmail,
        password: password,
        name: cleanName,
      });

      if (response?.error) {
        let msg = 'Não foi possível concluir o cadastro.';
        const errStr = (response.error.message || '').toLowerCase();
        if (errStr.includes('already exists') || errStr.includes('unique') || errStr.includes('duplicate')) {
          msg = 'Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.';
        } else if (response.error.message) {
          msg = response.error.message;
        }
        setErrorMessage(msg);
        return;
      }

      onSuccess();
    } catch (err: unknown) {
      console.error('Erro de cadastro:', err);
      let friendlyMsg = 'Não foi possível criar sua conta. Tente novamente em instantes.';
      if (err instanceof Error) {
        const msg = err.message.toLowerCase();
        if (msg.includes('already exists') || msg.includes('unique') || msg.includes('duplicate')) {
          friendlyMsg = 'Este e-mail já está cadastrado. Tente fazer login.';
        } else if (err.message) {
          friendlyMsg = err.message;
        }
      }
      setErrorMessage(friendlyMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const isLengthValid = password.length >= 9;
  const isMatch = password.length > 0 && password === confirmPassword;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/95 backdrop-blur-xl border border-teal-100 rounded-3xl p-8 shadow-xl shadow-teal-900/5">
        <div className="flex flex-col items-center text-center mb-6">
          <Logo size="lg" className="mb-4" />
          <h1 className="text-2xl font-bold text-teal-950">Criar nova conta</h1>
          <p className="text-sm text-teal-700/70 mt-1">
            Cadastre-se como nutricionista no Nutri Help
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200/80 flex items-start gap-3 text-red-800 text-sm animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="register-name"
            type="text"
            label="Nome Completo"
            placeholder="Ex.: Dra. Mariana Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            autoComplete="name"
            required
            disabled={isLoading}
          />

          <Input
            id="register-email"
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

          <div>
            <Input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              label="Senha"
              placeholder="Mínimo de 9 caracteres"
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
              autoComplete="new-password"
              required
              disabled={isLoading}
            />
            {password.length > 0 && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                {isLengthValid ? (
                  <span className="text-emerald-700 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Senha com tamanho adequado ({password.length}/9)
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium">
                    Faltam {9 - password.length} caracteres para atingir o mínimo de 9
                  </span>
                )}
              </div>
            )}
          </div>

          <div>
            <Input
              id="register-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirmar Senha"
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-teal-600/60 hover:text-teal-800 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              autoComplete="new-password"
              required
              disabled={isLoading}
            />
            {confirmPassword.length > 0 && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                {isMatch ? (
                  <span className="text-emerald-700 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Senhas conferem
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">
                    As senhas ainda não coincidem
                  </span>
                )}
              </div>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full mt-4 font-semibold text-base flex items-center justify-center gap-2"
            isLoading={isLoading}
          >
            <span>Criar conta</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-teal-100/80 text-center">
          <p className="text-sm text-teal-800/80">
            Já tem conta?{' '}
            <button
              type="button"
              onClick={onNavigateToLogin}
              disabled={isLoading}
              className="font-semibold text-teal-600 hover:text-teal-700 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20 rounded-md px-1"
            >
              Faça login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
