import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PersonalityTrait } from '@/shared/types';

interface PersonalitiesState {
  personalities: PersonalityTrait[];
  selectedPersonality: PersonalityTrait | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PersonalitiesState = {
  personalities: [],
  selectedPersonality: null,
  isLoading: false,
  error: null,
};

const personalitiesSlice = createSlice({
  name: 'personalities',
  initialState,
  reducers: {
    setPersonalities: (state, action: PayloadAction<PersonalityTrait[]>) => {
      state.personalities = action.payload;
      state.error = null;
    },
    addPersonality: (state, action: PayloadAction<PersonalityTrait>) => {
      state.personalities.push(action.payload);
    },
    updatePersonality: (state, action: PayloadAction<PersonalityTrait>) => {
      const index = state.personalities.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.personalities[index] = action.payload;
      }
      if (state.selectedPersonality?.id === action.payload.id) {
        state.selectedPersonality = action.payload;
      }
    },
    removePersonality: (state, action: PayloadAction<string>) => {
      state.personalities = state.personalities.filter(p => p.id !== action.payload);
      if (state.selectedPersonality?.id === action.payload) {
        state.selectedPersonality = null;
      }
    },
    setSelectedPersonality: (state, action: PayloadAction<PersonalityTrait | null>) => {
      state.selectedPersonality = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setPersonalities,
  addPersonality,
  updatePersonality,
  removePersonality,
  setSelectedPersonality,
  setLoading,
  setError,
} = personalitiesSlice.actions;

export default personalitiesSlice.reducer;