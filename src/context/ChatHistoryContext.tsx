import React, { createContext, useContext, useState } from 'react';

interface ChatHistoryContextType {
  isOpen: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

export function ChatHistoryProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  const setOpen = (open: boolean) => setIsOpen(open);

  return (
    <ChatHistoryContext.Provider value={{ isOpen, toggle, setOpen }}>
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistory() {
  const context = useContext(ChatHistoryContext);
  if (context === undefined) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
}