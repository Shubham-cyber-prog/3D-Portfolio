import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, Box, Torus } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useRef, useMemo, useState, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      return window.innerWidth <= 768;
    };
    
    setIsMobile(checkMobile());
    
    const handleResize = () => {
      setIsMobile(checkMobile());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Button click handlers
  const handleViewWork = () => {
    window.open('https://github.com/Shubham-cyber-prog?tab=repositories', '_blank');
  };

  const handleContactMe = () => {
    window.open('https://www.linkedin.com/in/subhamnayak/', '_blank');
  };

  // Simple scroll handler - direct scroll
  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative w-full h-screen">
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
        
        {/* Mobile pe OrbitControls disable, desktop pe enable */}
        {!isMobile && (
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
          />
        )}
      </Canvas>

      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-6xl md:text-8xl font-bold text-white mb-4 sm:mb-6"
            style={{
              textShadow: '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)',
            }}
          >
            Subham Nayak
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 sm:mb-8"
          >
            Full Stack Developer
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pointer-events-auto"
          >
            <button 
              onClick={handleViewWork}
              className="px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 
                         text-white rounded-full font-semibold text-sm sm:text-base
                         hover:shadow-lg hover:shadow-purple-500/50 
                         transition-all duration-300 hover:scale-105
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
                         w-full sm:w-auto max-w-xs"
            >
              View Work
            </button>
            <button 
              onClick={handleContactMe}
              className="px-6 sm:px-8 py-3 bg-white/10 backdrop-blur-sm
                         text-white rounded-full font-semibold border border-white/20 text-sm sm:text-base
                         hover:bg-white/20 transition-all duration-300 hover:scale-105
                         focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50
                         w-full sm:w-auto max-w-xs"
            >
              Contact Me
            </button>
          </motion.div>
        </div>
      </div>

      {/* Simple Scroll Indicator - Mobile Friendly */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 cursor-pointer pointer-events-auto"
        onClick={handleScrollDown}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleScrollDown();
          }
        }}
      >
        <div className="flex flex-col items-center">
          <div className="w-5 h-8 border-2 border-white/60 rounded-full flex justify-center hover:border-white/80 transition-colors duration-300 group">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
              className="w-1 h-2 bg-white rounded-full mt-1 group-hover:bg-purple-400 transition-colors duration-300"
            />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 2 }}
            className="text-white/70 text-xs mt-2 text-center hover:text-white transition-colors duration-300"
          >
            Scroll
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}

// Next section component
export function NextSection() {
  return (
    <section id="next-section" className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center text-white px-4">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Next Section</h2>
        <p className="text-lg sm:text-xl">This is the section that appears after scrolling down</p>
      </div>
    </section>
  );
}