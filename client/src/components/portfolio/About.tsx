import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 800;
  
  const { positions, colors, velocities } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const cols = new Float32Array(particleCount * 3);
    const vels = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Spherical distribution
      const radius = 8 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      // Gradient colors from purple to pink
      const color = new THREE.Color();
      const hue = 0.75 + Math.random() * 0.15; // Purple to pink range
      color.setHSL(hue, 0.8, 0.6 + Math.random() * 0.3);
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;

      // Random velocities for floating motion
      vels[i * 3] = (Math.random() - 0.5) * 0.02;
      vels[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      vels[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    return { positions: pos, colors: cols, velocities: vels };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.elapsedTime;
      const positions = particlesRef.current.geometry.attributes.position;
      
      // Gentle rotation
      particlesRef.current.rotation.y = time * 0.05;
      particlesRef.current.rotation.x = Math.sin(time * 0.03) * 0.2;

      // Floating animation with individual velocities
      for (let i = 0; i < particleCount; i++) {
        const vx = positions.getX(i) + Math.sin(time * 0.5 + i) * 0.01;
        const vy = positions.getY(i) + Math.cos(time * 0.3 + i) * 0.01;
        const vz = positions.getZ(i) + Math.sin(time * 0.4 + i) * 0.01;
        
        positions.setX(i, vx);
        positions.setY(i, vy);
        positions.setZ(i, vz);
      }
      positions.needsUpdate = true;
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
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function FloatingOrbs() {
  const groupRef = useRef<THREE.Group>(null);
  const orbs = useRef<THREE.Mesh[]>([]);
  
  const orbData = useMemo(() => [
    { color: '#8b5cf6', size: 0.8, speed: 0.8, position: [3, 2, -2] },
    { color: '#ec4899', size: 0.6, speed: 1.2, position: [-3, -1, -3] },
    { color: '#06b6d4', size: 0.7, speed: 1.0, position: [2, -2, -1] },
    { color: '#f59e0b', size: 0.5, speed: 1.5, position: [-2, 3, -4] },
  ], []);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      
      // Group rotation
      groupRef.current.rotation.y = time * 0.1;
      groupRef.current.rotation.x = Math.sin(time * 0.05) * 0.1;

      // Individual orb animations
      orbs.current.forEach((orb, index) => {
        if (orb) {
          const data = orbData[index];
          
          // Rotation
          orb.rotation.x = time * data.speed;
          orb.rotation.y = time * data.speed * 0.7;
          
          // Floating motion
          const floatY = Math.sin(time * data.speed + index) * 0.3;
          const floatX = Math.cos(time * data.speed * 0.5 + index) * 0.2;
          orb.position.y = data.position[1] + floatY;
          orb.position.x = data.position[0] + floatX;
          
          // Pulsing scale
          const scale = 1 + Math.sin(time * data.speed * 2) * 0.2;
          orb.scale.setScalar(scale);
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {orbData.map((orb, index) => (
        <mesh
          key={index}
          ref={el => orbs.current[index] = el!}
          position={orb.position as [number, number, number]}
        >
          <icosahedronGeometry args={[orb.size, 2]} />
          <meshStandardMaterial
            color={orb.color}
            emissive={orb.color}
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

export function About() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const cardHoverAnimation = {
    hover: {
      y: -10,
      scale: 1.02,
      rotateY: 5,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const floatingAnimation = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const skills = [
    {
      category: "Frontend & Design",
      items: ['React.js', 'Three.js', 'WebGL', 'TypeScript', 'Tailwind CSS', 'Framer Motion']
    },
    {
      category: "Backend & Tools",
      items: ['Node.js', 'Python', 'MongoDB', 'Git', 'Docker', 'AWS']
    },
    {
      category: "Creative & 3D",
      items: ['Blender', 'GSAP', 'Shader Programming', 'UI/UX Design', 'Animation', 'Creative Coding']
    }
  ];

  const stats = [
    { number: '50+', label: 'Projects Completed' },
    { number: '3+', label: 'Years Experience' },
    { number: '100%', label: 'Client Satisfaction' },
    { number: '24/7', label: 'Code Passion' }
  ];

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-black via-purple-950/40 to-pink-950/20 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        className="absolute inset-0 opacity-40"
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#8b5cf6" />
        <pointLight position={[-5, -5, 3]} intensity={0.8} color="#ec4899" />
        
        <FloatingParticles />
        <FloatingOrbs />
      </Canvas>

      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-6xl mx-auto"
        >
          {/* Header Section */}
          <motion.div
            variants={itemVariants}
            className="text-center mb-16"
          >
            <motion.h2
              className="text-6xl md:text-7xl font-bold text-white mb-6"
              {...floatingAnimation}
            >
              About <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Me</span>
            </motion.h2>
            
            <motion.div
              className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full mb-6"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              viewport={{ once: true }}
            />

            <motion.p
              className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Crafting digital experiences that blend cutting-edge technology with 
              artistic vision to create immersive web applications.
            </motion.p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10"
                whileHover={{
                  y: -5,
                  scale: 1.05,
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  transition: { duration: 0.3 }
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Left Column */}
            <motion.div
              variants={itemVariants}
              className="space-y-8"
            >
              <motion.div
                className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 
                           hover:border-purple-500/30 transition-all duration-500"
                variants={cardHoverAnimation}
                whileHover="hover"
              >
                <motion.h3 
                  className="text-3xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                >
                  My Journey
                </motion.h3>
                <p className="text-gray-300 leading-relaxed text-lg mb-4">
                  I'm a passionate full-stack developer and creative coder with a deep love for 
                  building immersive 3D web experiences. My journey began with curiosity and has 
                  evolved into a pursuit of creating digital art through code.
                </p>
                <p className="text-gray-300 leading-relaxed text-lg">
                  I specialize in blending modern web technologies with artistic vision to 
                  create experiences that not only function flawlessly but also inspire and 
                  engage users on an emotional level.
                </p>
              </motion.div>
            </motion.div>

            {/* Right Column */}
            <motion.div
              variants={itemVariants}
              className="space-y-8"
            >
              <motion.div
                className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 
                           hover:border-cyan-500/30 transition-all duration-500"
                variants={cardHoverAnimation}
                whileHover="hover"
              >
                <motion.h3 
                  className="text-3xl font-bold text-white mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                >
                  My Philosophy
                </motion.h3>
                <p className="text-gray-300 leading-relaxed text-lg mb-4">
                  I believe that great digital experiences should be both functional and beautiful. 
                  Every line of code is an opportunity to create something remarkable that pushes 
                  the boundaries of what's possible on the web.
                </p>
                <p className="text-gray-300 leading-relaxed text-lg">
                  Through continuous learning and experimentation, I strive to stay at the 
                  forefront of web technologies while maintaining a focus on creating meaningful, 
                  user-centered solutions.
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* Skills Section */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 
                       backdrop-blur-xl rounded-3xl p-8 border border-white/10"
          >
            <motion.h3 
              className="text-4xl font-bold text-white mb-8 text-center"
              {...floatingAnimation}
            >
              Skills & Technologies
            </motion.h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              {skills.map((category, categoryIndex) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + categoryIndex * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <h4 className="text-xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {category.category}
                  </h4>
                  <div className="space-y-3">
                    {category.items.map((skill, skillIndex) => (
                      <motion.div
                        key={skill}
                        className="flex items-center justify-center gap-3 p-3 bg-white/5 rounded-xl 
                                   hover:bg-white/10 transition-all duration-300"
                        whileHover={{ 
                          x: 10,
                          scale: 1.05,
                          transition: { duration: 0.2 }
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 + skillIndex * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                        <span className="text-gray-300 font-medium">{skill}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <motion.p
              className="text-gray-300 text-xl mb-8 max-w-2xl mx-auto"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Ready to bring your next project to life with stunning 3D experiences?
            </motion.p>
            <motion.button
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 
                         rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/30 
                         transition-all duration-300"
              whileHover={{
                scale: 1.05,
                y: -2,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              Let's Create Together
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}