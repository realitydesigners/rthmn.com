'use client';
import { useMemo } from 'react';
import { BoxSection } from './modules/BoxSection';
import { BoxInfo } from './modules/BoxInfo';

interface SceneVisibility {
  [key: string]: {
    isVisible: boolean;
    distance: number;
    isScaled: boolean;
  };
}

export const useSceneConfig = (
  splineRef: any,
  visibility?: SceneVisibility
) => {
  return useMemo(
    () => [
      {
        id: 'datastream',
        name: 'DataStream',
        scaleIn: 0,
        scaleOut: 6800,
        fadeIn: 0,
        fadeOut: 6800
      },
      {
        id: 'boxsection-controls',
        name: 'BoxSection',
        scaleIn: 1000,
        scaleOut: 1100,
        fadeIn: 800,
        fadeOut: 1000,
        component: (
          <BoxSection
            splineRef={splineRef}
            visibility={visibility?.['boxsection-controls']}
          />
        )
      },
      {
        id: 'boxsection-info',
        name: 'BoxSection',
        scaleIn: 500,
        scaleOut: 1000,
        fadeIn: 600,
        fadeOut: 850,
        component: <BoxInfo visibility={visibility?.['boxsection-info']} />
      }
    ],
    [splineRef, visibility]
  );
};
