// Multi-verifier abstraction

import { glob } from "glob";
import type { BroadcastJson, VerifierType, VerifyOptions } from "../types";
import * as forge from "./forge";

export interface VerifierConfig {
  type: VerifierType;
  chainId: number;
  apiUrl?: string;
  apiKey?: string;
  blockscoutHostName?: string;
}

export function getVerifierUrl(config: VerifierConfig): string | undefined {
  switch (config.type) {
    case "etherscan":
      return config.apiUrl || "https://api.etherscan.io/api";

    case "blockscout":
      if (config.blockscoutHostName) {
        return `https://${config.blockscoutHostName}/api?`;
      }
      return config.apiUrl;

    case "sourcify":
      return; // Sourcify doesn't need URL

    case "zksync":
      if (config.chainId === 300) {
        return "https://explorer.sepolia.era.zksync.dev/contract_verification";
      }
      if (config.chainId === 324) {
        return "https://zksync2-mainnet-explorer.zksync.io/contract_verification";
      }
      return config.apiUrl;

    case "routescan-mainnet":
      return `https://api.routescan.io/v2/network/mainnet/evm/${config.chainId}/etherscan`;

    case "routescan-testnet":
      return `https://api.routescan.io/v2/network/testnet/evm/${config.chainId}/etherscan`;

    default:
      return config.apiUrl;
  }
}

export function getVerifierParams(config: VerifierConfig): string[] {
  const params: string[] = [];

  switch (config.type) {
    case "etherscan":
      params.push("--verifier", "etherscan");
      if (config.apiKey) {
        params.push("--etherscan-api-key", config.apiKey);
      }
      break;

    case "blockscout": {
      params.push("--verifier", "blockscout");
      const blockscoutUrl = getVerifierUrl(config);
      if (blockscoutUrl) {
        params.push("--verifier-url", blockscoutUrl);
      }
      break;
    }

    case "sourcify":
      params.push("--verifier", "sourcify");
      break;

    case "zksync": {
      params.push("--verifier", "zksync");
      const zksyncUrl = getVerifierUrl(config);
      if (zksyncUrl) {
        params.push("--verifier-url", zksyncUrl);
      }
      break;
    }

    case "routescan-mainnet":
    case "routescan-testnet": {
      params.push("--verifier", "custom");
      const routescanUrl = getVerifierUrl(config);
      if (routescanUrl) {
        params.push("--verifier-url", routescanUrl);
      }
      params.push("--etherscan-api-key", "verifyContract");
      break;
    }

    default:
      params.push("--verifier", config.type);
      if (config.apiUrl) {
        params.push("--verifier-url", config.apiUrl);
      }
  }

  return params;
}

async function locateSourceFile(contractName: string): Promise<string | null> {
  // Search in src and lib directories
  const patterns = [`src/**/${contractName}.sol`, `lib/**/${contractName}.sol`];

  for (const pattern of patterns) {
    const files = await glob(pattern);
    if (files.length > 0) {
      return files[0];
    }
  }

  return null;
}

export async function verifyContract(
  address: string,
  contract: string,
  config: VerifierConfig,
  constructorArgs?: string
): Promise<boolean> {
  const verifierUrl = getVerifierUrl(config);

  const options: VerifyOptions = {
    verifier: config.type,
    verifierUrl,
    apiKey: config.apiKey,
    chainId: config.chainId,
    constructorArgs,
  };

  const exitCode = await forge.verify(address, contract, options);
  return exitCode === 0;
}

export async function verifyFromBroadcast(
  broadcastPath: string,
  config: VerifierConfig
): Promise<void> {
  const file = Bun.file(broadcastPath);

  if (!(await file.exists())) {
    throw new Error(`Broadcast file not found: ${broadcastPath}`);
  }

  const broadcast: BroadcastJson = await file.json();

  // Filter CREATE and CREATE2 transactions
  const contracts = broadcast.transactions.filter(
    (tx) =>
      (tx.transactionType === "CREATE" || tx.transactionType === "CREATE2") &&
      tx.contractAddress &&
      tx.contractAddress !== "0x0000000000000000000000000000000000000000" &&
      tx.contractName
  );

  console.log(`Found ${contracts.length} contracts to verify`);

  for (const contract of contracts) {
    if (!(contract.contractAddress && contract.contractName)) continue;

    console.log(
      `\nVerifying ${contract.contractName} at ${contract.contractAddress}`
    );

    const sourceFile = await locateSourceFile(contract.contractName);
    if (!sourceFile) {
      console.log(
        `  Warning: Could not find source file for ${contract.contractName}`
      );
      continue;
    }

    const contractPath = `${sourceFile}:${contract.contractName}`;

    const success = await verifyContract(
      contract.contractAddress,
      contractPath,
      config,
      contract.constructorArguments
    );

    if (success) {
      console.log(`  [SUCCESS] ${contract.contractName}`);
    } else {
      console.log(`  [FAILED] ${contract.contractName}`);
    }
  }

  console.log(`\nAll contracts processed for ${config.type}`);
}
