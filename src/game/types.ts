export type Team = 'outlaws' | 'medics';

export type GameMode = 'teams' | 'solo';

export type MapType = 'confectionery' | 'wildwest' | 'city';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type WeaponType = 'natural' | 'rocket' | 'knife';

export interface WeaponConfig {
  id: WeaponType;
  name: string;
  description: string;
  damage: number;
  cooldown: number; // in seconds
  range: number;
  isMelee: boolean;
  projectileSpeed: number;
  splashRadius: number;
  icon: string;
}

export const WEAPONS: Record<WeaponType, WeaponConfig> = {
  natural: {
    id: 'natural',
    name: 'Bolo Natural',
    description: 'Dispara bolinhos em sequência com alta cadência e recarga rápida.',
    damage: 15,
    cooldown: 0.22,
    range: 38,
    isMelee: false,
    projectileSpeed: 38,
    splashRadius: 1.0,
    icon: '🧁'
  },
  rocket: {
    id: 'rocket',
    name: 'Bolo-Foguete',
    description: 'Bolo gigante de artilharia com impacto em área e grande explosão de creme.',
    damage: 75,
    cooldown: 1.8,
    range: 50,
    isMelee: false,
    projectileSpeed: 22,
    splashRadius: 5.5,
    icon: '🎂'
  },
  knife: {
    id: 'knife',
    name: 'Bolo-Faca',
    description: 'Arma corpo a corpo que atinge instantaneamente no alcance próximo com muito glacê.',
    damage: 120,
    cooldown: 0.65,
    range: 3.2,
    isMelee: true,
    projectileSpeed: 0,
    splashRadius: 2.2,
    icon: '🍰'
  }
};

export interface DifficultyConfig {
  id: DifficultyLevel;
  name: string;
  description: string;
  npcSpeedMultiplier: number;
  shootCooldownMultiplier: number;
  accuracyInaccuracyAngle: number; // Radianos de desvio aleatório de tiro
  maxConcurrentNpcs: number;
  npcShootRange: number;
  reactionDelay: number;
}

export const DIFFICULTY_SETTINGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    id: 'easy',
    name: 'Fácil',
    description: 'NPCs mais lentos, reação demorada, disparos pouco frequentes e erros frequentes de mira.',
    npcSpeedMultiplier: 0.75,
    shootCooldownMultiplier: 2.2,
    accuracyInaccuracyAngle: 0.45, // Desvio amplo de mira (~26 graus)
    maxConcurrentNpcs: 20,
    npcShootRange: 18,
    reactionDelay: 1.2
  },
  medium: {
    id: 'medium',
    name: 'Médio',
    description: 'Velocidade e disparos moderados com taxa equilibrada de acertos e desvios.',
    npcSpeedMultiplier: 1.0,
    shootCooldownMultiplier: 1.4,
    accuracyInaccuracyAngle: 0.22, // Desvio moderado (~12 graus)
    maxConcurrentNpcs: 28,
    npcShootRange: 24,
    reactionDelay: 0.7
  },
  hard: {
    id: 'hard',
    name: 'Difícil',
    description: 'NPCs rápidos e agressivos, disparos constantes, mais inimigos simultâneos e alta precisão.',
    npcSpeedMultiplier: 1.35,
    shootCooldownMultiplier: 0.85,
    accuracyInaccuracyAngle: 0.08, // Desvio pequeno (~4.5 graus)
    maxConcurrentNpcs: 36,
    npcShootRange: 32,
    reactionDelay: 0.35
  }
};

export interface MapConfig {
  id: MapType;
  name: string;
  badge: string;
  description: string;
  themeColor: string;
  previewEmoji: string;
  groundColor: number;
  skyColor: number;
}

export const MAPS: Record<MapType, MapConfig> = {
  confectionery: {
    id: 'confectionery',
    name: 'Confeitaria Imperial',
    badge: 'Ambiente Gourmet',
    description: 'Ambiente gastronômico repleto de balcões vitrines de doces, mesas de café, bolos gigantes e fontes de calda.',
    themeColor: '#ec4899',
    previewEmoji: '🧁',
    groundColor: 0xfce7f3, // Rosa confeitaria claro
    skyColor: 0xfdf2f8
  },
  wildwest: {
    id: 'wildwest',
    name: 'Velho Oeste Doce',
    badge: 'Fronteira Saloon',
    description: 'Cidade de faroeste com saloons de madeira rústica, barris de chantilly, carroças e áreas abertas para duelos.',
    themeColor: '#d97706',
    previewEmoji: '🤠',
    groundColor: 0xd97706, // Terra/areia do deserto
    skyColor: 0xfef3c7
  },
  city: {
    id: 'city',
    name: 'Metrópole Brócolis',
    badge: 'Urbano Clássico',
    description: 'Ruas asfaltadas, calçadas, praça central, chafariz de glacê e árvores de brócolis gigantes.',
    themeColor: '#0284c7',
    previewEmoji: '🏙️',
    groundColor: 0x475569,
    skyColor: 0xbae6fd
  }
};

export interface GameSettings {
  mode: GameMode;
  map: MapType;
  difficulty: DifficultyLevel;
  matchDurationSeconds: number;
  targetHitNpcs: number;
  candleBuffDurationSeconds: number;
  candleRespawnSeconds: number;
  captureTimeSeconds: number;
  captureRange: number;
  captureCooldownSeconds: number;
  teamSize: number;
  medicSprintDuration: number;
  medicSprintMaxStamina: number;
  soloMaxLives: number;
  soloTargetKills: number;
}

export const DEFAULT_SETTINGS: GameSettings = {
  mode: 'solo',
  map: 'confectionery',
  difficulty: 'medium',
  matchDurationSeconds: 600, // 10 min no solo para cumprir a meta
  targetHitNpcs: 20,
  candleBuffDurationSeconds: 10,
  candleRespawnSeconds: 20,
  captureTimeSeconds: 2.0,
  captureRange: 4.2,
  captureCooldownSeconds: 3.0,
  teamSize: 4,
  medicSprintDuration: 4.0,
  medicSprintMaxStamina: 100,
  soloMaxLives: 5,
  soloTargetKills: 100
};

