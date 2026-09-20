"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useStore } from "../../_lib/store";
import Link from "../ui/Link";

gsap.registerPlugin(ScrollTrigger);

const RADIUS = 10;
const CARD_ARC = 0.5;
const ANGLE_STEP = 0.515;
const CARD_HEIGHT = 3.45;
const VERTICAL_STEP = 0.85;
const WAVE_AMPLITUDE = 0.42;
const WAVE_FREQUENCY = 0.65;

const IMAGE_OVERRIDES = {
  "the-fighting-temeraire":
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/Turner_-_The_Fighting_Temeraire.jpg/960px-Turner_-_The_Fighting_Temeraire.jpg",
  "the-hay-wain":
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/John_Constable_-_The_Hay_Wain_%281821%29.jpg/960px-John_Constable_-_The_Hay_Wain_%281821%29.jpg",
};

function createCurvedCard(centerAngle) {
  const columns = 32;
  const rows = 2;
  const helixPitch = VERTICAL_STEP / ANGLE_STEP;
  const centerWave = Math.sin(centerAngle * WAVE_FREQUENCY) * WAVE_AMPLITUDE;
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let row = 0; row <= rows; row += 1) {
    const v = row / rows;

    for (let column = 0; column <= columns; column += 1) {
      const u = column / columns;
      const angle = (u - 0.5) * CARD_ARC;
      const waveOffset =
        Math.sin((centerAngle + angle) * WAVE_FREQUENCY) * WAVE_AMPLITUDE -
        centerWave;

      positions.push(
        Math.sin(angle) * RADIUS,
        (v - 0.5) * CARD_HEIGHT - angle * helixPitch + waveOffset,
        Math.cos(angle) * RADIUS - RADIUS,
      );
      uvs.push(u, v);
    }
  }

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const a = row * (columns + 1) + column;
      const b = a + 1;
      const d = (row + 1) * (columns + 1) + column;
      const c = d + 1;

      indices.push(a, b, d, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  return geometry;
}

function createPlaceholder(work, index) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 384;
  const context = canvas.getContext("2d");

  context.fillStyle = index % 2 === 0 ? "#e7e7e1" : "#d8d8d2";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#050505";
  context.font = "700 26px Arial, sans-serif";
  context.fillText(String(index + 1).padStart(2, "0"), 28, 41);
  context.font = "700 32px Arial, sans-serif";
  context.fillText(work.title.slice(0, 24), 28, 325);
  context.font = "400 14px Arial, sans-serif";
  context.fillText(work.artist.slice(0, 34), 29, 353);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function loadTexture(loader, work, renderer) {
  const source = IMAGE_OVERRIDES[work.slug] ?? work.image;

  return loader.loadAsync(source).then((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  });
}

function createBackTexture(texture) {
  const backTexture = texture.clone();
  backTexture.wrapS = THREE.RepeatWrapping;
  backTexture.repeat.x = -1;
  backTexture.offset.x = 1;
  backTexture.needsUpdate = true;
  return backTexture;
}

