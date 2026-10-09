import * as THREE from 'three';
import { sound } from './sound';
import { WorldManager } from './world';

export interface Projectile {
  mesh: THREE.Mesh;
  direction: THREE.Vector3;
  speed: number;
  remainingDistance: number;
  damage: number;
  splashRadius: number;
  isRocket: boolean;
  isHostile?: boolean;
}

export interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export class CombatManager {
  private scene: THREE.Scene;
  private world: WorldManager;
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];

  constructor(scene: THREE.Scene, world: WorldManager) {
    this.scene = scene;
    this.world = world;
  }

  // Cria bolo disparado
  public spawnProjectile(
    startPos: THREE.Vector3,
    direction: THREE.Vector3,
    speed: number,
    range: number,
    damage: number,
    splashRadius: number,
    isRocket: boolean,
    isHostile: boolean = false
  ) {
    let mesh: THREE.Mesh;

    if (isRocket) {
      // Bolo Foguete: Bolo gigante de 2 andares cilíndrico
      const group = new THREE.Group();
      const baseGeo = new THREE.CylinderGeometry(0.8, 0.9, 0.6, 12);
      const baseMat = new THREE.MeshStandardMaterial({
        color: isHostile ? 0xef4444 : 0xec4899,
        roughness: 0.3
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      group.add(base);

      const topGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.5, 12);
      const topMat = new THREE.MeshStandardMaterial({ color: 0xfef08a });
      const top = new THREE.Mesh(topGeo, topMat);
      top.position.y = 0.55;
      group.add(top);

      const cherryGeo = new THREE.SphereGeometry(0.3, 8, 8);
      const cherryMat = new THREE.MeshStandardMaterial({ color: isHostile ? 0x991b1b : 0xe11d48 });
      const cherry = new THREE.Mesh(cherryGeo, cherryMat);
      cherry.position.y = 0.95;
      group.add(cherry);

      mesh = group as unknown as THREE.Mesh;
    } else {
      // Cupcake / Projétil
      const geo = new THREE.DodecahedronGeometry(0.45);
      const mat = new THREE.MeshStandardMaterial({
        color: isHostile ? 0xf97316 : 0x38bdf8,
        roughness: 0.2
      });
      mesh = new THREE.Mesh(geo, mat);
    }

    mesh.position.copy(startPos);
    mesh.position.y = 1.2;
    this.scene.add(mesh);

    this.projectiles.push({
      mesh,
      direction: direction.clone().normalize(),
      speed,
      remainingDistance: range,
      damage,
      splashRadius,
      isRocket,
      isHostile
    });
  }

  // Explode glacê / creme / cobertura
  public createSplat(position: THREE.Vector3, isBig: boolean = false) {
    sound.playCakeImpact();
    const count = isBig ? 35 : 16;
    const colors = [0xf472b6, 0xfde047, 0x67e8f9, 0xffffff];

    for (let i = 0; i < count; i++) {
      const pGeo = new THREE.SphereGeometry(0.12 + Math.random() * (isBig ? 0.35 : 0.2), 6, 6);
      const pColor = colors[Math.floor(Math.random() * colors.length)];
      const pMat = new THREE.MeshStandardMaterial({ color: pColor, roughness: 0.2 });
      const pMesh = new THREE.Mesh(pGeo, pMat);

      pMesh.position.copy(position);
      pMesh.position.y += 0.5;
      this.scene.add(pMesh);

      const speed = isBig ? 12 : 7;
      const angle = Math.random() * Math.PI * 2;
      const vy = (Math.random() * 0.8 + 0.3) * speed;
      const vx = Math.cos(angle) * (Math.random() * speed);
      const vz = Math.sin(angle) * (Math.random() * speed);

      this.particles.push({
        mesh: pMesh,
        velocity: new THREE.Vector3(vx, vy, vz),
        life: 0,
        maxLife: isBig ? 1.2 : 0.8
      });
    }
  }

  public update(delta: number): Projectile[] {
    const expiredOrHit: Projectile[] = [];

    // Atualiza projéteis
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const moveDist = p.speed * delta;
      p.mesh.position.addScaledVector(p.direction, moveDist);
      p.mesh.rotation.x += delta * 6;
      p.mesh.rotation.y += delta * 8;
      p.remainingDistance -= moveDist;

      // Colisão com prédios/paredes
      if (this.world.checkCollision(p.mesh.position.x, p.mesh.position.z, 0.4) || p.remainingDistance <= 0) {
        this.createSplat(p.mesh.position, p.isRocket);
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
        continue;
      }
    }

    // Atualiza partículas de creme
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life += delta;
      pt.velocity.y -= 18 * delta; // Gravidade
      pt.mesh.position.addScaledVector(pt.velocity, delta);

      if (pt.mesh.position.y < 0.2) {
        pt.mesh.position.y = 0.2;
        pt.velocity.set(0, 0, 0); // Gruda no chão como glacê
      }

      if (pt.life >= pt.maxLife) {
        this.scene.remove(pt.mesh);
        this.particles.splice(i, 1);
      }
    }

    return expiredOrHit;
  }
}
