'use client';
import { useMemo } from 'react';
import { BoxSection, BoxInfo } from './modules';

export const Buttons = [
  {
    sectionId: '1',
    object: 'BaseState',
    name: 'Base State'
  },
  {
    sectionId: '2',
    object: 'State1',
    name: 'State One'
  },
  {
    sectionId: '3',
    object: 'State2',
    name: 'State Two'
  },
  {
    sectionId: '4',
    object: 'State3',
    name: 'State Three'
  }
] as const;

// If we need to access by sectionId, we can create a helper
export const ButtonsMap = Buttons.reduce(
  (acc, button) => ({
    ...acc,
    [button.sectionId]: button
  }),
  {} as Record<string, (typeof Buttons)[number]>
);

export const useSceneConfig = (
  splineRef: any,
  visibility?: {
    [key: string]: { isVisible: boolean; distance: number; isScaled: boolean };
  }
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
