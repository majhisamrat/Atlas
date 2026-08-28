import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { useKnowledgeBases } from '@/hooks/useKnowledge';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Send, Brain, User, Loader2, BookOpen, Plus, ArrowUpRight, ChevronLeft, ChevronRight, Sparkles, MessageSquare, Trash2, Database, Menu, Filter, Check, X } from 'lucide-react';
import type { ChatMessageDisplay } from '@/types/chat';
import { FadeIn } from '@/components/shared/motion';
import { cn } from '@/lib/utils';
import RateLimitAlert from '@/components/chat/RateLimitAlert';

const promptSuggestions = [
  'Summarize the key takeaways from the latest uploaded reports',
  'What are the compliance requirements outlined in the documents?',
  'Extract financial metrics and revenue figures from Q1 reports',
  'List all action items mentioned in meeting transcripts',
];

const getAuthToken = () => localStorage.getItem('access_token') ?? localStorage.getItem('token') ?? '';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageDisplay[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedKb, setSelectedKb] = useState<string>('');
  const [chatHistoryData, setChatHistoryData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [currentSessionTitle, setCurrentSessionTitle] = useState<string>('');
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const chatMutation = useChat();
  const { data: kbs } = useKnowledgeBases();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatPageRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  // Rate limit state
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    isLimitReached: boolean;
    messageCount: number;
    maxMessages: number;
    resetTime: string;
  } | null>(null);

  // Auto-select KB if only 1 exists
  useEffect(() => {
    if (kbs && kbs.length === 1 && !selectedKb) {
      setSelectedKb(kbs[0].id);
    }
  }, [kbs, selectedKb]);

  // Track input focus to hide prompts on mobile
  const [inputFocused, setInputFocused] = useState(false);

  // ─── MOBILE/TABLET KEYBOARD-AWARE COMPOSER ───
  // Android/iOS change the visual viewport when the on-screen keyboard opens.
  // We use that change to move only the composer above the keyboard.
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const layoutViewportHeightRef = useRef<number | null>(null);

  // Concrete height used to force Android Chrome to repaint the mobile
  // ChatPage immediately after the keyboard closes. Without this, Android
  // can leave the flex layout in the keyboard-sized state until the next
  // user interaction (exactly the behavior shown in your screenshot).
  const [mobileLayoutHeight, setMobileLayoutHeight] = useState<number | null>(
    null
  );

  // Tracks the keyboard transition so Android Back can be handled even
  // when the textarea itself remains focused.
  const previousKeyboardHeightRef = useRef(0);

  // Android Chrome: keep the document/layout viewport unchanged while
  // the software keyboard overlays it. When overlaysContent=true,
  // visualViewport may stay full-height, so the Virtual Keyboard API's
  // boundingRect is the primary keyboard-height source.
  useEffect(() => {
    if (window.innerWidth >= 1024) return;

    const virtualKeyboard = (
      navigator as Navigator & {
        virtualKeyboard?: {
          overlaysContent: boolean;
          boundingRect?: DOMRectReadOnly;
          addEventListener?: (
            type: 'geometrychange',
            listener: () => void
          ) => void;
          removeEventListener?: (
            type: 'geometrychange',
            listener: () => void
          ) => void;
        };
      }
    ).virtualKeyboard;

    if (!virtualKeyboard) return;

    const previousValue = virtualKeyboard.overlaysContent;
    virtualKeyboard.overlaysContent = true;

    const updateKeyboardHeight = () => {
      const height = virtualKeyboard.boundingRect?.height ?? 0;
      setKeyboardHeight(Math.max(0, height));
    };

    updateKeyboardHeight();

    virtualKeyboard.addEventListener?.(
      'geometrychange',
      updateKeyboardHeight
    );

    return () => {
      virtualKeyboard.removeEventListener?.(
        'geometrychange',
        updateKeyboardHeight
      );
      virtualKeyboard.overlaysContent = previousValue;
      setKeyboardHeight(0);
    };
  }, []);

  // Android's Back button can hide the keyboard without firing blur on
  // the textarea. In your screenshots, tapping the page afterwards fixes
  // the card because that tap finally blurs the input. Do that explicitly
  // as soon as the keyboard reports that it has closed.
  useEffect(() => {
    if (window.innerWidth >= 1024) return;

    const wasOpen = previousKeyboardHeightRef.current > 120;
    const isClosed = keyboardHeight <= 120;

    if (wasOpen && isClosed) {
      const textarea = textareaRef.current;

      if (textarea && document.activeElement === textarea) {
        textarea.blur();
      }

      setInputFocused(false);

      // Force the same layout/reflow that currently occurs only after
      // tapping somewhere else on the page.
      void document.documentElement.offsetHeight;
      void document.body.offsetHeight;

      requestAnimationFrame(() => {
        void document.documentElement.offsetHeight;
        void document.body.offsetHeight;
      });
    }

    previousKeyboardHeightRef.current = keyboardHeight;
  }, [keyboardHeight]);

  useEffect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    const isMobileOrTablet = () => window.innerWidth < 1024;

    const hasVirtualKeyboard = Boolean(
      (navigator as Navigator & {
        virtualKeyboard?: unknown;
      }).virtualKeyboard
    );

    // When Virtual Keyboard API is present, its geometrychange handler
    // above is authoritative. Do not overwrite it with a full-height
    // visualViewport measurement.
    if (hasVirtualKeyboard) return;

    layoutViewportHeightRef.current = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight
    );

    let frameId: number | null = null;

    const updateKeyboardHeight = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);

      frameId = requestAnimationFrame(() => {
        if (!isMobileOrTablet()) {
          setKeyboardHeight(0);
          return;
        }

        const layoutHeight =
          layoutViewportHeightRef.current ?? window.innerHeight;
        const visualBottom =
          visualViewport.height + visualViewport.offsetTop;
        const viewportDifference = Math.max(0, layoutHeight - visualBottom);

        // Ignore small changes caused by browser chrome/address-bar movement.
        const nextKeyboardHeight =
          viewportDifference > 120 ? viewportDifference : 0;

        setKeyboardHeight(nextKeyboardHeight);

        // Refresh the baseline after the keyboard is closed.
        if (nextKeyboardHeight === 0) {
          layoutViewportHeightRef.current = Math.max(
            document.documentElement.clientHeight,
            window.innerHeight
          );
        }
      });
    };

    const handleOrientationChange = () => {
      window.setTimeout(() => {
        layoutViewportHeightRef.current = Math.max(
          document.documentElement.clientHeight,
          window.innerHeight
        );
        updateKeyboardHeight();
      }, 150);
    };

    updateKeyboardHeight();

    visualViewport.addEventListener('resize', updateKeyboardHeight);
    visualViewport.addEventListener('scroll', updateKeyboardHeight);
    window.addEventListener('resize', updateKeyboardHeight);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      visualViewport.removeEventListener('resize', updateKeyboardHeight);
      visualViewport.removeEventListener('scroll', updateKeyboardHeight);
      window.removeEventListener('resize', updateKeyboardHeight);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // ANDROID KEYBOARD FOCUS FIX
  //
  // The important part is NOT to fight Android after it scrolls.
  // Android automatically scrolls a scrollable ancestor when a focused
  // input is near the bottom of the viewport.
  //
  // We take control of the focus from the user's pointer/touch event and
  // call focus({ preventScroll: true }). This tells the browser to open
  // the keyboard without scrolling the ChatPage to reveal the input.
  //
  // The messages area remains normally scrollable.
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (window.innerWidth >= 1024) return;

    const getMobileLayoutHeight = () => {
      // AppLayout's mobile main starts below the 4rem (64px) header.
      // Use the actual layout viewport, not visualViewport, because the
      // keyboard is intentionally overlaying the page.
      const viewportHeight = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight
      );

      return Math.max(0, viewportHeight - 64);
    };

    const refreshMobileLayout = () => {
      const nextHeight = getMobileLayoutHeight();

      // Force a browser layout read before updating React state. This
      // triggers the same layout recalculation that currently happens only
      // after you tap somewhere on the page.
      void document.documentElement.offsetHeight;

      setMobileLayoutHeight(nextHeight);

      // Force another layout pass after React commits the new height.
      requestAnimationFrame(() => {
        void document.documentElement.offsetHeight;
      });
    };

    refreshMobileLayout();

    const handleViewportResize = () => {
      // During keyboard animation the height can change repeatedly.
      // Wait until the current frame finishes before measuring.
      requestAnimationFrame(refreshMobileLayout);
    };

    const handleWindowResize = () => {
      requestAnimationFrame(refreshMobileLayout);
    };

    window.visualViewport?.addEventListener(
      'resize',
      handleViewportResize
    );
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('orientationchange', handleWindowResize);

    return () => {
      window.visualViewport?.removeEventListener(
        'resize',
        handleViewportResize
      );
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('orientationchange', handleWindowResize);
    };
  }, []);

  useEffect(() => {
    if (window.innerWidth >= 1024) return;
    if (keyboardHeight > 120) return;

    // Android can report keyboardHeight=0 before it has finished its
    // final layout/visual-viewport restoration. Refresh several frames so
    // the card returns without requiring a tap.
    const timers: number[] = [];

    [0, 50, 150, 300, 500].forEach((delay) => {
      const timer = window.setTimeout(() => {
        const viewportHeight = Math.max(
          document.documentElement.clientHeight,
          window.innerHeight
        );

        setMobileLayoutHeight(Math.max(0, viewportHeight - 64));

        // Force synchronous style/layout calculation.
        void document.body.offsetHeight;
      }, delay);

      timers.push(timer);
    });

    return () => timers.forEach(window.clearTimeout);
  }, [keyboardHeight]);

  const handleInputPointerDown = (
    event: React.PointerEvent<HTMLTextAreaElement>
  ) => {
    if (window.innerWidth >= 1024) return;

    // Let an already-focused textarea behave normally.
    if (document.activeElement === textareaRef.current) {
      return;
    }

    // Prevent the browser's default focus + scroll-into-view operation.
    event.preventDefault();

    const textarea = textareaRef.current;
    if (!textarea) return;

    // Focus as part of the user's pointer gesture, but explicitly prevent
    // the browser from scrolling any ancestor to reveal the textarea.
    textarea.focus({ preventScroll: true });

    setInputFocused(true);

    // Restore the page's scroll position on the next frame as an extra
    // safeguard for Android Chrome devices that perform a delayed scroll.
    requestAnimationFrame(() => {
      textarea.focus({ preventScroll: true });
    });
  };

  // Close history when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Only on mobile/tablet
      if (window.innerWidth < 1024 && historyExpanded) {
        const isClickInHistory = target.closest('[data-chat-history]');
        const isClickInMenuButton = target.closest('[title="Toggle chat history"]');
        
        if (!isClickInHistory && !isClickInMenuButton) {
          setHistoryExpanded(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [historyExpanded]);

  // Handle swipe gestures
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX.current = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeThreshold = 50; // Minimum swipe distance
      const diff = touchStartX.current - touchEndX.current;

      // Right swipe (closing gesture) - from right to left
      if (diff > swipeThreshold && historyExpanded && window.innerWidth < 1024) {
        setHistoryExpanded(false);
      }

      // Left swipe (opening gesture) - from left to right
      if (diff < -swipeThreshold && !historyExpanded && window.innerWidth < 1024) {
        setHistoryExpanded(true);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchend', handleTouchEnd, false);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart, false);
      document.removeEventListener('touchend', handleTouchEnd, false);
    };
  }, [historyExpanded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea on input with responsive max heights
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the scrollHeight
      textarea.style.height = 'auto';
      
      // Determine max height based on screen size
      let maxHeight = 200; // Desktop default
      if (window.innerWidth < 768) {
        maxHeight = 100; // Mobile: max 100px
      } else if (window.innerWidth < 1024) {
        maxHeight = 150; // Tablet: max 150px
      }
      
      // Set height based on scrollHeight, capped at maxHeight
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [input]);

  // Handle window resize to recalculate max height
  useEffect(() => {
    const handleResize = () => {
      const textarea = textareaRef.current;
      if (textarea && input) {
        textarea.style.height = 'auto';
        
        let maxHeight = 200;
        if (window.innerWidth < 768) {
          maxHeight = 100;
        } else if (window.innerWidth < 1024) {
          maxHeight = 150;
        }
        
        const newHeight = Math.min(textarea.scrollHeight, maxHeight);
        textarea.style.height = `${newHeight}px`;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [input]);

  // Fetch chat history on component mount
  useEffect(() => {
    fetchChatHistory();
  }, []);

  // Close mobile filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (mobileFilterOpen && !target.closest('[title="Filter by Knowledge Base"]') && !target.closest('.kb-filter-dropdown')) {
        setMobileFilterOpen(false);
      }
    };
    
    if (mobileFilterOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [mobileFilterOpen]);

  // Fetch chat history
  const fetchChatHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = getAuthToken();
      const response = await fetch('/api/v1/chat/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setChatHistoryData(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load specific chat session
  const loadChatSession = async (sessionIdToLoad: string) => {
    if (sessionIdToLoad === sessionId) return; // Already loaded
    
    setLoadingSession(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/v1/chat/history/${sessionIdToLoad}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Convert messages to display format
        const convertedMessages: ChatMessageDisplay[] = data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.sender_role,
          content: msg.content,
          sources: msg.sources,
          timestamp: new Date(msg.created_at),
        }));
        
        setMessages(convertedMessages);
        setSessionId(sessionIdToLoad);
        setCurrentSessionTitle(data.session.title || 'Untitled Chat');
        
        // Set KB if session has one
        if (data.session.knowledge_base_id) {
          setSelectedKb(data.session.knowledge_base_id);
        } else {
          setSelectedKb('all');
        }
        
        // Close history after loading
        setHistoryExpanded(false);
      }
    } catch (error) {
      console.error('Error loading chat session:', error);
    } finally {
      setLoadingSession(false);
    }
  };

  // Delete chat session
  const deleteChatSession = async (sessionIdToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent session from loading when delete is clicked
    
    if (!confirm('Delete this chat session? This action cannot be undone.')) return;
    
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/v1/chat/history/${sessionIdToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Refresh history and clear current chat if it was deleted
        await fetchChatHistory();
        if (sessionId === sessionIdToDelete) {
          startNewChat();
        }
      }
    } catch (error) {
      console.error('Error deleting chat session:', error);
    }
  };

  // Start new chat
  const startNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setCurrentSessionTitle('');
    setSelectedKb('all');
  };

  const handleSend = async (customQuery?: string) => {
    const query = (customQuery || input).trim();
    if (!query || chatMutation.isPending) return;

    const userMsg: ChatMessageDisplay = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customQuery) setInput('');

    try {
      const res = await chatMutation.mutateAsync({
        query,
        session_id: sessionId || undefined,
        knowledge_base_id: selectedKb && selectedKb !== 'all' ? selectedKb : undefined,
        top_k: 10,
      });

      // Update rate limit info if included in response
      if (res.rate_limit_info) {
        setRateLimitInfo({
          isLimitReached: !res.rate_limit_info.is_allowed,
          messageCount: res.rate_limit_info.message_count,
          maxMessages: res.rate_limit_info.max_messages,
          resetTime: res.rate_limit_info.reset_time || '',
        });
      }

      // Update session ID if new session was created
      if (res.session_id && !sessionId) {
        setSessionId(res.session_id);
        setCurrentSessionTitle(query.slice(0, 50) + (query.length > 50 ? '...' : '')); // Auto-generate title from first message
        // Refresh history to show the new session
        setTimeout(fetchChatHistory, 500);
      }

      const assistantMsg: ChatMessageDisplay = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        sources: res.sources,
        metadata: res.metadata,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      // Check if error is a rate limit error (429)
      if (error?.response?.status === 429) {
        const errorData = error?.response?.data?.detail;
        if (errorData) {
          setRateLimitInfo({
            isLimitReached: true,
            messageCount: errorData.message_count || 10,
            maxMessages: errorData.max_messages || 10,
            resetTime: errorData.reset_time || 'Unknown',
          });
          // Remove the user message we just added since it failed
          setMessages((prev) => prev.slice(0, -1));
        }
      }
      // Error handled by API interceptor
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      ref={chatPageRef}
      className="relative flex-1 w-full h-full flex flex-col md:items-center md:justify-center md:py-2"
      style={{
        overflowAnchor: 'none',
        // Do not let browser touch scrolling interfere with the
        // pointer-controlled, preventScroll focus above.
        touchAction: 'pan-y',
        // Give Android a concrete post-keyboard layout height so the
        // flex/card geometry is recalculated immediately on keyboard close.
        ...(window.innerWidth < 1024 && mobileLayoutHeight !== null
          ? { height: `${mobileLayoutHeight}px` }
          : {}),
      }}
    >
      {/* ─── RESPONSIVE CHAT CONTAINER ─── */}
      <div className="relative w-full md:max-w-6xl h-[calc(100%-80px)] md:h-[90vh] flex flex-col">
        <div
          className={cn(
            "w-full h-full md:h-[90vh] md:max-h-[clamp(93.75rem,93.75rem,117.1875rem)] md:min-h-[clamp(62.5rem,62.5rem,78.125rem)] flex flex-col bg-card/90 backdrop-blur-2xl md:border md:border-border/80 md:rounded-3xl md:shadow-2xl md:overflow-hidden md:glow-sm z-10 rounded-2xl md:rounded-3xl overflow-hidden"
          )}
        >

        {/* ─── EDGE TOGGLE ARROW (LEFT EDGE OF FIXED CARD) - REMOVED ─── */}

        {/* Chat Header */}
        <div className="px-4 md:px-6 py-4 border-b border-border/70 bg-muted/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Menu Icon (Desktop only) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setHistoryExpanded(!historyExpanded);
                if (chatHistoryData.length === 0 && !historyExpanded) {
                  fetchChatHistory();
                }
              }}
              title="Toggle chat history"
              className="hidden md:flex h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo and Title (Desktop only) */}
            <div className="hidden md:flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-blue-600 to-indigo-600 shadow-md shadow-primary/20">
                <Brain className="h-5 w-5 text-white" />
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-sky-300 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-base tracking-tight text-foreground truncate">
                  {currentSessionTitle || 'Atlas Assistant'}
                </h2>
                {currentSessionTitle && (
                  <p className="text-xl text-muted-foreground font-semibold">
                    Atlas Assistant
                  </p>
                )}
              </div>
            </div>

            {/* Mobile: Menu + Logo + ATLAS (same as desktop layout) */}
            <div className="md:hidden flex items-center gap-2">
              {/* Menu Icon */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setHistoryExpanded(!historyExpanded);
                  if (chatHistoryData.length === 0 && !historyExpanded) {
                    fetchChatHistory();
                  }
                }}
                title="Toggle chat history"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Logo */}
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-blue-600 to-indigo-600 shadow-md shadow-primary/20">
                <Brain className="h-4 w-4 text-white" />
                <Sparkles className="absolute -top-0.5 -right-0.5 h-2 w-2 text-sky-300 animate-pulse" />
              </div>

              {/* ATLAS Text */}
              <h2 className="font-bold text-lg tracking-tight text-foreground">
                ATLAS
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Knowledge Base Filter (Mobile only) - Custom Dropdown */}
            <div className="md:hidden relative">
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="h-8 w-8 p-0 rounded-lg border border-border hover:bg-muted bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                title="Filter by Knowledge Base"
              >
                <Filter className="h-4 w-4" />
              </button>
              
              {mobileFilterOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50 py-1 kb-filter-dropdown">
                  {kbs?.map((kb) => (
                    <button
                      key={kb.id}
                      onClick={() => {
                        setSelectedKb(kb.id);
                        setMobileFilterOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-muted flex items-center justify-between text-lg transition-colors"
                    >
                      <span className="truncate">{kb.display_name}</span>
                      {selectedKb === kb.id && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Go to Knowledge Base (Mobile only) */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/knowledge')}
              title="Go to Knowledge Bases"
              className="md:hidden h-8 w-8 rounded-lg border-border hover:bg-muted"
            >
              <Database className="h-4 w-4" />
            </Button>

            {/* Knowledge Base Filter (Desktop only) */}
            <Select value={selectedKb} onValueChange={setSelectedKb}>
              <SelectTrigger className="hidden md:flex w-[clamp(15.625rem,15.625rem,19.53125rem)] h-10 text-lg font-bold rounded-xl bg-background/80 border-border">
                <SelectValue placeholder={kbs && kbs.length === 1 ? kbs[0].display_name : "Please select a KB to chat"} />
              </SelectTrigger>
              <SelectContent>
                {kbs?.map((kb) => (
                  <SelectItem key={kb.id} value={kb.id}>{kb.display_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* New Chat Button */}
            {sessionId && (
              <Button
                variant="outline"
                size="sm"
                onClick={startNewChat}
                className="gap-2 h-9 md:h-10 text-lg
                 font-bold rounded-xl border-border hover:bg-muted px-2 md:px-4"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline">New Chat</span>
              </Button>
            )}
          </div>
        </div>

        {/* ─── MESSAGES AREA ─── */}
        <div
          className="overflow-y-auto overflow-x-hidden p-4 md:p-8 lg:p-10 bg-background/50 pt-6 md:pt-8 lg:pt-10 flex-1 min-h-0"
          style={{
            paddingBottom:
              window.innerWidth < 1024
                ? `${Math.max(112, keyboardHeight + 112)}px`
                : undefined,
          }}
        >
          <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 h-full">
            {/* Rate Limit Alert */}
            {rateLimitInfo && (
              <RateLimitAlert
                isLimitReached={rateLimitInfo.isLimitReached}
                messageCount={rateLimitInfo.messageCount}
                maxMessages={rateLimitInfo.maxMessages}
                resetTime={rateLimitInfo.resetTime}
              />
            )}

            {messages.length === 0 ? (
              <FadeIn className="flex flex-col justify-center items-center space-y-6 md:space-y-8 text-center h-full py-12">
                <div className="p-4 md:p-6 rounded-3xl bg-primary/10 border border-primary/20 shadow-lg glow-sm">
                  <MessageSquare className="h-8 md:h-12 w-8 md:w-12 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-xl font-bold tracking-tight text-foreground">
                    Start a New Conversation
                  </h3>
                  <p className="text-xs md:text-base text-muted-foreground mt-2 max-w-lg leading-relaxed">
                    Ask questions about your knowledge base documents and get AI-powered insights.
                  </p>
                </div>

                {/* Prompt Suggestions - Hidden when input focused on mobile/tablet */}
                {!inputFocused && (
                  <div className="w-full space-y-4">
                    <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Suggested Prompts
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-w-2xl mx-auto px-2 md:px-0">
                      {promptSuggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(suggestion)}
                          className="p-3 md:p-5 text-left rounded-xl border border-border/80 bg-card/60 hover:bg-muted hover:border-primary/40 transition-all duration-200 text-xs md:text-base font-semibold text-muted-foreground hover:text-foreground group flex items-start justify-between gap-3 shadow-sm"
                        >
                          <span className="leading-relaxed text-sm md:text-sm line-clamp-3">{suggestion}</span>
                          <ArrowUpRight className="h-4 md:h-5 w-4 md:w-5 shrink-0 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </FadeIn>
            ) : (
              messages.map((msg) => (
                <FadeIn key={msg.id} direction="up" duration={0.3} className="space-y-3">
                  <div className={`flex gap-2 md:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <Avatar className="h-8 md:h-10 w-8 md:w-10 mt-1 shrink-0 shadow-md shadow-primary/20">
                        <AvatarFallback className="bg-gradient-to-br from-primary via-blue-600 to-indigo-600 text-white font-bold text-xs md:text-sm">
                          <Brain className="h-4 md:h-5 w-4 md:w-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className={`max-w-[85%] md:max-w-[80%] space-y-2 md:space-y-3 ${msg.role === 'user' ? 'order-first' : ''}`}>
                      {/* Message Card */}
                      <Card
                        className={`p-4 md:p-6 lg:p-8 rounded-2xl text-lg md:text-lg lg:text-xl leading-relaxed font-medium ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-transparent shadow-md shadow-purple-500/25'
                            : 'bg-card text-foreground border border-border/80 shadow-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </Card>

                      {/* Sources */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="p-3 md:p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2 text-xs">
                          <p className="text-muted-foreground font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
                            <BookOpen className="h-3 md:h-4 w-3 md:w-4 text-primary shrink-0" />
                            Sources ({msg.sources.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {msg.sources.slice(0, 6).map((src, i) => (
                              <Badge key={i} variant="outline" className="text-xs font-semibold py-1 px-2 md:px-3 gap-1 bg-card/80 border-border">
                                <span className="font-mono text-primary text-xs">{src.citation_key}</span>
                                <span>-</span>
                                <span className="truncate max-w-[150px] md:max-w-[200px]">{src.document_name || src.title}</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      {msg.metadata && (
                        <p className="text-xs text-muted-foreground font-mono px-1 font-semibold">
                          {msg.metadata.total_tokens} tokens • {msg.metadata.latency_ms.toFixed(0)}ms
                          {msg.metadata.kb_filtered && ' • KB filtered'}
                        </p>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <Avatar className="h-8 md:h-10 w-8 md:w-10 mt-1 shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-600 font-bold text-xs md:text-sm">
                          <User className="h-4 md:h-5 w-4 md:w-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </FadeIn>
              ))
            )}

            {chatMutation.isPending && (
              <FadeIn className="flex items-center gap-3 md:gap-4">
                <Avatar className="h-8 md:h-10 w-8 md:w-10 shadow-md shadow-primary/20 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-primary via-blue-600 to-indigo-600 text-white text-xs md:text-sm">
                    <Brain className="h-4 md:h-5 w-4 md:w-5 animate-spin-slow" />
                  </AvatarFallback>
                </Avatar>
                <Card className="p-3 md:p-4 rounded-xl bg-card border border-border flex items-center gap-3 text-sm md:text-sm font-semibold text-muted-foreground">
                  <Loader2 className="h-3 md:h-4 w-3 md:w-4 text-primary animate-spin shrink-0" />
                  <span className="animate-pulse">Thinking...</span>
                </Card>
              </FadeIn>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ─── SLIDE-IN HISTORY PANEL ─── */}
        {historyExpanded && (
          <>
            {/* Backdrop - tap to close */}
            <div
              className="absolute inset-0 bg-black/20 z-20 md:hidden"
              onClick={() => setHistoryExpanded(false)}
            />
            
            <div className="absolute inset-y-0 left-0 w-80 border-r border-border/40 bg-card/95 backdrop-blur-sm z-30 animate-in slide-in-from-left-full duration-300 rounded-l-3xl" data-chat-history>
              <div className="h-full overflow-y-auto">
                <div className="p-6">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg text-foreground">Recent Conversations</h3>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={startNewChat}
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="New Chat"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setHistoryExpanded(false)}
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="Close"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    
                    {loadingHistory ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : chatHistoryData.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium">No conversations yet</p>
                        <p className="text-sm mt-1">Start chatting to see your history here</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {chatHistoryData.map((session) => (
                          <div
                            key={session.session_id}
                            className={cn(
                              "group relative p-4 rounded-xl cursor-pointer transition-all duration-200 border bg-background/80 hover:shadow-md",
                              sessionId === session.session_id 
                                ? "border-primary/50 shadow-sm ring-2 ring-primary/20 bg-primary/5" 
                                : "border-border/60 hover:bg-muted/30 hover:border-border"
                            )}
                            onClick={() => loadChatSession(session.session_id)}
                          >
                            {/* Session Content */}
                            <div className="pr-8">
                              <div className="font-semibold text-sm text-foreground truncate mb-2">
                                {session.title || 'Untitled Chat'}
                              </div>
                              <div className="space-y-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{session.knowledge_base_name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3" />
                                    {session.message_count} messages
                                  </span>
                                  <span>{new Date(session.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>

                            {/* Delete Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => deleteChatSession(session.session_id, e)}
                              className="absolute top-3 right-3 h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 opacity-60 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        </div>

        {/* ─────────────────────────────────────────────────────────
            KEYBOARD-AWARE CHAT COMPOSER
            Desktop: anchored to the bottom of the chat card.
            Mobile/tablet: fixed to the visual viewport and follows
            the on-screen keyboard using keyboardHeight.
            ───────────────────────────────────────────────────────── */}
        <div
          className="z-40 fixed left-3 right-3 lg:absolute lg:left-0 lg:right-0    lg:bottom-0 translate-y-0"
          style={{
            overflowAnchor: 'none',
            bottom:
              window.innerWidth < 1024
                ? `max(${keyboardHeight + 8}px, calc(env(keyboard-inset-height, 0px) + 8px))`
                : undefined,
            paddingBottom:
              window.innerWidth < 1024
                ? 'env(safe-area-inset-bottom, 0px)'
                : undefined,
            transition:
              window.innerWidth < 1024
                ? keyboardHeight > 0
                  ? 'bottom 80ms ease-out'
                  : 'bottom 150ms ease-out'
                : undefined,
          }}
        >
          <div className="border-t border-border/70 bg-muted/20 backdrop-blur-xl shadow-2xl lg:rounded-none rounded-3xl">
            <div className="p-0 md:p-0 lg:p-4 relative">
              <div className="max-w-6xl mx-auto relative">
                <div className="relative rounded-2xl border border-border/80 bg-card/95 lg:bg-card/60 shadow-lg px-4 md:px-4 lg:px-5 py-2 md:py-2 lg:py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex items-center gap-2 md:gap-3">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPointerDown={handleInputPointerDown}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder={
                      rateLimitInfo?.isLimitReached
                        ? 'Daily message limit reached. Try again after reset time.'
                        : !selectedKb
                        ? 'Please select a KB to chat'
                        : `Ask about ${kbs?.find((k) => k.id === selectedKb)?.display_name}...`
                    }
                    disabled={rateLimitInfo?.isLimitReached || !selectedKb}
                    className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 resize-none py-3 pl-2 md:pl-3 lg:pl-4 text-lg md:text-sm lg:text-base font-medium placeholder:text-muted-foreground text-foreground disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] max-h-[150px] overflow-y-auto break-words whitespace-normal"
                    rows={1}
                    spellCheck="true"
                  />

                  <Button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || chatMutation.isPending || rateLimitInfo?.isLimitReached || !selectedKb}
                    size="icon"
                    className="gap-2 shadow-lg shadow-primary/25 h-8 md:h-8 lg:h-8 w-8 md:w-8 lg:w-8 font-bold rounded-full flex-shrink-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {chatMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
