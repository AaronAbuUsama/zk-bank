// Utility commands: storage, refund, gas-price, balance, nonce

import { createInterface } from "node:readline";
import type { Command } from "commander";
import {
  balance,
  gasPrice,
  send,
  sendStreaming,
  toUnit,
  walletAddress,
} from "../lib/cast";
import { loadConfig, validateConfigOrExit } from "../lib/config";
import { inspect } from "../lib/forge";

/**
 * Prompts user for confirmation via terminal.
 * Returns a Promise that resolves with user's yes/no answer.
 */
function confirm(message: string): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/N) `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}

export function registerUtilCommands(program: Command): void {
  program
    .command("storage")
    .description("Show storage layout of a contract")
    .argument("<contract>", "Contract path (e.g., src/MyContract.sol)")
    .action(async (contract) => {
      const result = await inspect(contract, "storageLayout");

      if (result.success) {
        console.log(result.output);
      } else {
        console.error("Error:", result.output);
        process.exit(1);
      }
    });

  program
    .command("gas-price")
    .description("Show current gas price")
    .action(async () => {
      const config = validateConfigOrExit(loadConfig(), [
        "rpcUrl",
        "networkName",
      ]);

      console.log(`Gas price (${config.networkName}):`);

      const currentGasPrice = await gasPrice(config.rpcUrl);
      if (currentGasPrice !== null) {
        const gasPriceGwei = await toUnit(currentGasPrice, "gwei");
        console.log(`  ${currentGasPrice} wei`);
        if (gasPriceGwei) {
          console.log(`  ${gasPriceGwei} gwei`);
        }
      } else {
        console.error("Failed to get gas price");
        process.exit(1);
      }
    });

  program
    .command("balance")
    .description("Show deployment account balance")
    .action(async () => {
      const config = validateConfigOrExit(loadConfig(), [
        "rpcUrl",
        "networkName",
        "deploymentPrivateKey",
      ]);

      const address = await walletAddress(config.deploymentPrivateKey);
      if (!address) {
        console.error("Failed to derive address from private key");
        process.exit(1);
      }

      console.log(`Balance of ${address} (${config.networkName}):`);

      const currentBalance = await balance(address, config.rpcUrl);
      if (currentBalance !== null) {
        const balanceEther = await toUnit(currentBalance, "ether");
        console.log(`  ${currentBalance} wei`);
        if (balanceEther) {
          console.log(`  ${balanceEther} ETH`);
        }
      } else {
        console.error("Failed to get balance");
        process.exit(1);
      }
    });

  program
    .command("refund")
    .description("Refund remaining balance from deployment account")
    .action(async () => {
      const config = validateConfigOrExit(loadConfig(), [
        "rpcUrl",
        "networkName",
        "deploymentPrivateKey",
        "refundAddress",
      ]);

      if (
        config.refundAddress === "0x0000000000000000000000000000000000000000"
      ) {
        console.error("Refund address cannot be zero address");
        process.exit(1);
      }

      const address = await walletAddress(config.deploymentPrivateKey);
      if (!address) {
        console.error("Failed to derive address from private key");
        process.exit(1);
      }

      console.log(`Refunding remaining balance on ${address}`);

      const currentBalance = await balance(address, config.rpcUrl);
      const currentGasPrice = await gasPrice(config.rpcUrl);

      if (currentBalance === null || currentGasPrice === null) {
        console.error("Failed to get balance or gas price");
        process.exit(1);
      }

      const gasCost = currentGasPrice * 21000n;
      const remaining = currentBalance - gasCost;

      if (remaining <= 0n) {
        const balanceEther = await toUnit(currentBalance, "ether");
        const minRequired = await toUnit(gasCost, "ether");
        console.error(`No balance can be refunded: ${balanceEther} ETH`);
        console.error(`Minimum required for gas: ${minRequired} ETH`);
        process.exit(1);
      }

      const remainingEther = await toUnit(remaining, "ether");
      console.log("\nSummary:");
      console.log(`  Refunding: ${remainingEther} ETH (${remaining} wei)`);
      console.log(`  Recipient: ${config.refundAddress}`);

      const confirmed = await confirm("\nContinue?");
      if (!confirmed) {
        console.log("Aborted");
        process.exit(0);
      }

      const result = await send({
        privateKey: config.deploymentPrivateKey,
        rpcUrl: config.rpcUrl,
        to: config.refundAddress,
        value: remaining,
      });

      if (result.success) {
        console.log("\nRefund successful!");
        if (result.txHash) {
          console.log(`Transaction: ${result.txHash}`);
        }
      } else {
        console.error(`\nRefund failed: ${result.error}`);
        process.exit(1);
      }
    });

  const nonce = program
    .command("nonce")
    .description("Nonce management commands");

  nonce
    .command("clean")
    .description("Clear a stuck transaction by sending 0 value to self")
    .argument("<nonce>", "Nonce to clear")
    .action(async (nonceValue) => {
      const config = validateConfigOrExit(loadConfig(), [
        "rpcUrl",
        "deploymentPrivateKey",
      ]);

      const address = await walletAddress(config.deploymentPrivateKey);
      if (!address) {
        console.error("Failed to derive address from private key");
        process.exit(1);
      }

      console.log(`Clearing nonce ${nonceValue} for ${address}`);

      const exitCode = await sendStreaming({
        privateKey: config.deploymentPrivateKey,
        rpcUrl: config.rpcUrl,
        to: address,
        value: 0n,
        nonce: Number.parseInt(nonceValue, 10),
      });

      process.exit(exitCode);
    });

  nonce
    .command("clean-all")
    .description("Clear multiple stuck transactions")
    .argument("<nonces...>", "Nonces to clear")
    .action(async (nonces) => {
      const config = validateConfigOrExit(loadConfig(), [
        "rpcUrl",
        "deploymentPrivateKey",
      ]);

      const address = await walletAddress(config.deploymentPrivateKey);
      if (!address) {
        console.error("Failed to derive address from private key");
        process.exit(1);
      }

      for (const nonceValue of nonces) {
        console.log(`\nClearing nonce ${nonceValue}...`);

        const result = await send({
          privateKey: config.deploymentPrivateKey,
          rpcUrl: config.rpcUrl,
          to: address,
          value: 0n,
          nonce: Number.parseInt(nonceValue, 10),
        });

        if (result.success) {
          console.log(`  [SUCCESS] Nonce ${nonceValue} cleared`);
        } else {
          console.log(`  [FAILED] Nonce ${nonceValue}: ${result.error}`);
        }
      }
    });

  program
    .command("info")
    .description("Show network and deployment info")
    .action(async () => {
      const config = loadConfig();

      console.log("Configuration:");
      console.log(`  Network: ${config.networkName || "(not set)"}`);
      console.log(`  Chain ID: ${config.chainId || "(not set)"}`);
      console.log(`  RPC URL: ${config.rpcUrl ? "***" : "(not set)"}`);
      console.log(`  Verifier: ${config.verifier || "(not set)"}`);
      console.log(
        `  Deployment Script: ${config.deploymentScript || "(not set)"}`
      );

      if (config.deploymentPrivateKey && config.rpcUrl) {
        const address = await walletAddress(config.deploymentPrivateKey);
        if (address) {
          console.log(`  Deployment Address: ${address}`);

          const currentBalance = await balance(address, config.rpcUrl);
          if (currentBalance !== null) {
            const balanceEther = await toUnit(currentBalance, "ether");
            console.log(`  Balance: ${balanceEther} ETH`);
          }
        }
      }
    });
}
