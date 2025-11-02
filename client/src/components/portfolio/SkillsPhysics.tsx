import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';

interface Orb {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: string;
  scale: number;
}

function PhysicsOrb({ orb, onHover }: { orb: Orb, onHover: (pos: THREE.Vector3) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetPosition = useRef(orb.position.clone());
  const [isHovered, setIsHovered] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const bounds = 6;
      orb.position.add(orb.velocity.clone().multiplyScalar(delta));
      
      if (orb.position.x > bounds || orb.position.x < -bounds) {
        orb.velocity.x *= -0.9;
        orb.position.x = THREE.MathUtils.clamp(orb.position.x, -bounds, bounds);
      }
      if (orb.position.y > bounds || orb.position.y < -bounds) {
        orb.velocity.y *= -0.9;
        orb.position.y = THREE.MathUtils.clamp(orb.position.y, -bounds, bounds);
      }
      if (orb.position.z > 2 || orb.position.z < -8) {
        orb.velocity.z *= -0.9;
        orb.position.z = THREE.MathUtils.clamp(orb.position.z, -8, 2);
      }

      orb.velocity.multiplyScalar(0.98);

      meshRef.current.position.lerp(orb.position, 0.1);
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.3;

      if (isHovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(orb.scale * 1.5, orb.scale * 1.5, orb.scale * 1.5), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(orb.scale, orb.scale, orb.scale), 0.1);
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={orb.position}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setIsHovered(true);
        onHover(orb.position);
      }}
      onPointerLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        const impulse = new THREE.Vector3(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5
        );
        orb.velocity.add(impulse);
      }}
    >
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={orb.color}
        emissive={orb.color}
        emissiveIntensity={isHovered ? 0.8 : 0.4}
        metalness={0.8}
        roughness={0.2}
        wireframe
      />
    </mesh>
  );
}

function PhysicsScene() {
  const orbs = useMemo<Orb[]>(() => [
    { 
      position: new THREE.Vector3(-4, 1, -2), 
      velocity: new THREE.Vector3(0.5, -0.3, 0.2),
      color: '#8b5cf6', 
      scale: 0.8 
    },
    { 
      position: new THREE.Vector3(4, -1, -1), 
      velocity: new THREE.Vector3(-0.3, 0.5, -0.1),
      color: '#ec4899', 
      scale: 1 
    },
    { 
      position: new THREE.Vector3(0, 2, -3), 
      velocity: new THREE.Vector3(0.2, 0.2, 0.3),
      color: '#06b6d4', 
      scale: 0.6 
    },
    { 
      position: new THREE.Vector3(-2, -2, 0), 
      velocity: new THREE.Vector3(0.4, 0.4, -0.2),
      color: '#f59e0b', 
      scale: 0.7 
    },
    { 
      position: new THREE.Vector3(3, 0, -2), 
      velocity: new THREE.Vector3(-0.2, -0.4, 0.3),
      color: '#10b981', 
      scale: 0.9 
    },
  ], []);

  const handleHover = (position: THREE.Vector3) => {
    orbs.forEach((orb) => {
      const distance = orb.position.distanceTo(position);
      if (distance < 3 && distance > 0.1) {
        const direction = orb.position.clone().sub(position).normalize();
        orb.velocity.add(direction.multiplyScalar(0.5));
      }
    });
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      
      {orbs.map((orb, index) => (
        <PhysicsOrb key={index} orb={orb} onHover={handleHover} />
      ))}
    </>
  );
}

export function SkillsPhysics() {
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
        <PhysicsScene />
      </Canvas>

      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-bold text-white mb-8 text-center"
        >
          Skills & Technologies
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center text-gray-400 mb-16"
        >
          Click or hover on the floating orbs to interact with them!
        </motion.p>

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
