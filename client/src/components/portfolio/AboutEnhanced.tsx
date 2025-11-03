import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

function CameraRig({ strength = 1.6 }: { strength?: number }) {
  const { camera } = useThree();
  const tmpRef = useRef({});

  useFrame((state, delta) => {
    const mx = state.mouse.x;
    const my = state.mouse.y;
    const centerFactor = 1 - Math.min(1, Math.hypot(mx, my));

    const closeZ = 2.4;
    const farZ = 6.0;
    let targetZ = THREE.MathUtils.lerp(farZ, closeZ, centerFactor);

    if (centerFactor > 0.8) {
      const extra = (centerFactor - 0.8) / 0.2;
      targetZ = THREE.MathUtils.lerp(targetZ, closeZ * 0.9, extra * 1.2);
    }

    const lerpSpeed = 6 * strength;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, Math.min(1, delta * lerpSpeed));

    const minFov = 24;
    const maxFov = 60;
    const fovTarget = THREE.MathUtils.mapLinear(camera.position.z, closeZ * 0.9, farZ, minFov, maxFov);

    // Ensure the camera is a PerspectiveCamera before accessing fov (guards against OrthographicCamera)
    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const cam = camera as THREE.PerspectiveCamera;
      cam.fov = THREE.MathUtils.lerp(cam.fov, fovTarget, Math.min(1, delta * lerpSpeed * 0.8));
      cam.updateProjectionMatrix();
    }
  });

  return null;
}

function AnimatedParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 300;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
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
        size={0.04}
        color="#6d28d9"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

function HeartModel() {
  const { scene } = useGLTF('/geometries/heart.gltf');
  const meshRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      
      meshRef.current.rotation.x = time * 0.4;
      meshRef.current.rotation.y = time * 0.6;
      meshRef.current.rotation.z = Math.sin(time * 0.3) * 0.2;
      
      const heartbeat = 1 + Math.sin(time * 3) * 0.15;
      meshRef.current.scale.setScalar(heartbeat * 1.3);
      
      meshRef.current.position.x = mouse.x * 0.2;
      meshRef.current.position.y = mouse.y * 0.1;
      
      meshRef.current.position.z = Math.sin(time * 0.5) * 0.1;
    }
  });

  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: '#be185d',
          emissive: '#dc2626',
          emissiveIntensity: 0.5,
          metalness: 0.9,
          roughness: 0.1,
        });
      }
    });
    return cloned;
  }, [scene]);

  return (
    <group ref={meshRef} position={[0, 0, -2]}>
      <primitive object={clonedScene} />
    </group>
  );
}

