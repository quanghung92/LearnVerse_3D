"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Sparkles, MessageSquare, Loader2 } from "lucide-react";

interface InteractiveRobot3DProps {
  mood?: "idle" | "happy" | "thinking" | "analyzing";
  tooltipText?: string;
  onRobotClick?: () => void;
  className?: string;
}

const GREETING_QUOTES = [
  "Chào bạn! Mình là AI đồng hành cùng bạn trên LearnVerse 👋✨",
  "Rất vui được gặp bạn! Hãy cùng chinh phục mục tiêu hôm nay nhé 🚀",
  "Bạn học rất tập trung đấy! Cố lên nào 🌟",
  "Cứ thong thả chọn đáp án nhé, mình luôn ở đây hỗ trợ bạn 💡",
  "Khám phá vũ trụ kiến thức 3D thật hào hứng phải không nào! 🛸",
  "Tuyệt vời! Bạn đang tiến rất gần đến lộ trình cá nhân hóa rồi! 🎯",
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

export default function InteractiveRobot3D({
  mood = "idle",
  tooltipText,
  onRobotClick,
  className = "",
}: InteractiveRobot3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [speech, setSpeech] = useState<string | null>(null);
  const speechTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const moodRef = useRef(mood);
  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  // Actions and mixer references
  const animStateRef = useRef<{
    mixer: THREE.AnimationMixer | null;
    actions: Record<string, THREE.AnimationAction>;
    activeAction: THREE.AnimationAction | null;
    headBone: THREE.Object3D | null;
    robotModel: THREE.Group | null;
  }>({
    mixer: null,
    actions: {},
    activeAction: null,
    headBone: null,
    robotModel: null,
  });

  useEffect(() => () => {
    if (speechTimeout.current) clearTimeout(speechTimeout.current);
  }, []);

  // Mood reaction watcher
  useEffect(() => {
    const { actions, mixer } = animStateRef.current;
    if (!mixer || Object.keys(actions).length === 0) return;

    const fadeToAction = (name: string, duration = 0.3, loopOnce = false) => {
      const nextAction = actions[name];
      if (!nextAction) return;

      const prevAction = animStateRef.current.activeAction;
      if (prevAction === nextAction) return;

      if (loopOnce) {
        nextAction.reset().setLoop(THREE.LoopOnce, 1);
        nextAction.clampWhenFinished = true;
      } else {
        nextAction.reset().setLoop(THREE.LoopRepeat, Infinity);
      }

      nextAction.play();
      if (prevAction) {
        prevAction.crossFadeTo(nextAction, duration, true);
      }
      animStateRef.current.activeAction = nextAction;
    };

    if (mood === "happy") {
      fadeToAction(actions["ThumbsUp"] ? "ThumbsUp" : "Wave", 0.25, true);
    } else if (mood === "thinking") {
      fadeToAction(actions["Yes"] ? "Yes" : "Idle", 0.3, true);
    } else if (mood === "analyzing") {
      fadeToAction(actions["Dance"] ? "Dance" : "Wave", 0.3, false);
    } else {
      fadeToAction("Idle", 0.4, false);
    }
  }, [mood]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
    camera.position.set(0, 1.4, 5.2);
    camera.lookAt(0, 1.1, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      container.textContent = "Thiết bị chưa hỗ trợ hiển thị 3D.";
      requestAnimationFrame(() => setLoading(false));
      return () => { container.textContent = ""; };
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.replaceChildren(renderer.domElement);

    // 2. Studio Lighting & Environment Reflections
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const envTexture = pmrem.fromScene(room, 0.04).texture;
    scene.environment = envTexture;
    room.dispose();
    pmrem.dispose();

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(3, 6, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x6366f1, 3.0);
    rimLight.position.set(-4, 4, -3);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x06b6d4, 1.8);
    fillLight.position.set(4, 0, 3);
    scene.add(fillLight);

    // 3. Soft Ground Shadow Plane
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext("2d");
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 8, 64, 64, 64);
      grad.addColorStop(0, "rgba(79, 70, 229, 0.4)");
      grad.addColorStop(0.5, "rgba(99, 102, 241, 0.15)");
      grad.addColorStop(1, "rgba(99, 102, 241, 0)");
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 2.8),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(shadowCanvas),
        transparent: true,
        depthWrite: false,
      })
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, 0.02, 0);
    scene.add(shadowMesh);

    // 4. Load Robot GLB Model
    const loader = new GLTFLoader();
    let mixer: THREE.AnimationMixer | null = null;
    const actions: Record<string, THREE.AnimationAction> = {};

    loader.load(
      "/models/robot.glb",
      (gltf) => {
        const model = gltf.scene;
        model.scale.setScalar(0.48);
        model.position.set(0, 0, 0);
        scene.add(model);
        animStateRef.current.robotModel = model;

        // Shadow & material tuning
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Find Head bone for tracking
        let foundHead: THREE.Object3D | null = null;
        model.traverse((obj) => {
          if (obj.name.toLowerCase().includes("head") && !foundHead) {
            foundHead = obj;
          }
        });
        animStateRef.current.headBone = foundHead;

        // Setup Animations
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          animStateRef.current.mixer = mixer;

          gltf.animations.forEach((clip) => {
            actions[clip.name] = mixer!.clipAction(clip);
          });
          animStateRef.current.actions = actions;

          // Start default idle animation
          const idleAction = actions["Idle"] || Object.values(actions)[0];
          if (idleAction) {
            idleAction.play();
            animStateRef.current.activeAction = idleAction;
          }

          // Handle single-action finish: return to Idle
          mixer.addEventListener("finished", () => {
            const idle = actions["Idle"];
            if (idle && animStateRef.current.activeAction !== idle) {
              idle.reset().play();
              animStateRef.current.activeAction?.crossFadeTo(idle, 0.35, true);
              animStateRef.current.activeAction = idle;
            }
          });
        }

        setLoading(false);
      },
      undefined,
      (err) => {
        console.error("Lỗi tải robot.glb:", err);
        setLoading(false);
      }
    );

    // 5. Mouse tracking setup across window
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    const onPointerMove = (e: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      const cx = bounds.left + bounds.width / 2;
      const cy = bounds.top + bounds.height / 2;

      const dx = (e.clientX - cx) / (window.innerWidth * 0.45);
      const dy = (e.clientY - cy) / (window.innerHeight * 0.45);

      target.y = THREE.MathUtils.clamp(dx, -1, 1) * 0.45;
      target.x = THREE.MathUtils.clamp(dy, -1, 1) * 0.25;
    };

    window.addEventListener("pointermove", onPointerMove);

    // 6. Resize listener
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

    // 7. Render Animation Loop
    const animate = () => {
      raf = 0;
      if (disposed) return;

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Update Skeletal Animations
      if (mixer) {
        mixer.update(delta);
      }

      // Smooth Mouse Look-At Damping
      const smoothing = 1 - Math.exp(-8 * delta);
      current.x += (target.x - current.x) * smoothing;
      current.y += (target.y - current.y) * smoothing;

      const model = animStateRef.current.robotModel;
      const headBone = animStateRef.current.headBone;

      if (model) {
        // Base subtle whole body yaw towards cursor
        model.rotation.y = current.y * 0.35;

        // Subtle gentle levitation bob
        model.position.y = Math.sin(elapsed * 2) * 0.03;
      }

      // Head bone tracks cursor
      if (headBone) {
        headBone.rotation.y += current.y * 0.4;
        headBone.rotation.x += current.x * 0.25;
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      resizeObserver.disconnect();
      envTexture.dispose();
      renderer.dispose();
      scene.clear();
      renderer.domElement.remove();
    };
  }, []);

  // 8. Click Action: Wave / Jump / ThumbsUp & Speak
  const handleClick = () => {
    const { actions, mixer } = animStateRef.current;

    // Trigger sweet sound chime
    playCuteChime();

    // Trigger friendly gesture animation
    if (mixer) {
      const gestureOptions = ["Wave", "ThumbsUp", "Jump", "Yes"].filter((name) => !!actions[name]);
      if (gestureOptions.length > 0) {
        const chosen = gestureOptions[Math.floor(Math.random() * gestureOptions.length)];
        const action = actions[chosen];
        const prevAction = animStateRef.current.activeAction;

        if (action) {
          action.reset().setLoop(THREE.LoopOnce, 1);
          action.clampWhenFinished = true;
          action.play();
          if (prevAction && prevAction !== action) {
            prevAction.crossFadeTo(action, 0.2, true);
          }
          animStateRef.current.activeAction = action;
        }
      }
    }

    // Show cheerful quote in speech bubble
    const quote = GREETING_QUOTES[Math.floor(Math.random() * GREETING_QUOTES.length)];
    setSpeech(quote);

    if (speechTimeout.current) clearTimeout(speechTimeout.current);
    speechTimeout.current = setTimeout(() => setSpeech(null), 4500);

    onRobotClick?.();
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

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur-sm border border-indigo-100 text-indigo-600 text-xs font-semibold shadow-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Đang tải Robot 3D...</span>
          </div>
        </div>
      )}

      {/* 3D Canvas Box */}
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
        aria-label="Tương tác với robot trợ lý LearnVerse"
        className="h-[320px] w-[260px] max-w-full cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 sm:h-[350px] sm:w-[290px] transition-transform active:scale-95"
        title="Nhấp vào robot để vẫy chào và trò chuyện!"
      />

      {/* Interactive Action Prompt */}
      <button
        type="button"
        onClick={handleClick}
        className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100/90 border border-indigo-200/80 text-indigo-700 text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
      >
        <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
        <span>Chạm vào mình để trò chuyện 👋✨</span>
      </button>
    </div>
  );
}
