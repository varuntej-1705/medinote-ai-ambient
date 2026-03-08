'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function DNAHelix() {
    const groupRef = useRef<THREE.Group>(null);
    const particlesRef = useRef<THREE.Points>(null);

    const particlesPosition = useMemo(() => {
        const positions = new Float32Array(600);
        for (let i = 0; i < 200; i++) {
            const t = (i / 200) * Math.PI * 6;
            const r = 2;
            positions[i * 3] = Math.cos(t) * r + (Math.random() - 0.5) * 0.5;
            positions[i * 3 + 1] = (i / 200) * 8 - 4 + (Math.random() - 0.5) * 0.3;
            positions[i * 3 + 2] = Math.sin(t) * r + (Math.random() - 0.5) * 0.5;
        }
        return positions;
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
        }
        if (particlesRef.current) {
            particlesRef.current.rotation.y = -state.clock.elapsedTime * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Central glowing sphere */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                <mesh>
                    <icosahedronGeometry args={[1.2, 4]} />
                    <MeshDistortMaterial
                        color="#2EC4B6"
                        emissive="#2EC4B6"
                        emissiveIntensity={0.4}
                        roughness={0.2}
                        metalness={0.8}
                        distort={0.3}
                        speed={2}
                        transparent
                        opacity={0.8}
                    />
                </mesh>
            </Float>

            {/* Orbiting rings */}
            <mesh rotation={[Math.PI / 3, 0, 0]}>
                <torusGeometry args={[2.2, 0.02, 16, 100]} />
                <meshBasicMaterial color="#4FD1C5" transparent opacity={0.5} />
            </mesh>
            <mesh rotation={[Math.PI / 6, Math.PI / 4, 0]}>
                <torusGeometry args={[2.8, 0.015, 16, 100]} />
                <meshBasicMaterial color="#0F4C81" transparent opacity={0.4} />
            </mesh>
            <mesh rotation={[-Math.PI / 4, Math.PI / 6, Math.PI / 3]}>
                <torusGeometry args={[3.2, 0.01, 16, 100]} />
                <meshBasicMaterial color="#2EC4B6" transparent opacity={0.3} />
            </mesh>

            {/* Particles */}
            <points ref={particlesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[particlesPosition, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    color="#4FD1C5"
                    size={0.04}
                    transparent
                    opacity={0.7}
                    sizeAttenuation
                />
            </points>

            {/* Small orbiting spheres */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <Float key={i} speed={1.5 + i * 0.3} rotationIntensity={0.2} floatIntensity={0.5}>
                    <mesh position={[
                        Math.cos(i * Math.PI / 3) * (2 + i * 0.2),
                        Math.sin(i * 1.5) * 1.5,
                        Math.sin(i * Math.PI / 3) * (2 + i * 0.2)
                    ]}>
                        <sphereGeometry args={[0.08 + i * 0.02, 16, 16]} />
                        <meshBasicMaterial
                            color={i % 2 === 0 ? '#4FD1C5' : '#2EC4B6'}
                            transparent
                            opacity={0.8}
                        />
                    </mesh>
                </Float>
            ))}

            {/* Ambient light */}
            <ambientLight intensity={0.3} />
            <pointLight position={[5, 5, 5]} color="#4FD1C5" intensity={1} />
            <pointLight position={[-5, -5, 5]} color="#0F4C81" intensity={0.5} />
        </group>
    );
}

export default function ThreeScene() {
    return (
        <div className="w-full h-full">
            <Canvas
                camera={{ position: [0, 0, 7], fov: 50 }}
                dpr={[1, 2]}
                style={{ background: 'transparent' }}
            >
                <DNAHelix />
            </Canvas>
        </div>
    );
}
