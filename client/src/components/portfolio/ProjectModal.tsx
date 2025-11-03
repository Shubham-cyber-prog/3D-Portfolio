import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, Cpu, Globe, Code, Database, Shield } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls, Float, Sparkles as ThreeSparkles } from '@react-three/drei';

// Floating particles component
function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const particleCount = 100;
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
  }

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
        color="#8b5cf6"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Enhanced 3D Scene with multiple animated elements
function Interactive3DScene() {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const torusRef1 = useRef<THREE.Mesh>(null);
  const torusRef2 = useRef<THREE.Mesh>(null);
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.3;
      meshRef.current.rotation.y = time * 0.5;
      meshRef.current.position.y = Math.sin(time) * 0.2;
    }
    
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.1;
    }

    if (torusRef1.current) {
      torusRef1.current.rotation.x = time * 0.4;
      torusRef1.current.rotation.y = time * 0.3;
    }

    if (torusRef2.current) {
      torusRef2.current.rotation.x = time * 0.5;
      torusRef2.current.rotation.z = time * 0.2;
    }

    if (sphereRef.current) {
      sphereRef.current.scale.x = 1 + Math.sin(time * 2) * 0.1;
      sphereRef.current.scale.y = 1 + Math.sin(time * 2) * 0.1;
      sphereRef.current.scale.z = 1 + Math.sin(time * 2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main Icosahedron */}
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1.2, 1]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.5}
            wireframe
            transparent
            opacity={0.8}
          />
        </mesh>
      </Float>

      {/* Animated Torus 1 */}
      <Float speed={3} rotationIntensity={2}>
        <mesh ref={torusRef1} position={[0, 0, 0]}>
          <torusGeometry args={[1.8, 0.08, 16, 100]} />
          <meshStandardMaterial
            color="#ec4899"
            emissive="#ec4899"
            emissiveIntensity={0.6}
            transparent
            opacity={0.7}
          />
        </mesh>
      </Float>

      {/* Animated Torus 2 */}
      <Float speed={4} rotationIntensity={1.5}>
        <mesh ref={torusRef2} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.2, 0.06, 16, 100]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={0.6}
            transparent
            opacity={0.7}
          />
        </mesh>
      </Float>

      {/* Central Sphere */}
      <Float speed={1} rotationIntensity={0.5}>
        <mesh ref={sphereRef}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.3}
            transparent
            opacity={0.9}
          />
        </mesh>
      </Float>

      {/* Sparkles */}
      <ThreeSparkles count={50} scale={4} size={2} speed={0.3} />
      
      {/* Floating Particles */}
      <FloatingParticles />
    </group>
  );
}

// Tech Icon component with animations
function TechIcon({ icon: Icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay
      }}
      whileHover={{
        scale: 1.2,
        rotate: 360,
        transition: { duration: 0.3 }
      }}
      className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 
                 rounded-lg border border-purple-500/30"
    >
      <Icon className="w-5 h-5 text-purple-300" />
    </motion.div>
  );
}

// Animated Feature Item
function AnimatedFeatureItem({ feature, index }: { feature: string; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + index * 0.1 }}
      className="flex items-start gap-3 text-gray-300 group"
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: index * 0.2
        }}
        className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 
                   rounded-full mt-2 flex-shrink-0"
      />
      <motion.span
        whileHover={{ x: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
        className="group-hover:text-white transition-colors"
      >
        {feature}
      </motion.span>
    </motion.li>
  );
}

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  if (!project) return null;

  const techIcons = [Code, Database, Shield, Globe, Cpu, Zap];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50"
            onClick={onClose}
          />
          
          {/* Main Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100, rotateX: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100, rotateX: 15 }}
            transition={{ 
              type: 'spring', 
              damping: 25,
              stiffness: 200
            }}
            className="fixed inset-4 md:inset-10 lg:inset-20 z-50 overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full h-full bg-gradient-to-br from-purple-950/95 via-gray-900/95 to-black/95 
                        backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl
                        flex flex-col md:flex-row overflow-hidden relative"
            >
              {/* Animated background elements */}
              <motion.div
                animate={{
                  background: [
                    'radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
                    'radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)',
                    'radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)',
                    'radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
                  ]
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute inset-0 pointer-events-none"
              />

              {/* 3D Canvas Section */}
              <div className="w-full md:w-2/5 h-80 md:h-full relative overflow-hidden">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute top-4 left-4 z-10 flex gap-2"
                >
                  {techIcons.map((Icon, index) => (
                    <TechIcon key={index} icon={Icon} delay={0.8 + index * 0.1} />
                  ))}
                </motion.div>

                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                  <color attach="background" args={['#000000']} />
                  <ambientLight intensity={0.6} />
                  <pointLight position={[5, 5, 5]} intensity={1.5} color="#8b5cf6" />
                  <pointLight position={[-5, -5, -5]} intensity={0.8} color="#ec4899" />
                  <pointLight position={[0, 5, 0]} intensity={0.5} color="#06b6d4" />
                  
                  <Interactive3DScene />
                  
                  <OrbitControls 
                    enableZoom={false} 
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={2}
                  />
                </Canvas>
              </div>

              {/* Content Section */}
              <div className="w-full md:w-3/5 p-6 md:p-10 overflow-y-auto relative">
                {/* Close Button */}
                <motion.button
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="absolute top-6 right-6 w-12 h-12 rounded-full 
                           bg-gradient-to-br from-purple-500/20 to-pink-500/20 
                           backdrop-blur-lg border border-white/10
                           flex items-center justify-center transition-all
                           hover:shadow-lg hover:shadow-purple-500/30 z-10"
                >
                  <X className="w-6 h-6 text-white" />
                </motion.button>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 
                           bg-clip-text text-transparent mb-4 pr-16"
                >
                  {project.title}
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-300 text-xl mb-8 leading-relaxed font-light"
                >
                  {project.description}
                </motion.p>

                {/* Technologies */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mb-8"
                >
                  <motion.h3 
                    className="text-2xl font-semibold text-white mb-4 flex items-center gap-3"
                    whileHover={{ x: 5 }}
                  >
                    <Zap className="w-6 h-6 text-purple-400" />
                    Technologies Used
                  </motion.h3>
                  <div className="flex flex-wrap gap-3">
                    {project.tech.map((tech, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                        whileHover={{
                          scale: 1.1,
                          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))"
                        }}
                        className="px-5 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 
                                 rounded-2xl text-base text-gray-200 border border-purple-500/20
                                 backdrop-blur-sm font-medium"
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>

                {/* Project Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mb-8"
                >
                  <motion.h3 
                    className="text-2xl font-semibold text-white mb-4 flex items-center gap-3"
                    whileHover={{ x: 5 }}
                  >
                    <Globe className="w-6 h-6 text-cyan-400" />
                    Project Overview
                  </motion.h3>
                  <motion.p 
                    className="text-gray-300 leading-relaxed text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    {project.details}
                  </motion.p>
                </motion.div>

                {/* Key Features */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <motion.h3 
                    className="text-2xl font-semibold text-white mb-4 flex items-center gap-3"
                    whileHover={{ x: 5 }}
                  >
                    <Sparkles className="w-6 h-6 text-pink-400" />
                    Key Features
                  </motion.h3>
                  <ul className="space-y-4">
                    {project.features.map((feature, i) => (
                      <AnimatedFeatureItem key={i} feature={feature} index={i} />
                    ))}
                  </ul>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}