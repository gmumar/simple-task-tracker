'use client';
import { motion } from 'framer-motion';

export default function CalmingLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '60px' }}>
      <div style={{ 
        position: 'relative', 
        width: '56px', 
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Nucleus */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            width: '10px',
            height: '10px',
            backgroundColor: 'var(--text-primary)',
            borderRadius: '50%',
            boxShadow: '0 0 15px var(--text-primary)',
            zIndex: 10
          }}
        />

        {/* Orbit 1 */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: 'rotateX(70deg) rotateY(20deg)',
          transformStyle: 'preserve-3d',
        }}>
          <motion.div
            animate={{ rotateZ: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{
              width: '100%',
              height: '100%',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              position: 'relative'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-4px',
              left: '50%',
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--status-complete)',
              borderRadius: '50%',
              boxShadow: '0 0 12px var(--status-complete)',
              transform: 'translateX(-50%)'
            }} />
          </motion.div>
        </div>

        {/* Orbit 2 */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: 'rotateX(70deg) rotateY(-40deg)',
          transformStyle: 'preserve-3d',
        }}>
          <motion.div
            animate={{ rotateZ: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{
              width: '100%',
              height: '100%',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              position: 'relative'
            }}
          >
            <div style={{
              position: 'absolute',
              bottom: '-4px',
              left: '50%',
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--status-win)',
              borderRadius: '50%',
              boxShadow: '0 0 12px var(--status-win)',
              transform: 'translateX(-50%)'
            }} />
          </motion.div>
        </div>

        {/* Orbit 3 */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: 'rotateX(10deg) rotateY(75deg)',
          transformStyle: 'preserve-3d',
        }}>
          <motion.div
            animate={{ rotateZ: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{
              width: '100%',
              height: '100%',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              position: 'relative'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '50%',
              right: '-4px',
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--status-rolled)',
              borderRadius: '50%',
              boxShadow: '0 0 12px var(--status-rolled)',
              transform: 'translateY(-50%)'
            }} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
