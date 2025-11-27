// Environment configuration loader and validator

import type { Config, DeploymentScript, VerifierType } from "../types";

const SUPPORTED_VERIFIERS: VerifierType[] = [
  "etherscan",
  "blockscout",
  "sourcify",
  "zksync",
  "routescan-mainnet",
  "routescan-testnet",
];

const SUPPORTED_DEPLOYMENT_SCRIPTS: DeploymentScript[] = [
  "DeploySimple",
  "DeployDaoWithPlugins",
  "DeployViaFactory",
];

// Anvil default configuration for local development (mainnet fork)
const ANVIL_DEFAULTS = {
  rpcUrl: "http://127.0.0.1:8545",
  chainId: 31_337,
  networkName: "anvil",
  // Anvil's first default test account private key (well-known, for local dev only)
  deploymentPrivateKey:
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  // Anvil's first default test account address (derived from above key)
  deploymentAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  verifier: "sourcify" as VerifierType,
};

// Aragon OSx mainnet contract addresses (for mainnet fork)
const ARAGON_MAINNET = {
  daoFactory: "0xA03C2182af8eC460D498108C92E8638a580b94d4",
  pluginRepoFactory: "0x301868712b77744A3C0E5511609238399f0A2d4D",
  pluginSetupProcessor: "0xE978942c691e43f65c1B7c7F8f1dc8cDF061B13f",
};

