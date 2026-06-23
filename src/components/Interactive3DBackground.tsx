'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Create a realistic 3D racket group procedurally
function createRacketMesh(colorGlow: string): THREE.Group {
  const racketGroup = new THREE.Group();
  
  // Metallic Frame Material
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorGlow),
    metalness: 0.9,
    roughness: 0.15,
    envMapIntensity: 1.0,
  });

  // 1. Torus Hoop (Frame) - Enlarged: 1.55 radius
  const torusGeom = new THREE.TorusGeometry(1.55, 0.052, 12, 64);
  const torusMesh = new THREE.Mesh(torusGeom, frameMaterial);
  torusMesh.scale.set(1, 1.25, 1); // Oval stretch: Y height becomes 1.55 * 1.25 = 1.9375
  racketGroup.add(torusMesh);

  // 2. String Grid (Thin cylinders)
  const stringMaterial = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    roughness: 0.3,
    metalness: 0.1,
    transparent: true,
    opacity: 0.5,
  });
  const strThick = 0.0045;

  // Verticals
  for (let i = -5; i <= 5; i++) {
    const x = i * 0.26;
    const h = Math.sqrt(1 - (x / 1.55) ** 2) * 1.9375; // height boundary of oval torus
    if (h > 0.1) {
      const geom = new THREE.CylinderGeometry(strThick, strThick, h * 2, 4);
      const mesh = new THREE.Mesh(geom, stringMaterial);
      mesh.position.set(x, 0, 0);
      racketGroup.add(mesh);
    }
  }

  // Horizontals
  for (let i = -7; i <= 7; i++) {
    const y = i * 0.24;
    const w = Math.sqrt(1 - (y / 1.9375) ** 2) * 1.55; // width boundary of oval torus
    if (w > 0.1) {
      const geom = new THREE.CylinderGeometry(strThick, strThick, w * 2, 4);
      const mesh = new THREE.Mesh(geom, stringMaterial);
      mesh.rotation.z = Math.PI / 2;
      mesh.position.set(0, y, 0);
      racketGroup.add(mesh);
    }
  }

  // 3. T-Joint and Shaft (Cylinders) - Extended
  const shaftGeom = new THREE.CylinderGeometry(0.024, 0.024, 3.0, 8);
  const shaftMesh = new THREE.Mesh(shaftGeom, frameMaterial);
  shaftMesh.position.set(0, -3.4375, 0); // Position below the hoop (-1.9375 - 1.5)
  racketGroup.add(shaftMesh);

  // Joint cap accent
  const jointGeom = new THREE.CylinderGeometry(0.045, 0.035, 0.22, 8);
  const jointMesh = new THREE.Mesh(jointGeom, frameMaterial);
  jointMesh.position.set(0, -1.95, 0);
  racketGroup.add(jointMesh);

  // 4. Handle (Hexagonal Cylinder Grip)
  const handleGeom = new THREE.CylinderGeometry(0.075, 0.08, 1.0, 6);
  const handleMaterial = new THREE.MeshStandardMaterial({
    color: 0x181818, // dark leather grip tape
    roughness: 0.8,
    metalness: 0.0,
  });
  const handleMesh = new THREE.Mesh(handleGeom, handleMaterial);
  handleMesh.position.set(0, -5.4375, 0); // Position below the shaft
  racketGroup.add(handleMesh);

  // Grip tape wrap lines
  const wrapMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.9,
  });
  for (let i = 0; i < 4; i++) {
    const ringGeom = new THREE.TorusGeometry(0.08, 0.005, 4, 16);
    const ring = new THREE.Mesh(ringGeom, wrapMaterial);
    ring.position.set(0, -5.0 - i * 0.24, 0);
    ring.rotation.x = Math.PI / 2 + 0.1;
    racketGroup.add(ring);
  }

  // Cap base
  const capGeom = new THREE.CylinderGeometry(0.085, 0.085, 0.07, 8);
  const capMesh = new THREE.Mesh(capGeom, frameMaterial);
  capMesh.position.set(0, -5.9675, 0);
  racketGroup.add(capMesh);

  return racketGroup;
}

