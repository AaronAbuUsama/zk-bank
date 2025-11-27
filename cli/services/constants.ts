// Shared constants and regex patterns (duplicated for services structure)

// Regex patterns
export const TX_HASH_REGEX = /0x[a-fA-F0-9]{64}/;
export const SOLC_VERSION_REGEX = /solc\s*=\s*["']?([^"'\s]+)["']?/;
export const YAML_EXT_REGEX = /\.t\.yaml$/;
export const CLEAN_TEXT_REGEX = /[^a-zA-Z0-9 ]/g;

// File extensions
export const TREE_EXT = ".tree";
export const SOL_TEST_EXT = ".t.sol";

// Default values
export const DEFAULT_SOLC_VERSION = "0.8.28";
export const DEFAULT_VERBOSITY = "3";
export const MAX_LOG_LINES = 20;
