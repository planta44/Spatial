import React from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const AnimatedCard = ({ 
  children, 
  className = '', 
  animationType = 'fadeInUp',
  delay = 0,
  duration = 600 
}) => {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.2 });

  const animations = {
    fadeInUp: {
      initial: 'opacity-0 translate-y-8',
      animate: 'opacity-100 translate-y-0'
    },
    fadeInLeft: {
      initial: 'opacity-0 -translate-x-8',
      animate: 'opacity-100 translate-x-0'
    },
    fadeInRight: {
      initial: 'opacity-0 translate-x-8',
      animate: 'opacity-100 translate-x-0'
    },
    scaleUp: {
      initial: 'opacity-0 scale-95',
      animate: 'opacity-100 scale-100'
    },
    slideInUp: {
      initial: 'opacity-0 translate-y-16',
      animate: 'opacity-100 translate-y-0'
    },
    rotateIn: {
      initial: 'opacity-0 rotate-12 scale-95',
      animate: 'opacity-100 rotate-0 scale-100'
    }
  };

  const animation = animations[animationType] || animations.fadeInUp;

  return (
    <div
      ref={ref}
      className={`transform transition-all ease-out ${
        isVisible ? animation.animate : animation.initial
      } ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;
