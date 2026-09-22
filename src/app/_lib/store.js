import { create } from "zustand";

export const useStore = create((set) => ({
  destinationUrl: "",
  setDestinationUrl: (url) => set({ destinationUrl: url }),
  transitionType: "default",
  setTransitionType: (type) => set({ transitionType: type }),
  artworkTransition: null,
  setArtworkTransition: (artwork) => set({ artworkTransition: artwork }),
  artworkNavigation: null,
  setArtworkNavigation: (navigation) => set({ artworkNavigation: navigation }),
  collectionState: null,
  setCollectionState: (collectionState) => set({ collectionState }),
  isTransitionActive: false,
  setIsTransitionActive: (isActive) => set({ isTransitionActive: isActive }),
  isFirstRender: true,
  setIsFirstRender: (isFirst) => set({ isFirstRender: isFirst }),
  isIntroComplete: false,
  setIsIntroComplete: (isComplete) => set({ isIntroComplete: isComplete }),
  isHeroAnimationComplete: false,
  setIsHeroAnimationComplete: (isComplete) =>
    set({ isHeroAnimationComplete: isComplete }),
  favoriteSlugs: [],
  setFavoriteSlugs: (slugs) => set({ favoriteSlugs: slugs }),
  setFavoriteSlug: (slug, isFavorite) =>
    set((state) => ({
      favoriteSlugs: isFavorite
        ? Array.from(new Set([...state.favoriteSlugs, slug]))
        : state.favoriteSlugs.filter((favoriteSlug) => favoriteSlug !== slug),
    })),
}));
