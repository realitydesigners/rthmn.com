# Rthmn Onboarding System Documentation

## Overview

The onboarding system is designed as a two-phase process:

1. **Initial Profile Setup** (Required Steps)
    - Profile photo upload
    - Trading experience selection
    - Trading pairs selection
2. **Feature Tours** (Interactive Guides)
    - Instruments panel tour
    - Test environment tour

## Core Components

### 1. State Management (`onboarding.ts`)

```typescript
interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    type: 'page' | 'feature-tour';
    order: number;
    component?: string;
}
```

The store manages:

- Current step tracking
- Step completion status
- User data persistence
- Navigation between steps

Key functions:

- `completeStep(stepId)`: Marks a step as completed
- `goToNextStep()`: Advances to the next step
- `setCurrentStep(stepId)`: Sets a specific step
- `hasCompletedInitialOnboarding()`: Checks if initial steps are done

### 2. Route Protection (`OnboardingCheck.tsx`)

Guards all app routes to ensure onboarding completion:

- Redirects new users to onboarding
- Allows completed users to access the app
- Handles feature tour states

### 3. Initial Steps Components

#### `ProfileUpload.tsx`

- Handles avatar upload
- Uses gradient styling
- Updates user data in store

#### `ExperienceStep.tsx`

- Three experience levels
- Animated selection cards
- Updates experience in store

#### `PairsStep.tsx`

- Currency pair selection
- Multi-select functionality
- Updates selected pairs in store

### 4. Feature Tour System

#### `FeatureTour.tsx`

Core tour component that:

- Displays tooltips
- Handles step completion
- Manages tour state
- Provides visual highlights

#### `SidebarButton.tsx`

- Integrates with tour system
- Shows feature highlights
- Manages completion state

#### Tour Flow:

1. Activates after initial onboarding
2. Highlights features sequentially
3. Provides interactive guidance
4. Updates progress in sidebar

## Implementation Details

### 1. Step Progression Logic

```typescript
const handleNext = () => {
    // 1. Complete current step
    completeStep(currentStepId, completionData);

    // 2. Check next step type
    if (nextStep?.type === 'feature-tour') {
        // 3a. For feature tours: redirect to dashboard
        setCurrentStep(nextStep.id);
        router.push('/dashboard');
    } else {
        // 3b. For regular steps: proceed
        goToNextStep();
    }
};
```

### 2. Progress Tracking

The right sidebar displays:

- Completed steps (blue)
- Current step (blue)
- Pending steps (neutral)
- Clear progress option

### 3. Visual Feedback

Components use consistent styling:

- Gradient backgrounds
- Hover effects
- Completion indicators
- Animated transitions

## Integration Points

### 1. Sidebar Integration

```typescript
// SidebarLeft/index.tsx
useEffect(() => {
    if (hasCompletedInitialOnboarding() && !currentStepId) {
        setCurrentStep('instruments');
    }
}, [hasCompletedInitialOnboarding, currentStepId]);
```

### 2. Feature Tour Activation

```typescript
// SidebarButton.tsx
const handleComplete = () => {
    completeStep(tourId);
    goToNextStep();
};
```

## Adding New Steps

1. Add step definition to `ONBOARDING_STEPS`:

```typescript
{
    id: 'new-step',
    title: 'Step Title',
    description: 'Step Description',
    type: 'page' | 'feature-tour',
    order: nextOrderNumber,
    component?: 'ComponentName' // for page types
}
```

2. Create component if type is 'page'
3. Update tour content if type is 'feature-tour'

## Best Practices

1. **State Updates**

    - Use store actions for all updates
    - Avoid direct state manipulation
    - Handle async operations properly

2. **Component Design**

    - Follow existing styling patterns
    - Maintain consistent animations
    - Use proper type definitions

3. **Tour Implementation**

    - Keep tooltips concise
    - Provide clear next steps
    - Handle edge cases (e.g., mobile)

4. **Error Handling**
    - Validate user inputs
    - Handle missing data gracefully
    - Provide fallback UI states

## Common Gotchas

1. **Step ID Matching**

    - Ensure IDs match exactly between components
    - Check case sensitivity
    - Verify in `onboarding.ts`

2. **Component Loading**

    - Handle SSR properly
    - Check for window object
    - Use proper mounting checks

3. **State Persistence**
    - Test localStorage behavior
    - Handle clear/reset properly
    - Verify data structure

## Testing

Key areas to test:

1. Initial onboarding flow
2. Feature tour progression
3. State persistence
4. Mobile responsiveness
5. Error scenarios

## Deployment Considerations

1. **Environment Variables**

    - Check storage keys
    - Verify API endpoints
    - Test in all environments

2. **Performance**

    - Optimize image uploads
    - Minimize re-renders
    - Handle large datasets

3. **Analytics**
    - Track completion rates
    - Monitor drop-off points
    - Gather user feedback