// Create a realistic 3D shuttlecock procedurally - Reduced by 25%
function createShuttleMesh(): THREE.Group {
  const shuttleGroup = new THREE.Group();

  // 1. Cork Base (Hemisphere) - Smaller: 0.135 radius
  const corkGeom = new THREE.SphereGeometry(0.135, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const corkMaterial = new THREE.MeshStandardMaterial({
    color: 0xfbfbfb,
    roughness: 0.45,
    metalness: 0.02,
  });
  const corkMesh = new THREE.Mesh(corkGeom, corkMaterial);
  corkMesh.rotation.x = Math.PI; // point cork dome down
  shuttleGroup.add(corkMesh);

  // Green binding band at flat edge of cork
  const bandGeom = new THREE.TorusGeometry(0.135, 0.012, 8, 32);
  const bandMaterial = new THREE.MeshStandardMaterial({
    color: 0x00c853, // UNN Green band
    roughness: 0.5,
  });
  const bandMesh = new THREE.Mesh(bandGeom, bandMaterial);
  bandMesh.rotation.x = Math.PI / 2;
  shuttleGroup.add(bandMesh);

  // 2. Feathers Cone (16 quills + flat vanes) - Scaled down
  const feathersGroup = new THREE.Group();
  const featherMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.95,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
  });

  const count = 16;
  const height = 0.31;
  const baseR = 0.13;
  const topR = 0.26;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const xStart = Math.cos(angle) * baseR;
    const zStart = Math.sin(angle) * baseR;
    const xEnd = Math.cos(angle) * topR;
    const zEnd = Math.sin(angle) * topR;

    // Quill spine
    const spineGeom = new THREE.CylinderGeometry(0.0035, 0.0035, height, 4);
    const spineMesh = new THREE.Mesh(spineGeom, featherMaterial);
    spineMesh.position.set((xStart + xEnd) / 2, height / 2, (zStart + zEnd) / 2);
    spineMesh.lookAt(new THREE.Vector3(xEnd, height, zEnd));
    spineMesh.rotateX(Math.PI / 2);
    feathersGroup.add(spineMesh);

    // Vane (Flat blade plane)
    const vaneGeom = new THREE.PlaneGeometry(0.048, 0.10);
    const vaneMesh = new THREE.Mesh(vaneGeom, featherMaterial);
    vaneMesh.position.set(xEnd, height - 0.035, zEnd);
    vaneMesh.lookAt(new THREE.Vector3(0, height - 0.035, 0)); // face center
    vaneMesh.rotateY(Math.PI);
    feathersGroup.add(vaneMesh);
  }

  // Crossbinding strings inside feathers
  for (let j = 1; j <= 2; j++) {
    const r = baseR + (topR - baseR) * (j / 2.5);
    const y = height * (j / 2.5);
    const ringGeom = new THREE.TorusGeometry(r, 0.003, 4, 32);
    const ring = new THREE.Mesh(ringGeom, featherMaterial);
    ring.position.set(0, y, 0);
    ring.rotation.x = Math.PI / 2;
    feathersGroup.add(ring);
  }

  shuttleGroup.add(feathersGroup);

  return shuttleGroup;
}

