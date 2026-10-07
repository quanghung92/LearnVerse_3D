"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Sparkles, MessageSquare } from "lucide-react";

interface InteractiveStudent3DProps {
  mood?: "idle" | "happy" | "thinking" | "analyzing";
  tooltipText?: string;
  onCharacterClick?: () => void;
  className?: string;
}

const STUDENT_QUOTES = [
  "Chào bạn! Mình là bạn đồng hành cùng bạn trên LearnVerse! 🎒✨",
  "Hôm nay chúng mình cùng bứt phá nhé! 🚀",
  "Cứ thong thả chọn đáp án nhé, mình luôn ở đây hỗ trợ bạn! 💡",
  "Bạn đang làm rất tốt đấy! Cố lên nào! 🌟",
  "Khám phá vũ trụ kiến thức 3D thật hào hứng phải không nào! 🛸",
  "Tuyệt vời! Lộ trình học cá nhân hóa đang dần hoàn thiện rồi! 🎯",
];

function playCuteChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.06, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    playTone(523.25, now, 0.14); // C5
    playTone(659.25, now + 0.08, 0.18); // E5
    playTone(880.0, now + 0.17, 0.28); // A5
  } catch {
    // Ignore audio permission restrictions
  }
}

export default function InteractiveStudent3D({
  mood = "idle",
  tooltipText,
  onCharacterClick,
  className = "",
}: InteractiveStudent3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [speech, setSpeech] = useState<string | null>(null);
  const speechTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moodRef = useRef(mood);
  const jumpAnimRef = useRef({ active: false, timer: 0 });

  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  useEffect(() => () => {
    if (speechTimeout.current) clearTimeout(speechTimeout.current);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
    camera.position.set(0, 0.05, 5.0);
    camera.lookAt(0, -0.05, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      container.textContent = "Thiết bị chưa hỗ trợ hiển thị 3D.";
      return () => { container.textContent = ""; };
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.replaceChildren(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(3, 4, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 2.2);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    // 3. Character Root Group
    const studentGroup = new THREE.Group();
    scene.add(studentGroup);

    // Soft circular shadow at the base under feet
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext("2d");
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 8, 64, 64, 64);
      grad.addColorStop(0, "rgba(79, 70, 229, 0.4)");
      grad.addColorStop(0.5, "rgba(99, 102, 241, 0.12)");
      grad.addColorStop(1, "rgba(99, 102, 241, 0)");
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 1.4),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(shadowCanvas),
        transparent: true,
        depthWrite: false,
      })
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -1.82, 0);
    scene.add(shadowMesh);

    // 4. Load 100% Transparent Cutout Character (No gray box, no square card borders!)
    let characterMesh: THREE.Mesh | null = null;
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load("/images/student-companion-clean.png", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;

      const geom = new THREE.PlaneGeometry(2.9, 2.9, 32, 32);

      // Give subtle 3D cylindrical curve so it pops in perspective without looking flat
      const pos = geom.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        pos.setZ(i, -x * x * 0.06);
      }
      geom.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        transparent: true,
        alphaTest: 0.05,
        roughness: 0.3,
        metalness: 0.05,
        side: THREE.DoubleSide,
      });

      characterMesh = new THREE.Mesh(geom, mat);
      characterMesh.position.set(0, 0.12, 0);
      studentGroup.add(characterMesh);
    });

    // 5. Floating Magic XP Sparks & Particles
    const particleCount = 35;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 3.5;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
      particleSpeeds[i] = 0.5 + Math.random() * 0.8;
    }

    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x6366f1,
      size: 0.065,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // 6. Interactive Mouse Tracking across the entire window
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    const onPointerMove = (e: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      const cx = bounds.left + bounds.width / 2;
      const cy = bounds.top + bounds.height / 2;

      const dx = (e.clientX - cx) / (window.innerWidth * 0.45);
      const dy = (e.clientY - cy) / (window.innerHeight * 0.45);

      target.y = THREE.MathUtils.clamp(dx, -1, 1) * 0.35;
      target.x = THREE.MathUtils.clamp(dy, -1, 1) * 0.20;
    };

    window.addEventListener("pointermove", onPointerMove);

    // 7. Auto-Resize handler
    const resize = () => {
      const width = container.clientWidth || 280;
      const height = container.clientHeight || 340;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    let raf = 0;
    let disposed = false;

    // 8. 60 FPS Animation Loop
    const animate = () => {
      raf = 0;
      if (disposed) return;

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const activeMood = moodRef.current;

      // Smooth mouse cursor 3D parallax tracking
      const smoothing = 1 - Math.exp(-9 * delta);
      current.x += (target.x - current.x) * smoothing;
      current.y += (target.y - current.y) * smoothing;

      studentGroup.rotation.y = current.y;
      studentGroup.rotation.x = current.x;

      // Organic subtle breathing & levitation
      const breathBob = Math.sin(elapsed * 2.2) * 0.035;
      studentGroup.position.y = breathBob;

      // Click happy jump animation
      const jump = jumpAnimRef.current;
      if (jump.active) {
        jump.timer += delta;
        const jumpY = Math.sin(Math.min(jump.timer * 7, Math.PI)) * 0.16;
        studentGroup.position.y += jumpY;
        if (jump.timer >= 0.5) {
          jump.active = false;
        }
      }

      // Waving hand micro-sway
      if (characterMesh) {
        const waveSpeed = activeMood === "happy" ? 5 : 2.5;
        const waveAngle = Math.sin(elapsed * waveSpeed) * 0.03;
        characterMesh.rotation.z = waveAngle;
      }

      // Shadow breathing scale
      const shadowScale = 1 - breathBob * 1.5;
      shadowMesh.scale.set(shadowScale, shadowScale, 1);

      // Particle float motion
      const pPositions = particleGeom.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        pPositions[i * 3 + 1] += particleSpeeds[i] * delta * 0.3;
        if (pPositions[i * 3 + 1] > 2.0) {
          pPositions[i * 3 + 1] = -2.0;
        }
      }
      particleGeom.attributes.position.needsUpdate = true;
      particles.rotation.y = elapsed * 0.05;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      resizeObserver.disconnect();
      renderer.dispose();
      scene.clear();
      renderer.domElement.remove();
    };
  }, []);

  // Click Handler: Play chime & show quote & jump
  const handleClick = () => {
    // 1. Trigger happy bounce animation
    jumpAnimRef.current = { active: true, timer: 0 };

    // 2. Play cute audio chime
    playCuteChime();

    // 3. Show friendly student quote
    const randomQuote = STUDENT_QUOTES[Math.floor(Math.random() * STUDENT_QUOTES.length)];
    setSpeech(randomQuote);

    if (speechTimeout.current) clearTimeout(speechTimeout.current);
    speechTimeout.current = setTimeout(() => setSpeech(null), 4500);

    onCharacterClick?.();
  };

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Speech Bubble */}
      {(speech || tooltipText) && (
        <div
          className="absolute -top-11 z-20 max-w-[270px] animate-in fade-in zoom-in-95 duration-200"
          aria-live="polite"
        >
          <div className="relative bg-white/98 backdrop-blur-md border border-indigo-200 text-slate-800 text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl shadow-indigo-500/15 flex items-center gap-2.5">
            <Sparkles
              className="w-4 h-4 text-indigo-600 shrink-0 animate-spin"
              style={{ animationDuration: "8s" }}
            />
            <span className="leading-snug">{speech || tooltipText}</span>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-indigo-200 rotate-45" />
          </div>
        </div>
      )}

      {/* 3D Interactive Canvas */}
      <div
        ref={mountRef}
        onClick={handleClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Tương tác với bạn đồng hành LearnVerse"
        className="h-[320px] w-[260px] max-w-full cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 sm:h-[350px] sm:w-[290px] transition-transform active:scale-95"
        title="Nhấp vào bạn đồng hành để trò chuyện và chào hỏi!"
      />

      {/* Interactive Action Prompt */}
      <button
        type="button"
        onClick={handleClick}
        className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100/90 border border-indigo-200/80 text-indigo-700 text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
      >
        <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
        <span>Chạm vào mình để trò chuyện 👋🎒</span>
      </button>
    </div>
  );
}
