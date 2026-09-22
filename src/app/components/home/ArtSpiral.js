"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useStore } from "../../_lib/store";
import {
  LOCOMOTIVE_START_EVENT,
  LOCOMOTIVE_STOP_EVENT,
} from "../layout/SmoothScroll";
import Link from "../ui/Link";

gsap.registerPlugin(ScrollTrigger);

const RADIUS = 10;
const CARD_ARC = 0.5;
const ANGLE_STEP = 0.515;
const CARD_HEIGHT = 3.45;
const VERTICAL_STEP = 0.85;
const WAVE_AMPLITUDE = 0.42;
const WAVE_FREQUENCY = 0.65;
const FLAT_CARD_WIDTH = 2 * RADIUS * Math.sin(CARD_ARC / 2);
const FLAT_CARD_AREA = FLAT_CARD_WIDTH * CARD_HEIGHT;

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

function createFlatCard(geometry, aspectRatio = FLAT_CARD_WIDTH / CARD_HEIGHT) {
  const uvs = geometry.getAttribute("uv");
  const safeRatio = THREE.MathUtils.clamp(aspectRatio, 0.52, 2.2);
  const width = Math.sqrt(FLAT_CARD_AREA * safeRatio);
  const height = width / safeRatio;
  const positions = new Float32Array(uvs.count * 3);

  for (let index = 0; index < uvs.count; index += 1) {
    positions[index * 3] = (uvs.getX(index) - 0.5) * width;
    positions[index * 3 + 1] = (uvs.getY(index) - 0.5) * height;
    positions[index * 3 + 2] = 0;
  }

  return { height, positions, width };
}

function morphCardGeometry(geometry, curvedPositions, flatPositions, progress) {
  const position = geometry.getAttribute("position");

  for (let index = 0; index < position.array.length; index += 1) {
    position.array[index] = THREE.MathUtils.lerp(
      curvedPositions[index],
      flatPositions[index],
      progress,
    );
  }

  position.needsUpdate = true;
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
}

function getProjectedCardRect(cardGroup, geometry, camera, canvas) {
  geometry.computeBoundingBox();
  cardGroup.updateWorldMatrix(true, true);
  camera.updateMatrixWorld(true);

  const bounds = geometry.boundingBox;
  const canvasRect = canvas.getBoundingClientRect();

  if (!bounds || !canvasRect.width || !canvasRect.height) return null;

  const corners = [
    new THREE.Vector3(bounds.min.x, bounds.min.y, 0),
    new THREE.Vector3(bounds.max.x, bounds.min.y, 0),
    new THREE.Vector3(bounds.max.x, bounds.max.y, 0),
    new THREE.Vector3(bounds.min.x, bounds.max.y, 0),
  ];
  const points = corners.map((corner) => {
    const projected = corner
      .applyMatrix4(cardGroup.matrixWorld)
      .project(camera);

    return {
      x: canvasRect.left + (projected.x * 0.5 + 0.5) * canvasRect.width,
      y: canvasRect.top + (-projected.y * 0.5 + 0.5) * canvasRect.height,
    };
  });
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const rect = {
    left: Math.min(...xs),
    top: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };

  return Object.values(rect).every(Number.isFinite) &&
    rect.width > 24 &&
    rect.height > 24
    ? rect
    : null;
}

