import { motion, HTMLMotionProps } from 'framer-motion';

export const MotionDiv = motion.div as React.FC<
  HTMLMotionProps<'div'> & {
    className?: string;
    ref?: any;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  }
>;
