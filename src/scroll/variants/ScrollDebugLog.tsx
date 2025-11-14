'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface LogEntry {
  id: string;
  timestamp: number;
  component: string;
  type: 'log' | 'warn' | 'error';
  message: string;
  data?: unknown;
}

interface ScrollDebugLogProps {
  componentName: string;
}

const MAX_LOGS = 100;

// Helper function to safely serialize data, handling circular references and DOM elements
const safeStringify = (obj: unknown, indent = 2): string => {
  const seen = new WeakSet();
  
  const replacer = (key: string, value: unknown) => {
    // Handle null and undefined
    if (value === null || value === undefined) {
      return value;
    }
    
    // Handle DOM elements
    if (value instanceof HTMLElement) {
      return {
        __type: 'HTMLElement',
        tagName: value.tagName,
        id: value.id || undefined,
        className: value.className || undefined,
        textContent: value.textContent?.substring(0, 100) || undefined,
      };
    }
    
    // Handle React refs and other objects with circular references
    if (typeof value === 'object' && value !== null) {
      // Check for circular reference
      if (seen.has(value as object)) {
        return '[Circular Reference]';
      }
      
      // Skip React internal properties
      if (key.startsWith('__react') || key.startsWith('__FIBER')) {
        return '[React Internal]';
      }
      
      seen.add(value as object);
    }
    
    return value;
  };
  
  try {
    return JSON.stringify(obj, replacer, indent);
  } catch (error) {
    // Fallback for objects that can't be stringified
    if (error instanceof Error && error.message.includes('circular')) {
      return '[Circular Structure - Cannot Serialize]';
    }
    return String(obj);
  }
};

// Global log storage to avoid conflicts with multiple instances
const globalLogs: LogEntry[] = [];
const logListeners: Set<(logs: LogEntry[]) => void> = new Set();
let logIdCounter = 0;
let isConsoleIntercepted = false;
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error
};

// Queue for logs that need to be processed asynchronously
let logQueue: LogEntry[] = [];
let isProcessingQueue = false;

// Process log queue asynchronously to avoid setState during render
const processLogQueue = () => {
  if (isProcessingQueue || logQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  // Use requestIdleCallback if available, otherwise setTimeout
  const scheduleUpdate = (callback: () => void) => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(callback, { timeout: 100 });
    } else {
      setTimeout(callback, 0);
    }
  };

  scheduleUpdate(() => {
    // Add queued logs to global logs
    logQueue.forEach(log => {
      globalLogs.push(log);
      if (globalLogs.length > MAX_LOGS) {
        globalLogs.shift();
      }
    });

    // Notify all listeners with a copy of the logs
    const logsCopy = [...globalLogs];
    logListeners.forEach(listener => {
      try {
        listener(logsCopy);
      } catch (error) {
        // Ignore errors from listeners (e.g., component unmounted)
      }
    });

    // Clear queue and reset flag
    logQueue = [];
    isProcessingQueue = false;
  });
};

// Global console interceptor (only set up once)
const setupGlobalConsoleInterceptor = () => {
  if (isConsoleIntercepted) return;
  isConsoleIntercepted = true;

  const addLog = (type: 'log' | 'warn' | 'error', ...args: unknown[]) => {
    const message = args
      .map(arg => {
        if (typeof arg === 'string') return arg;
        if (typeof arg === 'object' && arg !== null) {
          // Use safe stringify for objects to avoid circular reference errors
          try {
            return safeStringify(arg, 0).substring(0, 500); // Limit length
          } catch {
            return String(arg).substring(0, 500);
          }
        }
        return String(arg);
      })
      .join(' ');

    // Extract component name from log message (format: [ComponentName])
    const componentMatch = message.match(/\[([^\]]+)\]/);
    const component = componentMatch ? componentMatch[1] : 'Unknown';

    const logEntry: LogEntry = {
      id: `log-${logIdCounter++}`,
      timestamp: Date.now(),
      component,
      type,
      message,
      // Only store data if it's serializable and not too large
      data: args.length > 1 ? (() => {
        try {
          const dataArgs = args.slice(1);
          // Check if any arg is a DOM element or has circular refs
          const hasComplexObjects = dataArgs.some(arg => 
            arg instanceof HTMLElement || 
            (typeof arg === 'object' && arg !== null && Object.keys(arg).length > 10)
          );
          
          if (hasComplexObjects) {
            // Return simplified version
            return dataArgs.map(arg => {
              if (arg instanceof HTMLElement) {
                return {
                  __type: 'HTMLElement',
                  tagName: arg.tagName,
                  id: arg.id || undefined,
                  className: arg.className || undefined,
                };
              }
              return arg;
            });
          }
          
          return dataArgs;
        } catch {
          return undefined;
        }
      })() : undefined
    };

    // Add to queue instead of directly updating state
    // This prevents setState during render errors
    logQueue.push(logEntry);
    
    // Process queue asynchronously
    processLogQueue();
  };

  console.log = (...args: unknown[]) => {
    originalConsole.log(...args);
    addLog('log', ...args);
  };

  console.warn = (...args: unknown[]) => {
    originalConsole.warn(...args);
    addLog('warn', ...args);
  };

  console.error = (...args: unknown[]) => {
    originalConsole.error(...args);
    addLog('error', ...args);
  };
};

