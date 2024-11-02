import { motion, HTMLMotionProps } from 'framer-motion';

export const MotionButton = motion.button as React.FC<
  HTMLMotionProps<'button'> & {
    className?: string;
    ref?: any;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  }
>;