function stripQuotes(value: string | undefined): string {
  if (!value) return "";
  return value.replace(/^["']|["']$/g, "").trim();
}

export function loadConfig(): Partial<Config> {
  // Bun automatically loads .env files
  const env = process.env;

  const config: Partial<Config> = {
    // Network (with Anvil defaults for local development)
    rpcUrl: stripQuotes(env.RPC_URL) || ANVIL_DEFAULTS.rpcUrl,
    chainId: env.CHAIN_ID
      ? Number.parseInt(stripQuotes(env.CHAIN_ID), 10)
      : ANVIL_DEFAULTS.chainId,
    networkName: stripQuotes(env.NETWORK_NAME) || ANVIL_DEFAULTS.networkName,

    // Deployment (with Anvil defaults)
    deploymentPrivateKey:
      stripQuotes(env.DEPLOYMENT_PRIVATE_KEY) ||
      ANVIL_DEFAULTS.deploymentPrivateKey,
    deploymentScript: (stripQuotes(env.DEPLOYMENT_SCRIPT) ||
      "DeploySimple") as DeploymentScript,

    // Verification (with Anvil-friendly default)
    verifier: (stripQuotes(env.VERIFIER) ||
      ANVIL_DEFAULTS.verifier) as VerifierType,
    verifierApiKey: stripQuotes(env.ETHERSCAN_API_KEY),
    blockscoutHostName: stripQuotes(env.BLOCKSCOUT_HOST_NAME),

    // Aragon OSx (defaults to mainnet for fork testing)
    daoFactoryAddress:
      stripQuotes(env.DAO_FACTORY_ADDRESS) || ARAGON_MAINNET.daoFactory,
    pluginRepoFactoryAddress:
      stripQuotes(env.PLUGIN_REPO_FACTORY_ADDRESS) ||
      ARAGON_MAINNET.pluginRepoFactory,
    pluginSetupProcessorAddress:
      stripQuotes(env.PLUGIN_SETUP_PROCESSOR_ADDRESS) ||
      ARAGON_MAINNET.pluginSetupProcessor,

    // Plugin (defaults to deployer address for local dev)
    pluginEnsSubdomain: stripQuotes(env.PLUGIN_ENS_SUBDOMAIN) || "my-plugin",
    pluginRepoMaintainerAddress:
      stripQuotes(env.PLUGIN_REPO_MAINTAINER_ADDRESS) ||
      ANVIL_DEFAULTS.deploymentAddress,

    // Refund
    refundAddress: stripQuotes(env.REFUND_ADDRESS),

    // Paths (with defaults)
    artifactsFolder: stripQuotes(env.ARTIFACTS_FOLDER) || "./artifacts",
    logsFolder: stripQuotes(env.LOGS_FOLDER) || "./logs",
  };

  return config;
}

function validateRequiredFields<K extends keyof Config>(
  config: Partial<Config>,
  requiredFields: K[]
): string[] {
  const missing: string[] = [];
  for (const field of requiredFields) {
    const value = config[field];
    if (value === undefined || value === null || value === "") {
      missing.push(field);
    }
  }
  return missing;
}

function validateFieldValues(config: Partial<Config>): string[] {
  const invalid: string[] = [];

  if (config.verifier && !SUPPORTED_VERIFIERS.includes(config.verifier)) {
    invalid.push(
      `verifier must be one of: ${SUPPORTED_VERIFIERS.join(", ")} (got: ${config.verifier})`
    );
  }

  if (
    config.deploymentScript &&
    !SUPPORTED_DEPLOYMENT_SCRIPTS.includes(config.deploymentScript)
  ) {
    invalid.push(
      `deploymentScript must be one of: ${SUPPORTED_DEPLOYMENT_SCRIPTS.join(", ")} (got: ${config.deploymentScript})`
    );
  }

  if (config.chainId !== undefined && Number.isNaN(config.chainId)) {
    invalid.push("chainId must be a valid number");
  }

  return invalid;
}

function buildValidationError(missing: string[], invalid: string[]): Error {
  const errorParts: string[] = [];
  if (missing.length > 0) {
    errorParts.push(`Missing required fields: ${missing.join(", ")}`);
  }
  if (invalid.length > 0) {
    errorParts.push(`Invalid values: ${invalid.join("; ")}`);
  }
  return new Error(errorParts.join("\n"));
}

export function validateConfig<K extends keyof Config>(
  config: Partial<Config>,
  requiredFields: K[]
): asserts config is Partial<Config> & Required<Pick<Config, K>> {
  const missing = validateRequiredFields(config, requiredFields);
  const invalid = validateFieldValues(config);

  if (missing.length > 0 || invalid.length > 0) {
    throw buildValidationError(missing, invalid);
  }
}

export function getDeploymentAddress(privateKey: string): string | null {
  // We'll use cast to derive the address
  // This is a sync check - if private key is invalid, return null
  if (!privateKey || privateKey.length < 64) {
    return null;
  }
  return null; // Will be computed via cast
}

export function getChainCustomParams(chainId: number): {
  forgeScriptParams: string[];
  forgeBuildParams: string[];
} {
  const forgeScriptParams: string[] = [];
  const forgeBuildParams: string[] = [];

  switch (chainId) {
    case 88_888:
      // Chiliz chain - custom gas settings
      forgeScriptParams.push(
        "--priority-gas-price",
        "1000000000",
        "--gas-price",
        "5200000000000"
      );
      break;
    case 300:
    case 324:
      // zkSync Era (testnet: 300, mainnet: 324)
      forgeScriptParams.push("--slow");
      forgeBuildParams.push("--zksync");
      break;
    default:
      // No custom params for other chains
      break;
  }

  return { forgeScriptParams, forgeBuildParams };
}

export function getSolcVersion(): string {
  const { SOLC_VERSION_REGEX, DEFAULT_SOLC_VERSION } = require("./constants");
  try {
    const _foundryToml = Bun.file("foundry.toml");
    // Quick sync read for config
    const content = require("node:fs").readFileSync("foundry.toml", "utf-8");
    const match = content.match(SOLC_VERSION_REGEX);
    return match?.[1] || DEFAULT_SOLC_VERSION;
  } catch {
    return "0.8.28";
  }
}

/**
 * Validates config and returns typed config or exits process.
 * This helper eliminates the need for null assertions after validation.
 *
 * @param config - Partial config to validate
 * @param requiredFields - Array of required field names
 * @returns Validated config with required fields guaranteed to be present
 */
export function validateConfigOrExit<K extends keyof Config>(
  config: Partial<Config>,
  requiredFields: K[]
): Partial<Config> & Required<Pick<Config, K>> {
  try {
    validateConfig(config, requiredFields);
    return config;
  } catch (error) {
    console.error("Configuration error:", (error as Error).message);
    process.exit(1);
  }
}
