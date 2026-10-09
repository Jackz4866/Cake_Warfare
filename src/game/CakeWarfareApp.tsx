import React, { useEffect, useRef, useState } from 'react';
import { GameManager, GameState } from './GameManager';
import {
  Team,
  GameMode,
  MapType,
  DifficultyLevel,
  WEAPONS,
  MAPS,
  DIFFICULTY_SETTINGS
} from './types';
import { sound } from './sound';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Heart,
  Skull,
  Crosshair,
  Timer,
  Swords,
  User,
  Gauge
} from 'lucide-react';

export const CakeWarfareApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameManagerRef = useRef<GameManager | null>(null);

  // Estados de seleção pré-partida
  const [gameMode, setGameMode] = useState<GameMode>('solo');
  const [selectedMap, setSelectedMap] = useState<MapType>('confectionery');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('medium');
  const [selectedTeam, setSelectedTeam] = useState<Team>('outlaws');

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const handleStartGame = () => {
    setIsStarted(true);
  };

  useEffect(() => {
    if (!isStarted || !canvasRef.current) return;

    const gm = new GameManager(
      canvasRef.current,
      selectedTeam,
      gameMode,
      selectedMap,
      selectedDifficulty,
      (state) => {
        setGameState(state);
        if (state.gameStatus === 'outlaws_win' || state.gameStatus === 'medics_win') {
          confetti({ particleCount: 140, spread: 85, origin: { y: 0.6 } });
        }
      }
    );

    gameManagerRef.current = gm;

    let animFrame: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      gm.update(delta);
      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);

    const onResize = () => gm.handleResize();
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', onResize);
      gm.destroy();
    };
  }, [isStarted, selectedTeam, gameMode, selectedMap, selectedDifficulty]);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleRestart = () => {
    if (gameManagerRef.current) {
      gameManagerRef.current.destroy();
      gameManagerRef.current = null;
    }
    setIsStarted(false);
    setGameState(null);
  };

  // MENU INICIAL: SELEÇÃO DE MODO, CENÁRIO E DIFICULDADE
  if (!isStarted) {
    return (
      <div className="relative w-screen h-screen overflow-y-auto bg-gradient-to-br from-amber-100 via-pink-100 to-sky-200 flex items-center justify-center font-sans text-slate-800 p-4">
        <div className="max-w-4xl w-full my-auto p-6 sm:p-8 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-pink-400 relative z-10 space-y-6">
          {/* Cabeçalho */}
          <div className="text-center">
            <div className="inline-block px-4 py-1.5 bg-pink-500 text-white font-extrabold rounded-full text-xs uppercase tracking-widest mb-2 shadow-md">
              🍰 Ação & Comédia 3D
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-pink-600 tracking-tight drop-shadow-sm">
              CAKE WARFARE
            </h1>
            <p className="text-slate-600 text-sm max-w-xl mx-auto mt-1">
              Personalize sua batalha doce: escolha o modo de jogo, o cenário 3D e o nível de desafio dos NPCs!
            </p>
          </div>

          {/* 1. SELEÇÃO DE MODO DE JOGO */}
          <div>
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5 mb-2.5">
              <Swords className="w-4 h-4 text-pink-500" />
              1. Modo de Jogo:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGameMode('solo')}
                className={`p-4 rounded-2xl border-3 text-left transition-all flex items-start gap-3 ${
                  gameMode === 'solo'
                    ? 'border-pink-500 bg-pink-50/80 shadow-md ring-2 ring-pink-400/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-pink-500 text-white shadow-sm">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    Modo Individual (Solo)
                    <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-black">100 KILLS</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Você contra o mundo! Elimine 100 civis e defensores enquanto gerencia suas 5 vidas. Respawn contínuo de NPCs!
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('teams')}
                className={`p-4 rounded-2xl border-3 text-left transition-all flex items-start gap-3 ${
                  gameMode === 'teams'
                    ? 'border-sky-500 bg-sky-50/80 shadow-md ring-2 ring-sky-400/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-sky-500 text-white shadow-sm">
                  <Swords className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    Batalha em Equipe (4 vs 4)
                    <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-black">ASSIMÉTRICO</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Cake Outlaws (rebeldes armados com bolos) contra a Equipe Médica com sistema de captura de contenção.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* ESCOLHA DE EQUIPE (SE MODO DE TIMES) */}
          {gameMode === 'teams' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider block mb-2">
                Escolha seu Time:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTeam('outlaws')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    selectedTeam === 'outlaws'
                      ? 'bg-pink-600 text-white shadow-md'
                      : 'bg-white border text-slate-700'
                  }`}
                >
                  🎂 Cake Outlaws
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTeam('medics')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    selectedTeam === 'medics'
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'bg-white border text-slate-700'
                  }`}
                >
                  🚑 Equipe Médica
                </button>
              </div>
            </div>
          )}

          {/* 2. SELEÇÃO DE CENÁRIOS (CARTÕES VISUAIS COM PRÉVIA) */}
          <div>
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5 mb-2.5">
              <span>🗺️</span>
              2. Cenário da Cidade:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(Object.keys(MAPS) as MapType[]).map((mapKey) => {
                const map = MAPS[mapKey];
                const isSelected = selectedMap === mapKey;
                return (
                  <button
                    key={mapKey}
                    type="button"
                    onClick={() => setSelectedMap(mapKey)}
                    className={`p-4 rounded-2xl border-3 text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-pink-500 bg-pink-50/80 shadow-md ring-2 ring-pink-400/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">{map.previewEmoji}</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {map.badge}
                        </span>
                      </div>
                      <div className="font-extrabold text-sm text-slate-900">{map.name}</div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-3 leading-snug">
                        {map.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. SELEÇÃO DE DIFICULDADE (FÁCIL, MÉDIO, DIFÍCIL) */}
          <div>
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5 mb-2.5">
              <Gauge className="w-4 h-4 text-pink-500" />
              3. Nível de Dificuldade dos NPCs:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(Object.keys(DIFFICULTY_SETTINGS) as DifficultyLevel[]).map((diffKey) => {
                const diff = DIFFICULTY_SETTINGS[diffKey];
                const isSelected = selectedDifficulty === diffKey;
                return (
                  <button
                    key={diffKey}
                    type="button"
                    onClick={() => setSelectedDifficulty(diffKey)}
                    className={`p-3.5 rounded-2xl border-3 text-left transition-all ${
                      isSelected
                        ? 'border-pink-500 bg-pink-50/80 shadow-md ring-2 ring-pink-400/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-sm text-slate-900">{diff.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Limite: {diff.maxConcurrentNpcs} NPCs
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{diff.description}</p>
                    <div className="mt-2 text-[10px] font-semibold text-pink-600/80 flex items-center gap-1">
                      <Crosshair className="w-3 h-3" />
                      {diffKey === 'easy' && 'Erros de tiro frequentes'}
                      {diffKey === 'medium' && 'Erros moderados / equilibrado'}
                      {diffKey === 'hard' && 'Alta precisão e tiro rápido'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BOTÃO JOGAR AGORA */}
          <button
            type="button"
            onClick={handleStartGame}
            className="w-full py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-pink-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 border-2 border-white/50"
          >
            🍰 INICIAR CAKE WARFARE 3D
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none font-sans">
      {/* Canvas 3D */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* HUD SUPERIOR */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20 pointer-events-none">
        {/* Tempo de Partida */}
        <div className="bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-2xl text-white font-mono font-black text-sm sm:text-base shadow-xl border border-white/20 flex items-center gap-1.5">
          <Timer className="w-4 h-4 text-amber-400" />
          {gameState ? formatTime(gameState.matchElapsedSeconds) : '0:00'}
        </div>

        {/* VIDAS RESTANTES (SE MODO SOLO) */}
        {gameState?.gameMode === 'solo' ? (
          <div className="bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-2xl text-white shadow-xl border border-white/20 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">Vidas:</span>
            <div className="flex gap-1">
              {Array.from({ length: gameState.maxLives }).map((_, idx) => (
                <Heart
                  key={idx}
                  className={`w-5 h-5 transition-all ${
                    idx < gameState.playerLives
                      ? 'text-rose-500 fill-rose-500 animate-pulse'
                      : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Criminosos Livres (SE MODO TEAMS) */
          <div className="bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-2xl text-white font-bold text-xs sm:text-sm shadow-xl border border-white/20 flex items-center gap-2">
            🚨 Livres:
            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-extrabold">
              {gameState?.outlawsFreeCount || 0} / {gameState?.totalOutlawsCount || 4}
            </span>
          </div>
        )}

        {/* Barra de Progresso de Eliminações / Caos Doce */}
        <div className="bg-slate-900/85 backdrop-blur-md p-2.5 px-4 rounded-2xl text-white shadow-xl border border-white/20 min-w-[240px] sm:min-w-[280px]">
          <div className="flex justify-between items-center text-xs font-bold mb-1">
            <span className="flex items-center gap-1 text-pink-400">
              🧁 {gameState?.gameMode === 'solo' ? 'Eliminações:' : 'NPCs Glaceados:'}
            </span>
            <span className="text-yellow-400 font-mono">
              {gameState?.hitNpcCount || 0} / {gameState?.targetHitNpcs || 100}
            </span>
          </div>
          <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-500 via-rose-400 to-amber-300 h-full transition-all duration-200"
              style={{
                width: `${Math.min(100, ((gameState?.hitNpcCount || 0) / (gameState?.targetHitNpcs || 100)) * 100)}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* BOTÕES DE CONTROLE SUPERIOR DIREITO */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <button
          onClick={toggleSound}
          className="p-3 bg-white/90 hover:bg-white text-slate-800 rounded-2xl shadow-lg border border-slate-200 transition-transform active:scale-95"
          title="Alternar Áudio"
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-emerald-600" />}
        </button>
        <button
          onClick={handleRestart}
          className="p-3 bg-white/90 hover:bg-white text-slate-800 rounded-2xl shadow-lg border border-slate-200 transition-transform active:scale-95 flex items-center gap-1 font-bold text-sm"
          title="Reiniciar"
        >
          <RotateCcw className="w-5 h-5 text-sky-600" />
        </button>
      </div>

      {/* NOTIFICAÇÃO CENTRAL FLUTUANTE */}
      {gameState?.recentNotification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 px-6 py-2 bg-yellow-400 text-slate-900 font-extrabold text-xs sm:text-sm rounded-full shadow-2xl border-2 border-white animate-bounce z-20 pointer-events-none">
          ✨ {gameState.recentNotification}
        </div>
      )}

      {/* HUD INFERIOR ESQUERDO: ARMAS (1, 2, 3) */}
      <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
        {gameState?.playerTeam === 'outlaws' ? (
          <div className="bg-slate-900/85 backdrop-blur-md p-3.5 rounded-3xl text-white border border-white/20 shadow-2xl space-y-2.5">
            <div className="text-[11px] uppercase tracking-wider text-pink-400 font-bold flex items-center gap-1">
              🎂 Armas Disponíveis (Teclas 1, 2, 3):
            </div>
            <div className="flex gap-2">
              {(['natural', 'rocket', 'knife'] as const).map((key, idx) => {
                const w = WEAPONS[key];
                const isActive = gameState?.playerWeapon === key;
                return (
                  <div
                    key={key}
                    className={`px-3 py-2 rounded-2xl border-2 flex items-center gap-2 transition-all ${
                      isActive
                        ? 'border-pink-400 bg-pink-600/40 text-white font-bold scale-105 shadow-lg shadow-pink-500/30'
                        : 'border-slate-700 bg-slate-800/60 text-slate-400'
                    }`}
                  >
                    <span className="text-xl">{w.icon}</span>
                    <div className="text-left leading-tight">
                      <div className="text-xs font-black">{idx + 1}. {w.name}</div>
                      <div className="text-[10px] opacity-75">{w.isMelee ? 'Corpo a corpo' : `${w.damage} Dano`}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Buff de Vela */}
            {gameState?.playerBuffRemaining > 0 && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/30 border border-amber-400 text-amber-200 text-xs font-bold flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-300" />
                Vela Dourada Ativa! +80% Dano Doce ({gameState.playerBuffRemaining}s)
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-900/85 backdrop-blur-md p-4 rounded-3xl text-white border border-white/20 shadow-2xl space-y-2 min-w-[240px]">
            <div className="text-xs uppercase tracking-wider text-sky-400 font-bold flex items-center gap-1">
              🚑 Equipamento Médico de Contenção
            </div>
            <div className="text-xs text-slate-300">
              Pressione <strong>E</strong> perto de um Cake Outlaw para capturá-lo!
            </div>
            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                <span>Energia de Corrida (Shift):</span>
                <span>{Math.round(gameState?.medicStamina || 0)}%</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full transition-all"
                  style={{ width: `${gameState?.medicStamina || 0}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TELA DE FIM DE PARTIDA (VITÓRIA / GAME OVER) */}
      {(gameState?.gameStatus === 'outlaws_win' ||
        gameState?.gameStatus === 'medics_win' ||
        gameState?.gameStatus === 'game_over') && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-40 p-4">
          <div className="bg-white p-8 rounded-3xl max-w-lg w-full text-center shadow-2xl border-4 border-amber-400 transform animate-scaleIn">
            <span className="text-6xl mb-3 block">
              {gameState.gameStatus === 'outlaws_win'
                ? '🎂🏆'
                : gameState.gameStatus === 'game_over'
                ? '💀'
                : '🚑🏅'}
            </span>
            <h2 className="text-3xl font-black text-slate-900 mb-2">
              {gameState.gameStatus === 'outlaws_win'
                ? 'VITÓRIA! META ALCANÇADA!'
                : gameState.gameStatus === 'game_over'
                ? 'FIM DE JOGO - VIDAS ESGOTADAS'
                : 'VITÓRIA DA EQUIPE MÉDICA!'}
            </h2>
            <p className="text-slate-600 text-sm mb-6">
              {gameState.gameStatus === 'outlaws_win'
                ? `Você completou todas as ${gameState.targetHitNpcs} eliminações com sucesso!`
                : gameState.gameStatus === 'game_over'
                ? 'Você perdeu todas as suas vidas enfrentando os defensores da cidade!'
                : 'A equipe médica capturou com sucesso todos os criminosos de bolo com segurança!'}
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 text-sm text-slate-700 flex justify-around">
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase">Eliminações</div>
                <div className="text-2xl font-black text-pink-600">{gameState.hitNpcCount}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase">Tempo de Jogo</div>
                <div className="text-2xl font-black text-slate-700">
                  {formatTime(gameState.matchElapsedSeconds)}
                </div>
              </div>
            </div>

            <button
              onClick={handleRestart}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-extrabold text-base rounded-2xl shadow-lg hover:shadow-pink-500/40 hover:scale-105 active:scale-95 transition-all"
            >
              Jogar Novamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CakeWarfareApp;

