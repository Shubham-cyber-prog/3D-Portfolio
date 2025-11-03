import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';

// Shaders directly in the file
const hologramVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const hologramFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    float time = uTime * 2.0;
    
    // Scan lines effect
    float scanLine = sin(vUv.y * 200.0 + time * 5.0) * 0.1 + 0.9;
    
    // Grid effect
    float grid = step(0.98, mod(vUv.x * 20.0, 1.0)) + step(0.98, mod(vUv.y * 20.0, 1.0));
    
    // Hologram glow
    float glow = sin(vUv.y * 10.0 + time * 3.0) * 0.3 + 0.7;
    
    // Final color with transparency
    vec3 finalColor = uColor * scanLine * glow;
    finalColor += grid * uColor * 0.5;
    
    gl_FragColor = vec4(finalColor, 0.8 * glow);
  }
`;

function HologramShape({ geometry, position, color }) {
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

  // Simple scroll handler
  const handleScrollDown = () => {
    const aboutSection = document.getElementById('about-section');
    if (aboutSection) {
      aboutSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="relative w-full h-screen">
      {/* Canvas Container with proper touch handling */}
      <div className={`absolute inset-0 ${isMobile ? 'pointer-events-none' : ''}`}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          className="absolute inset-0"
          // Important for mobile touch events
          style={{ touchAction: 'none' }}
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
      </div>

      {/* Content Overlay - This allows scrolling */}
      <div className="absolute inset-0 z-10">
        <div className="h-full flex flex-col">
          {/* Main Content Area - Takes 90% height */}
          <div className="flex-1 flex items-center justify-center pointer-events-none">
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

          {/* Scroll Indicator Area - Takes 10% height */}
          <div className="h-20 flex items-center justify-center pointer-events-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="cursor-pointer"
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
                  Scroll Down
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// About Section Component
export function AboutSection() {
  return (
    <section id="about-section" className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">About Me</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-8"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg leading-relaxed"
          >
            <p className="mb-6 text-gray-300">
              Hello! I'm <span className="text-purple-400 font-semibold">Subham Nayak</span>, a passionate Full Stack Developer with expertise in modern web technologies. I love creating digital experiences that are both beautiful and functional.
            </p>
            <p className="mb-6 text-gray-300">
              With a strong foundation in both frontend and backend development, I specialize in building scalable applications using technologies like React, Node.js, Three.js, and more.
            </p>
            <p className="text-gray-300">
              When I'm not coding, you can find me exploring new technologies, contributing to open-source projects, or learning about the latest trends in web development.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 gap-6"
          >
            {[
              { name: 'React', level: '90%' },
              { name: 'TypeScript', level: '85%' },
              { name: 'Node.js', level: '88%' },
              { name: 'Three.js', level: '80%' },
              { name: 'Python', level: '75%' },
              { name: 'MongoDB', level: '82%' },
            ].map((skill, index) => (
              <div key={skill.name} className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">{skill.name}</span>
                  <span className="text-purple-400 text-sm">{skill.level}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: skill.level }}
                    transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Experience Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
        >
          {[
            { number: '2+', text: 'Years Experience' },
            { number: '50+', text: 'Projects Completed' },
            { number: '10+', text: 'Happy Clients' },
            { number: '5+', text: 'Technologies' },
          ].map((stat, index) => (
            <div key={stat.text} className="text-center p-6 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-bold text-purple-400 mb-2">{stat.number}</div>
              <div className="text-gray-300 text-sm">{stat.text}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Main App Component
export default function Home() {
  return (
    <div className="relative">
      <HeroEnhanced />
      <AboutSection />
      {/* You can add more sections here */}
    </div>
  );
}