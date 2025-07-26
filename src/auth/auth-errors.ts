export class AuthenticationError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, code: string = 'authentication_required', details?: any) {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
    this.statusCode = 401;
    this.details = details;
  }

  toMCPResponse() {
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          error: this.code,
          error_description: this.message,
          ...(this.details && { details: this.details })
        }, null, 2)
      }]
    };
  }
}

export class TokenExpiredError extends AuthenticationError {
  constructor(message: string = 'Access token has expired') {
    super(message, 'token_expired');
  }
}

export class InvalidTokenError extends AuthenticationError {
  constructor(message: string = 'Invalid access token') {
    super(message, 'invalid_token');
  }
}

export class AuthenticationRequiredError extends AuthenticationError {
  constructor(message: string = 'Authentication required. Please use the authenticate tool first.') {
    super(message, 'authentication_required');
  }
}