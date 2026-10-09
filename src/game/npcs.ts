import * as THREE from 'three';
import { WorldManager } from './world';
import { CombatManager } from './combat';
import { DifficultyConfig, DIFFICULTY_SETTINGS, DifficultyLevel } from './types';
import { sound } from './sound';

export interface NPCItem {
  id: number;
  mesh: THREE.Group;
  broccoli: THREE.Mesh;
  direction: THREE.Vector3;
  speed: number;
  changeTimer: number;
  isHit: boolean;
  hitFrosting: THREE.Mesh;
  chewTimer: number;
  shootCooldown: number;
  isHostile: boolean;
}

export class NPCManager {
  private scene: THREE.Scene;
  private world: WorldManager;
  private nextId: number = 0;
  public npcs: NPCItem[] = [];
  public difficultyConfig: DifficultyConfig;
  public isSoloMode: boolean = false;
  private spawnTimer: number = 0;

  constructor(
    scene: THREE.Scene,
    world: WorldManager,
    difficulty: DifficultyLevel = 'medium',
    isSolo: boolean = false
  ) {
    this.scene = scene;
    this.world = world;
    this.difficultyConfig = DIFFICULTY_SETTINGS[difficulty];
    this.isSoloMode = isSolo;

    // Inicializa até a capacidade simultânea da dificuldade
    const initialCount = Math.min(this.difficultyConfig.maxConcurrentNpcs, 24);
    for (let i = 0; i < initialCount; i++) {
      this.spawnSingleCivilian();
    }
  }

  public setDifficulty(level: DifficultyLevel) {
    this.difficultyConfig = DIFFICULTY_SETTINGS[level];
  }

  private spawnSingleCivilian() {
    let x = (Math.random() - 0.5) * 100;
    let z = (Math.random() - 0.5) * 100;

    let attempts = 0;
    while (this.world.checkCollision(x, z, 1.2) && attempts < 15) {
      x = (Math.random() - 0.5) * 100;
      z = (Math.random() - 0.5) * 100;
      attempts++;
    }

    const npcGroup = new THREE.Group();

    // No modo Solo, alguns NPCs são guardas/policiais do brócolis que disparam contra o jogador
    const isHostile = this.isSoloMode;
    const bodyColor = isHostile
      ? (Math.random() > 0.4 ? 0x059669 : 0x0284c7)
      : [0x38bdf8, 0xa855f7, 0xf97316, 0x10b981, 0xeab308][Math.floor(Math.random() * 5)];

    const bodyGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.3, 10);
    const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.6 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.95;
    body.castShadow = true;
    npcGroup.add(body);

    const headGeo = new THREE.SphereGeometry(0.48, 12, 12);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.4 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.95;
    head.castShadow = true;
    npcGroup.add(head);

    const eyeGeo = new THREE.SphereGeometry(0.12, 6, 6);
    const eyeMat = new THREE.MeshBasicMaterial({ color: isHostile ? 0x991b1b : 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.18, 2.05, 0.4);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.18, 2.05, 0.4);
    npcGroup.add(leftEye, rightEye);

