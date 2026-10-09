import * as THREE from 'three';
import { MapType, MAPS } from './types';

export interface BoundingBox2D {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export class WorldManager {
  public scene: THREE.Scene;
  public mapType: MapType;
  public obstacles: BoundingBox2D[] = [];
  public buildings: THREE.Mesh[] = [];
  public cityBounds = { minX: -65, maxX: 65, minZ: -65, maxZ: 65 };

  constructor(scene: THREE.Scene, mapType: MapType = 'confectionery') {
    this.scene = scene;
    this.mapType = mapType;
    this.createWorld();
  }

  private createWorld() {
    const config = MAPS[this.mapType];

    // Iluminação adaptada ao tema
    const ambientLight = new THREE.AmbientLight(
      this.mapType === 'wildwest' ? 0xfef3c7 : 0xfff5e6,
      1.3
    );
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(
      this.mapType === 'wildwest' ? 0xf59e0b : 0xffeedd,
      1.8
    );
    dirLight.position.set(45, 60, 35);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    const d = 75;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    this.scene.add(dirLight);

    // Chão temático
    const groundGeo = new THREE.PlaneGeometry(160, 160);
    const groundMat = new THREE.MeshStandardMaterial({
      color: config.groundColor,
      roughness: 0.85
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    if (this.mapType === 'confectionery') {
      this.createConfectioneryWorld();
    } else if (this.mapType === 'wildwest') {
      this.createWildWestWorld();
    } else {
      this.createCityWorld();
    }
  }

  // CENÁRIO 1: CONFEITARIA (Balcões vitrines de doces, mesas de café, bolos gigantes)
  private createConfectioneryWorld() {
    // Piso xadrez central de confeitaria
    const floorGeo = new THREE.PlaneGeometry(70, 70);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.05;
    this.scene.add(floor);

    // Balcões / Vitrines de doces e bolos
    const counters = [
      { x: -25, z: -25, w: 18, d: 8, h: 3.5, color: 0xf472b6 },
      { x: 25, z: -25, w: 18, d: 8, h: 3.5, color: 0xfb7185 },
      { x: -25, z: 25, w: 18, d: 8, h: 3.5, color: 0xc084fc },
      { x: 25, z: 25, w: 18, d: 8, h: 3.5, color: 0x38bdf8 },
      { x: 0, z: -38, w: 28, d: 6, h: 4, color: 0xfbbf24 }
    ];

    counters.forEach(c => {
      // Base do balcão
      const bGeo = new THREE.BoxGeometry(c.w, c.h, c.d);
      const bMat = new THREE.MeshStandardMaterial({ color: c.color, roughness: 0.3 });
      const counterMesh = new THREE.Mesh(bGeo, bMat);
      counterMesh.position.set(c.x, c.h / 2, c.z);
      counterMesh.castShadow = true;
      counterMesh.receiveShadow = true;
      this.scene.add(counterMesh);
      this.buildings.push(counterMesh);

      // Vitrine de vidro doce no topo
      const glassGeo = new THREE.BoxGeometry(c.w - 1, 1.8, c.d - 1);
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.45,
        roughness: 0.1
      });
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.set(c.x, c.h + 0.9, c.z);
      this.scene.add(glass);

      this.obstacles.push({
        minX: c.x - (c.w / 2 + 0.8),
        maxX: c.x + (c.w / 2 + 0.8),
        minZ: c.z - (c.d / 2 + 0.8),
        maxZ: c.z + (c.d / 2 + 0.8)
      });
    });

    // Mesas de café com bolos
    const tables = [
      { x: -12, z: -10 }, { x: 12, z: -10 },
      { x: -12, z: 10 }, { x: 12, z: 10 },
      { x: 0, z: 22 }
    ];

    tables.forEach(t => {
      // Mesa redonda
      const tableGeo = new THREE.CylinderGeometry(2.4, 2.4, 1.2, 16);
      const tableMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const tableMesh = new THREE.Mesh(tableGeo, tableMat);
      tableMesh.position.set(t.x, 0.6, t.z);
      tableMesh.castShadow = true;
      this.scene.add(tableMesh);

      // Bolo decorativo em cima da mesa
      const cakeGeo = new THREE.CylinderGeometry(1.0, 1.1, 0.8, 12);
      const cakeMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.2 });
      const cakeMesh = new THREE.Mesh(cakeGeo, cakeMat);
      cakeMesh.position.set(t.x, 1.6, t.z);
      this.scene.add(cakeMesh);

      this.obstacles.push({
        minX: t.x - 2.8,
        maxX: t.x + 2.8,
        minZ: t.z - 2.8,
        maxZ: t.z + 2.8
      });
    });

