'use client';
import { useMemo } from 'react';
import { BoxSection } from './modules/BoxSection';
import { BoxInfo } from './modules/BoxInfo';

export const useSceneConfig = (splineRef: any) => {
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
        component: <BoxSection splineRef={splineRef} />
      },
      {
        id: 'boxsection-info',
        name: 'BoxSection',
        show: 850,
        hide: 1100,
        component: <BoxInfo splineRef={splineRef} />
      }
    ],
    [splineRef]
  );
};
