import * as THREE from 'three';
import { Team, WeaponType, WEAPONS } from './types';
import { WorldManager } from './world';

export class Player {
  public mesh: THREE.Group;
  public team: Team;
  public isPlayerControlled: boolean;
  public id: string;
  public name: string;
  public currentWeapon: WeaponType = 'natural';
  public weaponCooldown: number = 0;
  public candleBuffTime: number = 0;
  public isCaptured: boolean = false;
  public isCapturing: boolean = false;
  public captureProgress: number = 0;
  public captureCooldown: number = 0;
  public sprintStamina: number = 100;
  public isSprinting: boolean = false;
  public baseSpeed: number = 11.5;
  public rotationTarget: number = 0;
  public auraMesh: THREE.Mesh;
  public weaponMesh: THREE.Group;
  public animTime: number = 0;

  constructor(
    scene: THREE.Scene,
    team: Team,
    isPlayerControlled: boolean,
    startPos: THREE.Vector3,
    id: string,
    name: string
  ) {
    this.team = team;
    this.isPlayerControlled = isPlayerControlled;
    this.id = id;
    this.name = name;

    this.mesh = new THREE.Group();
    this.createCharacterVisuals(team);
    this.mesh.position.copy(startPos);
    scene.add(this.mesh);

    // Aura de Buff da Vela
    const auraGeo = new THREE.RingGeometry(1.2, 1.6, 16);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    this.auraMesh = new THREE.Mesh(auraGeo, auraMat);
    this.auraMesh.rotation.x = -Math.PI / 2;
    this.auraMesh.position.y = 0.1;
    this.auraMesh.visible = false;
    this.mesh.add(this.auraMesh);

    // Arma visual na mão
    this.weaponMesh = new THREE.Group();
    this.createWeaponVisual();
    this.weaponMesh.position.set(0.65, 1.2, 0.45);
    this.mesh.add(this.weaponMesh);
  }

  private createCharacterVisuals(team: Team) {
    const isOutlaw = team === 'outlaws';

    // Corpo cartoon (Cilindro com cores da gangue ou jaleco médico)
    const bodyColor = isOutlaw ? 0xec4899 : 0x0284c7; // Rosa confeiteiro vs Azul médico cirúrgico
    const bodyGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.5, 12);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.5
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.0;
    body.castShadow = true;
    this.mesh.add(body);

    // Cabeça
    const headGeo = new THREE.SphereGeometry(0.55, 12, 12);
    const headMat = new THREE.MeshStandardMaterial({
      color: isOutlaw ? 0xffedd5 : 0xfef3c7,
      roughness: 0.4
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.15;
    head.castShadow = true;
    this.mesh.add(head);

    // Chapéu especial (Touca de Chef Confeiteiro ou Cruz Médica)
    if (isOutlaw) {
      // Chapéu de Chef de Bolo
      const hatGeo = new THREE.CylinderGeometry(0.7, 0.5, 0.6, 12);
      const hatMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const hat = new THREE.Mesh(hatGeo, hatMat);
      hat.position.y = 2.75;
      this.mesh.add(hat);
    } else {
      // Estetoscópio ou Cruz no peito
      const crossHGeo = new THREE.BoxGeometry(0.6, 0.2, 0.1);
      const crossVGeo = new THREE.BoxGeometry(0.2, 0.6, 0.1);
      const crossMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const ch = new THREE.Mesh(crossHGeo, crossMat);
      const cv = new THREE.Mesh(crossVGeo, crossMat);
      ch.position.set(0, 1.2, 0.7);
      cv.position.set(0, 1.2, 0.7);
      this.mesh.add(ch, cv);
    }

    // Olhos
    const eyeGeo = new THREE.SphereGeometry(0.12, 6, 6);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.2, 2.25, 0.46);
    eyeR.position.set(0.2, 2.25, 0.46);
    this.mesh.add(eyeL, eyeR);
  }

  public updateWeaponVisual(type: WeaponType) {
    this.currentWeapon = type;
    while (this.weaponMesh.children.length > 0) {
      this.weaponMesh.remove(this.weaponMesh.children[0]);
    }
    this.createWeaponVisual();
  }

  private createWeaponVisual() {
    if (this.team === 'medics') {
      // Canhão de Redes / Contenção Médica
      const pipeGeo = new THREE.CylinderGeometry(0.22, 0.3, 1.1, 8);
      const pipeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
      const pipe = new THREE.Mesh(pipeGeo, pipeMat);
      pipe.rotation.x = Math.PI / 2;
      this.weaponMesh.add(pipe);
      return;
    }

    if (this.currentWeapon === 'natural') {
      // Confeitaria de mão / Tubo de Glacê
      const tubeGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.9, 8);
      const tubeMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.rotation.x = Math.PI / 2;
      this.weaponMesh.add(tube);
    } else if (this.currentWeapon === 'rocket') {
      // Bazuca de Bolo Gigante
      const bazGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.4, 8);
      const bazMat = new THREE.MeshStandardMaterial({ color: 0xa855f7 });
      const baz = new THREE.Mesh(bazGeo, bazMat);
      baz.rotation.x = Math.PI / 2;
      this.weaponMesh.add(baz);
    } else if (this.currentWeapon === 'knife') {
      // Faca de Cortar Bolo de Prata
      const bladeGeo = new THREE.BoxGeometry(0.1, 0.2, 1.2);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.8 });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.rotation.x = Math.PI / 2;
      this.weaponMesh.add(blade);
    }
  }

  public update(delta: number, world: WorldManager) {
    this.animTime += delta;

    if (this.weaponCooldown > 0) {
      this.weaponCooldown -= delta;
    }
    if (this.captureCooldown > 0) {
      this.captureCooldown -= delta;
    }
    if (this.candleBuffTime > 0) {
      this.candleBuffTime -= delta;
      this.auraMesh.visible = true;
      this.auraMesh.rotation.z += delta * 4;
    } else {
      this.auraMesh.visible = false;
    }

    // Regulação de Stamina para corrida dos Médicos
    if (this.team === 'medics') {
      if (this.isSprinting && this.sprintStamina > 0) {
        this.sprintStamina = Math.max(0, this.sprintStamina - 28 * delta);
        if (this.sprintStamina <= 0) this.isSprinting = false;
      } else if (!this.isSprinting) {
        this.sprintStamina = Math.min(100, this.sprintStamina + 18 * delta);
      }
    }

    // Se estiver capturado, deita ou fica congelado no chão
    if (this.isCaptured) {
      this.mesh.rotation.z = Math.PI / 2;
      this.mesh.position.y = 0.4;
      return;
    }
  }

  public move(dir: THREE.Vector3, delta: number, world: WorldManager) {
    if (this.isCaptured) return;

    let speed = this.baseSpeed;
    if (this.isSprinting && this.team === 'medics' && this.sprintStamina > 0) {
      speed *= 1.6;
    }

    const moveX = dir.x * speed * delta;
    const moveZ = dir.z * speed * delta;

    const nextX = this.mesh.position.x + moveX;
    const nextZ = this.mesh.position.z + moveZ;

    if (!world.checkCollision(nextX, this.mesh.position.z, 0.75)) {
      this.mesh.position.x = nextX;
    }
    if (!world.checkCollision(this.mesh.position.x, nextZ, 0.75)) {
      this.mesh.position.z = nextZ;
    }

    // Balanço de corrida cartoon
    if (dir.lengthSq() > 0.01) {
      this.mesh.position.y = Math.abs(Math.sin(this.animTime * 12)) * 0.2;
    } else {
      this.mesh.position.y = 0;
    }
  }
}
