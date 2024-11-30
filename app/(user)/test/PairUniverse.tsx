'use client';
import Spline from '@splinetool/react-spline';
import React, { useRef, useState, useEffect } from 'react';
import { Modal } from './Modal';

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
    const radius = 800;
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
      object.position.x = position.x;
      object.position.y = position.y;
      object.position.z = position.z;
      object.scale.x = visible ? 1 : 0;
      object.scale.y = visible ? 1 : 0;
      object.scale.z = visible ? 1 : 0;
    } catch (error) {
      console.error('Error moving object:', error);
    }
  };

  function onSplineMouseDown(e) {
    if (!e.target) return;

    const clickedObject = e.target;
    console.log('Clicked object:', clickedObject);

    setSelectedPair(clickedObject.name);
    setModalOpen(true);
    console.log('Modal state after click:', {
      selectedPair: clickedObject.name,
      modalOpen: true
    });
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedPair(null);
  }

  const updatePositions = (spline: any) => {
    if (!spline) return;

    const objects = spline.getAllObjects();

    // Handle removed pairs
    previousPairs.forEach((pair) => {
      if (!selectedPairs.includes(pair)) {
        const object = objects.find((obj) => obj.name === pair);
        if (object) {
          moveObject(object, { x: 0, y: 0, z: 0 }, false);
          console.log(`Scaled down removed pair: ${pair}`);
        }
      }
    });

    // Handle current pairs
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
