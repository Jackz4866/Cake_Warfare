import * as THREE from 'three';
import { Player } from './player';
import { WorldManager } from './world';
import { CombatManager } from './combat';
import { NPCManager } from './npcs';
import { CandleManager } from './candles';
import {
  Team,
  GameMode,
  MapType,
  DifficultyLevel,
  WeaponType,
  WEAPONS,
  DEFAULT_SETTINGS
} from './types';
import { BotAI } from './ai';
import { sound } from './sound';

export interface GameState {
  matchTimeRemaining: number;
  matchElapsedSeconds: number;
  hitNpcCount: number;
  targetHitNpcs: number;
  outlawsFreeCount: number;
  totalOutlawsCount: number;
  gameStatus: 'ready' | 'playing' | 'outlaws_win' | 'medics_win' | 'game_over' | 'draw';
  playerTeam: Team;
  playerWeapon: WeaponType;
  playerBuffRemaining: number;
  playerCaptureProgress: number;
  isPlayerCaptured: boolean;
  medicStamina: number;
  recentNotification: string | null;
  // Solo mode
  gameMode: GameMode;
  playerLives: number;
  maxLives: number;
  selectedMap: MapType;
  selectedDifficulty: DifficultyLevel;
}

export class GameManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public world: WorldManager;
  public combat: CombatManager;
  public npcs: NPCManager;
  public candles: CandleManager;

  public player: Player;
  public bots: Player[] = [];
  public gameMode: GameMode;
  public mapType: MapType;
  public difficulty: DifficultyLevel;
  public matchTime: number;
  public matchElapsed: number = 0;
  public hitNpcCount: number = 0;
  public targetHitNpcs: number;
  public playerLives: number;
  public maxLives: number;
  public gameStatus: 'ready' | 'playing' | 'outlaws_win' | 'medics_win' | 'game_over' | 'draw' = 'playing';

  public keysPressed: Record<string, boolean> = {};
  public mousePos: THREE.Vector2 = new THREE.Vector2();
  public raycaster: THREE.Raycaster = new THREE.Raycaster();
  public groundPlane: THREE.Plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  public isPaused: boolean = false;
  public recentNotification: string | null = null;
  public notificationTimer: number = 0;

  private onStateChange: (state: GameState) => void;

  constructor(
    canvas: HTMLCanvasElement,
    chosenTeam: Team,
    mode: GameMode = 'solo',
    mapType: MapType = 'confectionery',
    difficulty: DifficultyLevel = 'medium',
    onStateChange: (state: GameState) => void
  ) {
    this.onStateChange = onStateChange;
    this.gameMode = mode;
    this.mapType = mapType;
    this.difficulty = difficulty;

    const isSolo = mode === 'solo';
    this.matchTime = isSolo ? 900 : DEFAULT_SETTINGS.matchDurationSeconds; // 15 min no Solo
    this.targetHitNpcs = isSolo ? DEFAULT_SETTINGS.soloTargetKills : DEFAULT_SETTINGS.targetHitNpcs; // 100 no Solo!
    this.maxLives = DEFAULT_SETTINGS.soloMaxLives;
    this.playerLives = this.maxLives;

    // Cenário Three.js
    this.scene = new THREE.Scene();
    const skyColor = mapType === 'wildwest' ? 0xfef3c7 : (mapType === 'confectionery' ? 0xfdf2f8 : 0xbae6fd);
    this.scene.background = new THREE.Color(skyColor);
    this.scene.fog = new THREE.Fog(skyColor, 50, 140);

    // Câmera Isométrica / Top-Down angulada
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 250);
    this.camera.position.set(0, 32, 28);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Sistemas com mapa e dificuldade
    this.world = new WorldManager(this.scene, mapType);
    this.combat = new CombatManager(this.scene, this.world);
    this.npcs = new NPCManager(this.scene, this.world, difficulty, isSolo);
    this.candles = new CandleManager(this.scene, this.world, DEFAULT_SETTINGS.candleRespawnSeconds);

    // Cria jogador humano (No solo o jogador sempre joga como Cake Outlaw contra os defensores da cidade)
    const effectiveTeam = isSolo ? 'outlaws' : chosenTeam;
    const playerStartPos = effectiveTeam === 'outlaws'
      ? new THREE.Vector3(-15, 0, -15)
      : new THREE.Vector3(15, 0, 15);

    this.player = new Player(
      this.scene,
      effectiveTeam,
      true,
      playerStartPos,
      'player-1',
      effectiveTeam === 'outlaws' ? 'Confeiteiro Rebelde' : 'Dr. Glicose'
    );

    // Cria Bots apenas se estiver no modo de times!
    if (!isSolo) {
      this.spawnTeamBots(chosenTeam);
    }

    // Inputs e Áudio
    this.setupInputs();
    sound.startBGM();

    const modeDesc = isSolo ? `Modo Solo (${this.targetHitNpcs} Eliminações) - Dificuldade ${difficulty.toUpperCase()}` : `Batalha de Equipes (4 vs 4)`;
    this.notify(`Partida iniciada! ${modeDesc}!`);
  }

  private spawnTeamBots(playerTeam: Team) {
    // Se o humano é outlaw, gera 3 outlaws e 4 médicos bots
    // Se o humano é médico, gera 4 outlaws e 3 médicos bots
    const outlawCount = playerTeam === 'outlaws' ? 3 : 4;
    const medicCount = playerTeam === 'medics' ? 3 : 4;

    for (let i = 0; i < outlawCount; i++) {
      const pos = new THREE.Vector3(-18 + Math.random() * 8, 0, -18 + Math.random() * 8);
      const bot = new Player(this.scene, 'outlaws', false, pos, `bot-outlaw-${i}`, `Outlaw Bot ${i + 1}`);
      this.bots.push(bot);
    }

    for (let i = 0; i < medicCount; i++) {
      const pos = new THREE.Vector3(18 + Math.random() * 8, 0, 18 + Math.random() * 8);
      const bot = new Player(this.scene, 'medics', false, pos, `bot-medic-${i}`, `Médico Bot ${i + 1}`);
      this.bots.push(bot);
    }
  }

  public notify(text: string) {
    this.recentNotification = text;
    this.notificationTimer = 3.5;
  }

  private setupInputs() {
    window.addEventListener('keydown', (e) => {
      this.keysPressed[e.key.toLowerCase()] = true;

      // Troca de armas (1, 2, 3)
      if (e.key === '1' && this.player.team === 'outlaws') this.player.updateWeaponVisual('natural');
      if (e.key === '2' && this.player.team === 'outlaws') this.player.updateWeaponVisual('rocket');
      if (e.key === '3' && this.player.team === 'outlaws') this.player.updateWeaponVisual('knife');

      // Tecla E para captura se for médico
      if (e.key.toLowerCase() === 'e' && this.player.team === 'medics') {
        this.attemptMedicCapture();
      }

      // Tecla Escape para pausar
      if (e.key === 'Escape') {
        this.isPaused = !this.isPaused;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysPressed[e.key.toLowerCase()] = false;
    });

    window.addEventListener('mousemove', (e) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mousePos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mousePos.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0 && this.gameStatus === 'playing') {
        this.handlePlayerAction();
      }
    });
  }

  private handlePlayerAction() {
    if (this.player.isCaptured) return;

    if (this.player.team === 'outlaws') {
      // Dispara arma selecionada
      if (this.player.weaponCooldown > 0) return;

      const weapon = WEAPONS[this.player.currentWeapon];
      this.player.weaponCooldown = weapon.cooldown;

      // Direção para onde o mouse aponta no chão
      const lookDir = new THREE.Vector3();
      this.player.mesh.getWorldDirection(lookDir);

      if (weapon.isMelee) {
        // Bolo-Faca (Melee)
        sound.playKnifeSwing();
        this.combat.createSplat(this.player.mesh.position.clone().addScaledVector(lookDir, 1.8), false);

        // Verifica NPCs no alcance corpo a corpo
        for (let i = 0; i < this.npcs.npcs.length; i++) {
          const npc = this.npcs.npcs[i];
          if (!npc.isHit && this.player.mesh.position.distanceTo(npc.mesh.position) <= weapon.range) {
            if (this.npcs.hitNPC(i)) {
              this.hitNpcCount++;
              this.combat.createSplat(npc.mesh.position, true);
              this.notify('NPC fatiado com bolo! +1 Caos Doce!');
            }
          }
        }
      } else {
        // Armas de projétil (Natural ou Foguete)
        if (weapon.id === 'natural') sound.playNaturalShoot();
        if (weapon.id === 'rocket') sound.playRocketShoot();

        const damageMult = this.player.candleBuffTime > 0 ? 1.8 : 1.0;
        this.combat.spawnProjectile(
          this.player.mesh.position,
          lookDir,
          weapon.projectileSpeed,
          weapon.range,
          weapon.damage * damageMult,
          weapon.splashRadius,
          weapon.id === 'rocket'
        );
      }
    } else {
      // Equipe médica: dispara tentativa de captura ou contenção
      this.attemptMedicCapture();
    }
  }

  private attemptMedicCapture() {
    if (this.player.captureCooldown > 0) return;

    // Encontra criminoso outlaw no alcance
    const targets: Player[] = this.bots.filter(b => b.team === 'outlaws' && !b.isCaptured);
    let capturedOne = false;

    for (const outlaw of targets) {
      const dist = this.player.mesh.position.distanceTo(outlaw.mesh.position);
      if (dist <= DEFAULT_SETTINGS.captureRange) {
        this.player.isCapturing = true;
        this.player.captureProgress += 0.8;
        if (this.player.captureProgress >= DEFAULT_SETTINGS.captureTimeSeconds) {
          outlaw.isCaptured = true;
          this.player.isCapturing = false;
          this.player.captureProgress = 0;
          this.player.captureCooldown = DEFAULT_SETTINGS.captureCooldownSeconds;
          sound.playCaptureAlert();
          this.notify(`Criminoso ${outlaw.name} foi CAPTURADO e algemado!`);
          capturedOne = true;
          break;
        }
      }
    }

    if (!capturedOne) {
      this.player.captureCooldown = 0.5;
    }
  }

  public update(delta: number) {
    if (this.isPaused || this.gameStatus !== 'playing') {
      this.render();
      return;
    }

    // Cronômetro da Partida
    this.matchTime -= delta;
    if (this.matchTime <= 0) {
      this.matchTime = 0;
      this.resolveMatchEnd();
    }

    if (this.notificationTimer > 0) {
      this.notificationTimer -= delta;
      if (this.notificationTimer <= 0) this.recentNotification = null;
    }

    // Movimento Humano via WASD
    const moveDir = new THREE.Vector3();
    if (this.keysPressed['w'] || this.keysPressed['arrowup']) moveDir.z -= 1;
    if (this.keysPressed['s'] || this.keysPressed['arrowdown']) moveDir.z += 1;
    if (this.keysPressed['a'] || this.keysPressed['arrowleft']) moveDir.x -= 1;
    if (this.keysPressed['d'] || this.keysPressed['arrowright']) moveDir.x += 1;

    this.player.isSprinting = !!this.keysPressed['shift'];

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      this.player.move(moveDir, delta, this.world);
    }

    // Mirar mouse no chão
    this.raycaster.setFromCamera(this.mousePos, this.camera);
    const intersectPoint = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(this.groundPlane, intersectPoint)) {
      const angle = Math.atan2(
        intersectPoint.x - this.player.mesh.position.x,
        intersectPoint.z - this.player.mesh.position.z
      );
      this.player.mesh.rotation.y = angle;
    }

    // Atualiza jogador
    this.player.update(delta, this.world);

    // Coleta de Velas
    if (this.candles.checkPickup(this.player.mesh.position, this.player.team === 'outlaws')) {
      this.player.candleBuffTime = DEFAULT_SETTINGS.candleBuffDurationSeconds;
      this.notify('Vela mágica coletada! Dano aumentado e aura doce!');
    }

    // Atualiza IA de Bots
    BotAI.updateBots(this.bots, this.player, delta, this.world, this.combat, this.npcs, this.candles);

    for (const b of this.bots) {
      b.update(delta, this.world);
    }

    // Atualiza NPCs e Velas
    this.matchElapsed += delta;
    this.npcs.update(delta, this.player.mesh.position, this.combat);
    this.candles.update(delta);

    // Atualiza projéteis e checa colisão de tiros contra NPCs e contra o Jogador
    this.combat.update(delta);
    this.checkProjectileCollisions();

    // Acompanhamento suave de câmera
    const targetCamX = this.player.mesh.position.x;
    const targetCamZ = this.player.mesh.position.z + 28;
    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, 0.1);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetCamZ, 0.1);
    this.camera.lookAt(this.player.mesh.position.x, 1, this.player.mesh.position.z);

    // Atualiza transparência de prédios para manter o jogador visível
    this.world.updateBuildingTransparency(this.player.mesh.position, this.camera.position);

    // Checa Condições de Vitória
    this.checkWinConditions();

    // Emite estado atual para a UI
    this.emitState();

    this.render();
  }

  private checkProjectileCollisions() {
    for (let pIdx = this.combat.projectiles.length - 1; pIdx >= 0; pIdx--) {
      const p = this.combat.projectiles[pIdx];

      // Projétil hostil atinge o jogador humano?
      if (p.isHostile) {
        const distToPlayer = p.mesh.position.distanceTo(this.player.mesh.position);
        if (distToPlayer <= 1.4) {
          this.combat.createSplat(this.player.mesh.position, false);
          this.scene.remove(p.mesh);
          this.combat.projectiles.splice(pIdx, 1);

          if (this.gameMode === 'solo') {
            this.playerLives = Math.max(0, this.playerLives - 1);
            sound.playCakeImpact();
            this.notify(`Atingido por brócolis! Vidas restantes: ${this.playerLives}/${this.maxLives}`);

            if (this.playerLives <= 0) {
              this.gameStatus = 'game_over';
              this.notify('FIM DE JOGO! Todas as suas vidas se esgotaram!');
              sound.playCaptureAlert();
            }
          }
          continue;
        }
      }

      // Projétil do jogador atinge NPCs?
      if (!p.isHostile) {
        for (let nIdx = 0; nIdx < this.npcs.npcs.length; nIdx++) {
          const npc = this.npcs.npcs[nIdx];
          if (npc.isHit) continue;

          const dist = p.mesh.position.distanceTo(npc.mesh.position);
          if (dist <= p.splashRadius + 0.8) {
            // Atingiu!
            if (this.npcs.hitNPC(nIdx)) {
              this.hitNpcCount++;
              this.combat.createSplat(npc.mesh.position, p.isRocket);

              // Se for foguete em área, atinge outros NPCs próximos
              if (p.isRocket) {
                for (let k = 0; k < this.npcs.npcs.length; k++) {
                  if (k !== nIdx && !this.npcs.npcs[k].isHit) {
                    if (p.mesh.position.distanceTo(this.npcs.npcs[k].mesh.position) <= p.splashRadius) {
                      this.npcs.hitNPC(k);
                      this.hitNpcCount++;
                    }
                  }
                }
              }

              // Remove projétil
              this.scene.remove(p.mesh);
              this.combat.projectiles.splice(pIdx, 1);
              break;
            }
          }
        }
      }
    }
  }

  private checkWinConditions() {
    // Modo Solo
    if (this.gameMode === 'solo') {
      if (this.hitNpcCount >= this.targetHitNpcs) {
        this.gameStatus = 'outlaws_win';
        sound.playVictory();
        this.notify(`PARABÉNS! Você alcançou a meta de ${this.targetHitNpcs} eliminações de NPCs!`);
        return;
      }
      if (this.playerLives <= 0) {
        this.gameStatus = 'game_over';
        return;
      }
      return;
    }

    // Modo Equipes: 1. Cake Outlaws atingiram a meta de NPCs?
    if (this.hitNpcCount >= this.targetHitNpcs) {
      this.gameStatus = 'outlaws_win';
      sound.playVictory();
      this.notify('VITÓRIA DOS CAKE OUTLAWS! A cidade inteira foi coberta de glacê!');
      return;
    }

    // Modo Equipes: 2. Todos os Outlaws foram capturados?
    const allOutlaws = [
      ...(this.player.team === 'outlaws' ? [this.player] : []),
      ...this.bots.filter(b => b.team === 'outlaws')
    ];
    const freeOutlaws = allOutlaws.filter(o => !o.isCaptured);

    if (freeOutlaws.length === 0) {
      this.gameStatus = 'medics_win';
      sound.playVictory();
      this.notify('VITÓRIA DA EQUIPE MÉDICA! Todos os baderneiros de bolo foram capturados!');
      return;
    }
  }

  private resolveMatchEnd() {
    if (this.gameMode === 'solo') {
      if (this.hitNpcCount >= this.targetHitNpcs) {
        this.gameStatus = 'outlaws_win';
      } else {
        this.gameStatus = 'game_over';
      }
    } else {
      if (this.hitNpcCount >= this.targetHitNpcs) {
        this.gameStatus = 'outlaws_win';
      } else {
        this.gameStatus = 'medics_win';
      }
    }
    sound.playVictory();
  }

  private emitState() {
    const allOutlaws = [
      ...(this.player.team === 'outlaws' ? [this.player] : []),
      ...this.bots.filter(b => b.team === 'outlaws')
    ];
    const freeCount = allOutlaws.filter(o => !o.isCaptured).length;

    this.onStateChange({
      matchTimeRemaining: Math.max(0, Math.ceil(this.matchTime)),
      matchElapsedSeconds: Math.floor(this.matchElapsed),
      hitNpcCount: this.hitNpcCount,
      targetHitNpcs: this.targetHitNpcs,
      outlawsFreeCount: freeCount,
      totalOutlawsCount: allOutlaws.length,
      gameStatus: this.gameStatus,
      playerTeam: this.player.team,
      playerWeapon: this.player.currentWeapon,
      playerBuffRemaining: Math.max(0, Math.ceil(this.player.candleBuffTime)),
      playerCaptureProgress: this.player.captureProgress,
      isPlayerCaptured: this.player.isCaptured,
      medicStamina: this.player.sprintStamina,
      recentNotification: this.recentNotification,
      gameMode: this.gameMode,
      playerLives: this.playerLives,
      maxLives: this.maxLives,
      selectedMap: this.mapType,
      selectedDifficulty: this.difficulty
    });
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  public handleResize() {
    const canvas = this.renderer.domElement;
    this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }

  public destroy() {
    sound.stopBGM();
    this.renderer.dispose();
  }
}
