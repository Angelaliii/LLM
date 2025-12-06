import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { dustParticleTransition } from '../animations';

interface DustParticlesProps {
  count?: number;
}

export default function DustParticles({ count = 20 }: DustParticlesProps) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 4 + Math.random() * 2,
      size: 2 + Math.random() * 4,
      opacity: 0.3 + Math.random() * 0.4,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-amber-300/40"
          style={{
            left: `${particle.left}%`,
            top: '-10px',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
          }}
          initial={{ opacity: particle.opacity, y: 0 }}
          animate={{
            opacity: [particle.opacity, 0],
            y: window.innerHeight + 10,
            x: (Math.random() - 0.5) * 100,
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