    // Brócolis / Arma de brócolis
    const stalkGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.5, 6);
    const stalkMat = new THREE.MeshStandardMaterial({ color: 0x86efac });
    const broccoliStalk = new THREE.Mesh(stalkGeo, stalkMat);

    const brocHeadGeo = new THREE.DodecahedronGeometry(0.28);
    const brocHeadMat = new THREE.MeshStandardMaterial({ color: 0x15803d });
    const brocHead = new THREE.Mesh(brocHeadGeo, brocHeadMat);
    brocHead.position.y = 0.28;

    const broccoliGroup = new THREE.Group();
    broccoliGroup.add(broccoliStalk, brocHead);
    broccoliGroup.position.set(0.5, 1.2, 0.45);
    broccoliGroup.rotation.x = Math.PI / 4;
    npcGroup.add(broccoliGroup);

    // Cobertura de bolo
    const frostingGeo = new THREE.SphereGeometry(0.65, 10, 10);
    const frostingMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      roughness: 0.2,
      metalness: 0.1
    });
    const frosting = new THREE.Mesh(frostingGeo, frostingMat);
    frosting.position.y = 1.85;
    frosting.scale.set(1.1, 1.2, 1.1);
    frosting.visible = false;
    npcGroup.add(frosting);

    npcGroup.position.set(x, 0, z);
    this.scene.add(npcGroup);

    const angle = Math.random() * Math.PI * 2;
    this.npcs.push({
      id: this.nextId++,
      mesh: npcGroup,
      broccoli: broccoliGroup as unknown as THREE.Mesh,
      direction: new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)),
      speed: (2.0 + Math.random() * 1.5) * this.difficultyConfig.npcSpeedMultiplier,
      changeTimer: 2 + Math.random() * 4,
      isHit: false,
      hitFrosting: frosting,
      chewTimer: Math.random() * 2,
      shootCooldown: (1.5 + Math.random() * 3) * this.difficultyConfig.shootCooldownMultiplier,
      isHostile
    });
  }

  public update(
    delta: number,
    playerPos?: THREE.Vector3,
    combat?: CombatManager,
    onPlayerHit?: () => void
  ) {
    // Respawn contínuo no Modo Solo
    if (this.isSoloMode) {
      this.spawnTimer += delta;
      const activeUnHitNpcs = this.npcs.filter(n => !n.isHit).length;
      if (this.spawnTimer >= 0.8 && activeUnHitNpcs < this.difficultyConfig.maxConcurrentNpcs) {
        this.spawnTimer = 0;
        this.spawnSingleCivilian();
      }
    }

    // Limpa NPCs mortos/atingidos muito antigos se houver excesso
    if (this.npcs.length > this.difficultyConfig.maxConcurrentNpcs + 15) {
      const hitIndex = this.npcs.findIndex(n => n.isHit);
      if (hitIndex !== -1) {
        this.scene.remove(this.npcs[hitIndex].mesh);
        this.npcs.splice(hitIndex, 1);
      }
    }

    for (let i = 0; i < this.npcs.length; i++) {
      const npc = this.npcs[i];
      npc.changeTimer -= delta;
      npc.chewTimer += delta * 6;
      if (npc.shootCooldown > 0) npc.shootCooldown -= delta;

      if (!npc.isHit) {
        npc.broccoli.position.y = 1.2 + Math.sin(npc.chewTimer) * 0.12;

        // IA DE TIRO COM DESVIO ALEATÓRIO (ITEM 3 E 4)
        if (this.isSoloMode && npc.isHostile && playerPos && combat && npc.shootCooldown <= 0) {
          const distToPlayer = npc.mesh.position.distanceTo(playerPos);

          if (distToPlayer <= this.difficultyConfig.npcShootRange) {
            npc.shootCooldown = (1.8 + Math.random() * 2.5) * this.difficultyConfig.shootCooldownMultiplier;

            // Calcula direção base ao jogador
            const baseDir = new THREE.Vector3()
              .subVectors(playerPos, npc.mesh.position)
              .setY(0)
              .normalize();

            // SISTEMA DE MIRA COM DESVIO ALEATÓRIO (ERRO DE TIRO BASEADO NA DIFICULDADE E DISTÂNCIA)
            const distanceErrorFactor = Math.min(2.0, 0.6 + distToPlayer / 20.0);
            const maxDeviationAngle = this.difficultyConfig.accuracyInaccuracyAngle * distanceErrorFactor;
            const deviationAngle = (Math.random() - 0.5) * 2 * maxDeviationAngle;

            const finalDir = baseDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), deviationAngle);

            // Dispara projétil hostil que segue trajetória fixa
            combat.spawnProjectile(
              npc.mesh.position,
              finalDir,
              26, // Velocidade fixa que permite desvio pelo jogador
              distToPlayer + 12,
              20,
              1.2,
              false,
              true // isHostile
            );

            sound.playNaturalShoot();
          }
        }
      } else {
        npc.mesh.rotation.z = Math.sin(npc.chewTimer * 1.5) * 0.15;
      }

      // Movimentação
      if (npc.changeTimer <= 0) {
        const angle = Math.random() * Math.PI * 2;
        npc.direction.set(Math.cos(angle), 0, Math.sin(angle));
        npc.changeTimer = 3 + Math.random() * 4;
      }

      const move = npc.direction.clone().multiplyScalar(npc.speed * delta);
      const newX = npc.mesh.position.x + move.x;
      const newZ = npc.mesh.position.z + move.z;

      if (!this.world.checkCollision(newX, newZ, 1.0)) {
        npc.mesh.position.x = newX;
        npc.mesh.position.z = newZ;
        npc.mesh.rotation.y = Math.atan2(npc.direction.x, npc.direction.z);
      } else {
        npc.direction.negate();
        const randOffset = (Math.random() - 0.5) * 1.5;
        npc.direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), randOffset);
        npc.changeTimer = 2.0;
      }

      npc.mesh.position.y = Math.abs(Math.sin(npc.chewTimer * 0.8)) * 0.15;
    }
  }

  public hitNPC(npcIndex: number): boolean {
    const npc = this.npcs[npcIndex];
    if (!npc) return false;
    if (npc.isHit) return false;

    npc.isHit = true;
    npc.hitFrosting.visible = true;
    npc.speed *= 1.6;
    return true;
  }
}

