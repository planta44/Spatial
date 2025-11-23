import React, { useEffect } from 'react';
import { useScrollAnimation, useCountUp } from '../../hooks/useScrollAnimation';

const CountUpNumber = ({ 
  end, 
  duration = 2000, 
  start = 0, 
  suffix = '', 
  prefix = '',
  className = '' 
}) => {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.5 });
  const [count, startCounting] = useCountUp(end, duration, start);

  useEffect(() => {
    if (isVisible) {
      startCounting();
    }
  }, [isVisible, startCounting]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

export default CountUpNumber;
