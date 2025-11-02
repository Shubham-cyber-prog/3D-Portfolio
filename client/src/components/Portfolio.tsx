import { useRef, useState } from 'react';
import { Hero } from './portfolio/Hero';
import { About } from './portfolio/About';
import { Projects } from './portfolio/Projects';
import { Skills } from './portfolio/Skills';
import { Contact } from './portfolio/Contact';
import { Navigation } from './portfolio/Navigation';

export function Portfolio() {
  const [activeSection, setActiveSection] = useState('hero');
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (section: string) => {
    const refs = {
      hero: heroRef,
      about: aboutRef,
      projects: projectsRef,
      skills: skillsRef,
      contact: contactRef,
    };
    
    refs[section as keyof typeof refs]?.current?.scrollIntoView({ 
      behavior: 'smooth' 
    });
    setActiveSection(section);
  };

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory bg-black">
      <Navigation activeSection={activeSection} onNavigate={scrollToSection} />
      
      <section ref={heroRef} className="w-full h-screen snap-start">
        <Hero />
      </section>
      
      <section ref={aboutRef} className="w-full min-h-screen snap-start">
        <About />
      </section>
      
      <section ref={projectsRef} className="w-full min-h-screen snap-start">
        <Projects />
      </section>
      
      <section ref={skillsRef} className="w-full min-h-screen snap-start">
        <Skills />
      </section>
      
      <section ref={contactRef} className="w-full min-h-screen snap-start">
        <Contact />
      </section>
    </div>
  );
}
