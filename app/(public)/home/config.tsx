'use client';
import { useMemo } from 'react';
import { BoxSection } from './modules/BoxSection';
import { BoxInfo } from './modules/BoxInfo';

interface SceneVisibility {
  [key: string]: {
    isVisible: boolean;
    distance: number;
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
        show: 0,
        hide: 6800
      },
      {
        id: 'boxsection-controls',
        name: 'BoxSection',
        show: 1000,
        hide: 1100,
        component: (
          <BoxSection
            splineRef={splineRef}
            visibility={visibility?.['boxsection-controls']}
            hideDistance={1100}
          />
        )
      },
      {
        id: 'boxsection-info',
        name: 'BoxSection',
        show: 500,
        hide: 1000,
        component: (
          <BoxInfo
            splineRef={splineRef}
            visibility={visibility?.['boxsection-info']}
            hideDistance={850}
          />
        )
      }
    ],
    [splineRef, visibility]
  );
};
