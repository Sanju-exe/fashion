import * as THREE from 'three';

let scene, camera, renderer, animationId;
let avatarGroup, shirtMesh, bodyGroup;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let currentRotation = { x: 0, y: 0 };
let targetRotation = { x: 0, y: 0 };

export function init3DAvatar(container, garment, measurements = {}) {
  // Clear any existing children
  container.innerHTML = '';
  const width = container.clientWidth || 600;
  const height = container.clientHeight || 550;

  // 1. Scene & Camera
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0b0f);

  camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
  camera.position.set(0, 0.2, 3.2);

  // 2. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // 3. Studio Lighting
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1a1a24, 1.2);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.0);
  keyLight.position.set(2, 3, 3);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
  fillLight.position.set(-2, 1, 2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xff007f, 1.5);
  rimLight.position.set(0, 3, -3);
  scene.add(rimLight);

  // 4. Construct Anatomical Avatar Group
  avatarGroup = new THREE.Group();
  scene.add(avatarGroup);

  bodyGroup = new THREE.Group();
  avatarGroup.add(bodyGroup);

  // Skin PBR Material
  const skinMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4a373,
    roughness: 0.55,
    metalness: 0.05
  });

  // Torso base
  const torsoGeo = new THREE.CylinderGeometry(0.38, 0.32, 0.95, 32);
  const torsoMesh = new THREE.Mesh(torsoGeo, skinMaterial);
  torsoMesh.position.y = 0;
  bodyGroup.add(torsoMesh);

  // Chest volume
  const chestGeo = new THREE.SphereGeometry(0.39, 32, 16);
  chestGeo.scale(1.0, 0.65, 0.85);
  const chestMesh = new THREE.Mesh(chestGeo, skinMaterial);
  chestMesh.position.set(0, 0.22, 0.04);
  bodyGroup.add(chestMesh);

  // Neck & Head
  const neckGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.25, 24);
  const neckMesh = new THREE.Mesh(neckGeo, skinMaterial);
  neckMesh.position.y = 0.58;
  bodyGroup.add(neckMesh);

  const headGeo = new THREE.SphereGeometry(0.20, 32, 32);
  headGeo.scale(0.85, 1.05, 0.95);
  const headMesh = new THREE.Mesh(headGeo, skinMaterial);
  headMesh.position.y = 0.82;
  bodyGroup.add(headMesh);

  // Shoulders & Arms
  const shoulderGeo = new THREE.SphereGeometry(0.15, 24, 24);
  const leftShoulder = new THREE.Mesh(shoulderGeo, skinMaterial);
  leftShoulder.position.set(-0.46, 0.38, 0);
  bodyGroup.add(leftShoulder);

  const rightShoulder = new THREE.Mesh(shoulderGeo, skinMaterial);
  rightShoulder.position.set(0.46, 0.38, 0);
  bodyGroup.add(rightShoulder);

  const armGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.75, 24);
  const leftArm = new THREE.Mesh(armGeo, skinMaterial);
  leftArm.position.set(-0.52, 0.02, 0);
  leftArm.rotation.z = 0.12;
  bodyGroup.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, skinMaterial);
  rightArm.position.set(0.52, 0.02, 0);
  rightArm.rotation.z = -0.12;
  bodyGroup.add(rightArm);

  // 5. 3D Draped Shirt Layer
  const textureLoader = new THREE.TextureLoader();
  const shirtTex = textureLoader.load(garment.image || garment.cutout);
  shirtTex.wrapS = THREE.RepeatWrapping;
  shirtTex.wrapT = THREE.RepeatWrapping;

  const shirtMat = new THREE.MeshStandardMaterial({
    map: shirtTex,
    roughness: 0.7,
    bumpScale: 0.05,
    side: THREE.DoubleSide
  });

  const shirtGeo = new THREE.CylinderGeometry(0.42, 0.36, 1.05, 36, 16, true);
  shirtMesh = new THREE.Mesh(shirtGeo, shirtMat);
  shirtMesh.position.y = 0.02;
  avatarGroup.add(shirtMesh);

  // Sleeves for shirt
  const sleeveGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.55, 24, 1, true);
  const leftSleeve = new THREE.Mesh(sleeveGeo, shirtMat);
  leftSleeve.position.set(-0.53, 0.12, 0);
  leftSleeve.rotation.z = 0.12;
  avatarGroup.add(leftSleeve);

  const rightSleeve = new THREE.Mesh(sleeveGeo, shirtMat);
  rightSleeve.position.set(0.53, 0.12, 0);
  rightSleeve.rotation.z = -0.12;
  avatarGroup.add(rightSleeve);

  // 6. Anatomical Measurement Indicators
  createMeasurementRings(avatarGroup, measurements);

  // 7. Interactive Orbit Controls (Mouse Drag & Touch)
  const dom = renderer.domElement;

  const onPointerDown = (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    targetRotation.y += deltaX * 0.008;
    targetRotation.x = Math.max(-0.4, Math.min(0.4, targetRotation.x + deltaY * 0.008));

    previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = () => { isDragging = false; };

  dom.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  // Zoom wheel
  dom.addEventListener('wheel', (e) => {
    e.preventDefault();
    camera.position.z = Math.max(2.0, Math.min(4.5, camera.position.z + e.deltaY * 0.002));
  }, { passive: false });

  // 8. Render Animation Loop
  function animate() {
    animationId = requestAnimationFrame(animate);

    // Smooth inertia interpolation
    currentRotation.x += (targetRotation.x - currentRotation.x) * 0.1;
    currentRotation.y += (targetRotation.y - currentRotation.y) * 0.1;

    if (avatarGroup) {
      avatarGroup.rotation.y = currentRotation.y;
      avatarGroup.rotation.x = currentRotation.x;
    }

    renderer.render(scene, camera);
  }
  animate();

  return {
    updateGarment: (newGarment) => {
      const newTex = textureLoader.load(newGarment.image || newGarment.cutout);
      shirtMat.map = newTex;
      shirtMat.needsUpdate = true;
    },
    updateProportions: (scaleChest, scaleShoulder, scaleWaist) => {
      if (shirtMesh && bodyGroup) {
        bodyGroup.scale.set(scaleShoulder, 1.0, scaleChest);
        shirtMesh.scale.set(scaleShoulder * 1.03, 1.0, scaleChest * 1.03);
      }
    },
    destroy: () => {
      if (animationId) cancelAnimationFrame(animationId);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
    }
  };
}

