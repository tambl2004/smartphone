import { Suspense, useState, useEffect, useRef, memo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Model } from './Model';

// Lightweight loading placeholder that shows immediately
const HeroPlaceholder = () => (
  <div className="w-full h-full absolute inset-0 z-0 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-2 border-neutral-300 dark:border-neutral-600 border-t-black dark:border-t-white rounded-full animate-spin" />
      <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium tracking-wide uppercase">
        Đang tải mô hình 3D...
      </span>
    </div>
  </div>
);

/**
 * Component that pauses the render loop when `paused` is true.
 * When active, it invalidates the frame so on-demand rendering works.
 */
const RenderController = memo(({ paused }: { paused: boolean }) => {
  const { invalidate } = useThree();

  useEffect(() => {
    if (!paused) {
      // Kick one frame so the scene redraws when becoming visible
      invalidate();
    }
  }, [paused, invalidate]);

  return null;
});

RenderController.displayName = 'RenderController';

// Inner scene component – uses lightweight directional lights instead of
// a heavy HDR Environment preset. Float is removed to cut per-frame work.
const HeroScene = memo(({ paused }: { paused: boolean }) => (
  <>
    {/* Premium lighting setup */}
    <ambientLight intensity={1.2} />
    <directionalLight position={[5, 8, 5]} intensity={1.5} color="#ffffff" />
    <directionalLight position={[-4, 3, -3]} intensity={0.8} />
    <directionalLight position={[0, 0, 8]} intensity={1.5} color="#ffffff" />
    <Environment preset="city" />

    <RenderController paused={paused} />

    <Model
      path="/models/iphone_16_pro_max.glb"
      scale={2.8}
      rotation={[0, Math.PI / 2 - 0.31, 0]}
      autoRotate={!paused}
    />

    <OrbitControls
      enablePan={false}
      enableZoom={false}
      minPolarAngle={Math.PI / 2.5}
      maxPolarAngle={Math.PI / 2}
    />
  </>
));

HeroScene.displayName = 'HeroScene';

export const Hero3DViewer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [inViewport, setInViewport] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Defer 3D rendering to after first paint so text content shows immediately
  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (win.requestIdleCallback) {
      const id = win.requestIdleCallback(() => setIsVisible(true), { timeout: 100 });
      return () => win.cancelIdleCallback?.(id);
    } else {
      const id = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(id);
    }
  }, []);

  // Pause the 3D render loop when the hero section is scrolled out of view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible]);

  if (!isVisible) {
    return <HeroPlaceholder />;
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full absolute inset-0 z-0 pointer-events-none md:pointer-events-auto"
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        // ★ On-demand rendering – only re-renders when invalidate() is called
        frameloop="demand"
      >
        <Suspense fallback={null}>
          <HeroScene paused={!inViewport} />
        </Suspense>
      </Canvas>
    </div>
  );
};
