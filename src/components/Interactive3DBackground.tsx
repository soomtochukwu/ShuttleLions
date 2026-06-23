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

    // Dynamic light tracking dark mode theme color
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const accentColor = isDark ? 0x39ff14 : 0x00c853;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(6, 12, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(accentColor, 1.8, 12);
    pointLight.position.set(0, 2, 3);
    scene.add(pointLight);

    // Racket references inside WebGL
    const rackets: THREE.Group[] = [];
    const racketCount = 5;
    
    // Landmark Coordinates
    const getLandmarks = (width: number) => {
      const isMobile = width < 768;
      const xOffset = isMobile ? 1.1 : 2.5; // shrink path horizontally on small screens
      return [
        { id: 0, x: 0, y: 0, rotY: -0.2, rotZ: 0.8 },       // Section 1: Hero Center
        { id: 1, x: -xOffset, y: -8, rotY: 0.5, rotZ: -0.8 }, // Section 2: Gallery Left
        { id: 2, x: xOffset, y: -16, rotY: -0.5, rotZ: 0.8 }, // Section 3: About Right
        { id: 3, x: -xOffset, y: -24, rotY: 0.5, rotZ: -0.8 },// Section 4: Fees Left
        { id: 4, x: 0, y: -32, rotY: 0.0, rotZ: 0.0 },       // Section 5: Onboard Center
      ];
    };

    let landmarks = getLandmarks(container.clientWidth);

    // Create and position Rackets in scene
    for (let i = 0; i < racketCount; i++) {
      const rColor = i === 0 || i === 4 ? '#00c853' : '#689f38';
      const racket = createRacketMesh(rColor);
      
      // Initially zeroed out to scale in
      racket.position.set(landmarks[i].x, landmarks[i].y, -1.0);
      racket.scale.set(0, 0, 0);
      racket.rotation.set(0.4, landmarks[i].rotY, landmarks[i].rotZ);

      scene.add(racket);
      rackets.push(racket);
    }

    // 3. CatmullRom Path representing the flight trail
    const getSplineCurve = () => {
      const pts = [
        new THREE.Vector3(landmarks[0].x, landmarks[0].y, 0), // racket 1
        new THREE.Vector3(landmarks[2].x / 2, (landmarks[0].y + landmarks[1].y) / 2, 0), // loop right
        new THREE.Vector3(landmarks[1].x, landmarks[1].y, 0), // racket 2
        new THREE.Vector3(0, (landmarks[1].y + landmarks[2].y) / 2, 0), // loop center
        new THREE.Vector3(landmarks[2].x, landmarks[2].y, 0), // racket 3
        new THREE.Vector3(0, (landmarks[2].y + landmarks[3].y) / 2, 0), // loop center
        new THREE.Vector3(landmarks[3].x, landmarks[3].y, 0), // racket 4
        new THREE.Vector3(landmarks[2].x / 2, (landmarks[3].y + landmarks[4].y) / 2, 0), // loop right
        new THREE.Vector3(landmarks[4].x, landmarks[4].y, 0)  // racket 5
      ];
      return new THREE.CatmullRomCurve3(pts);
    };

    let curve = getSplineCurve();

    // Create Dotted flight trail representation
    const trailPoints = curve.getPoints(100);
    const trailGeom = new THREE.BufferGeometry().setFromPoints(trailPoints);
    const trailMat = new THREE.PointsMaterial({
      color: accentColor,
      size: 0.055,
      transparent: true,
      opacity: 0.16,
    });
    const trailParticles = new THREE.Points(trailGeom, trailMat);
    scene.add(trailParticles);

    // Glowing active laser trail that draws behind shuttlecock
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
    shuttle.position.set(0, 5, 0); // starts high in the sky for intro
    scene.add(shuttle);

    // State managers
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

      // Disable intro landing lock as soon as user starts scrolling
      if (scrollTop > 12) {
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

      // Re-initialize landmarks and curve points dynamically for responsiveness
      landmarks = getLandmarks(width);
      curve = getSplineCurve();

      // Reposition rackets
      for (let i = 0; i < racketCount; i++) {
        rackets[i].position.x = landmarks[i].x;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Clock
    const clock = new THREE.Clock();

    // Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Camera Y position scroll link: scrolls down from 0 to -32
      let targetCameraY = -currentScroll * 32;

      // Soft Camera damping
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCameraY, 0.085);
      pointLight.position.y = camera.position.y + 2;

      if (isIntroActive) {
        // 1. Intro Phase Landing Animation (Racket 1 scales, Shuttlecock falls)
        introTime += delta;

        // Racket 1 entrance
        const racketScale = Math.min(1.0, introTime * 1.5);
        rackets[0].scale.set(racketScale, racketScale, racketScale);

        // Shuttlecock falls from above and decelerates to landing spot
        const startY = 6.0;
        const landingY = 0.05; // rest slightly above racket face center
        
        // Easing down
        const fallProgress = Math.min(1.0, introTime / 1.4);
        const easeOutQuad = 1 - (1 - fallProgress) * (1 - fallProgress);
        
        let currentY = startY - (startY - landingY) * easeOutQuad;

        // Add a micro-bounce on landing (at time = 1.4s)
        if (introTime > 1.4) {
          const bounceTime = introTime - 1.4;
          const bounceDecay = Math.exp(-bounceTime * 4.5);
          const bounceOscillation = Math.abs(Math.sin(bounceTime * 12.0));
          currentY += 0.22 * bounceDecay * bounceOscillation;
        }

        shuttle.position.set(0, currentY, 0.15);
        
        // Tilt the shuttle on falling, then settle to landing angle
        const fallAngle = THREE.MathUtils.lerp(185, 45, Math.min(1.0, introTime / 1.2));
        shuttle.rotation.set(0.4, 0, fallAngle * (Math.PI / 180));
      } else {
        // 2. Active Spline Scrolling Phase
        // Shuttle position on the spline path
        const point = curve.getPointAt(currentScroll);

        // Position shuttle
        shuttle.position.set(point.x, point.y, 0.15);

        // Shuttle rotation matching path tangent (flies nose-first)
        const aheadProgress = Math.min(currentScroll + 0.005, 1.0);
        const pointAhead = curve.getPointAt(aheadProgress);
        const dx = pointAhead.x - point.x;
        const dy = pointAhead.y - point.y;

        if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
          const pathAngle = Math.atan2(dy, dx);
          // Offset orientation: base vector points up, so we add 90 deg
          const targetRot = pathAngle + Math.PI / 2;
          
          // Smooth rotation mapping
          shuttle.rotation.set(0.4, 0, targetRot);
        }

        // Draw active laser trail
        const segments = Math.floor(currentScroll * 100);
        const activeTrailPoints = trailPoints.slice(0, Math.max(2, segments));
        activeTrailGeom.setFromPoints(activeTrailPoints);
      }

      // Racket Dynamic scale/fade out transitions
      rackets.forEach((racket, i) => {
        const racketY = landmarks[i].y;
        const dist = Math.abs(camera.position.y - racketY);

        let targetScale = 0;
        let targetRotY = landmarks[i].rotY;
        let targetX = landmarks[i].x;

        // If intro is active, only show Racket 1
        if (isIntroActive) {
          if (i > 0) {
            racket.scale.set(0, 0, 0);
            return;
          }
        }

        // Keep Racket in viewport if scroll position is close
        if (dist < 4.0) {
          const factor = 1.0 - dist / 4.0; // 1 when centered, 0 when far away
          targetScale = Math.sin(factor * Math.PI / 2); // elastic scale entrance

          // Rotate racket frame slightly as camera scrolls past
          targetRotY += (1 - factor) * (i % 2 === 0 ? 0.7 : -0.7);
        } else {
          targetScale = 0;
        }

        // Smooth Lerp transitions
        racket.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.095);
        racket.rotation.y = THREE.MathUtils.lerp(racket.rotation.y, targetRotY, 0.095);
        
        // Slide out effect
        const slideX = targetScale > 0.01 ? targetX : (i % 2 === 0 ? -4.5 : 4.5);
        racket.position.x = THREE.MathUtils.lerp(racket.position.x, slideX, 0.095);
      });

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
