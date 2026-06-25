"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type FilterContextType = {
  selectedLocation: string | null;
  setSelectedLocation: (loc: string | null) => void;
  selectedModel: string | null;
  setSelectedModel: (model: string | null) => void;
  selectedMonth: string | null;
  setSelectedMonth: (month: string | null) => void;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  return (
    <FilterContext.Provider value={{
      selectedLocation, setSelectedLocation,
      selectedModel, setSelectedModel,
      selectedMonth, setSelectedMonth
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
