import * as THREE from "three";

/**
 * High-definition, friendly floating companion robot model.
 * Features high-contrast glossy porcelain shell, deep obsidian glass visor,
 * glowing LED facial expressions, and natural articulated waving arms.
 */
export function createRobotModel() {
  // 1. High-contrast premium materials
  const shellMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.16,
    metalness: 0.04,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
  });

  const darkTrimMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.3,
    metalness: 0.5,
  });

  const blueAccentMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x4f46e5,
    roughness: 0.2,
    metalness: 0.3,
    clearcoat: 0.8,
  });

  const cyanGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
  });

  const visorMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x060913,
    roughness: 0.04,
    metalness: 0.3,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
  });

  const robot = new THREE.Group();

  // Helper for adding smooth meshes
  const addSphere = (
    parent: THREE.Object3D,
    material: THREE.Material,
    pos: [number, number, number],
    scale: [number, number, number],
    geom = new THREE.SphereGeometry(1, 48, 36)
  ) => {
    const mesh = new THREE.Mesh(geom, material);
    mesh.position.set(...pos);
    mesh.scale.set(...scale);
    parent.add(mesh);
    return mesh;
  };

  // ================= HEAD =================
  const head = new THREE.Group();
  head.position.y = 0.55;
  robot.add(head);

  // Outer glossy white head shell
  addSphere(head, shellMaterial, [0, 0, 0], [1.12, 0.96, 0.95]);

  // Deep obsidian curved visor on the front face
  addSphere(head, visorMaterial, [0, -0.03, 0.46], [0.92, 0.68, 0.52]);

  // ================= LED FACE CANVAS SCREEN =================
  const faceCanvas = document.createElement("canvas");
  faceCanvas.width = 1024;
  faceCanvas.height = 640;
  const fctx = faceCanvas.getContext("2d")!;
  const faceTexture = new THREE.CanvasTexture(faceCanvas);
  faceTexture.colorSpace = THREE.SRGBColorSpace;
  faceTexture.anisotropy = 4;

  const PHI = 0.96;
  const THETA = 0.74;
  const faceScreen = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 40, Math.PI / 2 - PHI, PHI * 2, Math.PI / 2 - THETA, THETA * 2),
    new THREE.MeshBasicMaterial({
      map: faceTexture,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    })
  );
  faceScreen.position.set(0, -0.03, 0.465);
  faceScreen.scale.set(0.925, 0.685, 0.525);
  faceScreen.renderOrder = 3;
  head.add(faceScreen);

  let lastDrawnKey = "";
  const drawFace = (mood: string, blink: number, t: number, eyeColor: string) => {
    const isWaving = mood === "happy" || mood === "waving";
    const lookX = mood === "thinking" ? 36 : 0;
    const lookY = mood === "thinking" ? -24 : 0;
    const scanProgress = mood === "analyzing" ? Math.floor((t * 80) % 100) : 0;

    const key = `${mood}|${blink.toFixed(2)}|${eyeColor}|${scanProgress}`;
    if (key === lastDrawnKey) return;
    lastDrawnKey = key;

    const W = faceCanvas.width;
    const H = faceCanvas.height;
    fctx.clearRect(0, 0, W, H);
    fctx.save();

    fctx.fillStyle = eyeColor;
    fctx.strokeStyle = eyeColor;
    fctx.shadowColor = eyeColor;
    fctx.lineCap = "round";

    const eyeW = 120;
    const eyeH = 160;
    const centerY = H * 0.48 + lookY;

    // Draw Left and Right eyes
    [W * 0.33, W * 0.67].forEach((centerX0, idx) => {
      const cx = centerX0 + lookX;

      if (isWaving) {
        // Joyful smiling crescent eyes ^ ^
        fctx.lineWidth = 32;
        fctx.shadowBlur = 45;
        fctx.beginPath();
        fctx.arc(cx, centerY + 36, 68, Math.PI * 1.15, Math.PI * 1.85);
        fctx.stroke();

        // Extra cute blush circles
        fctx.fillStyle = "rgba(244, 114, 182, 0.5)";
        fctx.beginPath();
        fctx.ellipse(cx + (idx === 0 ? -25 : 25), centerY + 105, 38, 16, 0, 0, Math.PI * 2);
        fctx.fill();
        fctx.fillStyle = eyeColor;
        return;
      }

      const h = Math.max(12, eyeH * blink);

      // 1. Soft ambient eye glow
      fctx.shadowBlur = 60;
      fctx.globalAlpha = 0.5;
      fctx.beginPath();
      fctx.roundRect(cx - eyeW / 2 - 12, centerY - h / 2 - 12, eyeW + 24, h + 24, 48);
      fctx.fill();

      // 2. Crisp bright core
      fctx.globalAlpha = 1.0;
      fctx.shadowBlur = 28;
      fctx.beginPath();
      fctx.roundRect(cx - eyeW / 2, centerY - h / 2, eyeW, h, 42);
      fctx.fill();

      // 3. Anime glossy catchlights (sparkle reflection)
      if (blink > 0.65) {
        fctx.shadowBlur = 0;
        fctx.fillStyle = "#ffffff";
        // Main top-left sparkle
        fctx.beginPath();
        fctx.ellipse(cx - 24, centerY - h * 0.22, 18, 25, -0.3, 0, Math.PI * 2);
        fctx.fill();

        // Secondary bottom-right sparkle
        fctx.beginPath();
        fctx.arc(cx + 26, centerY + h * 0.22, 9, 0, Math.PI * 2);
        fctx.fill();

        fctx.fillStyle = eyeColor;
      }
    });

    // Mouth
    fctx.globalAlpha = 0.95;
    fctx.shadowBlur = 22;
    fctx.lineWidth = 16;
    fctx.beginPath();
    if (mood === "thinking") {
      fctx.moveTo(W * 0.46, H * 0.81);
      fctx.lineTo(W * 0.54, H * 0.80);
    } else {
      const radius = isWaving ? 55 : 38;
      fctx.arc(W * 0.5, H * 0.72, radius, Math.PI * 0.16, Math.PI * 0.84);
    }
    fctx.stroke();

    // Analyzing laser scanline
    if (mood === "analyzing") {
      fctx.globalAlpha = 0.65;
      fctx.shadowBlur = 35;
      const scanY = H * 0.22 + (scanProgress / 100) * H * 0.58;
      fctx.fillRect(W * 0.2, scanY, W * 0.6, 6);
    }

    fctx.restore();
    faceTexture.needsUpdate = true;
  };

  // ================= HEADPHONE PODS & ANTENNA =================
  [-1, 1].forEach((side) => {
    // Outer headphone pod
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.2, 48), shellMaterial);
    pod.rotation.z = Math.PI / 2;
    pod.position.set(side * 1.1, -0.02, 0);
    head.add(pod);

    // Glowing cyan accent ring
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 16, 48), cyanGlowMaterial);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(side * 1.21, -0.02, 0);
    head.add(ring);

    // Inner dark disc
    const innerDisc = new THREE.Mesh(new THREE.CircleGeometry(0.15, 32), blueAccentMaterial);
    innerDisc.rotation.y = side * (Math.PI / 2);
    innerDisc.position.set(side * 1.205, -0.02, 0);
    head.add(innerDisc);
  });

  // Antenna on head
  const antennaBase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.08, 24), darkTrimMaterial);
  antennaBase.position.y = 0.94;
  head.add(antennaBase);

  const antennaStem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 0.22, 16), darkTrimMaterial);
  antennaStem.position.y = 1.05;
  head.add(antennaStem);

  const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.085, 32, 24), cyanGlowMaterial);
  antennaTip.position.y = 1.18;
  head.add(antennaTip);

  // ================= NECK & BODY =================
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.16, 32), darkTrimMaterial);
  neck.position.y = -0.16;
  robot.add(neck);

  // Smooth pear-shaped floating torso (egg-shaped, tapered bottom)
  const bodyGeo = new THREE.SphereGeometry(0.58, 48, 36);
  const pos = bodyGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y < 0) {
      const taper = 1 + y * 0.42;
      pos.setX(i, pos.getX(i) * taper);
      pos.setZ(i, pos.getZ(i) * taper);
    }
  }
  bodyGeo.computeVertexNormals();

  const body = new THREE.Mesh(bodyGeo, shellMaterial);
  body.scale.set(1.0, 1.06, 0.92);
  body.position.y = -0.72;
  robot.add(body);

  // Glowing chest reactor core
  const coreBezel = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.025, 16, 48), blueAccentMaterial);
  coreBezel.position.set(0, -0.6, 0.51);
  coreBezel.rotation.x = -0.25;
  robot.add(coreBezel);

  const core = new THREE.Mesh(new THREE.CircleGeometry(0.11, 32), cyanGlowMaterial);
  core.position.set(0, -0.6, 0.515);
  core.rotation.x = -0.25;
  robot.add(core);

  // Bottom thruster light
  const thrusterCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.16, 0.38, 32, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  thrusterCone.rotation.x = Math.PI;
  thrusterCone.position.y = -1.42;
  robot.add(thrusterCone);

  // ================= CUTE NATURAL ARTICULATED ARMS =================
  // Left Arm (Robot's right): Natural resting arm with gentle floating motion
  const armLGroup = new THREE.Group();
  armLGroup.position.set(-0.58, -0.45, 0.02);
  robot.add(armLGroup);

  // Shoulder ball
  const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 24), shellMaterial);
  armLGroup.add(shoulderL);

  // Arm segment
  const armLMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.24, 16, 24), shellMaterial);
  armLMesh.position.set(-0.06, -0.22, 0.05);
  armLMesh.rotation.z = -0.25;
  armLMesh.rotation.x = 0.15;
  armLGroup.add(armLMesh);

  // Cute mitten hand
  const handLMesh = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 24), shellMaterial);
  handLMesh.scale.set(0.9, 1.15, 0.85);
  handLMesh.position.set(-0.11, -0.44, 0.1);
  armLGroup.add(handLMesh);

  // Right Arm (Robot's left): Waving arm! Naturally raised and articulated!
  const armRGroup = new THREE.Group();
  armRGroup.position.set(0.58, -0.45, 0.02);
  robot.add(armRGroup);

  // Shoulder ball
  const shoulderR = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 24), shellMaterial);
  armRGroup.add(shoulderR);

  // Upper arm segment - angled naturally upward for greeting
  const armRUpper = new THREE.Group();
  armRGroup.add(armRUpper);

  const armRMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.24, 16, 24), shellMaterial);
  armRMesh.position.set(0.12, 0.16, 0.08);
  armRMesh.rotation.z = -0.7;
  armRMesh.rotation.x = 0.2;
  armRUpper.add(armRMesh);

  // Cute waving forearm & hand
  const handRGroup = new THREE.Group();
  handRGroup.position.set(0.24, 0.32, 0.14);
  armRUpper.add(handRGroup);

  const handRMesh = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 24), shellMaterial);
  handRMesh.scale.set(1.15, 1.25, 0.85);
  handRGroup.add(handRMesh);

  // Palm blue light accent
  const handRLight = new THREE.Mesh(new THREE.CircleGeometry(0.05, 16), cyanGlowMaterial);
  handRLight.position.set(0, 0, 0.12);
  handRGroup.add(handRLight);

  return {
    robot,
    head,
    body,
    armL: armLGroup,
    armR: armRGroup,
    handR: handRGroup,
    core,
    antennaTip,
    thrusterCone,
    glow: cyanGlowMaterial,
    drawFace,
  };
}
