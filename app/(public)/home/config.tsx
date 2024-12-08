'use client';
import { useMemo } from 'react';
import { BoxSection, BoxInfo } from './modules';

export const Buttons: Record<string, { id: string; buttonName: string }> = {
  baseState: {
    id: 'baseState',
    buttonName: 'BaseState'
  },
  state1: {
    id: 'state1',
    buttonName: 'State1'
  },
  state2: {
    id: 'state2',
    buttonName: 'State2'
  },
  state3: {
    id: 'state3',
    buttonName: 'State3'
  }
};

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
