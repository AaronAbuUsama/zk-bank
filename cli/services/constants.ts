// Shared constants and regex patterns (duplicated for services structure)

// Regex patterns
export const TX_HASH_REGEX = /0x[a-fA-F0-9]{64}/;
export const SOLC_VERSION_REGEX = /solc\s*=\s*["']?([^"'\s]+)["']?/;
export const YAML_EXT_REGEX = /\.t\.yaml$/;
export const CLEAN_TEXT_REGEX = /[^a-zA-Z0-9 ]/g;
export const QUOTE_STRIP_REGEX = /^["']|["']$/g;

// File extensions
export const TREE_EXT = ".tree";
export const SOL_TEST_EXT = ".t.sol";

// Default values
export const DEFAULT_SOLC_VERSION = "0.8.28";
export const DEFAULT_VERBOSITY = "3";
export const MAX_LOG_LINES = 20;

// Network defaults (Anvil for local development)
export const DEFAULT_RPC_URL = "http://127.0.0.1:8545";
export const DEFAULT_CHAIN_ID = 31_337;
export const DEFAULT_NETWORK_NAME = "anvil";

// Deployment defaults (Anvil test account)
export const DEFAULT_DEPLOYMENT_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
export const DEFAULT_DEPLOYMENT_ADDRESS =
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
export const DEFAULT_DEPLOYMENT_SCRIPT = "DeploySimple";

// Verification defaults
export const DEFAULT_VERIFIER = "sourcify";

// Aragon OSx mainnet contract addresses (for mainnet fork)
export const ARAGON_DAO_FACTORY_ADDRESS =
  "0xA03C2182af8eC460D498108C92E8638a580b94d4";
export const ARAGON_PLUGIN_REPO_FACTORY_ADDRESS =
  "0x301868712b77744A3C0E5511609238399f0A2d4D";
export const ARAGON_PLUGIN_SETUP_PROCESSOR_ADDRESS =
  "0xE978942c691e43f65c1B7c7F8f1dc8cDF061B13f";

// Plugin defaults
export const DEFAULT_PLUGIN_ENS_SUBDOMAIN = "my-plugin";

// Path defaults
export const DEFAULT_ARTIFACTS_FOLDER = "./artifacts";
export const DEFAULT_LOGS_FOLDER = "./logs";

// Valid verifier types
export const VALID_VERIFIERS = [
  "etherscan",
  "blockscout",
  "sourcify",
  "zksync",
  "routescan-mainnet",
  "routescan-testnet",
  "custom",
] as const;

// Valid deployment scripts
export const VALID_DEPLOYMENT_SCRIPTS = [
  "DeploySimple",
  "DeployDaoWithPlugins",
  "DeployViaFactory",
] as const;

// Chain-specific constants
export const CHAIN_IDS = {
  CHILIZ: 88_888,
  ZKSYNC_TESTNET: 300,
  ZKSYNC_MAINNET: 324,
} as const;

// Chiliz chain gas settings
export const CHILIZ_PRIORITY_GAS_PRICE = "1000000000";
export const CHILIZ_GAS_PRICE = "5200000000000";

// Minimum private key length (32 bytes = 64 hex chars)
export const MIN_PRIVATE_KEY_LENGTH = 64;
