'use client';
import Spline from '@splinetool/react-spline';
import React, { useRef, useState, useEffect } from 'react';
import { Modal } from './Modal';
import { FOREX_PAIRS, CRYPTO_PAIRS } from '@/components/Constants/instruments';

interface PairUniverseProps {
  selectedPairs: string[];
  pairData: {
    [key: string]: {
      currentOHLC?: {
        close: number;
        open: number;
        high: number;
        low: number;
      };
      boxes: Array<any>;
    };
  };
}

interface Position3D {
  x: number;
  y: number;
  z: number;
}

interface ProcessedPairData {
  name: string;
  position: Position3D | null;
  price: number;
  visible: boolean;
  index: number;
}

interface ProcessedSceneData {
  activePairs: ProcessedPairData[];
  inactivePairs: ProcessedPairData[];
}

const isValidPairData = (pairData: any) => {
  if (!pairData) return false;
  return Object.values(pairData).some(
    (pair: any) => pair?.currentOHLC?.close > 0
  );
};

// Data Processing Logic
const processSceneData = (
  selectedPairs: string[],
  pairData: {
    [key: string]: {
      currentOHLC?: {
        close: number;
        open: number;
        high: number;
        low: number;
      };
      boxes: Array<any>;
    };
  },
  allPossiblePairs: string[]
): ProcessedSceneData => {
  if (!isValidPairData(pairData)) {
    console.log('Waiting for valid pair data...');
    return {
      activePairs: [],
      inactivePairs: []
    };
  }

  console.log('Processing valid pair data:', pairData);

  const activePairs = selectedPairs.map((pair, index) => {
    const currentPrice = pairData[pair]?.currentOHLC?.close ?? 0;
    if (currentPrice === 0) {
      console.warn(`Zero price detected for ${pair}`, pairData[pair]);
    }
    console.log(`${pair} current price:`, currentPrice);

    return {
      name: pair,
      position: null,
      price: currentPrice,
      visible: true,
      index
    };
  });

  const inactivePairs = allPossiblePairs
    .filter((pair) => !selectedPairs.includes(pair))
    .map((pair) => {
      const currentPrice = pairData[pair]?.currentOHLC?.close ?? 0;
      return {
        name: pair,
        position: { x: 10000, y: 10000, z: 10000 },
        price: currentPrice,
        visible: false,
        index: -1
      };
    });

  console.log('Processed scene data:', {
    activePairs: activePairs.map((p) => ({ name: p.name, price: p.price })),
    inactivePairs: inactivePairs.map((p) => ({
      name: p.name,
      price: p.price
    }))
  });

  return {
    activePairs,
    inactivePairs
  };
};

