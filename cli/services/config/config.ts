// Environment configuration loader and validator

import type { Config } from "../../types";
import {
  ARAGON_DAO_FACTORY_ADDRESS,
  ARAGON_PLUGIN_REPO_FACTORY_ADDRESS,
  ARAGON_PLUGIN_SETUP_PROCESSOR_ADDRESS,
  CHAIN_IDS,
  CHILIZ_GAS_PRICE,
  CHILIZ_PRIORITY_GAS_PRICE,
  DEFAULT_ARTIFACTS_FOLDER,
  DEFAULT_CHAIN_ID,
  DEFAULT_DEPLOYMENT_ADDRESS,
  DEFAULT_DEPLOYMENT_PRIVATE_KEY,
  DEFAULT_DEPLOYMENT_SCRIPT,
  DEFAULT_LOGS_FOLDER,
  DEFAULT_NETWORK_NAME,
  DEFAULT_PLUGIN_ENS_SUBDOMAIN,
  DEFAULT_RPC_URL,
  DEFAULT_SOLC_VERSION,
  DEFAULT_VERIFIER,
  MIN_PRIVATE_KEY_LENGTH,
  QUOTE_STRIP_REGEX,
  SOLC_VERSION_REGEX,
  VALID_DEPLOYMENT_SCRIPTS,
  VALID_VERIFIERS,
} from "../constants";

// Helper to strip quotes from env vars
const stripQuotes = (val: string | undefined): string => {
  if (!val) return "";
  return val.replace(QUOTE_STRIP_REGEX, "").trim();
};

// Helper to get env var value
const getEnv = (key: string): string | undefined => process.env[key];

// Helper to parse string with default
const parseString = (val: string | undefined, defaultValue: string): string =>
  val ? stripQuotes(val) : defaultValue;

// Helper to parse number with default
const parseNumber = (val: string | undefined, defaultValue: number): number =>
  val ? Number.parseInt(stripQuotes(val), 10) : defaultValue;

export function loadConfig(): Partial<Config> {
  return {
    // Network
    rpcUrl: parseString(getEnv("RPC_URL"), DEFAULT_RPC_URL),
    chainId: parseNumber(getEnv("CHAIN_ID"), DEFAULT_CHAIN_ID),
    networkName: parseString(getEnv("NETWORK_NAME"), DEFAULT_NETWORK_NAME),

    // Deployment
    deploymentPrivateKey: parseString(
      getEnv("DEPLOYMENT_PRIVATE_KEY"),
      DEFAULT_DEPLOYMENT_PRIVATE_KEY
    ),
    deploymentScript: (parseString(
      getEnv("DEPLOYMENT_SCRIPT"),
      DEFAULT_DEPLOYMENT_SCRIPT
    ) || DEFAULT_DEPLOYMENT_SCRIPT) as Config["deploymentScript"],

    // Verification
    verifier: (parseString(getEnv("VERIFIER"), DEFAULT_VERIFIER) ||
      DEFAULT_VERIFIER) as Config["verifier"],
    verifierApiKey: stripQuotes(getEnv("ETHERSCAN_API_KEY")) || undefined,
    blockscoutHostName:
      stripQuotes(getEnv("BLOCKSCOUT_HOST_NAME")) || undefined,

    // Aragon OSx
    daoFactoryAddress:
      parseString(getEnv("DAO_FACTORY_ADDRESS"), ARAGON_DAO_FACTORY_ADDRESS) ||
      undefined,
    pluginRepoFactoryAddress:
      parseString(
        getEnv("PLUGIN_REPO_FACTORY_ADDRESS"),
        ARAGON_PLUGIN_REPO_FACTORY_ADDRESS
      ) || undefined,
    pluginSetupProcessorAddress:
      parseString(
        getEnv("PLUGIN_SETUP_PROCESSOR_ADDRESS"),
        ARAGON_PLUGIN_SETUP_PROCESSOR_ADDRESS
      ) || undefined,

    // Plugin
    pluginEnsSubdomain:
      parseString(
        getEnv("PLUGIN_ENS_SUBDOMAIN"),
        DEFAULT_PLUGIN_ENS_SUBDOMAIN
      ) || undefined,
    pluginRepoMaintainerAddress:
      parseString(
        getEnv("PLUGIN_REPO_MAINTAINER_ADDRESS"),
        DEFAULT_DEPLOYMENT_ADDRESS
      ) || undefined,

    // Refund
    refundAddress: stripQuotes(getEnv("REFUND_ADDRESS")) || undefined,

    // Paths
    artifactsFolder: parseString(
      getEnv("ARTIFACTS_FOLDER"),
      DEFAULT_ARTIFACTS_FOLDER
    ),
    logsFolder: parseString(getEnv("LOGS_FOLDER"), DEFAULT_LOGS_FOLDER),
  };
}

function checkRequiredFields<K extends keyof Config>(
  config: Partial<Config>,
  requiredFields: K[]
): string[] {
  const missing: string[] = [];
  for (const field of requiredFields) {
    const value = config[field];
    if (value === undefined || value === null || value === "") {
      missing.push(String(field));
    }
  }
  return missing;
}

function validateFieldValues(config: Partial<Config>): string[] {
  const invalid: string[] = [];

  if (config.verifier && !VALID_VERIFIERS.includes(config.verifier)) {
    invalid.push(
      `verifier must be one of: ${VALID_VERIFIERS.join(", ")} (got: ${config.verifier})`
    );
  }

  if (
    config.deploymentScript &&
    !VALID_DEPLOYMENT_SCRIPTS.includes(config.deploymentScript)
  ) {
    invalid.push(
      `deploymentScript must be one of: ${VALID_DEPLOYMENT_SCRIPTS.join(", ")} (got: ${config.deploymentScript})`
    );
  }

  if (config.chainId !== undefined && Number.isNaN(config.chainId)) {
    invalid.push("chainId must be a valid number");
  }

  return invalid;
}

export function validateConfig<K extends keyof Config>(
  config: Partial<Config>,
  requiredFields: K[]
): asserts config is Partial<Config> & Required<Pick<Config, K>> {
  const missing = checkRequiredFields(config, requiredFields);
  const invalid = validateFieldValues(config);

  if (missing.length > 0 || invalid.length > 0) {
    const errorParts: string[] = [];
    if (missing.length > 0)
      errorParts.push(`Missing required fields: ${missing.join(", ")}`);

    errorParts.push(`Invalid values: ${invalid.join("; ")}`);

    throw new Error(errorParts.join("\n"));
  }
}

export function getDeploymentAddress(privateKey: string): string | null {
  // We'll use cast to derive the address
  // This is a sync check - if private key is invalid, return null
  if (!privateKey || privateKey.length < MIN_PRIVATE_KEY_LENGTH) {
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
    case CHAIN_IDS.CHILIZ:
      // Chiliz chain - custom gas settings
      forgeScriptParams.push(
        "--priority-gas-price",
        CHILIZ_PRIORITY_GAS_PRICE,
        "--gas-price",
        CHILIZ_GAS_PRICE
      );
      break;
    case CHAIN_IDS.ZKSYNC_TESTNET:
    case CHAIN_IDS.ZKSYNC_MAINNET:
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

export async function getSolcVersion(): Promise<string> {
  try {
    const file = Bun.file("foundry.toml");
    const content = await file.text();
    const match = content.match(SOLC_VERSION_REGEX);
    return match?.[1] || DEFAULT_SOLC_VERSION;
  } catch {
    return DEFAULT_SOLC_VERSION;
  }
}
