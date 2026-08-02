/**
 * Sanitize error messages to hide sensitive backend details
 * Log full error to console for debugging, show safe message to user
 */

export interface SanitizedError {
  userMessage: string;
  debugMessage: string;
}

const ERROR_PATTERNS = [
  {
    pattern: /unique constraint/i,
    userMessage: 'You already have a review for this product.',
  },
  {
    pattern: /foreign key constraint/i,
    userMessage: 'Invalid product or user reference.',
  },
  {
    pattern: /not null constraint/i,
    userMessage: 'Please fill in all required fields.',
  },
  {
    pattern: /no rows affected|not found/i,
    userMessage: 'The item you are trying to modify was not found.',
  },
  {
    pattern: /unauthorized|403|forbidden/i,
    userMessage: 'You do not have permission to perform this action.',
  },
  {
    pattern: /authentication|401|unauthenticated/i,
    userMessage: 'Your session has expired. Please log in again.',
  },
];

export function sanitizeError(
  error: any,
  defaultMessage: string = 'Something went wrong. Please try again.',
): SanitizedError {
  const debugMessage =
    typeof error === 'string'
      ? error
      : error?.message ||
        error?.data?.error ||
        error?.error ||
        JSON.stringify(error);

  // Check if error matches any known patterns
  for (const { pattern, userMessage } of ERROR_PATTERNS) {
    if (pattern.test(debugMessage)) {
      return {
        userMessage,
        debugMessage,
      };
    }
  }

  // Check for HTTP status codes in error
  if (error?.status || error?.statusCode) {
    const status = error.status || error.statusCode;
    if (status === 400) {
      return {
        userMessage: 'Invalid request. Please check your input.',
        debugMessage,
      };
    }
    if (status === 401) {
      return {
        userMessage: 'Your session has expired. Please log in again.',
        debugMessage,
      };
    }
    if (status === 403) {
      return {
        userMessage: 'You do not have permission to perform this action.',
        debugMessage,
      };
    }
    if (status === 404) {
      return {
        userMessage: 'The item you are looking for was not found.',
        debugMessage,
      };
    }
    if (status === 409) {
      return {
        userMessage: 'This action conflicts with existing data.',
        debugMessage,
      };
    }
    if (status === 500) {
      return {
        userMessage: 'Server error. Please try again later or contact support.',
        debugMessage,
      };
    }
  }

  return {
    userMessage: defaultMessage,
    debugMessage,
  };
}

export function logAndAlertError(
  error: any,
  context: string,
  defaultMessage?: string,
): string {
  const sanitized = sanitizeError(error, defaultMessage);

  // Always log full error for debugging
  console.error(`[${context}] Error:`, {
    userMessage: sanitized.userMessage,
    debugMessage: sanitized.debugMessage,
    originalError: error,
  });

  return sanitized.userMessage;
}
