import React, { useEffect, useState } from 'react';
import './SuccessAnimation.css';

interface SuccessAnimationProps {
  message: string;
  onComplete: () => void;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ message, onComplete }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 400);
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`success-overlay ${visible ? 'visible' : ''}`}>
      <div className="success-content">
        <div className="success-checkmark">
          <svg viewBox="0 0 100 100" className="checkmark-svg">
            <circle className="checkmark-circle" cx="50" cy="50" r="45" fill="none"/>
            <path className="checkmark-check" fill="none" d="M30 50 L45 65 L70 35" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="success-message">{message}</div>
      </div>
    </div>
  );
};

export default SuccessAnimation;