function FloatingOrbs() {
  const groupRef = useRef<THREE.Group>(null);
  const orbsRef = useRef<THREE.Mesh[]>([]);
  
  const orbs = useMemo(() => [
    { color: '#6d28d9', size: 0.8, speed: 0.8, position: [2, 1, -2] },
    { color: '#be185d', size: 0.6, speed: 1.2, position: [-2, -1, -3] },
    { color: '#0e7490', size: 0.7, speed: 1.0, position: [1, 2, -1] },
  ], []);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      
      groupRef.current.rotation.y = time * 0.1;
      
      orbsRef.current.forEach((orb, index) => {
        if (orb) {
          const orbData = orbs[index];
          orb.rotation.x = time * orbData.speed;
          orb.rotation.y = time * orbData.speed * 0.7;
          
          const floatY = Math.sin(time * orbData.speed + index) * 0.2;
          orb.position.y = orbData.position[1] + floatY;
          
          const scale = 1 + Math.sin(time * orbData.speed * 2) * 0.1;
          orb.scale.setScalar(scale);
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {orbs.map((orb, index) => (
        <mesh
          key={index}
          ref={el => orbsRef.current[index] = el!}
          position={orb.position as [number, number, number]}
        >
          <icosahedronGeometry args={[orb.size, 1]} />
          <meshStandardMaterial
            color={orb.color}
            emissive={orb.color}
            emissiveIntensity={0.3}
            metalness={0.7}
            roughness={0.2}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

function LoadingFallback() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.8;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.4;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial
        color="#dc2626"
        wireframe
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

export function AboutEnhanced() {
  const stats = [
    { number: '2+', label: 'Years Experience' },
    { number: '50+', label: 'Projects Completed' },
    { number: '100%', label: 'Client Satisfaction' },
    { number: '24/7', label: 'Learning Mindset' },
  ];

  const skills = [
    { name: 'React, Node.js', level: 75 },
    { name: 'Tailwind CSS', level: 70 },
    { name: 'Bootstrap', level: 65 },
    { name: 'JavaScript', level: 75 },
    { name: 'Python', level: 50 },
    { name: 'Express.js', level: 55 },
    { name: 'GitHub, Git', level: 85 },
    { name: 'Postman', level: 80 },
  ];

  const passions = [
    {
      icon: '🚀',
      title: 'Innovation First',
      description: 'Building cutting-edge web experiences'
    },
    {
      icon: '💻',
      title: 'Clean Code',
      description: 'Writing maintainable, efficient code'
    },
    {
      icon: '🎨',
      title: 'Creative Vision',
      description: 'Technical skills with artistic creativity'
    }
  ];

  // Enhanced Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const flipVariants = {
    hidden: { 
      opacity: 0,
      rotateX: -90,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      rotateX: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const zoomVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.5
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "backOut"
      }
    }
  };

  const glowAnimation = {
    initial: { 
      boxShadow: "0 0 0px rgba(109, 40, 217, 0)",
      y: 0 
    },
    hover: {
      y: -8,
      scale: 1.05,
      boxShadow: [
        "0 0 0px rgba(109, 40, 217, 0)",
        "0 0 25px rgba(109, 40, 217, 0.6)",
        "0 0 15px rgba(109, 40, 217, 0.4)"
      ],
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  };

  const textGlowAnimation = {
    initial: { 
      textShadow: "0 0 0px rgba(255, 255, 255, 0)" 
    },
    hover: {
      textShadow: [
        "0 0 0px rgba(255, 255, 255, 0)",
        "0 0 15px rgba(255, 255, 255, 0.8)",
        "0 0 25px rgba(255, 255, 255, 0.6)",
        "0 0 0px rgba(255, 255, 255, 0)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const progressBarAnimation = {
    initial: { 
      width: 0,
      scaleX: 0 
    },
    animate: (level: number) => ({
      width: `${level}%`,
      scaleX: 1,
      transition: {
        duration: 1.5,
        delay: 0.3,
        ease: "circOut"
      }
    })
  };

  const pulseAnimation = {
    initial: { scale: 1 },
    hover: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const floatAnimation = {
    initial: { y: 0 },
    hover: {
      y: [0, -5, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const iconFlipAnimation = {
    initial: { rotateY: 0 },
    hover: {
      rotateY: 360,
      scale: 1.2,
      transition: {
        duration: 0.8,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        className="absolute inset-0 opacity-40"
      >
        <CameraRig strength={1.8} />
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={0.8} color="#6d28d9" />
        <pointLight position={[-2, -2, 2]} intensity={0.5} color="#dc2626" />
        
        <Suspense fallback={<LoadingFallback />}>
          <HeartModel />
        </Suspense>
        <AnimatedParticles />
        <FloatingOrbs />
      </Canvas>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto"
        >
          {/* Header Section with Flip Animation */}
          <motion.div
            variants={flipVariants}
            className="text-center mb-12"
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              variants={textGlowAnimation}
              whileHover="hover"
            >
              About <span className="bg-gradient-to-r from-purple-600 to-red-600 bg-clip-text text-transparent"></span>
            </motion.h2>
            <motion.div
              className="w-20 h-1 bg-gradient-to-r from-purple-600 to-red-600 mx-auto rounded-full mb-4"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            />
            <motion.p
              className="text-lg text-gray-400"
              variants={floatAnimation}
              whileHover="hover"
            >
             Student & Full Stack Developer 
            </motion.p>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Left Column */}
            <motion.div
              variants={zoomVariants}
              className="space-y-6"
            >
              <motion.div
                className="bg-gray-900/95 backdrop-blur-md rounded-xl p-6 border border-gray-800"
                variants={glowAnimation}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <motion.h3 
                  className="text-2xl font-bold text-white mb-4"
                  variants={pulseAnimation}
                  whileHover="hover"
                >
                  My Journey
                </motion.h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Hi! I'm <span className="text-purple-400 font-semibold">Subham Nayak</span>, a passionate full-stack developer with 2+ years of experience creating digital experiences.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Based in <span className="text-red-400 font-semibold">Haryana, India</span>, I've delivered 50+ projects focusing on clean code and user-centric solutions.
                </p>
              </motion.div>

              {/* Stats Grid with Flip Animation */}
              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    variants={flipVariants}
                    custom={index}
                    whileHover={{ 
                      rotateY: 180,
                      transition: { duration: 0.6 }
                    }}
                    className="bg-gray-900/80 rounded-lg p-4 text-center border border-gray-800 perspective-1000"
                  >
                    <motion.div
                      className="text-xl font-bold bg-gradient-to-r from-purple-500 to-red-500 bg-clip-text text-transparent"
                      whileHover={{ scale: 1.2 }}
                    >
                      {stat.number}
                    </motion.div>
                    <motion.div 
                      className="text-gray-400 text-xs mt-1"
                      whileHover={{ scale: 1.1 }}
                    >
                      {stat.label}
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Column - Skills with Zoom Animation */}
            <motion.div
              variants={zoomVariants}
              className="space-y-6"
            >
              <motion.div
                className="bg-gray-900/95 backdrop-blur-md rounded-xl p-6 border border-gray-800"
                variants={glowAnimation}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <motion.h3 
                  className="text-2xl font-bold text-white mb-6"
                  variants={pulseAnimation}
                  whileHover="hover"
                >
                  Technical Skills
                </motion.h3>
                <div className="space-y-4">
                  {skills.map((skill, index) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: 0.4 + index * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      viewport={{ once: true }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between text-gray-300 text-sm">
                        <motion.span 
                          className="font-medium"
                          whileHover={{ x: 5 }}
                        >
                          {skill.name}
                        </motion.span>
                        <motion.span 
                          className="text-purple-400 font-bold"
                          whileHover={{ scale: 1.3 }}
                        >
                          {skill.level}%
                        </motion.span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                        <motion.div
                          custom={skill.level}
                          variants={progressBarAnimation}
                          initial="initial"
                          whileInView="animate"
                          viewport={{ once: true }}
                          className="h-2 rounded-full bg-gradient-to-r from-purple-600 to-red-600 relative overflow-hidden"
                          whileHover={{ scaleY: 1.5 }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            initial={{ x: '-100%' }}
                            whileInView={{ x: '100%' }}
                            transition={{ 
                              duration: 1, 
                              delay: 1 + index * 0.1,
                              repeat: Infinity,
                              repeatDelay: 2
                            }}
                            viewport={{ once: true }}
                          />
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Passion Section with Enhanced Animations */}
          <motion.div
            variants={flipVariants}
            className="bg-gray-900/95 backdrop-blur-md rounded-xl p-6 border border-gray-800"
          >
            <motion.h3 
              className="text-2xl font-bold text-white mb-6 text-center"
              variants={textGlowAnimation}
              whileHover="hover"
            >
              Development Approach
            </motion.h3>
            <div className="grid md:grid-cols-3 gap-4">
              {passions.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20, rotateX: -45 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  whileHover={{ 
                    y: -10,
                    rotateY: 10,
                    transition: { duration: 0.3 }
                  }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.6 + index * 0.15,
                    type: "spring",
                    stiffness: 80
                  }}
                  viewport={{ once: true }}
                  className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 backdrop-blur-sm"
                >
                  <motion.div
                    className="text-3xl mb-3"
                    variants={iconFlipAnimation}
                    whileHover="hover"
                  >
                    {item.icon}
                  </motion.div>
                  <motion.h4 
                    className="text-lg font-bold text-white mb-2"
                    whileHover={{ scale: 1.1 }}
                  >
                    {item.title}
                  </motion.h4>
                  <motion.p 
                    className="text-gray-400 text-xs leading-relaxed"
                    whileHover={{ scale: 1.05 }}
                  >
                    {item.description}
                  </motion.p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div style={{
        '--perspective-1000': '1000px'
      } as React.CSSProperties}>
        <style>
          {`
            .perspective-1000 {
              perspective: var(--perspective-1000);
            }
          `}
        </style>
      </div>
    </div>
  );
}