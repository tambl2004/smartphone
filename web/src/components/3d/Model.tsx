import { useGLTF } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface ModelProps {
    path: string;
    color?: string;
    scale?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
    autoRotate?: boolean;
}

export function Model({ path, color, scale = 1.8, position = [0, -0.5, 0], rotation = [0, 0, 0], autoRotate = true }: ModelProps) {
    const groupRef = useRef<THREE.Group>(null!);
    const { scene } = useGLTF(path);

    // Apply color dynamically
    useEffect(() => {
        if (color) {
            scene.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material) {
                    const material = child.material as THREE.MeshStandardMaterial;
                    if (
                        material.name.toLowerCase().includes('body') ||
                        material.name.toLowerCase().includes('frame') ||
                        material.name.toLowerCase().includes('back') ||
                        material.name.toLowerCase().includes('metal')
                    ) {
                        material.color.set(color);
                    }
                }
            });
        }
    }, [scene, color]);

    // Idle subtle rotation – calls invalidate() for on-demand frameloop
    useFrame((state) => {
        if (!autoRotate || !groupRef.current) return; // Skip entirely when paused
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.05;
        state.invalidate(); // Request next frame (on-demand loop)
    });

    return (
        <group ref={groupRef} dispose={null}>
            <primitive
                object={scene}
                scale={scale}
                position={position}
                rotation={rotation}
            />
        </group>
    );
}

// Only preload the hero model - others will load on demand
useGLTF.preload('/models/iphone_16_pro_max.glb');
