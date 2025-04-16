import React, { createContext, useContext, ReactNode } from 'react';
import { motion, Variant, Variants, TargetAndTransition } from 'framer-motion';

// Define animation variants
interface AnimationVariants {
  // Page transitions
  pageInitial: Variant;
  pageAnimate: Variant;
  pageExit: Variant;

  // Component animations
  fadeIn: Variant;
  fadeOut: Variant;
  slideInLeft: Variant;
  slideInRight: Variant;
  slideInUp: Variant;
  slideInDown: Variant;

  // Container animations
  staggerContainer: Variants;
  staggerItem: Variants;

  // UI element animations
  buttonTap: Variant;
  buttonHover: Variant;
  formControl: Variants;

  // Notification animations
  notificationEnter: Variant;
  notificationExit: Variant;
}

// Transition types
interface AnimationTransitions {
  spring: object;
  smooth: object;
  bounce: object;
  snappy: object;
  stagger: object;
}

// Context type
interface AnimationContextType {
  variants: AnimationVariants;
  transitions: AnimationTransitions;
}

// Create the context
const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

// Custom hook to use animations
export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

// Props for the AnimationProvider
interface AnimationProviderProps {
  children: ReactNode;
}

// Props for the AnimationWrapper
interface AnimationWrapperProps {
  children: ReactNode;
  variant?: keyof AnimationVariants;
  transition?: keyof AnimationTransitions;
  className?: string;
  custom?: any;
  [key: string]: any; // For any additional props
}

// Animation Provider Component
const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  // Define animation variants
  const variants: AnimationVariants = {
    // Page transitions
    pageInitial: {
      opacity: 0,
      y: 20
    },
    pageAnimate: {
      opacity: 1,
      y: 0
    },
    pageExit: {
      opacity: 0,
      y: -20
    },

    // Component animations
    fadeIn: {
      opacity: 0,
      transition: { duration: 0.3 }
    },
    fadeOut: {
      opacity: 1,
      transition: { duration: 0.3 }
    },
    slideInLeft: {
      x: -50,
      opacity: 0,
      transition: { duration: 0.4 }
    },
    slideInRight: {
      x: 50,
      opacity: 0,
      transition: { duration: 0.4 }
    },
    slideInUp: {
      y: 50,
      opacity: 0,
      transition: { duration: 0.4 }
    },
    slideInDown: {
      y: -50,
      opacity: 0,
      transition: { duration: 0.4 }
    },

    // Container animations for staggered children
    staggerContainer: {
      hidden: { opacity: 1 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
      }
    },
    staggerItem: {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1
      }
    },

    // UI element animations
    buttonTap: {
      scale: 0.95
    },
    buttonHover: {
      scale: 1.05
    },
    formControl: {
      initial: {},
      animate: {},
      focus: {
        boxShadow: '0 0 0 3px rgba(229, 62, 62, 0.3)'
      }
    },

    // Notification animations
    notificationEnter: {
      opacity: 0,
      y: -50,
      scale: 0.95
    },
    notificationExit: {
      opacity: 0,
      y: -20,
      scale: 0.9
    }
  };

  // Define transitions
  const transitions: AnimationTransitions = {
    spring: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    },
    smooth: {
      type: 'tween',
      ease: 'easeInOut',
      duration: 0.4
    },
    bounce: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    },
    snappy: {
      type: 'tween',
      ease: 'circOut',
      duration: 0.2
    },
    stagger: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  };

  // Create the context value
  const value: AnimationContextType = {
    variants,
    transitions
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};

// Reusable Animation Wrapper Component
export const AnimationWrapper: React.FC<AnimationWrapperProps> = ({
  children,
  variant = 'fadeIn',
  transition = 'smooth',
  className = '',
  custom,
  ...props
}) => {
  const { variants, transitions } = useAnimation();

  // Handle different types of animations
  if (variant === 'staggerContainer') {
    return (
      <motion.div
        className={className}
        variants={variants.staggerContainer}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={transitions[transition]}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  if (variant === 'staggerItem') {
    return (
      <motion.div
        className={className}
        variants={variants.staggerItem}
        // Let parent control the animation states
        transition={transitions[transition]}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  // Default animation handling
  return (
    <motion.div
      className={className}
      initial={variant === 'fadeIn' ? { opacity: 0 } : variants[variant] as TargetAndTransition}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={variant.includes('Exit') ? variants[variant] as TargetAndTransition : undefined}
      transition={transitions[transition]}
      custom={custom}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimationProvider;
