'use client';
import Spline from '@splinetool/react-spline';
import React, { useRef, useState, useEffect } from 'react';
import { Modal } from './Modal';
import { FOREX_PAIRS, CRYPTO_PAIRS } from '@/components/Constants/instruments';

interface PairUniverseProps {
  selectedPairs: string[];
}

interface Position3D {
  x: number;
  y: number;
  z: number;
}

export default function PairUniverse({ selectedPairs }: PairUniverseProps) {
  const splineRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [previousPairs, setPreviousPairs] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState<string | null>(null);

  const calculatePosition = (index: number): Position3D => {
    const radius = 1500;
    const totalPairs = selectedPairs.length;
    const angle = (index * 2 * Math.PI) / totalPairs;
    const yOffset = 120;

    return {
      x: radius * Math.cos(angle),
      y: yOffset,
      z: radius * Math.sin(angle)
    };
  };

  const moveObject = (object: any, position: Position3D, visible: boolean) => {
    try {
      if (visible) {
        object.position.x = position.x;
        object.position.y = position.y;
        object.position.z = position.z;
        object.scale.x = 1;
        object.scale.y = 1;
        object.scale.z = 1;
        object.rotation.y = Math.PI * 0.1;
      } else {
        object.position.x = 10000;
        object.position.y = 10000;
        object.position.z = 10000;
        object.scale.x = 0.001;
        object.scale.y = 0.001;
        object.scale.z = 0.001;
      }
    } catch (error) {
      console.error('Error moving object:', error);
    }
  };

  function onSplineMouseDown(e) {
    if (!e.target) return;

    const clickedObject = e.target;
    console.log('Clicked object:', clickedObject);

    const allPossiblePairs = [...FOREX_PAIRS, ...CRYPTO_PAIRS];
    if (allPossiblePairs.includes(clickedObject.name)) {
      setSelectedPair(clickedObject.name);
      setModalOpen(true);
      console.log('Modal state after click:', {
        selectedPair: clickedObject.name,
        modalOpen: true
      });
    }
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedPair(null);
  }

  const updatePositions = (spline: any) => {
    if (!spline) return;

    const objects = spline.getAllObjects();
    const allPossiblePairs = [...FOREX_PAIRS, ...CRYPTO_PAIRS];

    allPossiblePairs.forEach((pair) => {
      const object = objects.find((obj) => obj.name === pair);
      if (object) {
        moveObject(object, { x: 0, y: 0, z: 0 }, false);
        console.log(`Moved ${pair} off screen`);
      }
    });

    selectedPairs.forEach((pair, index) => {
      const object = objects.find((obj) => obj.name === pair);
      if (object) {
        try {
          const position = calculatePosition(index);
          moveObject(object, position, true);
          console.log(`Positioned ${pair} at:`, position);
        } catch (error) {
          console.error(`Failed to position ${pair}:`, error);
        }
      }
    });

    setPreviousPairs(selectedPairs);
  };

  useEffect(() => {
    if (sceneLoaded && splineRef.current) {
      updatePositions(splineRef.current);
    }
  }, [selectedPairs, sceneLoaded]);

  const onLoad = (spline: any) => {
    splineRef.current = spline;

    try {
      setSceneLoaded(true);
      setIsLoading(false);

      if (selectedPairs.length) {
        updatePositions(spline);
      }
    } catch (error) {
      console.error('Error in onLoad:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Spline
        className="z-0 h-full w-full"
        scene="https://prod.spline.design/lrIbm-6D-FR6eTG0/scene.splinecode"
        onLoad={onLoad}
        onSplineMouseDown={onSplineMouseDown}
      />
      <Modal isOpen={modalOpen} onClose={closeModal} pairName={selectedPair} />
    </div>
  );
}
