import React, { useState, useRef, useEffect } from 'react';
import styles from './Tooltip.module.css';

const Tooltip = ({ 
  children, 
  content,
  position = 'top', // 'top', 'bottom', 'left', 'right'
  delay = 200,
  className = '',
  ...props 
}) => {
  const [visible, setVisible] = useState(false);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef(null);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const calculatePosition = () => {
    if (!triggerRef.current) return { x: 0, y: 0 };

    const rect = triggerRef.current.getBoundingClientRect();
    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = rect.left + rect.width / 2;
        y = rect.top - 10;
        break;
      case 'bottom':
        x = rect.left + rect.width / 2;
        y = rect.bottom + 10;
        break;
      case 'left':
        x = rect.left - 10;
        y = rect.top + rect.height / 2;
        break;
      case 'right':
        x = rect.right + 10;
        y = rect.top + rect.height / 2;
        break;
      default:
        x = rect.right + 12;
        y = rect.top - 24;
    }

    return { x, y };
  };

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      const pos = calculatePosition();
      setCoordinates(pos);
      setVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  const handleMouseMove = () => {
    if (visible) {
      const pos = calculatePosition();
      setCoordinates(pos);
    }
  };

  // Bersihkan timeout saat komponen unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Update posisi saat scroll atau resize
  useEffect(() => {
    if (!visible) return;

    const handleUpdate = () => {
      const pos = calculatePosition();
      setCoordinates(pos);
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [visible, position]);

  return (
    <>
      <div
        ref={triggerRef}
        className={`${styles.tooltipWrapper} ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        {...props}
      >
        {children}
      </div>
      
      {visible && (
        <div
          ref={tooltipRef}
          className={styles.tooltip}
          style={{
            left: coordinates.x,
            top: coordinates.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {content}
        </div>
      )}
    </>
  );
};

// Untuk tooltip yang lebih sederhana (tanpa kalkulasi posisi kompleks)
export const SimpleTooltip = ({ children, content, className = '' }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef(null);

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.right + 12,
      y: rect.top - 24
    });
    
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  const handleMouseMove = (e) => {
    if (visible) {
      setPosition({
        x: e.clientX + 12,
        y: e.clientY - 24
      });
    }
  };

  return (
    <>
      <div
        className={`${styles.tooltipWrapper} ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        {children}
      </div>
      {visible && (
        <div
          className={styles.tooltip}
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          {content}
        </div>
      )}
    </>
  );
};

export default Tooltip;