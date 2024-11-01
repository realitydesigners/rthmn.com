export const sequences = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, -1],
  [1, 1, 1, 1, 1, 1, -1, -1],
  [1, 1, 1, 1, 1, -1, -1, -1],
  [1, 1, 1, 1, -1, -1, -1, -1],
  [1, 1, 1, 1, -1, -1, -1, 1],
  [1, 1, 1, 1, -1, -1, 1, 1],
  [1, 1, 1, 1, -1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, -1],
  [1, 1, 1, 1, 1, 1, -1, -1],
  [1, 1, 1, 1, 1, -1, -1, -1],
  [1, 1, 1, 1, -1, -1, -1, -1],
  [1, 1, 1, -1, -1, -1, -1, -1],
  [1, 1, 1, -1, -1, -1, -1, 1],
  [1, 1, 1, -1, -1, -1, 1, 1],
  [1, 1, 1, -1, -1, 1, 1, 1],
  [1, 1, 1, -1, 1, 1, 1, 1],
  [1, 1, 1, -1, 1, 1, 1, -1],
  [1, 1, 1, -1, 1, 1, -1, -1],
  [1, 1, 1, -1, 1, -1, -1, -1],
  [1, 1, 1, -1, -1, -1, -1, -1],
  [1, 1, -1, -1, -1, -1, -1, -1],
  [1, -1, -1, -1, -1, -1, -1, -1],
  [1, -1, -1, -1, -1, -1, -1, 1],
  [1, -1, -1, -1, -1, -1, 1, 1],
  [1, -1, -1, -1, -1, 1, 1, 1],
  [1, -1, -1, -1, -1, 1, 1, -1],
  [1, -1, -1, -1, -1, 1, -1, -1],
  [1, -1, -1, -1, -1, 1, -1, 1], // POINT OF CHANGE
  [1, -1, -1, -1, -1, 1, 1, 1],
  [1, -1, -1, -1, 1, 1, 1, 1],
  [1, -1, -1, 1, 1, 1, 1, 1],
  [1, -1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, -1],
  [1, 1, 1, 1, 1, 1, -1, -1],
  [1, 1, 1, 1, 1, -1, -1, -1],
  [1, 1, 1, 1, -1, -1, -1, -1],
  [1, 1, 1, 1, -1, -1, -1, 1],
  [1, 1, 1, 1, -1, -1, 1, 1],
  [1, 1, 1, 1, -1, -1, 1, -1],
  [1, 1, 1, 1, -1, -1, -1, -1],
  [1, 1, 1, -1, -1, -1, -1, -1],
  [1, 1, 1, -1, -1, -1, -1, 1],
  [1, 1, 1, -1, -1, -1, 1, 1],
  [1, 1, 1, -1, -1, 1, 1, 1],
  [1, 1, 1, -1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1]
];

// New approach to track actual box positions
export interface BoxPosition {
  boxNumber: number; // The box's number (1-8)
  position: number; // Current position in the stack (0-7)
  isUp: boolean; // Whether it's in up position
}

export const getBoxPositionsFromPattern = (
  pattern: number[]
): BoxPosition[] => {
  // Start with initial box positions
  let boxes: BoxPosition[] = pattern.map((_, index) => ({
    boxNumber: index + 1,
    position: index,
    isUp: pattern[index] === 1
  }));

  // Sort boxes based on their state (up/down) and position
  boxes.sort((a, b) => {
    if (a.isUp === b.isUp) {
      // If both up or both down, maintain relative order
      return a.position - b.position;
    }
    // Up boxes go to top, down boxes to bottom
    return a.isUp ? -1 : 1;
  });

  // Reassign positions after sorting
  return boxes.map((box, index) => ({
    ...box,
    position: index
  }));
};

// Helper to get the next position for a box
export const getNextPosition = (
  currentBoxes: BoxPosition[],
  nextPattern: number[]
): BoxPosition[] => {
  const nextPositions = getBoxPositionsFromPattern(nextPattern);

  // Map current boxes to their next positions
  return currentBoxes.map((currentBox) => {
    const nextBox = nextPositions.find(
      (b) => b.boxNumber === currentBox.boxNumber
    );
    return {
      ...currentBox,
      position: nextBox!.position,
      isUp: nextBox!.isUp
    };
  });
};

// Get the full animation sequence
export const getAnimationSequence = () => {
  return sequences.map((pattern, index) => {
    const prevPattern = index > 0 ? sequences[index - 1] : pattern;
    const currentPositions = getBoxPositionsFromPattern(pattern);
    const prevPositions = getBoxPositionsFromPattern(prevPattern);

    return {
      pattern,
      positions: currentPositions,
      prevPositions,
      changes: currentPositions.map((pos, i) => ({
        boxNumber: pos.boxNumber,
        fromPosition: prevPositions[i].position,
        toPosition: pos.position,
        isUp: pos.isUp
      }))
    };
  });
};

// Example usage:
// const animationSequence = getAnimationSequence();
// This gives you for each step:
// - The current pattern
// - The exact position of each box
// - The previous positions
// - The changes that need to happen
