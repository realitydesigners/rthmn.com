// Simple atomic CSS system inspired by StyleX principles
// This generates atomic class names and can be optimized at build time

type StyleObject = {
  [key: string]: string | number;
};

type StyleDefinition = {
  [key: string]: StyleObject;
};

// CSS property to atomic class name mapping
const atomicClasses = new Map<string, string>();
let classCounter = 0;

// Performance metrics
const metrics = {
  totalClasses: 0,
  reuseCount: 0,
  totalStyles: 0,
};

function generateAtomicClass(property: string, value: string | number): string {
  const key = `${property}:${value}`;
  
  if (atomicClasses.has(key)) {
    metrics.reuseCount++;
    return atomicClasses.get(key)!;
  }
  
  const className = `x${(++classCounter).toString(36)}`;
  atomicClasses.set(key, className);
  metrics.totalClasses++;
  
  // In a real implementation, this would write to a CSS file at build time
  // For now, we'll inject styles at runtime for development
  if (typeof document !== 'undefined') {
    injectStyle(className, property, value);
  }
  
  return className;
}

function injectStyle(className: string, property: string, value: string | number) {
  if (typeof document === 'undefined') return;
  
  let styleSheet = document.getElementById('atomic-styles') as HTMLStyleElement;
  if (!styleSheet) {
    styleSheet = document.createElement('style');
    styleSheet.id = 'atomic-styles';
    document.head.appendChild(styleSheet);
  }
  
  const rule = `.${className} { ${kebabCase(property)}: ${value}; }`;
  styleSheet.sheet?.insertRule(rule, styleSheet.sheet.cssRules.length);
  metrics.totalStyles++;
}

function kebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

export function create(styles: StyleDefinition): { [key: string]: string } {
  const result: { [key: string]: string } = {};
  
  for (const [styleName, styleObject] of Object.entries(styles)) {
    const classNames: string[] = [];
    
    for (const [property, value] of Object.entries(styleObject)) {
      const atomicClass = generateAtomicClass(property, value);
      classNames.push(atomicClass);
    }
    
    result[styleName] = classNames.join(' ');
  }
  
  return result;
}

export function props(...classNames: (string | undefined | false)[]): { className: string } {
  const validClassNames = classNames.filter(Boolean) as string[];
  return { className: validClassNames.join(' ') };
}

// Keyframes support
export function keyframes(frames: { [key: string]: StyleObject }): string {
  const animationName = `anim${(++classCounter).toString(36)}`;
  
  if (typeof document !== 'undefined') {
    let styleSheet = document.getElementById('atomic-styles') as HTMLStyleElement;
    if (!styleSheet) {
      styleSheet = document.createElement('style');
      styleSheet.id = 'atomic-styles';
      document.head.appendChild(styleSheet);
    }
    
    let keyframeRule = `@keyframes ${animationName} {`;
    for (const [keyframe, styles] of Object.entries(frames)) {
      keyframeRule += `${keyframe} {`;
      for (const [property, value] of Object.entries(styles)) {
        keyframeRule += `${kebabCase(property)}: ${value};`;
      }
      keyframeRule += '}';
    }
    keyframeRule += '}';
    
    styleSheet.sheet?.insertRule(keyframeRule, styleSheet.sheet.cssRules.length);
  }
  
  return animationName;
}

// Debug function to see performance metrics
export function getAtomicMetrics() {
  return {
    ...metrics,
    reuseRatio: metrics.reuseCount / (metrics.totalClasses + metrics.reuseCount),
    totalClassesGenerated: atomicClasses.size,
  };
}

// Log metrics in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).atomicCSS = { getMetrics: getAtomicMetrics, atomicClasses };
} 