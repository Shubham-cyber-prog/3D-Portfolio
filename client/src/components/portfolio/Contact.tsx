import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Mail, MapPin, Phone, Send, Github, Linkedin, Twitter } from 'lucide-react';

function WaveGeometry() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.PlaneGeometry>(null);

  useFrame((state) => {
    if (geometryRef.current) {
      const positions = geometryRef.current.attributes.position;
      const time = state.clock.elapsedTime;

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const wave1 = Math.sin(x * 0.5 + time) * 0.3;
        const wave2 = Math.sin(y * 0.5 + time * 0.8) * 0.3;
        positions.setZ(i, wave1 + wave2);
      }
      positions.needsUpdate = true;
    }

    if (meshRef.current) {
      meshRef.current.rotation.x = -Math.PI / 4 + Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -5]}>
      <planeGeometry ref={geometryRef} args={[20, 20, 50, 50]} />
      <meshStandardMaterial
        color="#8b5cf6"
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 300;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
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
        color="#ec4899"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export function Contact() {
  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'hello@portfolio.com' },
    { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567' },
    { icon: MapPin, label: 'Location', value: 'San Francisco, CA' },
  ];

  const socialLinks = [
    { icon: Github, label: 'GitHub', url: '#' },
    { icon: Linkedin, label: 'LinkedIn', url: '#' },
    { icon: Twitter, label: 'Twitter', url: '#' },
  ];

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-purple-950/20 to-black">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        className="absolute inset-0"
      >
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        
        <WaveGeometry />
        <FloatingParticles />
      </Canvas>

      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-bold text-white mb-16 text-center"
        >
          Get In Touch
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-white mb-8">Let's create something amazing together</h3>
            
            <p className="text-gray-300 mb-8 leading-relaxed">
              Whether you have a project in mind or just want to chat about 3D web development, 
              I'd love to hear from you. Drop me a message and I'll get back to you as soon as possible.
            </p>

            <div className="space-y-6 mb-8">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 
                                  flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">{info.label}</p>
                      <p className="text-white font-semibold">{info.value}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.url}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm
                             flex items-center justify-center border border-white/20
                             hover:bg-white/20 transition-all"
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
          >
            <form className="space-y-6">
              <div>
                <label className="block text-white mb-2 font-semibold">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                           text-white placeholder-gray-400 focus:border-purple-500 
                           focus:outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                           text-white placeholder-gray-400 focus:border-purple-500 
                           focus:outline-none transition-colors"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">Message</label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                           text-white placeholder-gray-400 focus:border-purple-500 
                           focus:outline-none transition-colors resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 
                         text-white rounded-lg font-semibold flex items-center justify-center gap-2
                         hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </motion.button>
            </form>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-20 text-gray-400"
        >
          <p>© 2025 Creative Developer Portfolio. Built with React Three Fiber.</p>
        </motion.div>
      </div>
    </div>
  );
}
