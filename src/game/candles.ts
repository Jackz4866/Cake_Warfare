import * as THREE from 'three';
import { sound } from './sound';
import { WorldManager } from './world';

export interface CandleItem {
  mesh: THREE.Group;
  light: THREE.PointLight;
  position: THREE.Vector3;
  active: boolean;
  respawnTimer: number;
}

export class CandleManager {
  private scene: THREE.Scene;
  private world: WorldManager;
  public candles: CandleItem[] = [];
  public respawnInterval: number;

  constructor(scene: THREE.Scene, world: WorldManager, respawnInterval: number = 20) {
    this.scene = scene;
    this.world = world;
    this.respawnInterval = respawnInterval;
    this.spawnCandles();
  }

  private spawnCandles() {
    const candleCoords = [
      { x: -18, z: -18 },
      { x: 18, z: -18 },
      { x: -18, z: 18 },
      { x: 18, z: 18 },
      { x: 0, z: -30 },
      { x: 0, z: 30 },
      { x: -30, z: 0 },
      { x: 30, z: 0 }
    ];

    candleCoords.forEach(pos => {
      const group = new THREE.Group();

      // Corpo da vela de aniversário listrada
      const candleGeo = new THREE.CylinderGeometry(0.25, 0.25, 1.4, 12);
      const candleMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        roughness: 0.3
      });
      const candleMesh = new THREE.Mesh(candleGeo, candleMat);
      candleMesh.position.y = 0.7;
      group.add(candleMesh);

      // Pavio e Chama dourada cartoon
      const flameGeo = new THREE.ConeGeometry(0.2, 0.5, 8);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.y = 1.6;
      group.add(flame);

      // Auréola mágica / luz pontual
      const light = new THREE.PointLight(0xf59e0b, 2.5, 6);
      light.position.y = 1.6;
      group.add(light);

      group.position.set(pos.x, 0.4, pos.z);
      this.scene.add(group);

      this.candles.push({
        mesh: group,
        light,
        position: new THREE.Vector3(pos.x, 0.4, pos.z),
        active: true,
        respawnTimer: 0
      });
    });
  }

  public update(delta: number) {
    for (const c of this.candles) {
      if (c.active) {
        // Flutua e gira atraindo a atenção
        c.mesh.rotation.y += delta * 2.5;
        c.mesh.position.y = 0.4 + Math.sin(Date.now() * 0.005) * 0.25;
      } else {
        c.respawnTimer -= delta;
        if (c.respawnTimer <= 0) {
          c.active = true;
          c.mesh.visible = true;
          c.light.intensity = 2.5;
        }
      }
    }
  }

  // Coleta a vela pelo Cake Outlaw
  public checkPickup(playerPos: THREE.Vector3, isOutlaw: boolean): boolean {
    if (!isOutlaw) return false;

    for (const c of this.candles) {
      if (c.active && c.position.distanceTo(playerPos) < 2.2) {
        c.active = false;
        c.mesh.visible = false;
        c.light.intensity = 0;
        c.respawnTimer = this.respawnInterval;
        sound.playCandlePickup();
        return true;
      }
    }
    return false;
  }
}
