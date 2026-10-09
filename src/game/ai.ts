import * as THREE from 'three';
import { Player } from './player';
import { WorldManager } from './world';
import { CombatManager } from './combat';
import { NPCManager } from './npcs';
import { CandleManager } from './candles';
import { sound } from './sound';
import { WEAPONS, WeaponType } from './types';

export class BotAI {
  public static updateBots(
    bots: Player[],
    humanPlayer: Player,
    delta: number,
    world: WorldManager,
    combat: CombatManager,
    npcs: NPCManager,
    candles: CandleManager
  ) {
    for (const bot of bots) {
      if (bot.isCaptured) continue;

      if (bot.team === 'outlaws') {
        this.updateOutlawBot(bot, delta, world, combat, npcs, candles);
      } else {
        this.updateMedicBot(bot, humanPlayer, bots, delta, world);
      }
    }
  }

  // Comportamento do Bot Cake Outlaw: Caça NPCs e foge de médicos
  private static updateOutlawBot(
    bot: Player,
    delta: number,
    world: WorldManager,
    combat: CombatManager,
    npcs: NPCManager,
    candles: CandleManager
  ) {
    // Procura NPC não atingido mais próximo
    let closestNpcDist = Infinity;
    let targetNpcPos: THREE.Vector3 | null = null;
    let targetIndex = -1;

    for (let i = 0; i < npcs.npcs.length; i++) {
      const npc = npcs.npcs[i];
      if (npc.isHit) continue;
      const d = bot.mesh.position.distanceTo(npc.mesh.position);
      if (d < closestNpcDist) {
        closestNpcDist = d;
        targetNpcPos = npc.mesh.position;
        targetIndex = i;
      }
    }

    if (targetNpcPos) {
      const dir = new THREE.Vector3().subVectors(targetNpcPos, bot.mesh.position).setY(0).normalize();
      bot.move(dir, delta, world);
      bot.mesh.rotation.y = Math.atan2(dir.x, dir.z);

      // Dispara bolo se estiver perto
      if (closestNpcDist < 25 && bot.weaponCooldown <= 0) {
        const weapon = WEAPONS[bot.currentWeapon];
        bot.weaponCooldown = weapon.cooldown;
        combat.spawnProjectile(
          bot.mesh.position,
          dir,
          weapon.projectileSpeed,
          weapon.range,
          weapon.damage,
          weapon.splashRadius,
          weapon.id === 'rocket'
        );
      }
    }

    // Coleta vela próxima se estiver por perto
    candles.checkPickup(bot.mesh.position, true);
  }

  // Comportamento do Bot Médico: Persegue Cake Outlaws e tenta capturar
  private static updateMedicBot(
    bot: Player,
    humanPlayer: Player,
    allBots: Player[],
    delta: number,
    world: WorldManager
  ) {
    // Alvo prioritário: Cake Outlaws vivos
    const targets: Player[] = [];
    if (humanPlayer.team === 'outlaws' && !humanPlayer.isCaptured) {
      targets.push(humanPlayer);
    }
    for (const b of allBots) {
      if (b.team === 'outlaws' && !b.isCaptured) {
        targets.push(b);
      }
    }

    if (targets.length === 0) return;

    // Acha o mais próximo
    let closestDist = Infinity;
    let target: Player | null = null;
    for (const t of targets) {
      const d = bot.mesh.position.distanceTo(t.mesh.position);
      if (d < closestDist) {
        closestDist = d;
        target = t;
      }
    }

    if (!target) return;

    const dir = new THREE.Vector3().subVectors(target.mesh.position, bot.mesh.position).setY(0).normalize();
    bot.isSprinting = closestDist > 8; // Dá sprint se estiver longe
    bot.move(dir, delta, world);
    bot.mesh.rotation.y = Math.atan2(dir.x, dir.z);

    // Se estiver a menos de 4 metros, inicia captura
    if (closestDist < 4.2 && bot.captureCooldown <= 0) {
      bot.isCapturing = true;
      bot.captureProgress += delta;
      if (bot.captureProgress >= 2.0) {
        // Capturou!
        target.isCaptured = true;
        bot.isCapturing = false;
        bot.captureProgress = 0;
        bot.captureCooldown = 3.0;
        sound.playCaptureAlert();
      }
    } else {
      bot.isCapturing = false;
      bot.captureProgress = Math.max(0, bot.captureProgress - delta * 2);
    }
  }
}
