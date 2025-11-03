import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, Briefcase, Code, Mail } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export function Navigation({ activeSection, onNavigate }: NavigationProps) {
  const navItems = [
    { id: 'hero', icon: Home, label: 'Home' },
    { id: 'about', icon: User, label: 'About' },
    { id: 'projects', icon: Briefcase, label: 'Projects' },
    { id: 'skills', icon: Code, label: 'Skills' },
    { id: 'contact', icon: Mail, label: 'Contact' },
  ];

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <motion.nav
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed left-8 top-1/2 -translate-y-1/2 z-50 hidden md:block"
    >
      <div className="flex flex-col gap-4">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const isHovered = hoveredItem === item.id;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
            >
              <motion.button
                onClick={() => onNavigate(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className="group relative"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                {/* Background Glow Effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: isActive ? 1.1 : isHovered ? 1 : 0.8,
                    opacity: isActive ? 0.3 : isHovered ? 0.2 : 0
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Main Button */}
                <motion.div
                  className={`
                    relative w-12 h-12 rounded-full flex items-center justify-center
                    border-2 transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-transparent shadow-lg shadow-purple-500/50' 
                      : 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-purple-300'
                    }
                  `}
                  whileHover={{
                    rotateY: 180,
                    transition: { duration: 0.4 }
                  }}
                >
                  <motion.div
                    whileHover={{
                      rotate: -180,
                      transition: { duration: 0.4 }
                    }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </motion.div>
                </motion.div>

                {/* Active Indicator Pulse */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-purple-400"
                    initial={{ scale: 1, opacity: 0.7 }}
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.7, 0, 0.7]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}

                {/* Tooltip with Animation */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      className="absolute left-full ml-3 top-1/2 -translate-y-1/2 
                                 bg-gray-900/90 backdrop-blur-sm px-3 py-2 rounded-lg
                                 text-white text-sm font-medium whitespace-nowrap
                                 border border-white/20 shadow-xl"
                      initial={{ 
                        opacity: 0, 
                        x: -10,
                        scale: 0.8
                      }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        scale: 1
                      }}
                      exit={{ 
                        opacity: 0, 
                        x: -10,
                        scale: 0.8
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                      {/* Tooltip arrow */}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 w-2 h-2 
                                    bg-gray-900 rotate-45 border-l border-t border-white/20" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Active Dot Indicator */}
                {isActive && (
                  <motion.div
                    className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-400 rounded-full shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      duration: 0.3,
                      ease: "backOut"
                    }}
                  />
                )}
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </motion.nav>
  );
}