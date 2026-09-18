"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const COLLAPSE_TIME = 31;
const FORMATION_TIME = 37;
const BLUE = new THREE.Color("#3155ff");
const PAPER = new THREE.Color("#f4f4f0");
const ORANGE = new THREE.Color("#ff5a1f");

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (start, end, progress) => start + (end - start) * progress;
const easeInCubic = (value) => value * value * value;
const easeOutExpo = (value) => (value === 1 ? 1 : 1 - 2 ** (-10 * value));
const easeInOutCubic = (value) =>
  value < 0.5 ? 4 * value * value * value : 1 - (-2 * value + 2) ** 3 / 2;

function seededRandom(seed) {
  let value = seed;

  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let result = Math.imul(value ^ (value >>> 15), 1 | value);
    result =
      (result + Math.imul(result ^ (result >>> 7), 61 | result)) ^ result;
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function formatTime(value) {
  const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;
  const minutes = Math.floor(safeValue / 60);
  const seconds = Math.floor(safeValue % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function phaseFromTime(time) {
  if (time < 7) return "ÉMERGENCE";
  if (time < 18) return "MISE EN ORBITE";
  if (time < 26) return "ACCRÉTION";
  if (time < COLLAPSE_TIME) return "HORIZON DES ÉVÉNEMENTS";
  if (time < 33) return "COLLAPSE";
  if (time < FORMATION_TIME) return "RECOMPOSITION";
  return "COLLECTION FUSIONNÉE";
}

function createPlaceholder(work, index) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 640;
  const context = canvas.getContext("2d");
  const isDark = index % 3 === 0;

  context.fillStyle = isDark ? "#111111" : "#e6e6df";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = isDark ? "#3155ff" : "#050505";
  context.lineWidth = 2;
  context.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);
  context.fillStyle = isDark ? "#f4f4f0" : "#050505";
  context.font = "700 24px Arial, sans-serif";
  context.fillText(String(index + 1).padStart(2, "0"), 38, 58);
  context.font = "700 40px Arial, sans-serif";
  context.fillText(work.title.slice(0, 23), 38, 535);
  context.font = "400 18px Arial, sans-serif";
  context.fillText(work.artist.slice(0, 38), 40, 577);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createCardGeometry() {
  const geometry = new THREE.PlaneGeometry(1.65, 1.65, 12, 8);
  const position = geometry.attributes.position;

  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    position.setZ(index, -0.075 * x * x);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function createParticleField(count, random) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const radius = lerp(5, 34, random() ** 0.7);
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const positionIndex = index * 3;

    positions[positionIndex] = radius * Math.sin(phi) * Math.cos(theta);
    positions[positionIndex + 1] = radius * Math.cos(phi) * 0.55;
    positions[positionIndex + 2] = radius * Math.sin(phi) * Math.sin(theta);

    const colorChoice = random();
    const color =
      colorChoice > 0.94 ? ORANGE : colorChoice > 0.72 ? BLUE : PAPER;
    colors[positionIndex] = color.r;
    colors[positionIndex + 1] = color.g;
    colors[positionIndex + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.055,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.78,
    vertexColors: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geometry, material);
}

function createFireMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uOpacity: { value: 0 },
    },
    vertexShader: `
      uniform float uTime;
      uniform float uIntensity;
      varying vec3 vNormalView;
      varying vec3 vPosition;
      varying float vDisplacement;

      void main() {
        vec3 transformed = position;
        float waveA = sin(position.x * 3.6 + uTime * 3.2);
        float waveB = sin(position.y * 5.1 - uTime * 2.7);
        float waveC = cos(position.z * 4.3 + uTime * 2.1);
        float displacement = (waveA + waveB + waveC) / 3.0;
        transformed += normal * displacement * (0.08 + uIntensity * 0.24);
        vDisplacement = displacement;
        vPosition = transformed;
        vNormalView = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uIntensity;
      uniform float uOpacity;
      varying vec3 vNormalView;
      varying vec3 vPosition;
      varying float vDisplacement;

      void main() {
        float fresnel = pow(1.0 - abs(dot(vNormalView, vec3(0.0, 0.0, 1.0))), 2.2);
        float heat = sin(vPosition.y * 7.0 + uTime * 4.0) * 0.5 + 0.5;
        heat = clamp(heat + vDisplacement * 0.55, 0.0, 1.0);
        vec3 blue = vec3(0.05, 0.16, 1.0);
        vec3 orange = vec3(1.0, 0.16, 0.015);
        vec3 whiteHot = vec3(1.0, 0.92, 0.72);
        vec3 color = mix(blue, orange, clamp(uIntensity * 1.3, 0.0, 1.0));
        color = mix(color, whiteHot, pow(heat, 4.0) * uIntensity);
        float alpha = clamp((0.32 + fresnel + heat * 0.35) * uOpacity, 0.0, 1.0);
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

export default function SingularityExperience({ works }) {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const flashRef = useRef(null);
  const audioGraphRef = useRef(null);
  const phaseRef = useRef("idle");
  const pointerRef = useRef({ x: 0, y: 0 });
  const [audioReady, setAudioReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [textureProgress, setTextureProgress] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [phaseLabel, setPhaseLabel] = useState("SYSTÈME EN ATTENTE");
  const [displayTime, setDisplayTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState("");

  const assetsReady = audioReady && sceneReady && textureProgress >= 1;

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.classList.add("singularity-mode");

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.classList.remove("singularity-mode");
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const markReady = () => {
      setAudioReady(true);
      setDuration(audio.duration || 0);
    };
    const handleEnded = () => {
      phaseRef.current = "complete";
      setPhase("complete");
      setPhaseLabel("COLLECTION FUSIONNÉE");
    };

    if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) markReady();
    audio.addEventListener("canplay", markReady);
    audio.addEventListener("loadedmetadata", markReady);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("canplay", markReady);
      audio.removeEventListener("loadedmetadata", markReady);
      audio.removeEventListener("ended", handleEnded);
      audioGraphRef.current?.context.close();
      audioGraphRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const random = seededRandom(20260918);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020204");
    scene.fog = new THREE.FogExp2(0x020204, 0.018);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(1, 1),
      0.72,
      0.66,
      0.18,
    );
    composer.addPass(bloomPass);

    const galaxy = new THREE.Group();
    scene.add(galaxy);

    const starField = createParticleField(
      window.innerWidth < 768 ? 2600 : 7200,
      random,
    );
    scene.add(starField);

    const coreMaterial = createFireMaterial();
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.35, 6),
      coreMaterial,
    );
    core.scale.setScalar(0.28);
    scene.add(core);

    const darkCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.72, 40, 40),
      new THREE.MeshBasicMaterial({ color: 0x000000 }),
    );
    scene.add(darkCore);

    const shockwaveMaterial = new THREE.MeshBasicMaterial({
      color: 0xc8d1ff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const shockwave = new THREE.Mesh(
      new THREE.RingGeometry(0.96, 1.02, 160),
      shockwaveMaterial,
    );
    shockwave.scale.setScalar(0.01);
    scene.add(shockwave);

    const tempObject = new THREE.Object3D();
    const tempVector = new THREE.Vector3();
    const tempTarget = new THREE.Vector3();
    const tempQuaternion = new THREE.Quaternion();
    const cardGeometry = createCardGeometry();
    const totalWorks = Math.max(works.length, 1);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    const cards = works.map((work, index) => {
      const material = new THREE.MeshBasicMaterial({
        map: createPlaceholder(work, index),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
        toneMapped: false,
      });
      const mesh = new THREE.Mesh(cardGeometry, material);
      const arm = index % 4;
      const baseAngle = index * 1.87 + arm * (Math.PI / 2);
      const baseRadius = 5.8 + (index / totalWorks) * 8.5 + random() * 1.6;
      const baseY = (random() - 0.5) * 7.5;
      const tilt = (random() - 0.5) * 0.34;
      const explosionDirection = new THREE.Vector3(
        random() - 0.5,
        random() - 0.5,
        random() - 0.5,
      ).normalize();
      const sphereY = 1 - (index / Math.max(totalWorks - 1, 1)) * 2;
      const sphereRadius = Math.sqrt(Math.max(0, 1 - sphereY * sphereY));
      const sphereTheta = goldenAngle * index;
      const finalPosition = new THREE.Vector3(
        Math.cos(sphereTheta) * sphereRadius,
        sphereY,
        Math.sin(sphereTheta) * sphereRadius,
      ).multiplyScalar(5.15);

      mesh.userData = {
        work,
        baseAngle,
        baseRadius,
        baseY,
        tilt,
        aspect: 1,
        explosionDistance: 11 + random() * 9,
        explosionDirection,
        finalPosition,
      };
      galaxy.add(mesh);

      return mesh;
    });

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    let loadedTextures = 0;
    let disposed = false;

    if (cards.length === 0) {
      setTextureProgress(1);
    } else {
      Promise.allSettled(
        cards.map(async (card) => {
          try {
            const texture = await textureLoader.loadAsync(
              card.userData.work.image,
            );

            if (disposed) {
              texture.dispose();
              return;
            }

            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = Math.min(
              renderer.capabilities.getMaxAnisotropy(),
              8,
            );
            const imageWidth =
              texture.image?.naturalWidth || texture.image?.width;
            const imageHeight =
              texture.image?.naturalHeight || texture.image?.height;
            card.userData.aspect = clamp(
              imageWidth && imageHeight ? imageWidth / imageHeight : 1,
              0.58,
              1.7,
            );
            card.material.map?.dispose();
            card.material.map = texture;
            card.material.needsUpdate = true;
          } finally {
            loadedTextures += 1;
            if (!disposed) setTextureProgress(loadedTextures / cards.length);
          }
        }),
      );
    }

    const resize = () => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      renderer.setSize(width, height, false);
      composer.setSize(width, height);
      camera.aspect = width / height;
      camera.position.z = width < 768 ? 22 : 18;
      camera.updateProjectionMatrix();
    };

    const handlePointerMove = (event) => {
      pointerRef.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerRef.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    setSceneReady(true);

    const frequencyData = new Uint8Array(128);
    let frameId;
    let lastUiUpdate = 0;
    let lastPhaseLabel = "SYSTÈME EN ATTENTE";

    const render = (timestamp) => {
      const audio = audioRef.current;
      const isRunning = phaseRef.current === "running";
      const sequenceTime =
        isRunning || phaseRef.current === "complete"
          ? audio?.currentTime || 0
          : 0;
      const ambientTime = timestamp * 0.001;
      const analyser = audioGraphRef.current?.analyser;
      let energy = 0;

      if (analyser && isRunning) {
        analyser.getByteFrequencyData(frequencyData);
        const bassBins = frequencyData.slice(0, 18);
        energy =
          bassBins.reduce((total, value) => total + value, 0) /
          (bassBins.length * 255);
      }

      if (isRunning && timestamp - lastUiUpdate > 110) {
        lastUiUpdate = timestamp;
        setDisplayTime(sequenceTime);
        const nextLabel = phaseFromTime(sequenceTime);
        if (nextLabel !== lastPhaseLabel) {
          lastPhaseLabel = nextLabel;
          setPhaseLabel(nextLabel);
        }
      }

      const intro = clamp(sequenceTime / 7);
      const gravity = clamp((sequenceTime - 18) / (COLLAPSE_TIME - 18));
      const collapseEase = easeInCubic(gravity);
      const explosion = clamp((sequenceTime - COLLAPSE_TIME) / 2);
      const formation = easeInOutCubic(
        clamp((sequenceTime - 33) / (FORMATION_TIME - 33)),
      );
      const idleDrift = isRunning ? sequenceTime : ambientTime * 0.45;
      const angularAcceleration =
        sequenceTime > 18 ? (sequenceTime - 18) ** 2 * 0.018 : 0;

      cards.forEach((card, index) => {
        const data = card.userData;
        const orbitSpeed = 0.16 + (index % 5) * 0.008;
        const angle =
          data.baseAngle + idleDrift * orbitSpeed + angularAcceleration;
        const radius =
          data.baseRadius * lerp(isRunning ? 1.18 : 1, 0.025, collapseEase);
        const orbitalPosition = tempVector.set(
          Math.cos(angle) * radius,
          data.baseY * lerp(1, 0.04, collapseEase) +
            Math.sin(angle * 1.7 + idleDrift) * 0.65 * (1 - gravity),
          Math.sin(angle) * radius,
        );

        if (sequenceTime < COLLAPSE_TIME) {
          card.position.copy(orbitalPosition);
          card.quaternion.copy(camera.quaternion);
          card.rotateZ(data.tilt + Math.sin(angle + index) * 0.08);
        } else if (sequenceTime < 33) {
          const explosionRadius =
            data.explosionDistance * easeOutExpo(explosion);
          card.position
            .copy(data.explosionDirection)
            .multiplyScalar(explosionRadius);
          card.quaternion.copy(camera.quaternion);
          card.rotateZ(data.tilt + explosion * (index % 2 ? 1.2 : -1.2));
        } else {
          tempTarget
            .copy(data.explosionDirection)
            .multiplyScalar(data.explosionDistance);
          card.position.lerpVectors(tempTarget, data.finalPosition, formation);
          tempObject.position.copy(data.finalPosition);
          tempTarget.copy(data.finalPosition).multiplyScalar(2);
          tempObject.lookAt(tempTarget);
          tempQuaternion.copy(tempObject.quaternion);
          card.quaternion.slerp(tempQuaternion, Math.max(0.08, formation));
        }

        const baseScale =
          sequenceTime < COLLAPSE_TIME
            ? lerp(0.54, 0.84, intro) * lerp(1, 0.26, collapseEase)
            : sequenceTime < 33
              ? lerp(0.18, 0.82, easeOutExpo(explosion))
              : lerp(0.82, 0.72, formation);
        const pulseScale = 1 + energy * 0.12;
        card.scale.set(
          baseScale * data.aspect * pulseScale,
          baseScale * pulseScale,
          baseScale,
        );
        card.material.opacity =
          sequenceTime < 1 && isRunning
            ? lerp(0.08, 0.92, intro)
            : lerp(0.82, 1, formation);
      });

      const preCollapse = clamp((sequenceTime - 26) / 5);
      const coreExplosion = clamp((sequenceTime - COLLAPSE_TIME) / 2.2);
      const coreFormation = clamp((sequenceTime - 33) / 4);
      let coreScale = isRunning ? lerp(0.28, 0.82, intro) : 0.34;

      if (sequenceTime >= 26 && sequenceTime < COLLAPSE_TIME) {
        coreScale = lerp(0.82, 0.045, easeInCubic(preCollapse));
      } else if (sequenceTime >= COLLAPSE_TIME && sequenceTime < 33.2) {
        coreScale = lerp(0.22, 5.2, easeOutExpo(coreExplosion));
      } else if (sequenceTime >= 33.2) {
        coreScale = lerp(5.2, 2.35, coreFormation);
      }

      core.scale.setScalar(coreScale * (1 + energy * 0.14));
      darkCore.scale.setScalar(
        sequenceTime < COLLAPSE_TIME
          ? lerp(0.55, 1.25, preCollapse)
          : lerp(0.2, 0.82, coreFormation),
      );
      darkCore.visible = sequenceTime < COLLAPSE_TIME || sequenceTime > 33;
      coreMaterial.uniforms.uTime.value = ambientTime;
      coreMaterial.uniforms.uIntensity.value = clamp(
        coreExplosion + energy * 0.9,
      );
      coreMaterial.uniforms.uOpacity.value = isRunning
        ? lerp(0.25, 1, clamp((sequenceTime - 25) / 7))
        : 0.24;

      if (sequenceTime >= COLLAPSE_TIME && sequenceTime < 33.4) {
        const shockwaveProgress = clamp((sequenceTime - COLLAPSE_TIME) / 2.4);
        shockwave.scale.setScalar(
          lerp(0.04, 15, easeOutExpo(shockwaveProgress)),
        );
        shockwaveMaterial.opacity = (1 - shockwaveProgress) * 0.9;
      } else {
        shockwaveMaterial.opacity = 0;
      }

      const particleCollapseScale =
        sequenceTime < COLLAPSE_TIME
          ? lerp(1, 0.055, collapseEase)
          : sequenceTime < 33
            ? lerp(0.055, 1.45, easeOutExpo(explosion))
            : lerp(1.45, 1, formation);
      starField.scale.setScalar(particleCollapseScale);
      starField.rotation.y = ambientTime * 0.025 + sequenceTime * 0.015;
      starField.rotation.z = Math.sin(ambientTime * 0.08) * 0.08;
      starField.material.size = 0.05 + energy * 0.11;
      starField.material.opacity = lerp(0.54, 0.92, energy);

      const finalRotation = clamp((sequenceTime - 34) / 5);
      galaxy.rotation.y =
        finalRotation * (ambientTime * 0.09 + pointerRef.current.x * 0.22);
      galaxy.rotation.x = finalRotation * pointerRef.current.y * 0.08;
      camera.position.x +=
        (pointerRef.current.x * 0.5 - camera.position.x) * 0.025;
      camera.position.y +=
        (-pointerRef.current.y * 0.35 - camera.position.y) * 0.025;
      camera.lookAt(0, 0, 0);
      bloomPass.strength = lerp(
        0.52,
        2.15,
        Math.sin(clamp((sequenceTime - COLLAPSE_TIME) / 1.4) * Math.PI),
      );

      if (flashRef.current) {
        const flashDistance = Math.abs(sequenceTime - COLLAPSE_TIME);
        flashRef.current.style.opacity =
          isRunning && flashDistance < 0.24
            ? String(1 - flashDistance / 0.24)
            : "0";
      }

      composer.render();
      frameId = window.requestAnimationFrame(render);
    };

    frameId = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      cards.forEach((card) => {
        card.material.map?.dispose();
        card.material.dispose();
      });
      cardGeometry.dispose();
      starField.geometry.dispose();
      starField.material.dispose();
      core.geometry.dispose();
      coreMaterial.dispose();
      darkCore.geometry.dispose();
      darkCore.material.dispose();
      shockwave.geometry.dispose();
      shockwaveMaterial.dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, [works]);

  const startExperience = async () => {
    const audio = audioRef.current;
    if (!audio || !assetsReady) return;
    setError("");

    try {
      if (!audioGraphRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const context = new AudioContext();
        const source = context.createMediaElementSource(audio);
        const analyser = context.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.82;
        source.connect(analyser);
        analyser.connect(context.destination);
        audioGraphRef.current = { context, analyser, source };
      }

      await audioGraphRef.current.context.resume();
      audio.currentTime = 0;
      audio.muted = isMuted;
      await audio.play();
      phaseRef.current = "running";
      setPhase("running");
      setPhaseLabel("ÉMERGENCE");
      setDisplayTime(0);
    } catch {
      setError(
        "Le navigateur a bloqué le son. Réessayez après avoir interagi avec la page.",
      );
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) audioRef.current.muted = nextMuted;
  };

  const loadingPercent = Math.round(
    (((audioReady ? 1 : 0) + (sceneReady ? 1 : 0) + textureProgress) / 3) * 100,
  );

  return (
    <main
      ref={stageRef}
      className="fixed inset-0 z-[100] overflow-hidden bg-black text-paper"
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      <audio ref={audioRef} src="/audio/just-overture.mp3" preload="auto">
        <track
          default
          kind="captions"
          src="/audio/just-overture.vtt"
          srcLang="fr"
          label="Description de l’ambiance sonore"
        />
      </audio>

      <div
        ref={flashRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 bg-[radial-gradient(circle_at_center,#fff_0%,#dfe4ff_24%,#3155ff_58%,transparent_100%)] opacity-0 mix-blend-screen"
      />

      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.2)_48%,rgba(0,0,0,0.9)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-10 opacity-[0.065] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:5rem_5rem]" />

      <header className="absolute inset-x-3 top-3 z-40 flex items-start justify-between border-t border-paper/35 pt-3 sm:inset-x-4 sm:top-4">
        <div>
          <p className="eyebrow">( Singularity 031 )</p>
          <p className="mt-2 font-mono text-[0.625rem] uppercase tracking-[0.08em] text-paper/45">
            {String(works.length).padStart(2, "0")} œuvres en orbite
          </p>
        </div>
        <div className="flex items-center gap-5 sm:gap-8">
          <button
            type="button"
            onClick={toggleMute}
            className="eyebrow pointer-events-auto transition-colors hover:text-blue"
          >
            {isMuted ? "Son coupé" : "Son activé"}
          </button>
          <Link
            href="/"
            className="eyebrow pointer-events-auto border-b border-paper/45 pb-1 transition-colors hover:border-blue hover:text-blue"
          >
            Quitter ↗
          </Link>
        </div>
      </header>

      <div className="absolute inset-x-3 bottom-3 z-40 flex items-end justify-between gap-6 border-b border-paper/35 pb-3 sm:inset-x-4 sm:bottom-4">
        <div>
          <p className="eyebrow text-paper/45">État du système</p>
          <p className="mt-2 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.1em]">
            {phaseLabel}
          </p>
        </div>
        <div className="text-right">
          <p className="eyebrow text-paper/45">Temps orbital</p>
          <p className="mt-2 font-mono text-[0.6875rem] font-bold tracking-[0.1em]">
            {formatTime(displayTime)} / {formatTime(duration)}
          </p>
        </div>
      </div>

      <section
        className={`absolute inset-0 z-20 grid place-items-center px-4 text-center transition-all duration-1000 ${phase === "idle" ? "visible opacity-100" : "invisible scale-110 opacity-0"}`}
      >
        <div className="flex max-w-3xl flex-col items-center">
          <p className="eyebrow mb-6 text-blue">NM* / PROTOCOLE 031</p>
          <h1 className="display-type text-[clamp(4rem,12vw,11rem)]">
            SINGULARITY
            <br />
            031
          </h1>
          <p className="mt-7 max-w-lg text-base leading-[1.25] text-paper/55 sm:text-lg">
            Toute la collection va entrer en fusion. Activez le protocole et
            gardez le son allumé.
          </p>

          <button
            type="button"
            onClick={startExperience}
            disabled={!assetsReady}
            className="group pointer-events-auto relative mt-10 flex min-w-[18rem] items-center justify-between overflow-hidden rounded-full border border-paper/55 px-6 py-4 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.08em] transition-colors hover:border-blue hover:bg-blue disabled:cursor-wait disabled:border-paper/20 disabled:text-paper/35"
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 bg-paper/10 transition-[width] duration-300"
              style={{ width: `${loadingPercent}%` }}
            />
            <span className="relative">
              {assetsReady
                ? "Provoquer le collapse"
                : `Chargement orbital · ${loadingPercent}%`}
            </span>
            <span className="relative text-lg transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>
          {error ? (
            <p className="mt-5 max-w-lg font-mono text-xs uppercase leading-[1.4] text-[#ff6b43]">
              {error}
            </p>
          ) : null}
        </div>
      </section>

      <section
        className={`pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center transition-all duration-1000 ${phase === "complete" ? "visible opacity-100" : "invisible translate-y-6 opacity-0"}`}
      >
        <p className="eyebrow mb-5 text-blue">( Fusion accomplie )</p>
        <h2 className="display-type text-[clamp(3.5rem,10vw,9rem)]">
          UNE COLLECTION.
          <br />
          UN SEUL ASTRE.
        </h2>
        <div className="pointer-events-auto mt-8 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={startExperience}
            className="eyebrow rounded-full border border-paper px-6 py-3 transition-colors hover:border-blue hover:bg-blue"
          >
            Rejouer ↻
          </button>
          <Link
            href="/paintings"
            className="eyebrow rounded-full bg-paper px-6 py-3 text-ink transition-colors hover:bg-blue hover:text-white"
          >
            Explorer les œuvres ↗
          </Link>
        </div>
      </section>

      <p className="sr-only" aria-live="polite">
        {phaseLabel}
      </p>
    </main>
  );
}
