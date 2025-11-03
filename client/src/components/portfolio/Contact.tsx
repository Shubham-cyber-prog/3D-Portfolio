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
      meshRef.current.rotation.x = -Math.PI / 4;
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
    { 
      icon: Mail, 
      label: 'Email', 
      value: 'sn343555@gmail.com',
      href: 'mailto:sn343555@gmail.com'
    },
    { 
      icon: Phone, 
      label: 'Phone', 
      value: '+91 9034294744',
      href: 'tel:+919034294744'
    },
    { 
      icon: MapPin, 
      label: 'Location', 
      value: 'Haryana, India',
      href: 'https://maps.google.com/?q=Haryana,India'
    },
  ];

  const socialLinks = [
    { 
      icon: Github, 
      label: 'GitHub', 
      url: 'https://github.com/Shubham-cyber-prog'
    },
    { 
      icon: Linkedin, 
      label: 'LinkedIn', 
      url: 'https://www.linkedin.com/in/subhamnayak/'
    },
    { 
      icon: Twitter, 
      label: 'Twitter', 
      url: '#'
    },
  ];

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
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      x: 100,
      rotateY: 15 
    },
    visible: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.6,
        ease: "backOut"
      }
    },
    hover: {
      scale: 1.2,
      rotate: 360,
      transition: {
        duration: 0.4
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      background: "linear-gradient(45deg, #8b5cf6, #ec4899)",
      boxShadow: "0 10px 30px rgba(139, 92, 246, 0.4)",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.95
    }
  };

  const floatAnimation = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseAnimation = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold text-white mb-8"
          >
            Get In <motion.span 
              className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ["0%", "100%", "0%"] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              style={{
                backgroundSize: "200% 100%"
              }}
            >
              Touch
            </motion.span>
          </motion.h2>

          <motion.div
            variants={itemVariants}
            className="w-32 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"
            {...pulseAnimation}
          />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h3 
              variants={itemVariants}
              className="text-3xl font-bold text-white mb-8"
              {...floatAnimation}
            >
              Let's create something amazing together
            </motion.h3>
            
            <motion.p 
              variants={itemVariants}
              className="text-gray-300 mb-8 leading-relaxed"
            >
              Whether you have a project in mind or just want to chat about 3D web development, 
              I'd love to hear from you. Drop me a message and I'll get back to you as soon as possible.
            </motion.p>

            <div className="space-y-6 mb-8">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <motion.a
                    key={index}
                    href={info.href}
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.02, 
                      x: 10,
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-4 group cursor-pointer p-4 rounded-2xl
                             bg-white/5 hover:bg-white/10 transition-all duration-300"
                  >
                    <motion.div 
                      className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 
                                flex items-center justify-center"
                      variants={iconVariants}
                      whileHover="hover"
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <p className="text-gray-400 text-sm">{info.label}</p>
                      <motion.p 
                        className="text-white font-semibold group-hover:text-purple-300 transition-colors"
                        whileHover={{ color: "#c4b5fd" }}
                      >
                        {info.value}
                      </motion.p>
                    </div>
                  </motion.a>
                );
              })}
            </div>

            <motion.div 
              variants={itemVariants}
              className="flex gap-4"
            >
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variants={iconVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm
                             flex items-center justify-center border border-white/20
                             hover:bg-white/20 transition-all"
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </motion.a>
                );
              })}
            </motion.div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10
                     shadow-2xl shadow-purple-500/10"
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
          >
            <motion.form 
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { label: "Name", type: "text", placeholder: "Your name" },
                { label: "Email", type: "email", placeholder: "your.email@example.com" },
                { label: "Message", type: "textarea", placeholder: "Tell me about your project..." }
              ].map((field, index) => (
                <motion.div
                  key={field.label}
                  variants={itemVariants}
                  custom={index}
                  whileFocus={{ scale: 1.02 }}
                >
                  <label className="block text-white mb-2 font-semibold">{field.label}</label>
                  {field.type === "textarea" ? (
                    <motion.textarea
                      rows={5}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                               text-white placeholder-gray-400 focus:border-purple-500 
                               focus:outline-none transition-all duration-300 resize-none"
                      placeholder={field.placeholder}
                      whileFocus={{
                        borderColor: "#8b5cf6",
                        boxShadow: "0 0 0 2px rgba(139, 92, 246, 0.2)"
                      }}
                    />
                  ) : (
                    <motion.input
                      type={field.type}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                               text-white placeholder-gray-400 focus:border-purple-500 
                               focus:outline-none transition-all duration-300"
                      placeholder={field.placeholder}
                      whileFocus={{
                        borderColor: "#8b5cf6",
                        boxShadow: "0 0 0 2px rgba(139, 92, 246, 0.2)"
                      }}
                    />
                  )}
                </motion.div>
              ))}

              <motion.button
                variants={itemVariants}
            //    variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 
                         text-white rounded-lg font-semibold flex items-center justify-center gap-2
                         transition-all"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Send className="w-5 h-5" />
                </motion.div>
                <motion.span
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Send Message
                </motion.span>
              </motion.button>
            </motion.form>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <motion.p 
            className="text-gray-400"
            animate={{ 
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            © 2024 Subham Nayak. Built with React Three Fiber.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}