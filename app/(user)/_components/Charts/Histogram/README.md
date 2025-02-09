# Histogram Components

This directory contains the components responsible for rendering the interactive histogram visualization in Rthmn. The system uses a client-server architecture where heavy calculations are performed server-side, while the client handles rendering and interactions.

## Components Overview

### 1. HistogramManager.tsx

The main component orchestrating the histogram visualization.

#### Key Features:

- Manages the rendering of box data and oscillator lines
- Handles user interactions (scrolling, zooming, selection)
- Manages animation frames for smooth rendering
- Processes pre-calculated data from the server

#### Props:

```typescript
{
    data: BoxSlice[];
    height: number;
    boxOffset: number;
    onOffsetChange: (newOffset: number) => void;
    visibleBoxesCount: number;
    selectedFrame: BoxSlice | null;
    selectedFrameIndex: number | null;
    onFrameSelect: (frame: BoxSlice | null, index: number | null) => void;
    isDragging: boolean;
    onDragStart: (e: React.MouseEvent) => void;
    containerWidth: number;
    preProcessedData: {
        maxSize: number;
        initialFramesWithPoints: any[];
    };
}
```

### 2. SelectedFrameDetails.tsx

Displays detailed information about a selected histogram frame.

### 3. Colors.tsx

Defines the color schemes used throughout the histogram visualization.

## Architecture

### Server-Side Processing

Located in `@/utils/boxDataProcessor.ts`

#### Pre-processed Data:

- Box calculations for each timeframe
- Visual dimensions and positions
- Meeting point calculations
- Positive/negative box counts
- Max size calculations
- Initial frame data with visual properties

```typescript
interface ProcessedBoxData {
    histogramBoxes: BoxSlice[];
    histogramPreProcessed: {
        maxSize: number;
        initialFramesWithPoints: {
            frameData: {
                boxArray: BoxSlice['boxes'];
                isSelected: boolean;
                meetingPointY: number;
                sliceWidth: number;
                price: number;
                high: number;
                low: number;
            };
            meetingPointY: number;
            sliceWidth: number;
            preCalculated: {
                boxVisualData: {
                    y: number;
                    rangeY: number;
                    rangeHeight: number;
                    centerX: number;
                    centerY: number;
                    value: number;
                }[];
                positiveBoxesCount: number;
                negativeBoxesCount: number;
            };
        }[];
        defaultVisibleBoxesCount: number;
        defaultHeight: number;
    };
}
```

### Client-Side Components

#### HistogramLine

Renders the connecting lines between meeting points with:

- Angular/square-cornered paths
- Animated dot for the current (last) point
- Smooth transitions between states

#### Oscillator

Handles the rendering of individual histogram frames:

- Canvas-based box rendering
- SVG-based line overlays
- Meeting point calculations
- Color gradients and animations

#### HistogramChart

Manages the overall chart layout:

- Frame positioning
- Scrolling behavior
- Hover interactions
- Time axis

## Data Flow

1. Server processes raw candle data (`processInitialChartData`)
2. Server processes box data (`processInitialBoxData`)
3. Pre-processed data passed to client
4. HistogramManager receives and distributes data
5. Individual components render based on their slice of data
6. Real-time updates and animations handled client-side

## Performance Optimizations

1. Server-side pre-calculations
2. Canvas-based rendering for boxes
3. SVG for interactive elements
4. RequestAnimationFrame for smooth animations
5. Memoized calculations and renders
6. Efficient data structures for quick lookups

## Usage

```tsx
import HistogramManager from './HistogramManager';

// Example usage
<HistogramManager
    data={histogramBoxes}
    height={200}
    boxOffset={0}
    visibleBoxesCount={8}
    preProcessedData={histogramPreProcessed}
    // ... other props
/>;
```

## Styling

Colors are defined in `Colors.tsx` with three themes:

- GREEN: For positive values
- RED: For negative values
- NEUTRAL: For neutral states

Each theme includes:

- LIGHT: Primary color
- MEDIUM: Secondary color
- DARK: Background color
- GRID: Grid line color
- DOT: Point indicator color

## Future Improvements

1. TypeScript enhancements for better type safety
2. Performance optimizations for larger datasets
3. Additional customization options
4. Enhanced accessibility features
5. Mobile responsiveness improvements
