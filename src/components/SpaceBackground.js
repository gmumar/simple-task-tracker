'use client';
import { motion, useTime, useTransform, AnimatePresence } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';

const StarField = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stars = useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
      duration: 60 + Math.random() * 120, // Very slow drift
    }));
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: -2 }}>
      {/* Layer 1 */}
      <motion.div
        animate={{ x: ['0%', '-100%'] }}
        transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        {stars.map(star => (
          <div
            key={star.id}
            style={{
              position: 'absolute',
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: '#fff',
              borderRadius: '50%',
              opacity: star.opacity,
            }}
          />
        ))}
      </motion.div>
      {/* Layer 2 (Seamless loop) */}
      <motion.div
        animate={{ x: ['100%', '0%'] }}
        transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        {stars.map(star => (
          <div
            key={`loop-${star.id}`}
            style={{
              position: 'absolute',
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: '#fff',
              borderRadius: '50%',
              opacity: star.opacity,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

const TrailPoint = ({ time, offset, speed, rotationSpeed, radius, size, color, delay, opacityMult }) => {
  const left = useTransform(time, t => {
    const period = speed * 1000;
    const progress = ((t + offset - delay) % period) / period;
    return `${progress * 100}%`;
  });

  const angleTransform = useTransform(time, t => {
    const period = rotationSpeed; 
    return ((t - delay) / period) * Math.PI * 2 + (offset / 1000);
  });

  const y = useTransform(angleTransform, a => {
    return `${Math.sin(a) * radius}px`;
  });

  const scale = useTransform(angleTransform, a => {
    return ((0.5 + Math.cos(a) * 0.5) * 0.8 + 0.2) * (1 - delay / 1000); 
  });

  const opacity = useTransform(angleTransform, a => {
    return (0.1 + (Math.cos(a) + 1) * 0.4) * opacityMult;
  });

  return (
    <motion.div
      style={{
        position: 'absolute',
        left,
        top: '50%',
        y,
        scale,
        opacity,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: `0 0 ${size}px ${color}`,
        pointerEvents: 'none',
      }}
    />
  );
};

const HelicalParticle = ({ offset, speed, rotationSpeed, radius, size, color }) => {
  const time = useTime();
  
  const trail = [
    { delay: 60, opacity: 0.8 },
    { delay: 120, opacity: 0.6 },
    { delay: 180, opacity: 0.4 },
    { delay: 240, opacity: 0.3 },
    { delay: 300, opacity: 0.2 },
    { delay: 360, opacity: 0.15 },
    { delay: 420, opacity: 0.1 },
    { delay: 480, opacity: 0.05 },
  ];

  return (
    <>
      {trail.map((t, i) => (
        <TrailPoint 
          key={i}
          time={time}
          offset={offset}
          speed={speed}
          rotationSpeed={rotationSpeed}
          radius={radius}
          size={size}
          color={color}
          delay={t.delay}
          opacityMult={t.opacity}
        />
      ))}
      
      <TrailPoint 
        time={time}
        offset={offset}
        speed={speed}
        rotationSpeed={rotationSpeed}
        radius={radius}
        size={size}
        color={color}
        delay={0}
        opacityMult={1}
      />
    </>
  );
};

export default function SpaceBackground({ tasks = [] }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'win': return 'var(--status-win)';
      case 'lose': return 'var(--status-lose)';
      case 'cancelled': return 'var(--status-cancelled)';
      case 'complete': return 'var(--status-complete)';
      case 'open': return 'rgba(255, 255, 255, 0.3)'; 
      default: return 'rgba(255, 255, 255, 0.15)';
    }
  };

  const seed = (str) => {
    let h = 0;
    for(let i=0; i<str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    return h;
  }

  const particles = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    
    return tasks.map((task) => {
      const s = seed(task.id.toString());
      const absS = Math.abs(s);
      
      return {
        id: task.id,
        offset: absS % 50000,
        speed: 30 + (absS % 40),
        rotationSpeed: 5000 + (absS % 5000),
        radius: 20 + (absS % 50),
        size: 4 + (absS % 8),
        color: getStatusColor(task.status)
      };
    });
  }, [tasks]);

  return (
    <div style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: '-80px',
      bottom: '-80px',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: -1,
      display: 'flex',
      alignItems: 'center',
      maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
      WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
    }}>
      <StarField />
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <HelicalParticle {...p} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
