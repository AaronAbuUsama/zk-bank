// ============================================================================
// Error Type Definitions
// ============================================================================

/** Base error class for all zk-bank errors */
export class ZkBankError extends Error {
  readonly code: string;
  readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
  }
}

/** Configuration/environment errors */
export class ConfigError extends ZkBankError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "CONFIG_ERROR", context);
  }
}

/** Network/RPC errors */
export class NetworkError extends ZkBankError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "NETWORK_ERROR", context);
  }
}

/** Convex backend errors */
export class ConvexError extends ZkBankError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "CONVEX_ERROR", context);
  }
}

/** Wallet/signing errors */
export class WalletError extends ZkBankError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "WALLET_ERROR", context);
  }
}

/** Cast command execution errors */
export class CastError extends ZkBankError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "CAST_ERROR", context);
  }
}

/** Validation errors (can contain multiple issues) */
export class ValidationError extends ZkBankError {
  readonly issues: ValidationIssue[];

  constructor(message: string, issues: ValidationIssue[]) {
    super(message, "VALIDATION_ERROR", { issues });
    this.issues = issues;
  }
}

export type ValidationIssue = {
  field: string;
  message: string;
  code?: string;
};

/** Multi-error container for operations that can fail in multiple ways */
export class AggregateZkBankError extends ZkBankError {
  readonly errors: ZkBankError[];

  constructor(message: string, errors: ZkBankError[]) {
    super(message, "AGGREGATE_ERROR", { errorCount: errors.length });
    this.errors = errors;
  }
}
