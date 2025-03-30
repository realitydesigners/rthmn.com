# Box Level Chart Implementation

## Overview

The Box Level Chart is a specialized visualization component that displays nested boxes representing different price levels in a financial chart. Each box represents a different size/level, with specific movement and containment rules.

## Core Objectives

### 1. Box Movement Rules

- Smallest box leads the movement with continuous 45° diagonal lines
- Larger boxes should:
    - Move at exactly 45° angles when their values change
    - Create flat horizontal lines when values are stable
    - Move in sync with smaller boxes when sharing high/low values

### 2. Box Containment

- Larger boxes must always contain their smaller boxes
- When boxes share high or low values, they should move together
- Boxes should maintain proper nesting hierarchy at all times

### 3. Visual Requirements

- All diagonal movements must be exactly 45°
- Horizontal lines should be perfectly flat
- No intermediate angles are allowed
- Clean transitions between movement types
- Smooth frame interpolation to prevent jagged lines

## Current Implementation Status

### Working Features

- Basic box level visualization
- 45° diagonal movements
- Horizontal line creation
- Box size sorting and processing

### Current Challenges

1. **Frame Interpolation**: Need to maintain smooth transitions between frames while adhering to movement rules
2. **Box Synchronization**: Ensuring boxes move together properly when sharing values
3. **Containment vs Movement**: Balancing proper containment with desired movement patterns

## Technical Implementation Details

### Box Movement Logic

1. Boxes are sorted by size (largest to smallest)
2. Each box tracks:
    - Current high/low values
    - Last position
    - Movement state (moving/flat)
    - Shared values with other boxes

### Movement Types

1. **Diagonal Movement (45°)**

    - Triggered by value changes
    - Used when catching up to shared values
    - Maintains exact 45° angle

2. **Horizontal Movement**
    - Used when values are stable
    - Maintains last high/low values
    - Creates flat lines

### Frame Processing

1. Process smallest box first (continuous 45° movement)
2. Check larger boxes for:
    - Value changes requiring movement
    - Shared values with smaller boxes
    - Containment requirements

## Next Steps

1. **Immediate Priority**

    - Restore smooth frame interpolation
    - Maintain clean transitions while enforcing containment rules
    - Ensure proper synchronization of shared values

2. **Future Improvements**
    - Optimize performance for large datasets
    - Add configuration options for movement thresholds
    - Implement additional visual customization options

## Implementation Notes

The chart behaves similar to a Renko chart but with multiple box sizes. Key differences:

- Multiple concurrent box sizes
- Nested containment requirements
- Shared value synchronization
- Continuous movement patterns

The challenge is maintaining smooth visual transitions while enforcing strict movement and containment rules. The current focus is on preserving the smooth interpolation while ensuring boxes follow the correct movement patterns and containment hierarchy.