// Create a 3D Athlete (Student model) procedurally with joints
function createAthleteMesh(jerseyColor: number, skinColor: number, racketColor: string, isServer: boolean): THREE.Group {
  const athlete = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.62 });
  const jerseyMat = new THREE.MeshStandardMaterial({ color: jerseyColor, roughness: 0.5 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.85 });

  // 1. Torso (Jerseys)
  const torsoGeom = new THREE.CylinderGeometry(0.24, 0.18, 0.75, 12);
  const torso = new THREE.Mesh(torsoGeom, jerseyMat);
  torso.position.y = 0.375;
  athlete.add(torso);

  // White stripes on Jersey
  const stripeGeom = new THREE.TorusGeometry(0.235, 0.015, 6, 24);
  const stripe1 = new THREE.Mesh(stripeGeom, whiteMat);
  stripe1.position.set(0, 0.55, 0);
  stripe1.rotation.x = Math.PI / 2;
  athlete.add(stripe1);

  const stripe2 = new THREE.Mesh(stripeGeom, whiteMat);
  stripe2.position.set(0, 0.25, 0);
  stripe2.rotation.x = Math.PI / 2;
  athlete.add(stripe2);

  // Shorts
  const shortsGeom = new THREE.CylinderGeometry(0.19, 0.20, 0.22, 12);
  const shorts = new THREE.Mesh(shortsGeom, blackMat);
  shorts.position.y = 0.05;
  athlete.add(shorts);

  // Legs
  const legH = 0.55;
  const upperLegGeom = new THREE.CylinderGeometry(0.075, 0.065, legH, 8);
  
  const leftLeg = new THREE.Mesh(upperLegGeom, skinMat);
  leftLeg.position.set(-0.09, -0.28, 0);
  athlete.add(leftLeg);
  
  const rightLeg = new THREE.Mesh(upperLegGeom, skinMat);
  rightLeg.position.set(0.09, -0.28, 0);
  athlete.add(rightLeg);

  // Shoes (white sneakers)
  const shoeGeom = new THREE.BoxGeometry(0.12, 0.1, 0.25);
  const leftShoe = new THREE.Mesh(shoeGeom, whiteMat);
  leftShoe.position.set(-0.09, -0.6, 0.04);
  athlete.add(leftShoe);

  const rightShoe = new THREE.Mesh(shoeGeom, whiteMat);
  rightShoe.position.set(0.09, -0.6, 0.04);
  athlete.add(rightShoe);

  // 2. Neck
  const neckGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.16, 8);
  const neck = new THREE.Mesh(neckGeom, skinMat);
  neck.position.y = 0.8;
  athlete.add(neck);

  // 3. Head
  const headGeom = new THREE.SphereGeometry(0.19, 32, 16);
  const head = new THREE.Mesh(headGeom, skinMat);
  head.position.y = 0.96;
  athlete.add(head);

  // Hair (bumpy afro fade)
  const hairGeom = new THREE.SphereGeometry(0.205, 16, 16);
  const hair = new THREE.Mesh(hairGeom, blackMat);
  hair.position.set(0, 1.02, -0.02);
  hair.scale.set(1.02, 0.95, 1.04);
  athlete.add(hair);

  // Eyes (white + pupil)
  const eyeGeom = new THREE.SphereGeometry(0.018, 8, 8);
  const eyeL = new THREE.Mesh(eyeGeom, whiteMat);
  eyeL.position.set(-0.05, 0.98, 0.16);
  const eyeR = new THREE.Mesh(eyeGeom, whiteMat);
  eyeR.position.set(0.05, 0.98, 0.16);
  athlete.add(eyeL);
  athlete.add(eyeR);

  const pupilGeom = new THREE.SphereGeometry(0.008, 8, 8);
  const pupilL = new THREE.Mesh(pupilGeom, blackMat);
  pupilL.position.set(-0.05, 0.98, 0.175);
  const pupilR = new THREE.Mesh(pupilGeom, blackMat);
  pupilR.position.set(0.05, 0.98, 0.175);
  athlete.add(pupilL);
  athlete.add(pupilR);

  // Nose
  const noseGeom = new THREE.ConeGeometry(0.02, 0.05, 4);
  const nose = new THREE.Mesh(noseGeom, skinMat);
  nose.position.set(0, 0.94, 0.185);
  nose.rotation.x = -Math.PI / 4;
  athlete.add(nose);

  // 4. Arms (Hierarchical groups for serve swing joints)
  // Left Arm (Holding Shuttlecock in Server, balanced in Receiver)
  const leftShoulder = new THREE.Group();
  leftShoulder.position.set(-0.28, 0.65, 0);
  
  const leftUpperArmGeom = new THREE.CylinderGeometry(0.055, 0.045, 0.38, 8);
  const leftUpperArm = new THREE.Mesh(leftUpperArmGeom, skinMat);
  leftUpperArm.position.y = -0.19;
  leftShoulder.add(leftUpperArm);

  const leftElbow = new THREE.Group();
  leftElbow.position.set(0, -0.38, 0);
  
  const leftForearmGeom = new THREE.CylinderGeometry(0.045, 0.038, 0.34, 8);
  const leftForearm = new THREE.Mesh(leftForearmGeom, skinMat);
  leftForearm.position.y = -0.17;
  leftElbow.add(leftForearm);

  const leftHand = new THREE.Group();
  leftHand.position.set(0, -0.34, 0);
  leftElbow.add(leftHand);

  leftUpperArm.add(leftElbow);
  athlete.add(leftShoulder);

  // Right Arm (Holding Racket)
  const rightShoulder = new THREE.Group();
  rightShoulder.position.set(0.28, 0.65, 0);

  const rightUpperArmGeom = new THREE.CylinderGeometry(0.055, 0.045, 0.38, 8);
  const rightUpperArm = new THREE.Mesh(rightUpperArmGeom, skinMat);
  rightUpperArm.position.y = -0.19;
  rightShoulder.add(rightUpperArm);

  const rightElbow = new THREE.Group();
  rightElbow.position.set(0, -0.38, 0);

  const rightForearmGeom = new THREE.CylinderGeometry(0.045, 0.038, 0.34, 8);
  const rightForearm = new THREE.Mesh(rightForearmGeom, skinMat);
  rightForearm.position.y = -0.17;
  rightElbow.add(rightForearm);

  const rightHand = new THREE.Group();
  rightHand.position.set(0, -0.34, 0);
  rightElbow.add(rightHand);

  rightUpperArm.add(rightElbow);
  athlete.add(rightShoulder);

  // Attach Racket in Right Hand
  const racket = createRacketMesh(racketColor);
  racket.scale.set(0.65, 0.65, 0.65); // Scale down to fit character scale
  racket.position.set(0, -0.05, 0.1);
  racket.rotation.set(-Math.PI / 2, 0, 0);
  rightHand.add(racket);

  // Setup initial poses
  if (isServer) {
    // Hold shuttle in left hand for serve
    const handShuttle = createShuttleMesh();
    handShuttle.scale.set(0.75, 0.75, 0.75);
    handShuttle.position.set(0, -0.05, 0.08);
    handShuttle.rotation.set(Math.PI / 2, 0, 0);
    leftHand.add(handShuttle);
    athlete.userData.handShuttle = handShuttle;

    // Ready pose
    leftShoulder.rotation.set(0.5, 0.2, -0.2);
    leftElbow.rotation.set(0.5, 0, 0);
    rightShoulder.rotation.set(-0.25, -0.1, 0.35);
    rightElbow.rotation.set(0.7, 0, 0);
  } else {
    // Receiver ready stance
    leftShoulder.rotation.set(0.4, 0.3, -0.15);
    leftElbow.rotation.set(0.6, 0, 0);
    rightShoulder.rotation.set(0.5, -0.4, 0.2);
    rightElbow.rotation.set(0.9, 0, 0);
    
    // Slight knees bend (tilt leg groups forward)
    leftLeg.rotation.x = -0.15;
    rightLeg.rotation.x = -0.15;
    torso.rotation.x = 0.08;
  }

  athlete.userData = {
    ...athlete.userData,
    leftShoulder,
    leftElbow,
    leftHand,
    rightShoulder,
    rightElbow,
    rightHand,
    racket,
  };

  return athlete;
}

