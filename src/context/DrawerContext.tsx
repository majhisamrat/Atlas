import React, { createContext, useContext, useState } from 'react';

interface DrawerContextType {
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <DrawerContext.Provider value={{ isDrawerOpen, setDrawerOpen, closeDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const context = useContext(DrawerContext);
  if (context === undefined) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
}
