import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  createMascotDNA,
  mascotBoundingRadius,
  type MascotDNA,
} from "../lib/mascot-dna";
import { buildProceduralMascot } from "../lib/procedural-mascot-three";

type Mood = "happy" | "smile" | "neutral" | "sleepy";

type Props = {
  seed: string;
  size?: number;
  mood?: Mood;
  className?: string;
};

// ─── Module-level renderer cache ─────────────────────────────────────────────
// Keep the Three.js renderer alive between route navigations.
// On unmount: pause the RAF and detach canvas.
// On remount: reattach canvas and resume RAF — zero rebuild cost.
type RendererEntry = {
  canvas: HTMLCanvasElement;
  pause: () => void;
  resume: () => void;
  dispose: () => void;
};

const rendererCache = new Map<string, RendererEntry>();

function buildEntry(
  seed: string,
  dna: MascotDNA,
  size: number,
  mood: Mood,
): RendererEntry {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(dpr);
  renderer.setSize(size, size);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = `${size}px`;
  renderer.domElement.style.height = `${size}px`;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  // PMREMGenerator leaves the renderer viewport in a modified state after
  // cubemap-face rendering. Reset to full canvas so the main render is correct.
  renderer.setViewport(0, 0, size, size);
  renderer.setScissorTest(false);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 20);
  const radius = mascotBoundingRadius(dna);
  const camDist = radius * 5.6;
  camera.position.set(0, radius * 0.18, camDist);
  camera.lookAt(0, 0, 0);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.05);
  keyLight.position.set(1.2, 1.6, 1.4);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffe1ec, 0.45);
  fillLight.position.set(-1.4, 0.6, 0.8);
  scene.add(fillLight);

  scene.add(new THREE.AmbientLight(0xffffff, 0.25));

  const handles = buildProceduralMascot(dna, seed || "nibbo");
  scene.add(handles.root);

  handles.mouthNeutral.visible = mood === "neutral";
  handles.mouthSmile.visible = mood === "smile" || mood === "happy";
  handles.mouthSleepy.visible = mood === "sleepy";
  if (mood === "sleepy") handles.sleepyEyelids.visible = true;

  const moodAmp =
    mood === "happy"
      ? 1.6
      : mood === "smile"
        ? 1.0
        : mood === "neutral"
          ? 0.7
          : 0.45;
  const moodFreq =
    mood === "happy"
      ? 1.5
      : mood === "smile"
        ? 1.1
        : mood === "neutral"
          ? 0.85
          : 0.6;
  let targetTiltX = 0,
    targetTiltY = 0,
    smoothTiltX = 0,
    smoothTiltY = 0;
  const maxTilt = 0.22;

  const handleOrientation = (e: DeviceOrientationEvent) => {
    targetTiltX = THREE.MathUtils.clamp(
      ((e.beta ?? 0) / 45) * 0.12,
      -maxTilt,
      maxTilt,
    );
    targetTiltY = THREE.MathUtils.clamp(
      ((e.gamma ?? 0) / 45) * 0.16,
      -maxTilt,
      maxTilt,
    );
  };
  const maybeEnableOrientation = async () => {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window))
      return;
    const req = (
      window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<"granted" | "denied">;
      }
    ).requestPermission;
    if (typeof req === "function") {
      const onStart = async () => {
        if ((await req()) === "granted")
          window.addEventListener("deviceorientation", handleOrientation);
        window.removeEventListener("pointerdown", onStart);
        window.removeEventListener("touchstart", onStart);
      };
      window.addEventListener("pointerdown", onStart, { once: true });
      window.addEventListener("touchstart", onStart, { once: true });
      return;
    }
    window.addEventListener("deviceorientation", handleOrientation);
  };
  void maybeEnableOrientation();

  let raf = 0;
  let running = false;
  const startTime = performance.now();

  const animate = () => {
    if (!running) return;
    const t = (performance.now() - startTime) / 1000;
    const bob =
      Math.sin(t * dna.bobSpeed * moodFreq * Math.PI * 2 * 0.45) *
      dna.bobAmp *
      moodAmp;
    const sway = Math.sin(t * 0.7 + dna.blinkOffset) * dna.swayAmp * moodAmp;
    handles.body.position.y = bob;
    handles.body.position.x = sway * 0.3;
    smoothTiltX = THREE.MathUtils.lerp(smoothTiltX, targetTiltX, 0.08);
    smoothTiltY = THREE.MathUtils.lerp(smoothTiltY, targetTiltY, 0.08);
    handles.body.rotation.x = smoothTiltX;
    handles.body.rotation.y = sway * 0.6 + smoothTiltY;
    handles.body.rotation.z =
      Math.sin(t * 0.55) * 0.04 * moodAmp - smoothTiltY * 0.35;
    const blinkPhase = (t * 0.7 + dna.blinkOffset) % 4;
    const blink =
      blinkPhase < 0.12
        ? 1 - blinkPhase / 0.12
        : blinkPhase < 0.24
          ? (blinkPhase - 0.12) / 0.12
          : 1;
    handles.leftEye.scale.y = dna.eyeOvalY * dna.eyeOvalL * blink;
    handles.rightEye.scale.y = dna.eyeOvalY * dna.eyeOvalR * blink;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  };

  const entry: RendererEntry = {
    canvas: renderer.domElement,
    resume() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(animate);
    },
    pause() {
      running = false;
      cancelAnimationFrame(raf);
    },
    dispose() {
      entry.pause();
      window.removeEventListener("deviceorientation", handleOrientation);
      handles.dispose();
      pmrem.dispose();
      envTex.dispose();
      renderer.dispose();
    },
  };

  return entry;
}
// ─────────────────────────────────────────────────────────────────────────────

export function Mascot({
  seed,
  size = 160,
  mood = "smile",
  className = "",
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const dna = useMemo<MascotDNA>(
    () => createMascotDNA(seed || "nibbo"),
    [seed],
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const cacheKey = `${seed}:${mood}:${size}`;
    let entry = rendererCache.get(cacheKey);
    if (!entry) {
      entry = buildEntry(seed, dna, size, mood);
      rendererCache.set(cacheKey, entry);
    }

    host.appendChild(entry.canvas);
    entry.resume();

    return () => {
      // Pause animation but keep renderer alive — instant re-attach on next visit
      entry!.pause();
      if (entry!.canvas.parentNode === host) {
        host.removeChild(entry!.canvas);
      }
    };
  }, [dna, mood, seed, size]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}