export default function ArtSpiral({ works }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const targetFocusRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canInitialize, setCanInitialize] = useState(false);
  const isHeroAnimationComplete = useStore(
    (state) => state.isHeroAnimationComplete,
  );
  const isTransitionActive = useStore((state) => state.isTransitionActive);

  useEffect(() => {
    if (!isHeroAnimationComplete || isTransitionActive || canInitialize) return;

    const initialize = () => {
      setCanInitialize(true);
    };
    const idleId = window.requestIdleCallback?.(initialize, { timeout: 1200 });
    const fallbackTimer = idleId ? null : window.setTimeout(initialize, 160);

    return () => {
      if (idleId) window.cancelIdleCallback?.(idleId);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
    };
  }, [canInitialize, isHeroAnimationComplete, isTransitionActive]);

  useGSAP(
    () => {
      if (!canInitialize || works.length === 0) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(sectionRef.current, { height: "100vh" });
        return;
      }

      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.15,
        onUpdate: (self) => {
          const focus = self.progress * (works.length - 1);
          targetFocusRef.current = focus;
          setActiveIndex(Math.round(focus));
        },
      });

      return () => trigger.kill();
    },
    { scope: sectionRef, dependencies: [canInitialize, works.length] },
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canInitialize || !canvas || !stage || works.length === 0) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 100);
    camera.position.set(0, 0.25, 20.3);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x050505, 0);

    const ribbon = new THREE.Group();
    scene.add(ribbon);

    const cards = works.map((work, index) => {
      const frontTexture = createPlaceholder(work, index);
      const backTexture = createBackTexture(frontTexture);
      const frontMaterial = new THREE.MeshBasicMaterial({
        map: frontTexture,
        side: THREE.FrontSide,
        toneMapped: false,
      });
      const backMaterial = new THREE.MeshBasicMaterial({
        map: backTexture,
        side: THREE.BackSide,
        toneMapped: false,
      });
      const cardGroup = new THREE.Group();
      const centerAngle = index * ANGLE_STEP;
      const ribbonWave =
        Math.sin(centerAngle * WAVE_FREQUENCY) * WAVE_AMPLITUDE;
      const geometry = createCurvedCard(centerAngle);
      cardGroup.position.set(
        Math.sin(centerAngle) * RADIUS,
        -index * VERTICAL_STEP + ribbonWave,
        Math.cos(centerAngle) * RADIUS,
      );
      cardGroup.rotation.y = centerAngle;
      cardGroup.userData.hoverScale = 1;
      cardGroup.userData.workSlug = work.slug;
      cardGroup.add(
        new THREE.Mesh(geometry, frontMaterial),
        new THREE.Mesh(geometry, backMaterial),
      );
      ribbon.add(cardGroup);
      return { cardGroup, geometry, frontMaterial, backMaterial };
    });

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    let disposed = false;
    let textureCursor = 0;

    const hydrateTextures = async () => {
      while (!disposed && textureCursor < works.length) {
        const index = textureCursor;
        textureCursor += 1;

        try {
          const texture = await loadTexture(
            textureLoader,
            works[index],
            renderer,
          );

          if (disposed) {
            texture.dispose();
            return;
          }

          const backTexture = createBackTexture(texture);
          const card = cards[index];
          card.frontMaterial.map?.dispose();
          card.backMaterial.map?.dispose();
          card.frontMaterial.map = texture;
          card.backMaterial.map = backTexture;
          card.frontMaterial.needsUpdate = true;
          card.backMaterial.needsUpdate = true;
        } catch {
          // Le placeholder titré reste visible si une source distante échoue.
        }
      }
    };

    for (let worker = 0; worker < 2; worker += 1) {
      hydrateTextures();
    }

    const resize = () => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      renderer.setSize(width, height, false);
      camera.position.set(
        0,
        width < 768 ? 0.1 : 0.25,
        width < 768 ? 24.5 : 20.3,
      );
      camera.lookAt(0, 0, 0);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    window.addEventListener("resize", resize);

    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    let hoveredCard = null;
    let pointerStart = null;

    const getCardAtPointer = (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersection = raycaster.intersectObjects(ribbon.children, true)[0];

      return intersection?.object.parent ?? null;
    };

    const updateHover = (event) => {
      hoveredCard = getCardAtPointer(event);
      canvas.style.cursor = hoveredCard ? "pointer" : "default";
    };

    const clearHover = () => {
      hoveredCard = null;
      canvas.style.cursor = "default";
    };

    const handlePointerDown = (event) => {
      if (event.button !== 0) return;

      pointerStart = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };
    };

    const handlePointerUp = (event) => {
      if (!pointerStart || pointerStart.id !== event.pointerId) return;

      const distance = Math.hypot(
        event.clientX - pointerStart.x,
        event.clientY - pointerStart.y,
      );
      pointerStart = null;

      if (distance > 8) return;

      const clickedCard = getCardAtPointer(event);
      const workSlug = clickedCard?.userData.workSlug;
      const store = useStore.getState();

      if (!workSlug || store.isTransitionActive) return;

      store.setDestinationUrl(`/paintings/${workSlug}`);
      store.setIsTransitionActive(true);
    };

    const cancelPointer = () => {
      pointerStart = null;
    };

    canvas.addEventListener("pointermove", updateHover);
    canvas.addEventListener("pointerleave", clearHover);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", cancelPointer);

    let currentFocus = targetFocusRef.current;
    let frameId;

    const render = () => {
      currentFocus += (targetFocusRef.current - currentFocus) * 0.085;
      ribbon.rotation.y = -currentFocus * ANGLE_STEP;
      ribbon.position.y =
        currentFocus * VERTICAL_STEP -
        Math.sin(currentFocus * ANGLE_STEP * WAVE_FREQUENCY) * WAVE_AMPLITUDE;
      ribbon.rotation.z = Math.sin(currentFocus * 0.32) * 0.035;

      for (const card of cards) {
        const targetScale = card.cardGroup === hoveredCard ? 1.085 : 1;
        card.cardGroup.userData.hoverScale +=
          (targetScale - card.cardGroup.userData.hoverScale) * 0.14;
        card.cardGroup.scale.setScalar(card.cardGroup.userData.hoverScale);
      }

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", updateHover);
      canvas.removeEventListener("pointerleave", clearHover);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", cancelPointer);

      for (const card of cards) {
        card.geometry.dispose();
        card.frontMaterial.map?.dispose();
        card.backMaterial.map?.dispose();
        card.frontMaterial.dispose();
        card.backMaterial.dispose();
      }

      renderer.dispose();
    };
  }, [canInitialize, works]);

  const activeWork = works[activeIndex] ?? works[0];

  if (!activeWork) return null;

  return (
    <section
      ref={sectionRef}
      className="relative bg-paper text-ink"
      style={{ height: `${Math.max(640, works.length * 24)}vh` }}
    >
      <div
        ref={stageRef}
        className="sticky top-14 h-[calc(100svh-3.5rem)] overflow-hidden sm:top-16 sm:h-[calc(100svh-4rem)]"
      >
        <div className="absolute inset-x-3 top-4 z-20 flex items-start justify-between border-t border-ink/35 pt-3 sm:inset-x-4">
          <p className="eyebrow">( À voir )</p>
          <p className="eyebrow text-right text-ink/55">
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(works.length).padStart(2, "0")}
            <br />
            Faites défiler ↓
          </p>
        </div>

        <div className="pointer-events-none absolute inset-0 z-0 grid place-items-center">
          <h2 className="display-type text-center text-[clamp(4.5rem,14vw,13rem)] text-ink/10">
            ART EN
            <br />
            MOUVEMENT
          </h2>
        </div>

        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-10 size-full"
          aria-label={`Ruban 3D de ${works.length} œuvres de la collection`}
        />

        <div className="pointer-events-none absolute inset-x-3 bottom-4 z-20 flex items-end justify-between sm:inset-x-4">
          <div className="max-w-[56vw]">
            <p className="eyebrow text-ink/50">
              {String(activeIndex + 1).padStart(2, "0")} · {activeWork.artist}
            </p>
            <h3 className="mt-1 text-[clamp(1.2rem,3vw,2.5rem)] font-bold tracking-[-0.045em]">
              {activeWork.title}
            </h3>
          </div>
          <Link
            className="pointer-events-auto eyebrow rounded-full bg-ink px-5 py-3 text-paper transition-colors hover:bg-blue hover:text-white"
            href={`/paintings/${activeWork.slug}`}
          >
            Voir l’œuvre ↗
          </Link>
        </div>

        <div className="sr-only">
          {works.map((work) => (
            <Link key={work.id} href={`/paintings/${work.slug}`}>
              {work.title} — {work.artist}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
