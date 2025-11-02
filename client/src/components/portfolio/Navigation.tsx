import { motion } from 'framer-motion';
import { Home, User, Briefcase, Code, Mail } from 'lucide-react';

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

  return (
    <motion.nav
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed left-8 top-1/2 -translate-y-1/2 z-50 hidden md:block"
    >
      <div className="flex flex-col gap-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="group relative"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center
                transition-all duration-300
                ${isActive 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50' 
                  : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'
                }
              `}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              
              <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 
                             bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg
                             text-white text-sm whitespace-nowrap
                             opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
