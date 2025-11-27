// Chain control commands for Anvil: mine, warp, mint, impersonate

import type { Command } from "commander";
import { loadConfig } from "../lib/config";
import { NetworkError, type Result, tryCatch } from "../shared/errors";

type JsonRpcError = {
  code: number;
  message: string;
  data?: unknown;
};

type JsonRpcResponse<T> = {
  jsonrpc: "2.0";
  id: number;
  result?: T;
  error?: JsonRpcError;
};

async function rpcCall<T = unknown>(
  method: string,
  params: unknown[] = []
): Promise<Result<T, NetworkError>> {
  const config = loadConfig();
  const rpcUrl = config.rpcUrl ?? "http://127.0.0.1:8545";

  // Network/HTTP errors
  const fetchResult = await tryCatch<Response, Error>(
    fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method,
        params,
      }),
    })
  );

  if (fetchResult.error) {
    return {
      data: null,
      error: new NetworkError(`Network error: ${fetchResult.error.message}`, {
        method,
        params,
        rpcUrl,
      }),
    };
  }

  const response = fetchResult.data;

  // HTTP status errors
  if (!response.ok) {
    return {
      data: null,
      error: new NetworkError(
        `HTTP ${response.status}: ${response.statusText}`,
        { method, params, rpcUrl, status: response.status }
      ),
    };
  }

  // JSON parsing errors
  const jsonResult = await tryCatch<JsonRpcResponse<T>, Error>(
    response.json() as Promise<JsonRpcResponse<T>>
  );
  if (jsonResult.error) {
    return {
      data: null,
      error: new NetworkError("Parse error: Invalid JSON response", {
        method,
        params,
        rpcUrl,
        parseError: jsonResult.error.message,
      }),
    };
  }

  const data = jsonResult.data;

  // JSON-RPC structure validation
  if (data.jsonrpc !== "2.0") {
    return {
      data: null,
      error: new NetworkError("Invalid JSON-RPC version", {
        method,
        params,
        rpcUrl,
        received: data.jsonrpc,
      }),
    };
  }

  // JSON-RPC error response
  if (data.error) {
    return {
      data: null,
      error: new NetworkError(
        `RPC Error [${data.error.code}]: ${data.error.message}`,
        {
          method,
          params,
          rpcUrl,
          rpcErrorCode: data.error.code,
          rpcErrorData: data.error.data,
        }
      ),
    };
  }

  // Missing result
  if (!("result" in data)) {
    return {
      data: null,
      error: new NetworkError("Missing result in response", {
        method,
        params,
        rpcUrl,
      }),
    };
  }

  return { data: data.result as T, error: null };
}

function parseEther(value: string): string {
  // Convert ETH to wei (hex)
  const eth = Number.parseFloat(value);
  const wei = BigInt(Math.floor(eth * 1e18));
  return `0x${wei.toString(16)}`;
}

