import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, Box, Torus } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { hologramVertexShader, hologramFragmentShader } from './shaders/hologram';

function HologramShape({ geometry, position, color }: { geometry: THREE.BufferGeometry, position: [number, number, number], color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
    }),
    [color]
  );

  useFrame((state) => {
    if (meshRef.current) {
      uniforms.uTime.value = state.clock.elapsedTime;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <primitive object={geometry} attach="geometry" />
        <shaderMaterial
          attach="material"
          vertexShader={hologramVertexShader}
          fragmentShader={hologramFragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
    </Float>
  );
}

function EnhancedShapes() {
  const sphereGeometry = useMemo(() => new THREE.SphereGeometry(1, 32, 32), []);
  const boxGeometry = useMemo(() => new THREE.BoxGeometry(1.5, 1.5, 1.5), []);
  const torusGeometry = useMemo(() => new THREE.TorusGeometry(1, 0.4, 16, 32), []);
  const icosahedronGeometry = useMemo(() => new THREE.IcosahedronGeometry(0.8, 0), []);

  return (
    <>
      <HologramShape 
        geometry={sphereGeometry} 
        position={[-3, 2, -2]} 
        color="#8b5cf6" 
      />
      <HologramShape 
        geometry={boxGeometry} 
        position={[3, -1, -1]} 
        color="#ec4899" 
      />
      <HologramShape 
        geometry={torusGeometry} 
        position={[0, 1, -3]} 
        color="#06b6d4" 
      />
      <HologramShape 
        geometry={icosahedronGeometry} 
        position={[2, 3, -2]} 
        color="#f59e0b" 
      />
      <HologramShape 
        geometry={boxGeometry} 
        position={[-2, -2, -2]} 
        color="#10b981" 
      />
    </>
  );
}

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 1000;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export function HeroEnhanced() {
  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        className="absolute inset-0"
      >
        <color attach="background" args={['#000000']} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        
        <EnhancedShapes />
        <ParticleField />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>

      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold text-white mb-6"
            style={{
              textShadow: '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)',
            }}
          >
            Creative Developer
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-300 mb-8"
          >
            Crafting immersive digital experiences
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex gap-4 justify-center pointer-events-auto"
          >
            <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 
                             text-white rounded-full font-semibold
                             hover:shadow-lg hover:shadow-purple-500/50 
                             transition-all duration-300 hover:scale-105">
              View Work
            </button>
            <button className="px-8 py-3 bg-white/10 backdrop-blur-sm
                             text-white rounded-full font-semibold border border-white/20
                             hover:bg-white/20 transition-all duration-300 hover:scale-105">
              Contact Me
            </button>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full p-1">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-white rounded-full mx-auto"
          />
        </div>
      </motion.div>
    </div>
  );
}
