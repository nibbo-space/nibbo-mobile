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

export function Mascot({ seed, size = 160, mood = "smile", className = "" }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const dna = useMemo<MascotDNA>(() => createMascotDNA(seed || "nibbo"), [seed]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

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
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

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
      mood === "happy" ? 1.6 : mood === "smile" ? 1.0 : mood === "neutral" ? 0.7 : 0.45;
    const moodFreq =
      mood === "happy" ? 1.5 : mood === "smile" ? 1.1 : mood === "neutral" ? 0.85 : 0.6;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let smoothTiltX = 0;
    let smoothTiltY = 0;
    const maxTilt = 0.22;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const beta = event.beta ?? 0;
      const gamma = event.gamma ?? 0;
      const nextX = THREE.MathUtils.clamp((beta / 45) * 0.12, -maxTilt, maxTilt);
      const nextY = THREE.MathUtils.clamp((gamma / 45) * 0.16, -maxTilt, maxTilt);
      targetTiltX = nextX;
      targetTiltY = nextY;
    };

    const maybeEnableOrientation = async () => {
      if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return;
      const requestPermission = (
        window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
          requestPermission?: () => Promise<"granted" | "denied">;
        }
      ).requestPermission;
      if (typeof requestPermission === "function") {
        const onStart = async () => {
          const status = await requestPermission();
          if (status === "granted") {
            window.addEventListener("deviceorientation", handleOrientation);
          }
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
    const start = performance.now();
    const animate = () => {
      const t = (performance.now() - start) / 1000;
      const bob = Math.sin(t * dna.bobSpeed * moodFreq * Math.PI * 2 * 0.45) * dna.bobAmp * moodAmp;
      const sway = Math.sin(t * 0.7 + dna.blinkOffset) * dna.swayAmp * moodAmp;
      handles.body.position.y = bob;
      handles.body.position.x = sway * 0.3;
      smoothTiltX = THREE.MathUtils.lerp(smoothTiltX, targetTiltX, 0.08);
      smoothTiltY = THREE.MathUtils.lerp(smoothTiltY, targetTiltY, 0.08);
      handles.body.rotation.x = smoothTiltX;
      handles.body.rotation.y = sway * 0.6 + smoothTiltY;
      handles.body.rotation.z = Math.sin(t * 0.55) * 0.04 * moodAmp - smoothTiltY * 0.35;

      const blinkPhase = (t * 0.7 + dna.blinkOffset) % 4;
      const blink = blinkPhase < 0.12 ? 1 - blinkPhase / 0.12 : blinkPhase < 0.24 ? (blinkPhase - 0.12) / 0.12 : 1;
      handles.leftEye.scale.y = dna.eyeOvalY * dna.eyeOvalL * blink;
      handles.rightEye.scale.y = dna.eyeOvalY * dna.eyeOvalR * blink;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("deviceorientation", handleOrientation);
      handles.dispose();
      pmrem.dispose();
      envTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
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
