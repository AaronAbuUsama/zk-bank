// Utility commands: storage, refund, gas-price, balance, nonce

import { Command } from "commander";
import * as forge from "../lib/forge";
import * as cast from "../lib/cast";
import { loadConfig, validateConfig } from "../lib/config";
import { createInterface } from "readline";

async function confirm(message: string): Promise<boolean> {
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
      const result = await forge.inspect(contract, "storageLayout");

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
      const config = loadConfig();

      try {
        validateConfig(config, ["rpcUrl", "networkName"]);
      } catch (error) {
        console.error("Configuration error:", (error as Error).message);
        process.exit(1);
      }

      console.log(`Gas price (${config.networkName}):`);

      const gasPrice = await cast.gasPrice(config.rpcUrl!);
      if (gasPrice !== null) {
        const gasPriceGwei = await cast.toUnit(gasPrice, "gwei");
        console.log(`  ${gasPrice} wei`);
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
      const config = loadConfig();

      try {
        validateConfig(config, ["rpcUrl", "networkName", "deploymentPrivateKey"]);
      } catch (error) {
        console.error("Configuration error:", (error as Error).message);
        process.exit(1);
      }

      const address = await cast.walletAddress(config.deploymentPrivateKey!);
      if (!address) {
        console.error("Failed to derive address from private key");
        process.exit(1);
      }

      console.log(`Balance of ${address} (${config.networkName}):`);

      const balance = await cast.balance(address, config.rpcUrl!);
      if (balance !== null) {
        const balanceEther = await cast.toUnit(balance, "ether");
        console.log(`  ${balance} wei`);
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
      const config = loadConfig();

      try {
        validateConfig(config, [
          "rpcUrl",
          "networkName",
          "deploymentPrivateKey",
          "refundAddress",
        ]);
      } catch (error) {
        console.error("Configuration error:", (error as Error).message);
        console.error("\nSet REFUND_ADDRESS in your .env file");
        process.exit(1);
      }

      if (
        config.refundAddress ===
        "0x0000000000000000000000000000000000000000"
      ) {
        console.error("Refund address cannot be zero address");
        process.exit(1);
      }

      const address = await cast.walletAddress(config.deploymentPrivateKey!);
      if (!address) {
        console.error("Failed to derive address from private key");
        process.exit(1);
      }

      console.log(`Refunding remaining balance on ${address}`);

      const balance = await cast.balance(address, config.rpcUrl!);
      const gasPrice = await cast.gasPrice(config.rpcUrl!);

      if (balance === null || gasPrice === null) {
        console.error("Failed to get balance or gas price");
        process.exit(1);
      }

      const gasCost = gasPrice * 21000n;
      const remaining = balance - gasCost;

      if (remaining <= 0n) {
        const balanceEther = await cast.toUnit(balance, "ether");
        const minRequired = await cast.toUnit(gasCost, "ether");
        console.error(`No balance can be refunded: ${balanceEther} ETH`);
        console.error(`Minimum required for gas: ${minRequired} ETH`);
        process.exit(1);
      }

      const remainingEther = await cast.toUnit(remaining, "ether");
      console.log(`\nSummary:`);
      console.log(`  Refunding: ${remainingEther} ETH (${remaining} wei)`);
      console.log(`  Recipient: ${config.refundAddress}`);

      const confirmed = await confirm("\nContinue?");
      if (!confirmed) {
        console.log("Aborted");
        process.exit(0);
      }

      const result = await cast.send({
        privateKey: config.deploymentPrivateKey!,
        rpcUrl: config.rpcUrl!,
        to: config.refundAddress!,
        value: remaining,
      });

      if (result.success) {
        console.log(`\nRefund successful!`);
        if (result.txHash) {
          console.log(`Transaction: ${result.txHash}`);
        }
      } else {
        console.error(`\nRefund failed: ${result.error}`);
        process.exit(1);
      }
    });

  const nonce = program.command("nonce").description("Nonce management commands");

  nonce
    .command("clean")
    .description("Clear a stuck transaction by sending 0 value to self")
    .argument("<nonce>", "Nonce to clear")
    .action(async (nonceValue) => {
      const config = loadConfig();

      try {
        validateConfig(config, ["rpcUrl", "deploymentPrivateKey"]);
      } catch (error) {
        console.error("Configuration error:", (error as Error).message);
        process.exit(1);
      }

      const address = await cast.walletAddress(config.deploymentPrivateKey!);
      if (!address) {
        console.error("Failed to derive address from private key");
        process.exit(1);
      }

      console.log(`Clearing nonce ${nonceValue} for ${address}`);

      const exitCode = await cast.sendStreaming({
        privateKey: config.deploymentPrivateKey!,
        rpcUrl: config.rpcUrl!,
        to: address,
        value: 0n,
        nonce: parseInt(nonceValue, 10),
      });

      process.exit(exitCode);
    });

  nonce
    .command("clean-all")
    .description("Clear multiple stuck transactions")
    .argument("<nonces...>", "Nonces to clear")
    .action(async (nonces) => {
      const config = loadConfig();

      try {
        validateConfig(config, ["rpcUrl", "deploymentPrivateKey"]);
      } catch (error) {
        console.error("Configuration error:", (error as Error).message);
        process.exit(1);
      }

      const address = await cast.walletAddress(config.deploymentPrivateKey!);
      if (!address) {
        console.error("Failed to derive address from private key");
        process.exit(1);
      }

      for (const nonceValue of nonces) {
        console.log(`\nClearing nonce ${nonceValue}...`);

        const result = await cast.send({
          privateKey: config.deploymentPrivateKey!,
          rpcUrl: config.rpcUrl!,
          to: address,
          value: 0n,
          nonce: parseInt(nonceValue, 10),
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
      console.log(`  Deployment Script: ${config.deploymentScript || "(not set)"}`);

      if (config.deploymentPrivateKey && config.rpcUrl) {
        const address = await cast.walletAddress(config.deploymentPrivateKey);
        if (address) {
          console.log(`  Deployment Address: ${address}`);

          const balance = await cast.balance(address, config.rpcUrl);
          if (balance !== null) {
            const balanceEther = await cast.toUnit(balance, "ether");
            console.log(`  Balance: ${balanceEther} ETH`);
          }
        }
      }
    });
}