// Subtle Background Badminton Court marking lines
const CourtLines = ({ y }: { y: number }) => {
  return (
    <g
      transform={`translate(500, ${y})`}
      className="opacity-[0.06] dark:opacity-[0.03]"
      stroke="var(--sl-foreground)"
      strokeWidth="2"
      fill="none"
    >
      {/* Outer court boundary */}
      <rect x="-320" y="-210" width="640" height="420" />
      {/* Center line */}
      <line x1="0" y1="-210" x2="0" y2="210" />
      {/* Inner singles sideline */}
      <line x1="-280" y1="-210" x2="-280" y2="210" />
      <line x1="280" y1="-210" x2="280" y2="210" />
      {/* Short service lines */}
      <line x1="-320" y1="-65" x2="320" y2="-65" />
      <line x1="-320" y1="65" x2="320" y2="65" />
      {/* Net line */}
      <line x1="-320" y1="0" x2="320" y2="0" strokeWidth="4" />
      {/* Back service lines for doubles */}
      <line x1="-320" y1="-190" x2="320" y2="-190" />
      <line x1="-320" y1="190" x2="320" y2="190" />
    </g>
  );
};

export function Interactive3DBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Perspective Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 8);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Theme values
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const accentColor = isDark ? 0x39ff14 : 0x00c853;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(6, 12, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(accentColor, 2.0, 15);
    pointLight.position.set(0, 2, 3);
    scene.add(pointLight);

    // 1. Create Athletes
    // Server: Black student (brown skin 0x4e2d19) wearing green jersey (0x00c853)
    const server = createAthleteMesh(0x00c853, 0x4e2d19, '#00c853', true);
    // Position on the right side of Section 1
    const getInitialServerX = (width: number) => (width < 768 ? 1.0 : 1.95);
    let serverX = getInitialServerX(container.clientWidth);
    server.position.set(serverX, -0.4, -0.5);
    scene.add(server);

    // Receiver: Student wearing black jersey (0x1f2937), standing in Section 5 on the right
    const receiver = createAthleteMesh(0x1a1a1a, 0x5a3825, '#689f38', false);
    receiver.position.set(serverX, -32.5, -0.5);
    receiver.scale.set(0, 0, 0); // starts invisible, scales in when approached
    scene.add(receiver);

    // Dynamic xOffset for the winding spline path (scales with screen size)
    const getXOffset = (width: number) => (width < 768 ? 1.1 : 2.5);
    let xOffset = getXOffset(container.clientWidth);

    // Landmarks coordinates for spline path
    const getLandmarks = () => {
      return [
        { id: 0, x: serverX, y: 0.1, rotY: 0.0 },     // Section 1: Server's strike point
        { id: 1, x: -xOffset, y: -8, rotY: 0.5 },    // Section 2: Gallery Left
        { id: 2, x: xOffset, y: -16, rotY: -0.5 },    // Section 3: About Right
        { id: 3, x: -xOffset, y: -24, rotY: 0.5 },    // Section 4: Fees Left
        { id: 4, x: serverX, y: -32.1, rotY: 0.0 },   // Section 5: Receiver strings (on the right)
      ];
    };

    let landmarks = getLandmarks();

    // 2. Winding spline path
    const getSplineCurve = () => {
      const pts = [
        new THREE.Vector3(landmarks[0].x, landmarks[0].y, 0.15),
        new THREE.Vector3(xOffset / 1.5, -3.8, 0.15),
        new THREE.Vector3(landmarks[1].x, landmarks[1].y, 0.15),
        new THREE.Vector3(0, -11.8, 0.15),
        new THREE.Vector3(landmarks[2].x, landmarks[2].y, 0.15),
        new THREE.Vector3(0, -19.8, 0.15),
        new THREE.Vector3(landmarks[3].x, landmarks[3].y, 0.15),
        new THREE.Vector3(xOffset / 2, -27.8, 0.15),
        new THREE.Vector3(landmarks[4].x, landmarks[4].y, 0.15)
      ];
      return new THREE.CatmullRomCurve3(pts);
    };

    let curve = getSplineCurve();

    // Create 3 Standalone Rackets for Sections 2, 3, and 4
    const rackets: THREE.Group[] = [];
    for (let i = 1; i <= 3; i++) {
      const racket = createRacketMesh('#689f38');
      racket.position.set(landmarks[i].x, landmarks[i].y, -1.0);
      racket.scale.set(0, 0, 0); // start collapsed
      racket.rotation.set(0.4, landmarks[i].rotY || 0, i % 2 === 0 ? 0.8 : -0.8);
      scene.add(racket);
      rackets.push(racket);
    }

    // Dotted flight trail representation
    const trailPoints = curve.getPoints(100);
    const trailGeom = new THREE.BufferGeometry().setFromPoints(trailPoints);
    const trailMat = new THREE.PointsMaterial({
      color: accentColor,
      size: 0.055,
      transparent: true,
      opacity: 0.15,
    });
    const trailParticles = new THREE.Points(trailGeom, trailMat);
    scene.add(trailParticles);

    // Glowing active laser trail
    const activeTrailGeom = new THREE.BufferGeometry();
    const activeTrailMat = new THREE.LineBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.65,
    });
    const activeTrail = new THREE.Line(activeTrailGeom, activeTrailMat);
    scene.add(activeTrail);

    // Create ShuttleMesh and place in Scene
    const shuttle = createShuttleMesh();
    shuttle.position.set(serverX, 0.1, 0.15); // rest on the server racket face
    scene.add(shuttle);

    let isIntroActive = true;
    let introTime = 0.0;
    let currentScroll = 0;

    // Track scroll
    const handleScroll = () => {
      const html = document.documentElement;
      const body = document.body;

      const scrollTop = window.pageYOffset || html.scrollTop || body.scrollTop;
      const scrollHeight = html.scrollHeight || body.scrollHeight;
      const clientHeight = html.clientHeight || window.innerHeight;

      const totalScrollable = scrollHeight - clientHeight;
      if (totalScrollable <= 0) return;

      const progress = Math.min(Math.max(scrollTop / totalScrollable, 0), 1);
      setScrollProgress(progress);
      currentScroll = progress;

      // Handoff to scroll animation as soon as user scroll threshold is met
      if (scrollTop > 10) {
        isIntroActive = false;
      }
    };

    // Resize handler
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      // Recalculate layouts
      serverX = getInitialServerX(width);
      server.position.x = serverX;
      receiver.position.x = serverX;

      xOffset = getXOffset(width);
      landmarks = getLandmarks();
      curve = getSplineCurve();
      
      // Update middle rackets positions
      for (let i = 0; i < 3; i++) {
        rackets[i].position.x = landmarks[i + 1].x;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Clock
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Camera Y position scroll link: scrolls down from 0 to -32
      const targetCameraY = -currentScroll * 32;
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCameraY, 0.085);
      pointLight.position.y = camera.position.y + 2;

      // Extract athlete joints for serve animation
      const sJoints = server.userData;
      const rJoints = receiver.userData;

      if (isIntroActive) {
        // 1. INTRO LANDING PHASE (Server transitions into view and swings slightly, shuttle sits in place)
        introTime += delta;

        // Server fades/scales in
        const sScale = Math.min(1.0, introTime * 1.5);
        server.scale.set(sScale, sScale, sScale);

        // Keep shuttlecock nestled inside the serve stance
        shuttle.position.set(serverX - 0.05, 0.12, 0.1);
        shuttle.rotation.set(0.4, 0, Math.PI / 4);

        if (sJoints.handShuttle) {
          sJoints.handShuttle.visible = true;
        }
      } else {
        // 2. ACTIVE SCROLL SEGMENT
        // If serve is underway (scroll from 0 to 4%): animate serve mechanics
        if (currentScroll < 0.045) {
          const ratio = currentScroll / 0.045;

          // Swing server arm holding racket forward
          sJoints.rightShoulder.rotation.x = THREE.MathUtils.lerp(-0.25, 0.9, ratio);
          sJoints.rightElbow.rotation.x = THREE.MathUtils.lerp(0.7, 0.15, ratio);

          // Pivot left hand away (releasing the ball)
          sJoints.leftShoulder.rotation.x = THREE.MathUtils.lerp(0.5, -0.4, ratio);
          sJoints.leftShoulder.rotation.z = THREE.MathUtils.lerp(-0.2, -0.6, ratio);

          // Hide shuttle in server hand right before impact
          if (ratio > 0.85 && sJoints.handShuttle) {
            sJoints.handShuttle.visible = false;
          }

          // position shuttle cock right on the serve swing face
          const point = curve.getPointAt(currentScroll);
          shuttle.position.set(point.x, point.y, 0.15);
          shuttle.rotation.set(0.4, 0, Math.PI / 4);
        } else {
          // Serve follow-through motion (scroll 4.5% to 10%)
          if (currentScroll < 0.1) {
            const ratio = (currentScroll - 0.045) / 0.055;
            sJoints.rightShoulder.rotation.x = THREE.MathUtils.lerp(0.9, 1.2, ratio);
            sJoints.rightElbow.rotation.x = THREE.MathUtils.lerp(0.15, 0.8, ratio);
          }

          if (sJoints.handShuttle) {
            sJoints.handShuttle.visible = false;
          }

          // Evaluate path position along spline
          const point = curve.getPointAt(currentScroll);
          shuttle.position.set(point.x, point.y, 0.15);

          // Orient shuttlecock nose-first along path tangent
          const ahead = Math.min(currentScroll + 0.004, 1.0);
          const pointAhead = curve.getPointAt(ahead);
          const dx = pointAhead.x - point.x;
          const dy = pointAhead.y - point.y;

          if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
            const tangentAngle = Math.atan2(dy, dx);
            shuttle.rotation.set(0.4, 0, tangentAngle + Math.PI / 2);
          }
        }

        // Draw active laser trail
        const segments = Math.floor(currentScroll * 100);
        const activeTrailPoints = trailPoints.slice(0, Math.max(2, segments));
        activeTrailGeom.setFromPoints(activeTrailPoints);
      }

      // 3. FADE OUT SERVER ATHLETE
      // Server transitions out as camera travels downwards
      const distFromServer = Math.abs(camera.position.y);
      if (!isIntroActive) {
        let serverScale = 0;
        let serverSlideX = serverX;
        if (distFromServer < 2.5) {
          const factor = 1.0 - distFromServer / 2.5;
          serverScale = Math.sin(factor * Math.PI / 2);
        } else {
          serverScale = 0;
        }
        server.scale.lerp(new THREE.Vector3(serverScale, serverScale, serverScale), 0.09);
        serverSlideX = serverScale > 0.01 ? serverX : serverX + 3.0; // slide off right
        server.position.x = THREE.MathUtils.lerp(server.position.x, serverSlideX, 0.09);
      }

      // 4. TRANSITION SECTIONS RACKETS (Middle rackets 2, 3, 4)
      rackets.forEach((racket, index) => {
        const racketIdx = index + 1; // rackets map to landmarks index 1, 2, 3
        const racketY = landmarks[racketIdx].y;
        const dist = Math.abs(camera.position.y - racketY);

        let targetScale = 0;
        let targetRotY = landmarks[racketIdx].rotY;
        let targetX = landmarks[racketIdx].x;

        if (dist < 4.0 && !isIntroActive) {
          const factor = 1.0 - dist / 4.0;
          targetScale = Math.sin(factor * Math.PI / 2);
          targetRotY += (1 - factor) * (racketIdx % 2 === 0 ? 0.7 : -0.7);
        } else {
          targetScale = 0;
        }

        racket.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.095);
        racket.rotation.y = THREE.MathUtils.lerp(racket.rotation.y, targetRotY, 0.095);

        // Slide in
        const slideX = targetScale > 0.01 ? targetX : (racketIdx % 2 === 0 ? 4.5 : -4.5);
        racket.position.x = THREE.MathUtils.lerp(racket.position.x, slideX, 0.095);
      });

      // 5. RECEIVER ATHLETE TRANSITIONS (Section 5)
      const distFromReceiver = Math.abs(camera.position.y - receiver.position.y);
      let rScale = 0;
      if (distFromReceiver < 4.5 && !isIntroActive) {
        const factor = 1.0 - distFromReceiver / 4.5;
        rScale = Math.sin(factor * Math.PI / 2);

        // Animate receiver swing as the shuttle reaches them (progress 90% to 100%)
        if (currentScroll > 0.88) {
          const swingRatio = (currentScroll - 0.88) / 0.12; // 0 to 1
          if (swingRatio < 0.8) {
            // Takeback position: raise racket back slightly
            const prepare = swingRatio / 0.8;
            rJoints.rightShoulder.rotation.x = THREE.MathUtils.lerp(0.5, 0.1, prepare);
            rJoints.rightElbow.rotation.x = THREE.MathUtils.lerp(0.9, 1.2, prepare);
          } else {
            // Strike/Swing forward: as it hits the string
            const strike = (swingRatio - 0.8) / 0.2;
            rJoints.rightShoulder.rotation.x = THREE.MathUtils.lerp(0.1, 1.3, strike);
            rJoints.rightElbow.rotation.x = THREE.MathUtils.lerp(1.2, 0.3, strike);
          }
        }
      } else {
        rScale = 0;
      }
      receiver.scale.lerp(new THREE.Vector3(rScale, rScale, rScale), 0.095);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none"
    />
  );
}
