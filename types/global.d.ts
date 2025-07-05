// Global TypeScript declarations for Framer Motion easing compatibility
declare module "framer-motion" {
  interface Transition {
    ease?: string | number[] | ((t: number) => number);
    repeatType?: string;
    [key: string]: any;
  }

  interface ValueAnimationTransition {
    ease?: string | number[] | ((t: number) => number);
    repeatType?: string;
    [key: string]: any;
  }

  interface AnimationControls {
    ease?: string | number[] | ((t: number) => number);
    repeatType?: string;
    [key: string]: any;
  }

  interface TargetAndTransition {
    transition?: {
      ease?: string | number[] | ((t: number) => number);
      repeatType?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }

  interface StyleTransitions {
    x?: {
      ease?: string | number[] | ((t: number) => number);
      repeatType?: string;
      [key: string]: any;
    };
    y?: {
      ease?: string | number[] | ((t: number) => number);
      repeatType?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }
}

// Global type augmentation
declare global {
  namespace FramerMotion {
    interface EasingFunction {
      (t: number): number;
    }

    type Easing = string | number[] | EasingFunction;

    interface BaseTransition {
      ease?: Easing;
      repeatType?: "loop" | "reverse" | "mirror" | string;
      [key: string]: any;
    }
  }
}

export {};
