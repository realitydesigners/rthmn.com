'use client';

import { create } from 'zustand';

interface TourState {
    currentTourId: string | null;
    completedTours: string[];
    setCurrentTour: (tourId: string) => void;
    completeTour: (tourId: string) => void;
    isCompleted: (tourId: string) => boolean;
    getNextTour: (currentTourId: string, availableTours: string[]) => string | null;
}

export const useTourStore = create<TourState>((set, get) => ({
    currentTourId: null, // Start with no tour active, SidebarLeft will initialize it
    completedTours: [],

    setCurrentTour: (tourId) => set({ currentTourId: tourId }),

    completeTour: (tourId) =>
        set((state) => {
            const availableTours = ['instruments', 'test'];
            const nextTourId = get().getNextTour(tourId, availableTours);

            return {
                completedTours: [...state.completedTours, tourId],
                currentTourId: nextTourId, // Set to next tour or null if no more tours
            };
        }),

    isCompleted: (tourId) => get().completedTours.includes(tourId),

    getNextTour: (currentTourId, availableTours) => {
        const currentIndex = availableTours.indexOf(currentTourId);
        if (currentIndex === -1 || currentIndex === availableTours.length - 1) return null;
        return availableTours[currentIndex + 1];
    },
}));
