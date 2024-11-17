import { motion, HTMLMotionProps } from 'framer-motion';

export const MotionDiv = motion.div as React.FC<
  HTMLMotionProps<'div'> & {
    className?: string;
    ref?: any;
    onTap?: () => void;
    onTapStart?: () => void;
    onTapCancel?: () => void;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  }
>;
