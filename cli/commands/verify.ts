// Verify commands: verify-etherscan, verify-blockscout, verify-sourcify

import { Command } from "commander";
import { loadConfig, validateConfig } from "../lib/config";
import { verifyFromBroadcast, type VerifierConfig } from "../lib/verifier";
import type { VerifierType } from "../types";
import { existsSync } from "node:fs";

export function registerVerifyCommands(program: Command): void {
  program
    .command("verify")
    .description("Verify deployed contracts on block explorers")
    .option(
      "--verifier <type>",
      "Verifier type (etherscan, blockscout, sourcify, zksync, routescan-mainnet, routescan-testnet)"
    )
    .option("--broadcast <path>", "Path to broadcast JSON file")
    .action(async (options) => {
      const config = loadConfig();

      try {
        validateConfig(config, ["chainId", "verifier"]);
      } catch (error) {
        console.error("Configuration error:", (error as Error).message);
        process.exit(1);
      }

      const verifierType: VerifierType = options.verifier || config.verifier!;

      // Find broadcast file
      let broadcastPath = options.broadcast;
      if (!broadcastPath) {
        // Default to latest broadcast for Deploy.s.sol
        broadcastPath = `broadcast/Deploy.s.sol/${config.chainId}/run-latest.json`;

        // Also try the deployment script name
        if (!existsSync(broadcastPath)) {
          const scriptName = config.deploymentScript || "DeploySimple";
          broadcastPath = `broadcast/${scriptName}.s.sol/${config.chainId}/run-latest.json`;
        }
      }

      if (!existsSync(broadcastPath)) {
        console.error(`Broadcast file not found: ${broadcastPath}`);
        console.error(
          "\nMake sure you have run a deployment with --broadcast first."
        );
        process.exit(1);
      }

      console.log(`Verifying contracts from: ${broadcastPath}`);
      console.log(`Using verifier: ${verifierType}\n`);

      const verifierConfig: VerifierConfig = {
        type: verifierType,
        chainId: config.chainId!,
        apiKey: config.verifierApiKey,
        blockscoutHostName: config.blockscoutHostName,
      };

      await verifyFromBroadcast(broadcastPath, verifierConfig);
    });

  // Shortcut commands for specific verifiers
  program
    .command("verify:etherscan")
    .description("Verify contracts on Etherscan")
    .action(async () => {
      const config = loadConfig();
      try {
        validateConfig(config, ["chainId"]);
      } catch (error) {
        console.error("Configuration error:", (error as Error).message);
        process.exit(1);
      }

      const broadcastPath = `broadcast/Deploy.s.sol/${config.chainId}/run-latest.json`;

      if (!existsSync(broadcastPath)) {
        console.error(`Broadcast file not found: ${broadcastPath}`);
        process.exit(1);
      }

      await verifyFromBroadcast(broadcastPath, {
        type: "etherscan",
        chainId: config.chainId!,
        apiKey: config.verifierApiKey,
      });
    });

  program
    .command("verify:blockscout")
    .description("Verify contracts on Blockscout")
    .action(async () => {
      const config = loadConfig();
      try {
        validateConfig(config, ["chainId", "blockscoutHostName"]);
      } catch (error) {
        console.error("Configuration error:", (error as Error).message);
        process.exit(1);
      }

      const broadcastPath = `broadcast/Deploy.s.sol/${config.chainId}/run-latest.json`;

      if (!existsSync(broadcastPath)) {
        console.error(`Broadcast file not found: ${broadcastPath}`);
        process.exit(1);
      }

      await verifyFromBroadcast(broadcastPath, {
        type: "blockscout",
        chainId: config.chainId!,
        blockscoutHostName: config.blockscoutHostName,
      });
    });

  program
    .command("verify:sourcify")
    .description("Verify contracts on Sourcify")
    .action(async () => {
      const config = loadConfig();
      try {
        validateConfig(config, ["chainId"]);
      } catch (error) {
        console.error("Configuration error:", (error as Error).message);
        process.exit(1);
      }

      const broadcastPath = `broadcast/Deploy.s.sol/${config.chainId}/run-latest.json`;

      if (!existsSync(broadcastPath)) {
        console.error(`Broadcast file not found: ${broadcastPath}`);
        process.exit(1);
      }

      await verifyFromBroadcast(broadcastPath, {
        type: "sourcify",
        chainId: config.chainId!,
      });
    });
}
