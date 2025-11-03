import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';

interface Orb {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: string;
  scale: number;
  rotationSpeed: number;
  pulseSpeed: number;
  wobbleSpeed: number;
  trailLength: number;
  floatAmplitude: number;
  floatFrequency: number;
  floatOffset: number;
}

function OrbTrail({ orb, isHovered }: { orb: Orb; isHovered: boolean }) {
  const trailRef = useRef<THREE.Points>(null);
  const trailPositions = useRef<THREE.Vector3[]>([]);
  const maxTrailLength = orb.trailLength;

  useFrame(() => {
    if (trailRef.current && isHovered) {
      trailPositions.current.unshift(orb.position.clone());
      
      if (trailPositions.current.length > maxTrailLength) {
        trailPositions.current.pop();
      }

      const positions = new Float32Array(trailPositions.current.length * 3);
      trailPositions.current.forEach((pos, i) => {
        positions[i * 3] = pos.x;
        positions[i * 3 + 1] = pos.y;
        positions[i * 3 + 2] = pos.z;
      });

      trailRef.current.geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      );
    }
  });

  if (!isHovered) {
    trailPositions.current = [];
    return null;
  }

  return (
    <points ref={trailRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.1}
        color={orb.color}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function PhysicsOrb({ orb, onHover }: { orb: Orb; onHover: (pos: THREE.Vector3) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const pulsePhase = useRef(Math.random() * Math.PI * 2);
  const wobblePhase = useRef(Math.random() * Math.PI * 2);
  const floatPhase = useRef(orb.floatOffset);
  const clickTime = useRef(0);
  const originalPosition = useRef(orb.position.clone());

  useFrame((state, delta) => {
    if (meshRef.current && groupRef.current) {
      const bounds = 6;
      const time = state.clock.elapsedTime;

      // Enhanced floating motion
      floatPhase.current += delta * orb.floatFrequency;
      const floatX = Math.sin(floatPhase.current) * orb.floatAmplitude * 0.3;
      const floatY = Math.cos(floatPhase.current * 1.3) * orb.floatAmplitude * 0.4;
      const floatZ = Math.sin(floatPhase.current * 0.7) * orb.floatAmplitude * 0.2;

      // Apply floating to original position
      const floatedPosition = originalPosition.current.clone();
      floatedPosition.x += floatX;
      floatedPosition.y += floatY;
      floatedPosition.z += floatZ;

      // Physics movement with floating
      orb.position.copy(floatedPosition);
      orb.position.add(orb.velocity.clone().multiplyScalar(delta));

      // Boundary collision
      if (orb.position.x > bounds || orb.position.x < -bounds) {
        orb.velocity.x *= -0.95;
        orb.position.x = THREE.MathUtils.clamp(orb.position.x, -bounds, bounds);
        originalPosition.current.x = orb.position.x;
      }
      if (orb.position.y > bounds || orb.position.y < -bounds) {
        orb.velocity.y *= -0.95;
        orb.position.y = THREE.MathUtils.clamp(orb.position.y, -bounds, bounds);
        originalPosition.current.y = orb.position.y;
      }
      if (orb.position.z > 2 || orb.position.z < -8) {
        orb.velocity.z *= -0.95;
        orb.position.z = THREE.MathUtils.clamp(orb.position.z, -8, 2);
        originalPosition.current.z = orb.position.z;
      }

      // Enhanced friction with air resistance
      orb.velocity.multiplyScalar(0.985);

      // Smooth position interpolation
      groupRef.current.position.lerp(orb.position, 0.15);

      // Enhanced rotation with multiple axes
      meshRef.current.rotation.x += delta * orb.rotationSpeed;
      meshRef.current.rotation.y += delta * orb.rotationSpeed * 0.8;
      meshRef.current.rotation.z += delta * orb.rotationSpeed * 0.5;

      // Wobble animation
      wobblePhase.current += delta * orb.wobbleSpeed;
      const wobbleX = Math.sin(wobblePhase.current) * 0.1;
      const wobbleY = Math.cos(wobblePhase.current * 0.7) * 0.1;
      meshRef.current.rotation.x += wobbleX * delta;
      meshRef.current.rotation.y += wobbleY * delta;

      // Enhanced pulsing animation with floating influence
      pulsePhase.current += delta * orb.pulseSpeed;
      const basePulse = Math.sin(pulsePhase.current) * 0.15;
      const floatPulse = Math.sin(floatPhase.current * 2) * 0.05;
      const hoverPulse = isHovered ? 0.3 : 0;
      const clickPulse = isClicked ? Math.sin(time * 20) * 0.2 : 0;
      const totalPulse = orb.scale * (1 + basePulse + floatPulse + hoverPulse + clickPulse);

      // Click animation timer
      if (isClicked) {
        clickTime.current += delta;
        if (clickTime.current > 0.3) {
          setIsClicked(false);
          clickTime.current = 0;
        }
      }

      meshRef.current.scale.setScalar(totalPulse);

      // Orbital rotation around own axis
      groupRef.current.rotation.y += delta * 0.3;
      groupRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <OrbTrail orb={orb} isHovered={isHovered} />
      <mesh
        ref={meshRef}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setIsHovered(true);
          onHover(orb.position);
          orb.rotationSpeed *= 2;
          orb.wobbleSpeed *= 1.5;
          orb.floatAmplitude *= 1.8;
        }}
        onPointerLeave={() => {
          setIsHovered(false);
          orb.rotationSpeed /= 2;
          orb.wobbleSpeed /= 1.5;
          orb.floatAmplitude /= 1.8;
        }}
        onClick={(e) => {
          e.stopPropagation();
          setIsClicked(true);
          clickTime.current = 0;

          // Enhanced click impulse with directional force
          const impulse = new THREE.Vector3(
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 12
          );
          orb.velocity.add(impulse);

          // Random rotation and wobble boost
          orb.rotationSpeed = 3 + Math.random() * 4;
          orb.wobbleSpeed = 3 + Math.random() * 2;
          orb.floatAmplitude = 0.8 + Math.random() * 0.4;

          setTimeout(() => {
            orb.rotationSpeed = 1 + Math.random();
            orb.wobbleSpeed = 1 + Math.random();
            orb.floatAmplitude = 0.3 + Math.random() * 0.2;
          }, 500);
        }}
      >
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          color={orb.color}
          emissive={orb.color}
          emissiveIntensity={isHovered ? 1.5 : isClicked ? 2 : 0.8}
          metalness={0.9}
          roughness={0.1}
          wireframe={!isHovered}
          transparent
          opacity={isHovered ? 1 : 0.9}
        />
      </mesh>
    </group>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 400;
  
  const { positions, colors, floatProperties } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const floatProps = new Float32Array(particleCount * 3); // [amplitude, frequency, phase]

    for (let i = 0; i < particleCount; i++) {
      // Initial positions in a larger sphere
      const radius = 12 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.2 + 0.6, 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Random floating properties for each particle
      floatProps[i * 3] = 0.1 + Math.random() * 0.3; // amplitude
      floatProps[i * 3 + 1] = 0.5 + Math.random() * 1.5; // frequency
      floatProps[i * 3 + 2] = Math.random() * Math.PI * 2; // phase
    }
    return { positions: pos, colors, floatProperties: floatProps };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.elapsedTime;
      const positions = particlesRef.current.geometry.attributes.position;
      const floatProps = particlesRef.current.geometry.attributes.floatProperties;

      for (let i = 0; i < particleCount; i++) {
        const amplitude = floatProps.getX(i);
        const frequency = floatProps.getY(i);
        const phase = floatProps.getZ(i);
        
        // Multi-axis floating
        const floatX = Math.sin(time * frequency * 0.3 + phase) * amplitude * 0.5;
        const floatY = Math.cos(time * frequency * 0.5 + phase * 1.3) * amplitude;
        const floatZ = Math.sin(time * frequency * 0.4 + phase * 0.7) * amplitude * 0.3;

        const baseX = positions.getX(i);
        const baseY = positions.getY(i);
        const baseZ = positions.getZ(i);

        positions.setX(i, baseX + floatX);
        positions.setY(i, baseY + floatY);
        positions.setZ(i, baseZ + floatZ);
      }
      positions.needsUpdate = true;

      // Gentle overall rotation
      particlesRef.current.rotation.y = time * 0.05;
      particlesRef.current.rotation.x = Math.sin(time * 0.03) * 0.2;
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
        <bufferAttribute
          attach="attributes-floatProperties"
          count={particleCount}
          array={floatProperties}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function AnimatedBackground() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.PlaneGeometry>(null);

  useFrame((state) => {
    if (geometryRef.current && meshRef.current) {
      const positions = geometryRef.current.attributes.position;
      const time = state.clock.elapsedTime;

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        
        // Enhanced wave patterns with multiple frequencies
        const wave1 = Math.sin(x * 0.15 + time * 0.4) * 1.2;
        const wave2 = Math.cos(y * 0.12 + time * 0.3) * 0.8;
        const wave3 = Math.sin((x + y) * 0.08 + time * 0.6) * 0.5;
        const wave4 = Math.cos(Math.sqrt(x*x + y*y) * 0.1 + time * 0.5) * 0.3;
        
        positions.setZ(i, wave1 + wave2 + wave3 + wave4);
      }
      positions.needsUpdate = true;

      // Gentle floating rotation
      meshRef.current.rotation.z = time * 0.015;
      meshRef.current.rotation.x = Math.sin(time * 0.08) * 0.05;
      meshRef.current.rotation.y = Math.cos(time * 0.06) * 0.03;

      // Subtle floating motion
      meshRef.current.position.y = Math.sin(time * 0.2) * 0.3;
      meshRef.current.position.x = Math.cos(time * 0.15) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -15]} rotation={[0, 0, 0]}>
      <planeGeometry ref={geometryRef} args={[50, 50, 40, 40]} />
      <meshStandardMaterial
        color="#1e1b4b"
        wireframe
        transparent
        opacity={0.12}
        emissive="#1e1b4b"
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}

function EnergyBeams() {
  const beamsRef = useRef<THREE.LineSegments>(null);
  const beamCount = 12;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(beamCount * 2 * 3);
    const col = new Float32Array(beamCount * 2 * 3);
    
    for (let i = 0; i < beamCount; i++) {
      const angle = (i / beamCount) * Math.PI * 2;
      const radius = 18 + Math.random() * 4;
      
      // Start point (center with slight variation)
      pos[i * 6] = (Math.random() - 0.5) * 2;
      pos[i * 6 + 1] = (Math.random() - 0.5) * 2;
      pos[i * 6 + 2] = -8;
      
      // End point (circle with variation)
      pos[i * 6 + 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 3;
      pos[i * 6 + 4] = Math.sin(angle) * radius + (Math.random() - 0.5) * 3;
      pos[i * 6 + 5] = -8 + (Math.random() - 0.5) * 2;

      const color = new THREE.Color();
      color.setHSL(angle / (Math.PI * 2), 0.8, 0.6);
      
      col[i * 6] = color.r; col[i * 6 + 1] = color.g; col[i * 6 + 2] = color.b;
      col[i * 6 + 3] = color.r; col[i * 6 + 4] = color.g; col[i * 6 + 5] = color.b;
    }
    
    return { positions: pos, colors: col };
  }, []);

  useFrame((state) => {
    if (beamsRef.current) {
      const time = state.clock.elapsedTime;
      
      // Gentle floating rotation
      beamsRef.current.rotation.z = time * 0.08;
      beamsRef.current.rotation.x = Math.sin(time * 0.05) * 0.1;
      beamsRef.current.rotation.y = Math.cos(time * 0.04) * 0.05;
      
      // Enhanced pulsing with multiple frequencies
      const material = beamsRef.current.material as THREE.LineBasicMaterial;
      const pulse1 = Math.sin(time * 1.5) * 0.15;
      const pulse2 = Math.cos(time * 2.2) * 0.1;
      material.opacity = 0.25 + pulse1 + pulse2;

      // Subtle floating motion
      beamsRef.current.position.y = Math.sin(time * 0.3) * 0.5;
    }
  });

  return (
    <lineSegments ref={beamsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={beamCount * 2}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={beamCount * 2}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.3}
        linewidth={1}
      />
    </lineSegments>
  );
}

function PhysicsScene() {
  const orbs = useMemo<Orb[]>(() => [
    { 
      position: new THREE.Vector3(-4, 1, -2), 
      velocity: new THREE.Vector3(0.5, -0.3, 0.2),
      color: '#8b5cf6', 
      scale: 0.8,
      rotationSpeed: 0.8,
      pulseSpeed: 2,
      wobbleSpeed: 1,
      trailLength: 15,
      floatAmplitude: 0.3,
      floatFrequency: 0.8,
      floatOffset: Math.random() * Math.PI * 2
    },
    { 
      position: new THREE.Vector3(4, -1, -1), 
      velocity: new THREE.Vector3(-0.3, 0.5, -0.1),
      color: '#ec4899', 
      scale: 1,
      rotationSpeed: 1.2,
      pulseSpeed: 1.5,
      wobbleSpeed: 1.2,
      trailLength: 20,
      floatAmplitude: 0.4,
      floatFrequency: 0.6,
      floatOffset: Math.random() * Math.PI * 2
    },
    { 
      position: new THREE.Vector3(0, 2, -3), 
      velocity: new THREE.Vector3(0.2, 0.2, 0.3),
      color: '#06b6d4', 
      scale: 0.6,
      rotationSpeed: 1.5,
      pulseSpeed: 2.2,
      wobbleSpeed: 0.8,
      trailLength: 12,
      floatAmplitude: 0.5,
      floatFrequency: 1.0,
      floatOffset: Math.random() * Math.PI * 2
    },
    { 
      position: new THREE.Vector3(-2, -2, 0), 
      velocity: new THREE.Vector3(0.4, 0.4, -0.2),
      color: '#f59e0b', 
      scale: 0.7,
      rotationSpeed: 0.9,
      pulseSpeed: 1.8,
      wobbleSpeed: 1.5,
      trailLength: 18,
      floatAmplitude: 0.35,
      floatFrequency: 0.9,
      floatOffset: Math.random() * Math.PI * 2
    },
    { 
      position: new THREE.Vector3(3, 0, -2), 
      velocity: new THREE.Vector3(-0.2, -0.4, 0.3),
      color: '#10b981', 
      scale: 0.9,
      rotationSpeed: 1.1,
      pulseSpeed: 2.5,
      wobbleSpeed: 1.1,
      trailLength: 16,
      floatAmplitude: 0.45,
      floatFrequency: 0.7,
      floatOffset: Math.random() * Math.PI * 2
    },
  ], []);

  const handleHover = (position: THREE.Vector3) => {
    orbs.forEach((orb) => {
      const distance = orb.position.distanceTo(position);
      if (distance < 5 && distance > 0.1) {
        const direction = orb.position.clone().sub(position).normalize();
        orb.velocity.add(direction.multiplyScalar(1.2));
        orb.rotationSpeed += 0.8;
        orb.wobbleSpeed += 0.3;
        orb.floatAmplitude *= 1.2;
      }
    });
  };

  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#8b5cf6" />
      <pointLight position={[0, 10, 5]} intensity={0.6} color="#ec4899" />
      <pointLight position={[5, -5, 3]} intensity={0.4} color="#06b6d4" />
      
      <AnimatedBackground />
      <FloatingParticles />
      <EnergyBeams />
      
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
      skills: ['HTML', 'CSS', 'JavaScript', 'Tailwind CSS', 'React'],
      color: 'from-purple-500 to-pink-500',
      icon: '🔄'
    },
    {
      title: '3D & Database',
      skills: ['Git','GitHub','Postman','MongoDb','GSAP'],
      color: 'from-pink-500 to-orange-500',
      icon: '🎮'
    },
    {
      title: 'Backend',
      skills: ['Node.js', 'Express', 'Python', 'REST APIs', 'WebSockets'],
      color: 'from-cyan-500 to-blue-500',
      icon: '⚡'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 80,
      scale: 0.7,
      rotateX: 45
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const skillItemVariants = {
    hidden: { opacity: 0, x: -40, scale: 0.8 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    },
    hover: {
      x: 15,
      scale: 1.1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  // Enhanced floating animations
  const floatingAnimation = {
    animate: {
      y: [0, -20, 0],
      rotateZ: [0, 3, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const floatingAnimationSlow = {
    animate: {
      y: [0, -15, 0],
      rotateZ: [0, -2, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const floatingAnimationFast = {
    animate: {
      y: [0, -25, 0],
      rotateZ: [0, 5, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseAnimation = {
    animate: {
      scale: [1, 1.08, 1],
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const gentleFloat = {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-black via-purple-950/40 to-black overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        className="absolute inset-0 opacity-60"
      >
        <PhysicsScene />
      </Canvas>

      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className="text-6xl md:text-7xl font-bold text-white mb-6"
            {...floatingAnimation}
          >
            Skills & <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Technologies</span>
          </motion.h2>

          <motion.div
            variants={itemVariants}
            className="w-32 h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mx-auto rounded-full mb-8"
            {...pulseAnimation}
          />

          <motion.p
            variants={itemVariants}
            className="text-center text-gray-300 text-xl mt-8"
            animate={{
              opacity: [0.7, 1, 0.7],
              y: [0, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto"
        >
          {skillCategories.map((category, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                y: -10,
                rotateY: 5,
                transition: { 
                  duration: 0.4,
                  ease: "easeOut"
                }
              }}
              className="relative group cursor-pointer"
              {...(index % 3 === 0 ? floatingAnimation : 
                   index % 3 === 1 ? floatingAnimationSlow : floatingAnimationFast)}
            >
              <motion.div
                className={`
                  absolute inset-0 bg-gradient-to-br ${category.color} 
                  rounded-3xl blur-2xl group-hover:blur-3xl
                  transition-all duration-700
                `}
                animate={{
                  opacity: [0.15, 0.25, 0.15],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.3
                }}
              />
              
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-10 
                            border-2 border-white/20 hover:border-white/40 
                            transition-all duration-500 h-full
                            shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40">
                <motion.div 
                  className="text-4xl mb-4"
                  whileHover={{ 
                    scale: 1.3,
                    rotate: 360,
                    transition: { duration: 0.5 }
                  }}
                  {...gentleFloat}
                >
                  {category.icon}
                </motion.div>
                
                <motion.h3 
                  className={`
                    text-3xl font-bold mb-8 bg-gradient-to-r ${category.color}
                    bg-clip-text text-transparent
                  `}
                  whileHover={{ scale: 1.1 }}
                  {...gentleFloat}
                >
                  {category.title}
                </motion.h3>

                <div className="space-y-4">
                  {category.skills.map((skill, skillIndex) => (
                    <motion.div
                      key={skillIndex}
                      variants={skillItemVariants}
                      whileHover="hover"
                      className="flex items-center gap-4 group/item p-3 rounded-xl
                               bg-white/5 hover:bg-white/10 transition-all duration-300"
                      animate={{
                        y: [0, -3, 0],
                        transition: {
                          duration: 3 + skillIndex * 0.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: skillIndex * 0.2
                        }
                      }}
                    >
                      <motion.div 
                        className={`
                          w-3 h-3 rounded-full bg-gradient-to-r ${category.color}
                          shadow-lg
                        `}
                        whileHover={{
                          scale: 2,
                          rotate: 180,
                          transition: { duration: 0.3 }
                        }}
                        animate={{
                          scale: [1, 1.2, 1],
                          transition: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: skillIndex * 0.3
                          }
                        }}
                      />
                      <motion.span 
                        className="text-gray-200 group-hover/item:text-white text-lg font-medium"
                        whileHover={{ 
                          color: "#ffffff",
                          x: 5
                        }}
                      >
                        {skill}
                      </motion.span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <motion.p 
            className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed"
            animate={{
              opacity: [0.6, 1, 0.6],
              y: [0, -8, 0]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🚀 Always pushing boundaries and exploring cutting-edge technologies 
            to create extraordinary digital experiences that captivate and inspire.
          </motion.p>
        </motion.div>
      </div>

      {/* Enhanced animated background elements */}
      <motion.div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: [0, (Math.random() - 0.5) * 20, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Floating gradient orbs */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-32 h-32 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, ${
                i % 3 === 0 ? 'rgba(139, 92, 246, 0.3)' : 
                i % 3 === 1 ? 'rgba(236, 72, 153, 0.3)' : 'rgba(6, 182, 212, 0.3)'
              }, transparent)`,
              left: `${20 + i * 10}%`,
              top: `${10 + i * 12}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}