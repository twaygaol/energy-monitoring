import React from 'react';
import styles from './Button.module.css';

const Button = ({ 
  children, 
  variant = 'default', // 'default', 'primary'
  active = false,
  onClick,
  className = '',
  ...props 
}) => {
  const buttonClass = `${styles.cbtn} 
    ${variant === 'primary' ? styles.pri : ''} 
    ${active ? styles.on : ''} 
    ${className}`;
  
  return (
    <button className={buttonClass} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export default Button;