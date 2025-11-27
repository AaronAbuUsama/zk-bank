// Chain control commands for Anvil: mine, warp, mint, impersonate

import type { Command } from "commander";
import { loadConfig } from "../lib/config";

async function rpcCall(
  method: string,
  params: unknown[] = []
): Promise<unknown> {
  const config = loadConfig();
  const rpcUrl = config.rpcUrl ?? "http://127.0.0.1:8545";
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }
  return data.result;
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
      const numBlocks = Number.parseInt(blocks, 10);
      const interval = Number.parseInt(options.interval, 10);

      console.log(`Mining ${numBlocks} block(s) with ${interval}s interval...`);

      // anvil_mine takes hex values
      await rpcCall("anvil_mine", [
        `0x${numBlocks.toString(16)}`,
        `0x${interval.toString(16)}`,
      ]);

      // Get new block number
      const blockNum = await rpcCall("eth_blockNumber");
      console.log(`Current block: ${Number.parseInt(blockNum as string, 16)}`);
    });

  chain
    .command("warp <timestamp>")
    .description("Set next block timestamp (unix timestamp or +seconds)")
    .action(async (timestamp: string) => {
      let targetTimestamp: number;

      if (timestamp.startsWith("+")) {
        // Relative: +3600 means 1 hour from now
        const currentBlock = (await rpcCall("eth_getBlockByNumber", [
          "latest",
          false,
        ])) as { timestamp: string };
        const currentTimestamp = Number.parseInt(currentBlock.timestamp, 16);
        targetTimestamp =
          currentTimestamp + Number.parseInt(timestamp.slice(1), 10);
      } else {
        targetTimestamp = Number.parseInt(timestamp, 10);
      }

      console.log(`Warping to timestamp ${targetTimestamp}...`);
      console.log(`(${new Date(targetTimestamp * 1000).toISOString()})`);

      await rpcCall("evm_setNextBlockTimestamp", [targetTimestamp]);

      // Mine a block to apply the timestamp
      await rpcCall("anvil_mine", ["0x1", "0x0"]);

      const block = (await rpcCall("eth_getBlockByNumber", [
        "latest",
        false,
      ])) as { timestamp: string };
      console.log(`Block timestamp: ${Number.parseInt(block.timestamp, 16)}`);
    });

  chain
    .command("mint <address> <amount>")
    .description("Mint ETH to an address (amount in ETH)")
    .action(async (address: string, amount: string) => {
      console.log(`Minting ${amount} ETH to ${address}...`);

      const weiHex = parseEther(amount);
      await rpcCall("anvil_setBalance", [address, weiHex]);

      // Verify balance
      const balance = (await rpcCall("eth_getBalance", [
        address,
        "latest",
      ])) as string;
      const ethBalance = Number(BigInt(balance)) / 1e18;
      console.log(`New balance: ${ethBalance.toLocaleString()} ETH`);
    });

  chain
    .command("impersonate <address>")
    .description("Impersonate an account (allows sending txs as this address)")
    .action(async (address: string) => {
      console.log(`Impersonating ${address}...`);
      await rpcCall("anvil_impersonateAccount", [address]);
      console.log(`Now impersonating ${address}`);
      console.log("Use 'bun cli chain stop-impersonate <address>' to stop");
    });

  chain
    .command("stop-impersonate <address>")
    .description("Stop impersonating an account")
    .action(async (address: string) => {
      console.log(`Stopping impersonation of ${address}...`);
      await rpcCall("anvil_stopImpersonatingAccount", [address]);
      console.log("Impersonation stopped");
    });

  chain
    .command("snapshot")
    .description("Create a chain state snapshot")
    .action(async () => {
      const snapshotId = await rpcCall("evm_snapshot");
      console.log(`Snapshot created: ${snapshotId}`);
      console.log("Use 'bun cli chain revert <id>' to restore");
    });

  chain
    .command("revert <snapshotId>")
    .description("Revert to a chain state snapshot")
    .action(async (snapshotId: string) => {
      console.log(`Reverting to snapshot ${snapshotId}...`);
      const success = await rpcCall("evm_revert", [snapshotId]);
      if (success) {
        console.log("Chain state reverted successfully");
      } else {
        console.error("Failed to revert (snapshot may not exist)");
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

      await rpcCall("anvil_reset", [params]);
      console.log("Chain reset complete");
    });

  chain
    .command("auto-mine [enabled]")
    .description("Enable/disable auto-mining (true/false)")
    .action(async (enabled = "true") => {
      const autoMine = enabled.toLowerCase() === "true";
      console.log(`Setting auto-mine to ${autoMine}...`);
      await rpcCall("evm_setAutomine", [autoMine]);
      console.log(`Auto-mine ${autoMine ? "enabled" : "disabled"}`);
    });

  chain
    .command("block-interval <seconds>")
    .description("Set block mining interval (0 for auto-mine)")
    .action(async (seconds: string) => {
      const interval = Number.parseInt(seconds, 10);
      console.log(`Setting block interval to ${interval}s...`);
      await rpcCall("evm_setIntervalMining", [interval]);
      console.log(`Block interval set to ${interval}s`);
    });

  chain
    .command("status")
    .description("Show current chain status")
    .action(async () => {
      const config = loadConfig();

      const [blockNum, gasPrice, block] = (await Promise.all([
        rpcCall("eth_blockNumber"),
        rpcCall("eth_gasPrice"),
        rpcCall("eth_getBlockByNumber", ["latest", false]),
      ])) as [string, string, { timestamp: string; baseFeePerGas?: string }];

      const blockNumber = Number.parseInt(blockNum, 16);
      const gasPriceGwei = Number(BigInt(gasPrice)) / 1e9;
      const timestamp = Number.parseInt(block.timestamp, 16);
      const baseFee = block.baseFeePerGas
        ? Number(BigInt(block.baseFeePerGas)) / 1e9
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
