import React from 'react';
import { LogOut, Users, Calendar, Apple, CheckCircle2, ShieldCheck, HeartPulse } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';

interface DashboardProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  onSignOut: () => Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onSignOut }) => {
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3faf9] flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-teal-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo size="md" />

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-teal-950">
                {user.name || 'Nutricionista'}
              </span>
              <span className="text-xs text-teal-600/80">{user.email}</span>
            </div>

            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-400 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              {(user.name || user.email || 'N').charAt(0).toUpperCase()}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              isLoading={isSigningOut}
              className="flex items-center gap-1.5 text-xs text-teal-800 border-teal-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 p-8 sm:p-10 text-white shadow-xl shadow-teal-900/10">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Sessão autenticada e protegida com Neon Auth</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Olá, {user.name || 'Nutricionista'}! 👋
            </h1>
            <p className="mt-2 text-teal-50 text-base sm:text-lg leading-relaxed">
              Bem-vindo(a) ao painel do <strong>Nutri Help</strong>. Sua conta está configurada e sincronizada diretamente com a base de dados do Neon.
            </p>
          </div>

          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <HeartPulse className="w-80 h-80 text-white" />
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-teal-100/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">Pacientes</p>
                <h3 className="text-3xl font-bold text-teal-950 mt-1">0</h3>
                <p className="text-xs text-teal-600/70 mt-1">Cadastros ativos</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-teal-100/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">Consultas</p>
                <h3 className="text-3xl font-bold text-teal-950 mt-1">0</h3>
                <p className="text-xs text-teal-600/70 mt-1">Agendadas este mês</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-teal-100/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">Planos Alimentares</p>
                <h3 className="text-3xl font-bold text-teal-950 mt-1">0</h3>
                <p className="text-xs text-teal-600/70 mt-1">Prescrições personalizadas</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Apple className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status Card */}
        <div className="bg-white rounded-3xl p-8 border border-teal-100 shadow-xs">
          <h2 className="text-xl font-bold text-teal-950 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-teal-600" />
            Status da Autenticação e Dados do Perfil
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-teal-50/50 p-6 rounded-2xl border border-teal-100/60">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-teal-700/70 block">
                Nome do Nutricionista
              </span>
              <span className="font-semibold text-teal-950 text-base">{user.name || 'Não informado'}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-teal-700/70 block">
                E-mail cadastrado
              </span>
              <span className="font-semibold text-teal-950 text-base">{user.email}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-teal-700/70 block">
                Identificador Único (ID)
              </span>
              <span className="font-mono text-xs text-teal-800 bg-teal-100/60 px-2 py-1 rounded inline-block mt-0.5">
                {user.id}
              </span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-teal-700/70 block">
                Segurança RLS (Row Level Security)
              </span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Ativo no Neon Postgres
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