// Setup interceptor immediately when module loads (if in browser)
if (typeof window !== 'undefined') {
  // Use setTimeout to ensure it runs after other modules
  setTimeout(() => {
    setupGlobalConsoleInterceptor();
  }, 0);
  
  // Also try immediately
  setupGlobalConsoleInterceptor();
}

export function ScrollDebugLog({ componentName }: ScrollDebugLogProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
    // Ensure interceptor is set up (in case module loaded after first render)
    setupGlobalConsoleInterceptor();
  }, []);

  // Subscribe to global logs and filter by component
  useEffect(() => {
    if (!mounted) return;

    const updateLogs = (allLogs: LogEntry[]) => {
      // Filter logs for this component (case insensitive)
      // Match both [ComponentName] format and ComponentName format
      const componentNameLower = componentName.toLowerCase();
      const filtered = allLogs.filter(log => {
        const logComponentLower = log.component.toLowerCase();
        const logMessageLower = log.message.toLowerCase();
        
        // Match component name exactly or in brackets
        return logComponentLower === componentNameLower || 
               logComponentLower.includes(componentNameLower) ||
               componentNameLower.includes(logComponentLower) ||
               logMessageLower.includes(`[${componentNameLower}]`) ||
               logMessageLower.includes(componentNameLower);
      });
      
      // Use setTimeout to ensure this runs after render
      setTimeout(() => {
        setLogs(filtered);
      }, 0);
    };

    // Initial load
    updateLogs(globalLogs);

    // Subscribe to updates
    logListeners.add(updateLogs);

    return () => {
      logListeners.delete(updateLogs);
    };
  }, [mounted, componentName]);

  // Keyboard shortcut: Shift + D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const copyLogs = useCallback(() => {
    const logText = logs
      .map(log => {
        const time = new Date(log.timestamp).toLocaleTimeString();
        const prefix = `[${time}] [${log.component}]`;
        return `${prefix} ${log.message}`;
      })
      .join('\n');

    navigator.clipboard.writeText(logText).then(() => {
      // Show temporary feedback
      const button = document.querySelector('[data-copy-logs]') as HTMLButtonElement;
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          if (button) button.textContent = originalText;
        }, 1000);
      }
    });
  }, [logs]);

  if (!isVisible || !mounted) return null;

  const debugPanel = (
    <div
      style={{
        position: 'fixed',
        right: '16px',
        top: '80px',
        width: '500px',
        maxHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 99999,
        pointerEvents: 'auto',
        backgroundColor: 'white',
        border: '2px solid #d1d5db',
        borderRadius: '8px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Debug Logs - {componentName}</h3>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
            {logs.length} logs
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            data-copy-logs
            onClick={copyLogs}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            title="Copy logs to clipboard"
          >
            Copy
          </button>
          <button
            onClick={clearLogs}
            className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            title="Clear logs"
          >
            Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            title="Close (Shift + D)"
          >
            ×
          </button>
        </div>
      </div>

      {/* Logs container */}
      <div
        className="overflow-y-auto p-3 font-mono text-xs"
        style={{
          maxHeight: 'calc(70vh - 60px)',
          backgroundColor: '#1e1e1e',
          color: '#d4d4d4'
        }}
      >
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <div>No logs yet for {componentName}.</div>
            <div className="text-[10px] mt-2">Total global logs: {globalLogs.length}</div>
            <div className="text-[10px] mt-1">Scroll to see logs appear here.</div>
            <div className="text-[10px] mt-2 text-yellow-400">
              Check browser console for all logs.
            </div>
          </div>
        ) : (
          logs.map(log => {
            const time = new Date(log.timestamp).toLocaleTimeString();
            const colorClass =
              log.type === 'error'
                ? 'text-red-400'
                : log.type === 'warn'
                  ? 'text-yellow-400'
                  : 'text-green-400';

            return (
              <div
                key={log.id}
                className="mb-2 pb-2 border-b border-gray-700 last:border-b-0"
              >
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 text-[10px]">{time}</span>
                  <span className={`${colorClass} font-semibold`}>
                    [{log.component}]
                  </span>
                </div>
                <div className="mt-1 break-words whitespace-pre-wrap">
                  {log.message}
                </div>
                {log.data !== undefined && log.data !== null && (
                  <details className="mt-1">
                    <summary className="text-gray-400 cursor-pointer text-[10px]">
                      Show data
                    </summary>
                    <pre className="mt-1 text-[10px] text-gray-300 overflow-x-auto">
                      {safeStringify(log.data)}
                    </pre>
                  </details>
                )}
              </div>
            );
          })
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Footer */}
      <div className="p-2 border-t bg-gray-50 text-xs text-gray-500 text-center rounded-b-lg">
        Press <kbd className="px-1 py-0.5 bg-gray-200 rounded">Shift + D</kbd> to toggle
      </div>
    </div>
  );

  // Render using portal to ensure it's always at the root level and fixed
  return typeof window !== 'undefined' && mounted
    ? createPortal(debugPanel, document.body)
    : null;
}

