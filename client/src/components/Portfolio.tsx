import { useRef, useState } from 'react';
import { HeroEnhanced } from './portfolio/HeroEnhanced';
import { AboutEnhanced } from './portfolio/AboutEnhanced';
import { Projects } from './portfolio/Projects';
import { SkillsPhysics } from './portfolio/SkillsPhysics';
import { Contact } from './portfolio/Contact';
import { Navigation } from './portfolio/Navigation';
import { Loader3D } from './Loader3D';
import { Footer } from './portfolio/Footer'; // Import the Footer component

export function Portfolio() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (section: string) => {
    const refs = {
      hero: heroRef,
      about: aboutRef,
      projects: projectsRef,
      skills: skillsRef,
      contact: contactRef,
      footer: footerRef,
    };
    
    refs[section as keyof typeof refs]?.current?.scrollIntoView({ 
      behavior: 'smooth' 
    });
    setActiveSection(section);
  };

  return (
    <>
      <Loader3D onComplete={() => setIsLoading(false)} />
      
      {!isLoading && (
        <div className="w-full h-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory bg-black">
          <Navigation activeSection={activeSection} onNavigate={scrollToSection} />
          
          <section ref={heroRef} className="w-full h-screen snap-start">
            <HeroEnhanced />
          </section>
          
          <section ref={aboutRef} className="w-full min-h-screen snap-start">
            <AboutEnhanced />
          </section>
          
          <section ref={projectsRef} className="w-full min-h-screen snap-start">
            <Projects />
          </section>
          
          <section ref={skillsRef} className="w-full min-h-screen snap-start">
            <SkillsPhysics />
          </section>
          
          <section ref={contactRef} className="w-full min-h-screen snap-start">
            <Contact />
          </section>
          
          {/* Footer Section */}
          <section ref={footerRef} className="w-full snap-start">
            <Footer />
          </section>
        </div>
      )}
    </>
  );
}
