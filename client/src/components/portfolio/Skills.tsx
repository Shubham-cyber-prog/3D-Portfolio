import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function SkillOrb({ position, color, scale }: { position: [number, number, number], color: string, scale: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        metalness={0.8}
        roughness={0.2}
        wireframe
      />
    </mesh>
  );
}

function SkillsScene() {
  const orbs = useMemo(() => [
    { position: [-4, 1, -2] as [number, number, number], color: '#8b5cf6', scale: 0.8 },
    { position: [4, -1, -1] as [number, number, number], color: '#ec4899', scale: 1 },
    { position: [0, 2, -3] as [number, number, number], color: '#06b6d4', scale: 0.6 },
    { position: [-2, -2, 0] as [number, number, number], color: '#f59e0b', scale: 0.7 },
    { position: [3, 0, -2] as [number, number, number], color: '#10b981', scale: 0.9 },
  ], []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      
      {orbs.map((orb, index) => (
        <SkillOrb key={index} {...orb} />
      ))}
    </>
  );
}

export function Skills() {
  const skillCategories = [
    {
      title: 'Frontend',
      skills: ['React', 'Three.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: '3D & Graphics',
      skills: ['WebGL', 'GLSL Shaders', 'React Three Fiber', 'Blender', 'GSAP'],
      color: 'from-pink-500 to-orange-500',
    },
    {
      title: 'Backend',
      skills: ['Node.js', 'Express', 'PostgreSQL', 'REST APIs', 'WebSockets'],
      color: 'from-cyan-500 to-blue-500',
    },
  ];

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-black to-purple-950/20">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        className="absolute inset-0 opacity-30"
      >
        <SkillsScene />
      </Canvas>

      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-bold text-white mb-16 text-center"
        >
          Skills & Technologies
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {skillCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className={`
                absolute inset-0 bg-gradient-to-br ${category.color} opacity-20
                rounded-2xl blur-xl group-hover:opacity-30 transition-opacity duration-500
              `} />
              
              <div className="relative bg-white/5 backdrop-blur-lg rounded-2xl p-8 
                            border border-white/10 hover:border-white/30 
                            transition-all duration-500">
                <h3 className={`
                  text-2xl font-bold mb-6 bg-gradient-to-r ${category.color}
                  bg-clip-text text-transparent
                `}>
                  {category.title}
                </h3>

                <div className="space-y-3">
                  {category.skills.map((skill, skillIndex) => (
                    <motion.div
                      key={skillIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + skillIndex * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3 group/item"
                    >
                      <div className={`
                        w-2 h-2 rounded-full bg-gradient-to-r ${category.color}
                        group-hover/item:w-3 group-hover/item:h-3 transition-all duration-300
                      `} />
                      <span className="text-gray-300 group-hover/item:text-white transition-colors">
                        {skill}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Always learning and exploring new technologies to create innovative web experiences
          </p>
        </motion.div>
      </div>
    </div>
  );
}
