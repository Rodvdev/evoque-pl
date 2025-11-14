'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, SphereGeometry, MeshStandardMaterial } from 'three';

interface Balloon3DProps {
  position: [number, number, number];
  color: string;
  rotationSpeed: number;
  scale: number;
  opacity: number;
  showString?: boolean; // Whether to show the balloon string
}

export function Balloon3D({
  position,
  color,
  rotationSpeed,
  scale,
  opacity,
  showString = true // Default to showing string
}: Balloon3DProps) {
  const meshRef = useRef<Mesh>(null);
  
  // Create geometry and material with useMemo for performance
  // Bigger balloon: increased radius from 0.9 to 1.4
  const geometry = useMemo(() => new SphereGeometry(1.4, 32, 32), []);
  const material = useMemo(() => {
    return new MeshStandardMaterial({
      color: color,
      metalness: 0.05,
      roughness: 0.3,
      emissive: color,
      emissiveIntensity: 0.1,
      transparent: true,
      // More realistic opacity - closer to full opacity
      opacity: opacity * 0.9 // Increased from 0.7 to 0.9 for more realistic opacity
    });
  }, [color, opacity]);

  // Continuous rotation animation (basketball spin on Y-axis)
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed * delta;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Main balloon sphere */}
      <mesh ref={meshRef} geometry={geometry} material={material}>
        {/* Highlight/shine effect - positioned on sphere surface */}
        <mesh position={[-0.4, 0.4, 0.6]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial
            color="white"
            transparent
            opacity={0.4 * opacity * 0.9}
            emissive="white"
            emissiveIntensity={0.5}
          />
        </mesh>
      </mesh>
      
      {/* Balloon tie/knot at bottom */}
      <mesh position={[0, -1.4, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.15, 8]} />
        <meshStandardMaterial color={color} transparent opacity={opacity * 0.9} />
      </mesh>
      
      {/* Balloon string - conditionally rendered */}
      {showString && (
        <mesh position={[0, -2.1, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.6, 8]} />
          <meshStandardMaterial color="#333333" transparent opacity={opacity * 0.8} />
        </mesh>
      )}
    </group>
  );
}

