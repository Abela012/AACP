export function setupConsoleInterceptor() {
  // Only suppress errors in production mode
  if (import.meta.env.DEV) {
    return;
  }

  const originalError = console.error;
  const originalWarn = console.warn;

  // Patterns that typically identify expected authentication/network noise
  const errorNoisePatterns = [
    'Clerk',
    '400 (Bad Request)',
    '401 (Unauthorized)',
    '403 (Forbidden)',
    'status code 400',
    'status code 401',
    'status code 403',
    'Network Error',
    'Failed to fetch',
    'ERR_INTERNET_DISCONNECTED',
    'ERR_CONNECTION_REFUSED',
    'ERR_CONNECTION_RESET',
    'Authentication error',
    'Uncaught (in promise) Error: Network Error',
    'timeout',
    'Socket connection error',
  ];

  const warnNoisePatterns = [
    'Clerk',
    'React Router',
    'No routes matched location',
    'timeout',
  ];

  // Safely check if any of the arguments match our noise patterns
  const isNoise = (args: any[], patterns: string[]) => {
    try {
      return args.some(arg => {
        if (!arg) return false;
        
        // Direct string match
        if (typeof arg === 'string') {
          return patterns.some(p => arg.toLowerCase().includes(p.toLowerCase()));
        }
        
        // Error object match
        if (arg instanceof Error) {
          const messageMatch = patterns.some(p => arg.message?.toLowerCase().includes(p.toLowerCase()));
          const stackMatch = patterns.some(p => arg.stack?.toLowerCase().includes(p.toLowerCase()));
          return messageMatch || stackMatch;
        }

        // Object with status code (like AxiosError or fetch response)
        if (typeof arg === 'object') {
          if (arg.status === 400 || arg.status === 401 || arg.status === 403) return true;
          if (arg?.response?.status === 400 || arg?.response?.status === 401 || arg?.response?.status === 403) return true;
          
          // Stringify safely (depth limited) to catch nested error messages
          const str = String(arg);
          if (str !== '[object Object]') {
             return patterns.some(p => str.toLowerCase().includes(p.toLowerCase()));
          }
        }
        
        return false;
      });
    } catch (err) {
      // If our interceptor fails to parse, default to showing the error
      return false;
    }
  };

  // Override console.error
  console.error = (...args: any[]) => {
    if (isNoise(args, errorNoisePatterns)) {
      return; // Suppress expected errors quietly
    }

    // Sanitize remaining errors in production to prevent exposing stack traces or API details
    const sanitizedArgs = args.map(arg => {
      if (arg instanceof Error) {
        // Return a clean object without the stack trace
        return { message: arg.message, name: arg.name };
      }
      if (typeof arg === 'object' && arg !== null) {
        // Strip out potentially sensitive API response details like headers or config
        const { config, request, response, ...safeParts } = arg as any;
        if (response) {
            return { ...safeParts, status: response.status, data: response.data };
        }
        return safeParts;
      }
      return arg;
    });

    originalError(...sanitizedArgs);
  };

  // Override console.warn
  console.warn = (...args: any[]) => {
    if (isNoise(args, warnNoisePatterns)) {
      return; // Suppress expected warnings quietly
    }
    
    const sanitizedArgs = args.map(arg => {
      if (arg instanceof Error) {
        return { message: arg.message, name: arg.name };
      }
      return arg;
    });

    originalWarn(...sanitizedArgs);
  };
}