// Scene Positioning Logic
const sceneManager = {
  calculatePosition: (index: number, totalPairs: number): Position3D => {
    const radius = 1500;
    const angle = (index * 2 * Math.PI) / totalPairs;
    const yOffset = 120;

    return {
      x: radius * Math.cos(angle),
      y: yOffset,
      z: radius * Math.sin(angle)
    };
  },

  moveObject: (
    object: any,
    position: Position3D,
    visible: boolean,
    price?: number,
    spline?: any,
    selectedPair?: string | null
  ) => {
    try {
      if (visible) {
        // Position the object
        object.position.x = position.x;
        object.position.y = position.y;
        object.position.z = position.z;
        object.scale.x = 1;
        object.scale.y = 1;
        object.scale.z = 1;
        object.rotation.y = Math.PI * 0.1;

        // Update price display using pair-specific variable
        if (spline && price) {
          const pairPriceVariable = `${object.name}price`; // e.g., "USDJPYprice"
          spline.setVariable(pairPriceVariable, price.toFixed(4));
          console.log(`Set ${pairPriceVariable} to ${price.toFixed(4)}`);

          // Also update the global price variable when clicked
          if (object.name === selectedPair) {
            spline.setVariable('price', price.toFixed(4));
          }
        }
      } else {
        // Hide the object
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
  },

  updatePositions: (
    spline: any,
    processedData: ProcessedSceneData,
    selectedPairs: string[],
    selectedPair: string | null
  ) => {
    if (!spline) return;

    const objects = spline.getAllObjects();

    // Handle inactive pairs
    processedData.inactivePairs.forEach(({ name, position, visible }) => {
      const object = objects.find((obj) => obj.name === name);
      if (object) {
        sceneManager.moveObject(
          object,
          position || { x: 10000, y: 10000, z: 10000 },
          visible,
          undefined,
          spline,
          selectedPair
        );
      }
    });

    // Handle active pairs
    processedData.activePairs.forEach(({ name, visible, price, index }) => {
      const object = objects.find((obj) => obj.name === name);
      if (object) {
        try {
          const position = sceneManager.calculatePosition(
            index,
            selectedPairs.length
          );
          sceneManager.moveObject(
            object,
            position,
            visible,
            price,
            spline,
            selectedPair
          );
          console.log(
            `Positioned ${name} at:`,
            position,
            `with price: ${price}`,
            'spline instance:',
            !!spline
          );
        } catch (error) {
          console.error(`Failed to position ${name}:`, error);
        }
      }
    });
  }
};

export default function PairUniverse({
  selectedPairs,
  pairData
}: PairUniverseProps) {
  console.log(pairData);
  const splineRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [previousPairs, setPreviousPairs] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState<string | null>(null);

  function onSplineMouseDown(e) {
    if (!e.target || !isValidPairData(pairData)) return;

    const clickedObject = e.target;
    console.log('Clicked object:', clickedObject);

    const allPossiblePairs = [...FOREX_PAIRS, ...CRYPTO_PAIRS];
    if (allPossiblePairs.includes(clickedObject.name)) {
      setSelectedPair(clickedObject.name);
      setModalOpen(true);

      const sceneData = processSceneData(
        selectedPairs,
        pairData,
        allPossiblePairs
      );
      const clickedPairData = [
        ...sceneData.activePairs,
        ...sceneData.inactivePairs
      ].find((pair) => pair.name === clickedObject.name);

      if (clickedPairData && splineRef.current) {
        // Update both the pair-specific price and global price
        const pairPriceVariable = `${clickedObject.name}price`;
        splineRef.current.setVariable(
          pairPriceVariable,
          clickedPairData.price.toFixed(4)
        );
        splineRef.current.setVariable(
          'price',
          clickedPairData.price.toFixed(4)
        );
        console.log(
          `Updated price for ${clickedPairData.name}: ${clickedPairData.price}`
        );
      }
    }
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedPair(null);
  }

  const onLoad = (spline: any) => {
    splineRef.current = spline;

    try {
      setSceneLoaded(true);
      setIsLoading(false);

      // Debug: List all available variables in the scene
      const variables = spline.getVariables();
      console.log('Available Spline variables:', variables);

      if (selectedPairs.length) {
        sceneManager.updatePositions(
          spline,
          processSceneData(selectedPairs, pairData, [
            ...FOREX_PAIRS,
            ...CRYPTO_PAIRS
          ]),
          selectedPairs,
          selectedPair
        );
      }
    } catch (error) {
      console.error('Error in onLoad:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('pairData updated:', {
      pairData,
      hasData: Object.keys(pairData).length > 0,
      samplePair: selectedPairs[0],
      samplePrice: selectedPairs[0]
        ? pairData[selectedPairs[0]]?.currentOHLC?.close
        : null
    });
  }, [pairData, selectedPairs]);

  useEffect(() => {
    if (sceneLoaded && splineRef.current && isValidPairData(pairData)) {
      const processedData = processSceneData(selectedPairs, pairData, [
        ...FOREX_PAIRS,
        ...CRYPTO_PAIRS
      ]);
      sceneManager.updatePositions(
        splineRef.current,
        processedData,
        selectedPairs,
        selectedPair
      );
    }
  }, [selectedPairs, sceneLoaded, pairData, selectedPair]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Spline
        className="z-0 h-full w-full"
        scene="https://prod.spline.design/lk1fNngN9W3ECA2l/scene.splinecode"
        onLoad={onLoad}
        onSplineMouseDown={onSplineMouseDown}
      />
      <Modal isOpen={modalOpen} onClose={closeModal} pairName={selectedPair} />
    </div>
  );
}
