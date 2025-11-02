import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';

interface Project {
  title: string;
  description: string;
  tech: string[];
  details: string;
  features: string[];
}

function Interactive3DScene() {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
    
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.3}
          wireframe
        />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[2, 0.1, 16, 100]} />
        <meshStandardMaterial
          color="#ec4899"
          emissive="#ec4899"
          emissiveIntensity={0.5}
        />
      </mesh>

      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.1, 16, 100]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-4 md:inset-10 lg:inset-20 z-50 overflow-hidden"
          >
            <div className="w-full h-full bg-gradient-to-br from-purple-950/90 to-black/90 
                          backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl
                          flex flex-col md:flex-row overflow-hidden">
              <div className="w-full md:w-1/2 h-64 md:h-full relative">
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                  <color attach="background" args={['#000000']} />
                  <ambientLight intensity={0.5} />
                  <pointLight position={[5, 5, 5]} intensity={1} />
                  <pointLight position={[-5, -5, -5]} intensity={0.5} color="#8b5cf6" />
                  
                  <Interactive3DScene />
                  
                  <OrbitControls enableZoom={false} />
                </Canvas>
              </div>

              <div className="w-full md:w-1/2 p-6 md:p-10 overflow-y-auto">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full 
                           bg-white/10 hover:bg-white/20 backdrop-blur-sm
                           flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                <h2 className="text-4xl font-bold text-white mb-4">
                  {project.title}
                </h2>

                <p className="text-gray-300 text-lg mb-6">
                  {project.description}
                </p>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 
                                 rounded-full text-sm text-gray-200 border border-purple-500/30"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3">Project Details</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {project.details}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Key Features</h3>
                  <ul className="space-y-2">
                    {project.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-300">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
