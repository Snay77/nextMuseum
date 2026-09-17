import { create } from "zustand";

export const useStore = create((set) => ({
  destinationUrl: "",
  setDestinationUrl: (url) => set({ destinationUrl: url }),
  isTransitionActive: false,
  setIsTransitionActive: (isActive) => set({ isTransitionActive: isActive }),
  isFirstRender: true,
  setIsFirstRender: (isFirst) => set({ isFirstRender: isFirst }),
  isIntroComplete: false,
  setIsIntroComplete: (isComplete) => set({ isIntroComplete: isComplete }),
  isHeroAnimationComplete: false,
  setIsHeroAnimationComplete: (isComplete) =>
    set({ isHeroAnimationComplete: isComplete }),
}));