    // Fonte Central de Calda de Chocolate e Glacê
    const fountainGeo = new THREE.CylinderGeometry(5, 5.5, 1.6, 20);
    const fountainMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.2 });
    const fountain = new THREE.Mesh(fountainGeo, fountainMat);
    fountain.position.set(0, 0.8, 0);
    this.scene.add(fountain);

    const chocolateGeo = new THREE.SphereGeometry(3.2, 16, 16);
    const chocolateMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.3 });
    const choc = new THREE.Mesh(chocolateGeo, chocolateMat);
    choc.position.set(0, 2.4, 0);
    this.scene.add(choc);

    this.obstacles.push({ minX: -6, maxX: 6, minZ: -6, maxZ: 6 });
  }

  // CENÁRIO 2: VELHO OESTE (Saloons de madeira, barris de chantilly, carroças, postes)
  private createWildWestWorld() {
    // Saloons e Construções de Madeira
    const buildings = [
      { x: -32, z: -25, w: 22, d: 18, h: 9, name: 'SALOON' },
      { x: 32, z: -25, w: 22, d: 18, h: 8, name: 'XERIFE' },
      { x: -32, z: 25, w: 22, d: 18, h: 8, name: 'DOCERIA OESTE' },
      { x: 32, z: 25, w: 22, d: 18, h: 9, name: 'HOTEL DO BOLO' }
    ];

    buildings.forEach(b => {
      // Madeira rústica marrom
      const bGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const bMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
      const mesh = new THREE.Mesh(bGeo, bMat);
      mesh.position.set(b.x, b.h / 2, b.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      this.buildings.push(mesh);

      // Fachada do Saloon / Toldo
      const porchGeo = new THREE.BoxGeometry(b.w, 0.5, 6);
      const porchMat = new THREE.MeshStandardMaterial({ color: 0x92400e });
      const porch = new THREE.Mesh(porchGeo, porchMat);
      porch.position.set(b.x, 3.8, b.z > 0 ? b.z - (b.d / 2 + 3) : b.z + (b.d / 2 + 3));
      this.scene.add(porch);

      this.obstacles.push({
        minX: b.x - (b.w / 2 + 1),
        maxX: b.x + (b.w / 2 + 1),
        minZ: b.z - (b.d / 2 + 1),
        maxZ: b.z + (b.d / 2 + 1)
      });
    });

    // Barris de Chantilly espalhados pelo deserto
    const barrels = [
      { x: -8, z: -12 }, { x: -6, z: -14 },
      { x: 8, z: -12 }, { x: 10, z: -10 },
      { x: -14, z: 6 }, { x: 14, z: 6 },
      { x: 0, z: -18 }, { x: 0, z: 18 }
    ];

    barrels.forEach(pos => {
      const barrelGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.8, 10);
      const barrelMat = new THREE.MeshStandardMaterial({ color: 0xb45309 });
      const barrel = new THREE.Mesh(barrelGeo, barrelMat);
      barrel.position.set(pos.x, 0.9, pos.z);
      barrel.castShadow = true;
      this.scene.add(barrel);

      // Espuma de chantilly saindo do barril
      const foamGeo = new THREE.SphereGeometry(0.6, 8, 8);
      const foamMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
      const foam = new THREE.Mesh(foamGeo, foamMat);
      foam.position.set(pos.x, 1.8, pos.z);
      this.scene.add(foam);

      this.obstacles.push({
        minX: pos.x - 1.2,
        maxX: pos.x + 1.2,
        minZ: pos.z - 1.2,
        maxZ: pos.z + 1.2
      });
    });

    // Carroça de Bolos no Centro Oeste
    const cartGeo = new THREE.BoxGeometry(6, 2, 3.5);
    const cartMat = new THREE.MeshStandardMaterial({ color: 0x92400e });
    const cart = new THREE.Mesh(cartGeo, cartMat);
    cart.position.set(0, 1.6, 0);
    this.scene.add(cart);

    this.obstacles.push({ minX: -4, maxX: 4, minZ: -2.5, maxZ: 2.5 });
  }

  // CENÁRIO 3: CIDADE METRÓPOLE
  private createCityWorld() {
    const blockPositions = [
      { x: -35, z: -35, w: 26, d: 26, color: 0xfbbf24 },
      { x: 35, z: -35, w: 26, d: 26, color: 0x60a5fa },
      { x: -35, z: 35, w: 26, d: 26, color: 0xf472b6 },
      { x: 35, z: 35, w: 26, d: 26, color: 0x34d399 },
      { x: 0, z: -45, w: 16, d: 16, color: 0xa78bfa },
      { x: 0, z: 45, w: 16, d: 16, color: 0xfb923c },
    ];

    blockPositions.forEach((b) => {
      const sidewalkGeo = new THREE.BoxGeometry(b.w + 4, 0.4, b.d + 4);
      const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 });
      const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
      sidewalk.position.set(b.x, 0.2, b.z);
      this.scene.add(sidewalk);

      const h = 10 + Math.random() * 8;
      const bGeo = new THREE.BoxGeometry(b.w, h, b.d);
      const bMat = new THREE.MeshStandardMaterial({
        color: b.color,
        roughness: 0.5,
        transparent: true,
        opacity: 0.95
      });
      const building = new THREE.Mesh(bGeo, bMat);
      building.position.set(b.x, h / 2 + 0.4, b.z);
      building.castShadow = true;
      this.scene.add(building);
      this.buildings.push(building);

      this.obstacles.push({
        minX: b.x - (b.w / 2 + 0.8),
        maxX: b.x + (b.w / 2 + 0.8),
        minZ: b.z - (b.d / 2 + 0.8),
        maxZ: b.z + (b.d / 2 + 0.8)
      });
    });

    const fountainGeo = new THREE.CylinderGeometry(3.5, 4, 1.2, 16);
    const fountainMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const fountain = new THREE.Mesh(fountainGeo, fountainMat);
    fountain.position.set(0, 0.8, 0);
    this.scene.add(fountain);
    this.obstacles.push({ minX: -4.5, maxX: 4.5, minZ: -4.5, maxZ: 4.5 });
  }

  public checkCollision(x: number, z: number, radius = 0.8): boolean {
    if (x < this.cityBounds.minX || x > this.cityBounds.maxX || z < this.cityBounds.minZ || z > this.cityBounds.maxZ) {
      return true;
    }
    for (const b of this.obstacles) {
      if (x + radius >= b.minX && x - radius <= b.maxX && z + radius >= b.minZ && z - radius <= b.maxZ) {
        return true;
      }
    }
    return false;
  }

  public updateBuildingTransparency(playerPos: THREE.Vector3, cameraPos: THREE.Vector3) {
    this.buildings.forEach(b => {
      const bMat = b.material as THREE.MeshStandardMaterial;
      const distToPlayer = b.position.distanceTo(playerPos);
      const isBetween = (b.position.z > playerPos.z && b.position.z < cameraPos.z) &&
                        (Math.abs(b.position.x - playerPos.x) < 14);
      if (isBetween && distToPlayer < 24) {
        bMat.opacity = 0.35;
      } else {
        bMat.opacity = 0.96;
      }
    });
  }
}