export default function ArtSpiral({ works }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const targetFocusRef = useRef(0);
  const startSpiralTransitionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canInitialize, setCanInitialize] = useState(false);
  const isTransitionActive = useStore((state) => state.isTransitionActive);

  useEffect(() => {
    if (isTransitionActive || canInitialize) return;

    const initialize = () => {
      setCanInitialize(true);
    };
    const idleId = window.requestIdleCallback?.(initialize, { timeout: 250 });
    const fallbackTimer = idleId ? null : window.setTimeout(initialize, 80);

    return () => {
      if (idleId) window.cancelIdleCallback?.(idleId);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
    };
  }, [canInitialize, isTransitionActive]);

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
      const curvedPositions = Float32Array.from(
        geometry.getAttribute("position").array,
      );
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
      return {
        work,
        cardGroup,
        geometry,
        curvedPositions,
        frontMaterial,
        backMaterial,
      };
    });

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    let disposed = false;
    let textureCursor = 0;
    let hydratedTextureCount = 0;
    const preloadRoot = document.documentElement;

    const reportTextureProgress = () => {
      preloadRoot.dataset.artSpiralLoaded = String(hydratedTextureCount);
      preloadRoot.dataset.artSpiralTotal = String(works.length);
      preloadRoot.dataset.artSpiralReady = String(
        hydratedTextureCount >= works.length,
      );
      window.dispatchEvent(
        new CustomEvent("museum:art-spiral-progress", {
          detail: {
            loaded: hydratedTextureCount,
            total: works.length,
            ready: hydratedTextureCount >= works.length,
          },
        }),
      );
    };

    reportTextureProgress();

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
        } finally {
          hydratedTextureCount += 1;
          reportTextureProgress();
        }
      }
    };

    const textureWorkers = Array.from(
      { length: Math.min(4, works.length) },
      () => hydrateTextures(),
    );
    void Promise.all(textureWorkers);

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
    let selectedCard = null;
    let transitionTimeline = null;
    let isSelecting = false;
    let pinnedStageStyle;
    const motionState = { focusEase: 0.085 };

    const pinStageToViewport = () => {
      const stage = stageRef.current;

      if (!stage || pinnedStageStyle !== undefined) return;

      const rect = stage.getBoundingClientRect();
      pinnedStageStyle = stage.getAttribute("style");
      Object.assign(stage.style, {
        position: "fixed",
        inset: "auto",
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        zIndex: "100",
      });
    };

    const restorePinnedStage = () => {
      const stage = stageRef.current;

      if (!stage || pinnedStageStyle === undefined) return;

      if (pinnedStageStyle) {
        stage.setAttribute("style", pinnedStageStyle);
      } else {
        stage.removeAttribute("style");
      }
      pinnedStageStyle = undefined;
    };

    const startDefaultTransition = (workSlug) => {
      const store = useStore.getState();

      window.dispatchEvent(new Event(LOCOMOTIVE_START_EVENT));
      store.setTransitionType("default");
      store.setDestinationUrl(`/paintings/${workSlug}`);
      store.setIsTransitionActive(true);
    };

    const startSpiralTransition = (workSlug) => {
      const store = useStore.getState();
      const card = cards.find((item) => item.work.slug === workSlug);

      if (isSelecting || store.isTransitionActive) return true;
      if (!card) return false;

      const textureImage = card.frontMaterial.map?.image;
      const hasTexture =
        textureImage &&
        !(textureImage instanceof HTMLCanvasElement) &&
        Number(textureImage.naturalWidth ?? textureImage.width) > 0 &&
        Number(textureImage.naturalHeight ?? textureImage.height) > 0;

      if (!hasTexture) return false;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const isMobile = window.matchMedia("(max-width: 47.99rem)").matches;
      const imageSource = IMAGE_OVERRIDES[workSlug] ?? card.work.image;
      const naturalWidth = Number(
        textureImage.naturalWidth ?? textureImage.width,
      );
      const naturalHeight = Number(
        textureImage.naturalHeight ?? textureImage.height,
      );
      const flatCard = createFlatCard(
        card.geometry,
        naturalWidth / naturalHeight,
      );
      const startSharedTransition = () => {
        const sourceRect = getProjectedCardRect(
          card.cardGroup,
          card.geometry,
          camera,
          canvas,
        );

        if (!sourceRect || !imageSource) {
          startDefaultTransition(workSlug);
          return;
        }

        store.setArtworkTransition({
          id: `spiral-${workSlug}-${Date.now()}`,
          origin: "spiral",
          slug: workSlug,
          title: card.work.title,
          direction: "to-artwork",
          image: imageSource,
          naturalWidth,
          naturalHeight,
          objectFit: "fill",
          objectPosition: "50% 50%",
          sourceRotation: 0,
          sourceRect,
        });
        store.setTransitionType("artwork");
        store.setDestinationUrl(`/paintings/${workSlug}`);
        store.setIsTransitionActive(true);
      };

      isSelecting = true;
      selectedCard = card.cardGroup;
      hoveredCard = null;
      pointerStart = null;
      canvas.style.cursor = "default";
      canvas.style.pointerEvents = "none";
      pinStageToViewport();
      window.dispatchEvent(new Event(LOCOMOTIVE_STOP_EVENT));

      scene.attach(card.cardGroup);
      card.cardGroup.children.forEach((mesh) => {
        mesh.renderOrder = 1000;
        mesh.material.transparent = true;
        mesh.material.depthTest = false;
        mesh.material.depthWrite = false;
        mesh.material.opacity = 1;
        mesh.material.needsUpdate = true;
      });

      if (reduceMotion) {
        morphCardGeometry(
          card.geometry,
          card.curvedPositions,
          flatCard.positions,
          1,
        );
        card.cardGroup.rotation.set(0, 0, 0);
        startSharedTransition();
        return true;
      }

      const currentPosition = card.cardGroup.position.clone();
      const cameraDistance = isMobile ? 11.4 : 8.5;
      const visibleHeight =
        2 * cameraDistance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const visibleWidth = visibleHeight * camera.aspect;
      const targetScale = Math.min(
        isMobile ? 0.92 : 1.04,
        (visibleWidth * (isMobile ? 0.72 : 0.46)) / flatCard.width,
        (visibleHeight * 0.58) / flatCard.height,
      );
      const targetPosition = {
        x: THREE.MathUtils.clamp(currentPosition.x * 0.34, -1.65, 1.65),
        y:
          camera.position.y +
          THREE.MathUtils.clamp(
            (currentPosition.y - camera.position.y) * 0.34,
            -1.1,
            1.1,
          ),
        z: camera.position.z - cameraDistance,
      };
      const flattenState = { progress: 0 };

      for (const otherCard of cards) {
        if (otherCard === card) continue;
        otherCard.frontMaterial.transparent = true;
        otherCard.backMaterial.transparent = true;
        otherCard.frontMaterial.depthWrite = false;
        otherCard.backMaterial.depthWrite = false;
        otherCard.frontMaterial.needsUpdate = true;
        otherCard.backMaterial.needsUpdate = true;
      }

      transitionTimeline = gsap.timeline();
      transitionTimeline
        .to(
          motionState,
          { focusEase: 0.012, duration: 0.2, ease: "power2.out" },
          0,
        )
        .to(ribbon.position, { z: -2, duration: 0.4, ease: "power3.out" }, 0.1);

      for (const otherCard of cards) {
        if (otherCard === card) continue;

        transitionTimeline
          .to(
            [otherCard.frontMaterial, otherCard.backMaterial],
            {
              opacity: 0.06,
              duration: 0.4,
              ease: "power2.out",
            },
            0.1,
          )
          .to(
            otherCard.cardGroup.scale,
            {
              x: 0.94,
              y: 0.94,
              z: 0.94,
              duration: 0.4,
              ease: "power2.out",
            },
            0.1,
          );
      }

      transitionTimeline
        .to(
          card.cardGroup.position,
          {
            ...targetPosition,
            duration: isMobile ? 0.35 : 0.5,
            ease: "expo.inOut",
          },
          0.15,
        )
        .to(
          card.cardGroup.rotation,
          {
            x: 0,
            y: 0,
            z: 0,
            duration: isMobile ? 0.35 : 0.5,
            ease: "expo.inOut",
          },
          0.15,
        )
        .to(
          card.cardGroup.scale,
          {
            x: targetScale,
            y: targetScale,
            z: targetScale,
            duration: isMobile ? 0.35 : 0.5,
            ease: "expo.inOut",
          },
          0.15,
        )
        .to(
          flattenState,
          {
            progress: 1,
            duration: isMobile ? 0.35 : 0.5,
            ease: "expo.inOut",
            onUpdate: () => {
              morphCardGeometry(
                card.geometry,
                card.curvedPositions,
                flatCard.positions,
                flattenState.progress,
              );
            },
          },
          0.15,
        )
        .call(startSharedTransition, [], isMobile ? 0.48 : 0.65);

      return true;
    };

    startSpiralTransitionRef.current = startSpiralTransition;

    const getCardAtPointer = (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersection = raycaster.intersectObjects(ribbon.children, true)[0];

      return intersection?.object.parent ?? null;
    };

    const updateHover = (event) => {
      if (isSelecting) return;
      hoveredCard = getCardAtPointer(event);
      canvas.style.cursor = hoveredCard ? "pointer" : "default";
    };

    const clearHover = () => {
      hoveredCard = null;
      canvas.style.cursor = "default";
    };

    const handlePointerDown = (event) => {
      if (event.button !== 0 || isSelecting) return;

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

      if (!startSpiralTransition(workSlug)) {
        startDefaultTransition(workSlug);
      }
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
      currentFocus +=
        (targetFocusRef.current - currentFocus) * motionState.focusEase;
      ribbon.rotation.y = -currentFocus * ANGLE_STEP;
      ribbon.position.y =
        currentFocus * VERTICAL_STEP -
        Math.sin(currentFocus * ANGLE_STEP * WAVE_FREQUENCY) * WAVE_AMPLITUDE;
      ribbon.rotation.z = Math.sin(currentFocus * 0.32) * 0.035;

      for (const card of cards) {
        if (isSelecting || card.cardGroup === selectedCard) continue;
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
      delete preloadRoot.dataset.artSpiralLoaded;
      delete preloadRoot.dataset.artSpiralTotal;
      delete preloadRoot.dataset.artSpiralReady;
      startSpiralTransitionRef.current = null;
      transitionTimeline?.kill();
      restorePinnedStage();
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

  const handleActiveWorkClick = (event) => {
    const isModifiedClick =
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

    if (isModifiedClick || event.currentTarget.target === "_blank") return;

    if (startSpiralTransitionRef.current?.(activeWork.slug)) {
      event.preventDefault();
    }
  };

  return (
    <section
      ref={sectionRef}
      data-artwork-spiral-page
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
            onClick={handleActiveWorkClick}
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