function createMeasurementRings(parent, measurements) {
  // Chest Circumference Ring
  const chestCurve = new THREE.EllipseCurve(0, 0, 0.44, 0.38, 0, 2 * Math.PI, false, 0);
  const chestPoints = chestCurve.getPoints(50);
  const chestGeo = new THREE.BufferGeometry().setFromPoints(chestPoints.map(p => new THREE.Vector3(p.x, 0, p.y)));
  const ringMat = new THREE.LineDashedMaterial({ color: 0x00f3ff, dashSize: 0.04, gapSize: 0.02, linewidth: 2 });
  const chestRing = new THREE.Line(chestGeo, ringMat);
  chestRing.computeLineDistances();
  chestRing.position.set(0, 0.22, 0.02);
  parent.add(chestRing);

  // Waist Circumference Ring
  const waistCurve = new THREE.EllipseCurve(0, 0, 0.38, 0.32, 0, 2 * Math.PI, false, 0);
  const waistPoints = waistCurve.getPoints(50);
  const waistGeo = new THREE.BufferGeometry().setFromPoints(waistPoints.map(p => new THREE.Vector3(p.x, 0, p.y)));
  const waistMat = new THREE.LineDashedMaterial({ color: 0xff007f, dashSize: 0.04, gapSize: 0.02, linewidth: 2 });
  const waistRing = new THREE.Line(waistGeo, waistMat);
  waistRing.computeLineDistances();
  waistRing.position.set(0, -0.32, 0);
  parent.add(waistRing);

  // Shoulder Breadth Line
  const shoulderLineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-0.48, 0.38, 0.12),
    new THREE.Vector3(0.48, 0.38, 0.12)
  ]);
  const shoulderMat = new THREE.LineBasicMaterial({ color: 0xd4af37, linewidth: 2 });
  const shoulderLine = new THREE.Line(shoulderLineGeo, shoulderMat);
  parent.add(shoulderLine);
}
