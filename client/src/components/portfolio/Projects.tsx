import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { ExternalLink, Github, Eye } from 'lucide-react';
import { ProjectModal } from './ProjectModal';

function ProjectCard3D({ position, color, isHovered }: { position: [number, number, number], color: string, isHovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
      
      if (isHovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  return (
    <RoundedBox
      ref={meshRef}
      args={[1, 1, 1]}
      position={position}
      radius={0.1}
      smoothness={4}
    >
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        metalness={0.7}
        roughness={0.3}
      />
    </RoundedBox>
  );
}

export function Projects() {
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const projects = [
    {
      title: 'Nexus Indian Bank',
      description: 'A modern, responsive Bank Web Application with next-generation payment solutions',
      tech: ['React', 'Tailwind CSS', 'Vite', 'ESLint'],
      color: '#2563eb',
      position: [-2, 0, 0] as [number, number, number],
      liveUrl: 'https://nexus-indian.netlify.app/',
      codeUrl: 'https://github.com/Shubham-cyber-prog/Nexus-INDIAN-BANK-.git',
      image: 'https://tse3.mm.bing.net/th/id/OIP.HfHDlDjts9qxYjKlW1GfRAHaEo?rs=1&pid=ImgDetMain&o=7&rm=3',
      details: 'A modern, responsive Bank Web Application built using React + Tailwind CSS + Vite, designed to showcase next-generation payment solutions with smooth animations, interactive UI components, and optimized performance.',
      features: [
        'Modern responsive design with Tailwind CSS',
        'Smooth animations and interactive UI components',
        'Optimized performance with Vite',
        'Next-generation payment solutions showcase',
        'Clean code architecture with ESLint'
      ]
    },
    {
      title: 'Personal Portfolio',
      description: 'My personal portfolio showcasing my technical skills, creative projects, and professional achievements',
      tech: ['HTML5', 'CSS3', 'JavaScript','GSAP', ],
      color: '#10b981',
      position: [0, 0, 0] as [number, number, number],
      liveUrl: 'https://shubham-cyber-prog.github.io/portfolio/',
      codeUrl: 'https://github.com/Shubham-cyber-prog/portfolio.git',
      image: '/api/placeholder/400/250',
      details: 'My personal portfolio showcasing skills, projects, and achievement built using HTML, CSS and JavaScript. Features a clean, modern design with smooth interactions.',
      features: [
        'Responsive design with HTML5 and CSS3',
        'Interactive elements with JavaScript',
        'Project showcase section',
        'Skills and achievements display',
        'Clean and modern UI design'
      ]
    },
    {
      title: 'InternHub',
      description: 'Centralized platform for managing internships and applications',
      tech: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT'],
      color: '#f59e0b',
      position: [2, 0, 0] as [number, number, number],
      liveUrl: 'https://intern-hub-frontend.vercel.app/',
      codeUrl: 'https://github.com/HackWatt/Internhub.git',
      image: '/api/placeholder/400/250',
      details: 'InternHub is a full-stack web application that serves as a portal for students and job seekers to apply for internships and for employers to post internship opportunities. The platform includes secure authentication using JWT tokens, a review section, and an integrated AI chatbot powered by Google Gemini AI.',
      features: [
        'Secure JWT authentication system',
        'Role-based access (Students & Employers)',
        'AI chatbot integration with Google Gemini',
        'Review and rating system',
        'Real-time application tracking',
        'MongoDB database with Mongoose ODM'
      ]
    },
  ];

  const handleProjectClick = (index: number) => {
    setSelectedProject(index);
    setIsModalOpen(true);
  };

  const handleViewLive = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleViewCode = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-purple-950/20 to-black">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        className="absolute inset-0 opacity-40"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#8b5cf6" />
        
        {projects.map((project, index) => (
          <ProjectCard3D
            key={index}
            position={project.position}
            color={project.color}
            isHovered={hoveredProject === index}
          />
        ))}
      </Canvas>

      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-bold text-white mb-16 text-center"
        >
          Featured Projects
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              onMouseEnter={() => setHoveredProject(index)}
              onMouseLeave={() => setHoveredProject(null)}
              className="group relative"
            >
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 
                            hover:border-white/30 transition-all duration-500 h-full
                            hover:shadow-2xl hover:shadow-purple-500/20">
                <div 
                  className="w-full h-48 rounded-xl mb-6 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${project.color}30, ${project.color}10)`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="w-24 h-24 rounded-lg transform group-hover:rotate-12 
                                 transition-transform duration-500"
                      style={{ backgroundColor: project.color }}
                    />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  {project.title}
                </h3>
                
                <p className="text-gray-300 mb-4 leading-relaxed">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tech.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => handleProjectClick(index)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500
                                   rounded-lg text-white hover:shadow-lg hover:shadow-purple-500/50 
                                   transition-all hover:scale-105"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Details</span>
                  </button>
                  <button 
                    onClick={() => handleViewLive(project.liveUrl)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 
                                   rounded-lg text-white hover:bg-white/20 transition-all hover:scale-105"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Live</span>
                  </button>
                  <button 
                    onClick={() => handleViewCode(project.codeUrl)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 
                                   rounded-lg text-white hover:bg-white/20 transition-all hover:scale-105"
                  >
                    <Github className="w-4 h-4" />
                    <span>Code</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ProjectModal 
        project={selectedProject !== null ? projects[selectedProject] : null}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}