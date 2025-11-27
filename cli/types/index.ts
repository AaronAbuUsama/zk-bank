// Shared type definitions for the CLI

export type VerifierType =
  | "etherscan"
  | "blockscout"
  | "sourcify"
  | "zksync"
  | "routescan-mainnet"
  | "routescan-testnet"
  | "custom";

export type DeploymentScript =
  | "DeploySimple"
  | "DeployDaoWithPlugins"
  | "DeployViaFactory";

export type Config = {
  // Network
  rpcUrl: string;
  chainId: number;
  networkName: string;

  // Deployment
  deploymentPrivateKey: string;
  deploymentScript: DeploymentScript;

  // Verification
  verifier: VerifierType;
  verifierApiKey?: string;
  blockscoutHostName?: string;

  // Aragon OSx
  daoFactoryAddress?: string;
  pluginRepoFactoryAddress?: string;
  pluginSetupProcessorAddress?: string;

  // Plugin
  pluginEnsSubdomain?: string;
  pluginRepoMaintainerAddress?: string;

  // Refund
  refundAddress?: string;

  // Paths
  artifactsFolder: string;
  logsFolder: string;
};

export type ForgeOptions = {
  verbosity?: number;
  zksync?: boolean;
  customParams?: string[];
};

export interface ForgeScriptOptions extends ForgeOptions {
  broadcast?: boolean;
  verify?: boolean;
  resume?: boolean;
  retries?: number;
  delay?: number;
  simulation?: boolean;
}

export interface ForgeTestOptions extends ForgeOptions {
  match?: string;
  noMatch?: string;
  matchPath?: string;
  noMatchPath?: string;
  fork?: boolean;
  coverage?: boolean;
}

export type VerifyOptions = {
  verifier: VerifierType;
  verifierUrl?: string;
  apiKey?: string;
  chainId: number;
  constructorArgs?: string;
  compilerVersion?: string;
  numOptimizations?: number;
};

export type CastSendOptions = {
  privateKey: string;
  rpcUrl: string;
  value?: bigint;
  nonce?: number;
  to: string;
};

// Test tree types (from make-test-tree.ts)
export type Rule = {
  comment?: string;
  given?: string;
  when?: string;
  and?: Rule[];
  then?: Rule[];
  it?: string;
};

export type TreeItem = {
  content: string;
  children: TreeItem[];
  comment?: string;
};

// Broadcast JSON types (from forge script output)
export type BroadcastTransaction = {
  transactionType: "CREATE" | "CREATE2" | "CALL";
  contractAddress: string | null;
  contractName: string | null;
  constructorArguments?: string;
};

export type BroadcastJson = {
  transactions: BroadcastTransaction[];
};