export function registerChainCommands(program: Command): void {
  const chain = program
    .command("chain")
    .description("Anvil chain control commands");

  chain
    .command("mine [blocks]")
    .description("Mine blocks (default: 1)")
    .option("-i, --interval <seconds>", "Time interval between blocks", "1")
    .action(async (blocks, options) => {
      const _config = loadConfig();
      const numBlocks = Number.parseInt(blocks ?? "1", 10) || 1;
      const interval = Number.parseInt(options.interval, 10) || 1;

      console.log(`Mining ${numBlocks} block(s) with ${interval}s interval...`);

      // anvil_mine takes hex values
      const mineResult = await rpcCall("anvil_mine", [
        `0x${numBlocks.toString(16)}`,
        `0x${interval.toString(16)}`,
      ]);

      if (mineResult.error) {
        console.error(`Failed to mine blocks: ${mineResult.error.message}`);
        process.exit(1);
      }

      // Get new block number
      const blockNumResult = await rpcCall<string>("eth_blockNumber");
      if (blockNumResult.error) {
        console.error(
          `Failed to get block number: ${blockNumResult.error.message}`
        );
        process.exit(1);
      }

      console.log(`Current block: ${Number.parseInt(blockNumResult.data, 16)}`);
    });

  chain
    .command("warp <timestamp>")
    .description("Set next block timestamp (unix timestamp or +seconds)")
    .action(async (timestamp: string) => {
      let targetTimestamp: number;

      if (timestamp.startsWith("+")) {
        // Relative: +3600 means 1 hour from now
        const currentBlockResult = await rpcCall<{ timestamp: string }>(
          "eth_getBlockByNumber",
          ["latest", false]
        );

        if (currentBlockResult.error) {
          console.error(
            `Failed to get current block: ${currentBlockResult.error.message}`
          );
          process.exit(1);
        }

        const currentTimestamp = Number.parseInt(
          currentBlockResult.data.timestamp,
          16
        );
        targetTimestamp =
          currentTimestamp + Number.parseInt(timestamp.slice(1), 10);
      } else {
        targetTimestamp = Number.parseInt(timestamp, 10);
      }

      console.log(`Warping to timestamp ${targetTimestamp}...`);
      console.log(`(${new Date(targetTimestamp * 1000).toISOString()})`);

      const setTimestampResult = await rpcCall("evm_setNextBlockTimestamp", [
        targetTimestamp,
      ]);
      if (setTimestampResult.error) {
        console.error(
          `Failed to set timestamp: ${setTimestampResult.error.message}`
        );
        process.exit(1);
      }

      // Mine a block to apply the timestamp
      const mineResult = await rpcCall("anvil_mine", ["0x1", "0x0"]);
      if (mineResult.error) {
        console.error(`Failed to mine block: ${mineResult.error.message}`);
        process.exit(1);
      }

      const blockResult = await rpcCall<{ timestamp: string }>(
        "eth_getBlockByNumber",
        ["latest", false]
      );
      if (blockResult.error) {
        console.error(`Failed to get block: ${blockResult.error.message}`);
        process.exit(1);
      }

      console.log(
        `Block timestamp: ${Number.parseInt(blockResult.data.timestamp, 16)}`
      );
    });

  chain
    .command("mint <address> <amount>")
    .description("Mint ETH to an address (amount in ETH)")
    .action(async (address: string, amount: string) => {
      console.log(`Minting ${amount} ETH to ${address}...`);

      const weiHex = parseEther(amount);
      const setBalanceResult = await rpcCall("anvil_setBalance", [
        address,
        weiHex,
      ]);
      if (setBalanceResult.error) {
        console.error(
          `Failed to set balance: ${setBalanceResult.error.message}`
        );
        process.exit(1);
      }

      // Verify balance
      const balanceResult = await rpcCall<string>("eth_getBalance", [
        address,
        "latest",
      ]);
      if (balanceResult.error) {
        console.error(`Failed to get balance: ${balanceResult.error.message}`);
        process.exit(1);
      }

      const ethBalance = Number(BigInt(balanceResult.data)) / 1e18;
      console.log(`New balance: ${ethBalance.toLocaleString()} ETH`);
    });

  chain
    .command("impersonate <address>")
    .description("Impersonate an account (allows sending txs as this address)")
    .action(async (address: string) => {
      console.log(`Impersonating ${address}...`);
      const result = await rpcCall("anvil_impersonateAccount", [address]);
      if (result.error) {
        console.error(`Failed to impersonate: ${result.error.message}`);
        process.exit(1);
      }
      console.log(`Now impersonating ${address}`);
      console.log("Use 'bun cli chain stop-impersonate <address>' to stop");
    });

  chain
    .command("stop-impersonate <address>")
    .description("Stop impersonating an account")
    .action(async (address: string) => {
      console.log(`Stopping impersonation of ${address}...`);
      const result = await rpcCall("anvil_stopImpersonatingAccount", [address]);
      if (result.error) {
        console.error(`Failed to stop impersonation: ${result.error.message}`);
        process.exit(1);
      }
      console.log("Impersonation stopped");
    });

  chain
    .command("snapshot")
    .description("Create a chain state snapshot")
    .action(async () => {
      const result = await rpcCall<string>("evm_snapshot");
      if (result.error) {
        console.error(`Failed to create snapshot: ${result.error.message}`);
        process.exit(1);
      }
      console.log(`Snapshot created: ${result.data}`);
      console.log("Use 'bun cli chain revert <id>' to restore");
    });

  chain
    .command("revert <snapshotId>")
    .description("Revert to a chain state snapshot")
    .action(async (snapshotId: string) => {
      console.log(`Reverting to snapshot ${snapshotId}...`);
      const result = await rpcCall<boolean>("evm_revert", [snapshotId]);
      if (result.error) {
        console.error(`Failed to revert: ${result.error.message}`);
        process.exit(1);
      }
      if (result.data) {
        console.log("Chain state reverted successfully");
      } else {
        console.error("Failed to revert (snapshot may not exist)");
        process.exit(1);
      }
    });

  chain
    .command("reset")
    .description("Reset chain to initial fork state")
    .option("--block <number>", "Fork from specific block number")
    .action(async (options) => {
      const config = loadConfig();
      console.log("Resetting chain to fork state...");

      const params: { forking?: { jsonRpcUrl: string; blockNumber?: number } } =
        {};

      if (config.rpcUrl && config.rpcUrl !== "http://127.0.0.1:8545") {
        params.forking = { jsonRpcUrl: config.rpcUrl };
        if (options.block) {
          params.forking.blockNumber = Number.parseInt(options.block, 10);
        }
      }

      const result = await rpcCall("anvil_reset", [params]);
      if (result.error) {
        console.error(`Failed to reset chain: ${result.error.message}`);
        process.exit(1);
      }
      console.log("Chain reset complete");
    });

  chain
    .command("auto-mine [enabled]")
    .description("Enable/disable auto-mining (true/false)")
    .action(async (enabled = "true") => {
      const autoMine = enabled.toLowerCase() === "true";
      console.log(`Setting auto-mine to ${autoMine}...`);
      const result = await rpcCall("evm_setAutomine", [autoMine]);
      if (result.error) {
        console.error(`Failed to set auto-mine: ${result.error.message}`);
        process.exit(1);
      }
      console.log(`Auto-mine ${autoMine ? "enabled" : "disabled"}`);
    });

  chain
    .command("block-interval <seconds>")
    .description("Set block mining interval (0 for auto-mine)")
    .action(async (seconds: string) => {
      const interval = Number.parseInt(seconds, 10);
      console.log(`Setting block interval to ${interval}s...`);
      const result = await rpcCall("evm_setIntervalMining", [interval]);
      if (result.error) {
        console.error(`Failed to set interval: ${result.error.message}`);
        process.exit(1);
      }
      console.log(`Block interval set to ${interval}s`);
    });

  chain
    .command("status")
    .description("Show current chain status")
    .action(async () => {
      const config = loadConfig();

      const [blockNumResult, gasPriceResult, blockResult] = await Promise.all([
        rpcCall<string>("eth_blockNumber"),
        rpcCall<string>("eth_gasPrice"),
        rpcCall<{ timestamp: string; baseFeePerGas?: string }>(
          "eth_getBlockByNumber",
          ["latest", false]
        ),
      ]);

      if (blockNumResult.error) {
        console.error(
          `Failed to get block number: ${blockNumResult.error.message}`
        );
        process.exit(1);
      }
      if (gasPriceResult.error) {
        console.error(
          `Failed to get gas price: ${gasPriceResult.error.message}`
        );
        process.exit(1);
      }
      if (blockResult.error) {
        console.error(`Failed to get block: ${blockResult.error.message}`);
        process.exit(1);
      }

      const blockNumber = Number.parseInt(blockNumResult.data, 16);
      const gasPriceGwei = Number(BigInt(gasPriceResult.data)) / 1e9;
      const timestamp = Number.parseInt(blockResult.data.timestamp, 16);
      const baseFee = blockResult.data.baseFeePerGas
        ? Number(BigInt(blockResult.data.baseFeePerGas)) / 1e9
        : 0;

      console.log(`Chain Status (${config.networkName}):`);
      console.log(`  Block:      ${blockNumber.toLocaleString()}`);
      console.log(
        `  Timestamp:  ${timestamp} (${new Date(timestamp * 1000).toISOString()})`
      );
      console.log(`  Gas Price:  ${gasPriceGwei.toFixed(2)} gwei`);
      console.log(`  Base Fee:   ${baseFee.toFixed(2)} gwei`);
    });
}
