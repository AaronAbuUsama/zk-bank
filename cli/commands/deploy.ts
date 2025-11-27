// Deploy commands: predeploy, deploy, resume

import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import type { Command } from "commander";
import {
  getChainCustomParams,
  loadConfig,
  validateConfigOrExit,
} from "../lib/config";
import { script as forgeScript, test as forgeTest } from "../lib/forge";
import { getVerifierParams } from "../lib/verifier";

function getDeployScriptPath(script: string): string {
  return `script/${script}.s.sol:${script}Script`;
}

function _getLogFileName(networkName: string): string {
  const now = new Date();
  const dateStr = now
    .toISOString()
    .slice(2, 16)
    .replace(/[-T:]/g, "-")
    .slice(0, 14);
  return `deployment-${networkName}-${dateStr}.log`;
}

export function registerDeployCommands(program: Command): void {
  program
    .command("deploy")
    .description("Deploy contracts")
    .option("--dry-run", "Simulate deployment without broadcasting")
    .option("--resume", "Resume a failed deployment")
    .option("-v, --verbosity <level>", "Verbosity level (1-5)", "3")
    .option("--skip-tests", "Skip running tests before deployment")
    .action(async (options) => {
      const config = validateConfigOrExit(loadConfig(), [
        "rpcUrl",
        "chainId",
        "networkName",
        "deploymentPrivateKey",
        "deploymentScript",
        "verifier",
      ]);

      const verbosity = Number.parseInt(options.verbosity, 10);
      const chainParams = getChainCustomParams(config.chainId);

      // Run tests first (unless skipped or dry-run)
      if (!(options.skipTests || options.dryRun)) {
        console.log("Running tests before deployment...\n");
        const testExitCode = await forgeTest({
          verbosity,
          noMatchPath: "./test/fork-tests/*.sol",
          customParams: chainParams.forgeBuildParams,
        });

        if (testExitCode !== 0) {
          console.error("\nTests failed. Aborting deployment.");
          process.exit(testExitCode);
        }
        console.log("\nTests passed!\n");
      }

      // Create logs and artifacts directories
      const logsFolder = config.logsFolder || "./logs";
      const artifactsFolder = config.artifactsFolder || "./artifacts";

      if (!existsSync(logsFolder)) {
        await mkdir(logsFolder, { recursive: true });
      }
      if (!existsSync(artifactsFolder)) {
        await mkdir(artifactsFolder, { recursive: true });
      }

      const scriptPath = getDeployScriptPath(config.deploymentScript);

      // Build environment variables for forge script (passes config to Solidity)
      const scriptEnv: Record<string, string> = {
        DEPLOYMENT_PRIVATE_KEY: config.deploymentPrivateKey,
        CHAIN_ID: config.chainId.toString(),
        NETWORK_NAME: config.networkName,
      };

      // Add Aragon OSx addresses if set
      if (config.daoFactoryAddress) {
        scriptEnv.DAO_FACTORY_ADDRESS = config.daoFactoryAddress;
      }
      if (config.pluginRepoFactoryAddress) {
        scriptEnv.PLUGIN_REPO_FACTORY_ADDRESS = config.pluginRepoFactoryAddress;
      }
      if (config.pluginSetupProcessorAddress) {
        scriptEnv.PLUGIN_SETUP_PROCESSOR_ADDRESS =
          config.pluginSetupProcessorAddress;
      }

      // Add plugin config if set
      if (config.pluginEnsSubdomain) {
        scriptEnv.PLUGIN_ENS_SUBDOMAIN = config.pluginEnsSubdomain;
      }
      if (config.pluginRepoMaintainerAddress) {
        scriptEnv.PLUGIN_REPO_MAINTAINER_ADDRESS =
          config.pluginRepoMaintainerAddress;
      }

      if (options.dryRun) {
        console.log("Simulating deployment (dry run)...\n");

        const exitCode = await forgeScript(scriptPath, config.rpcUrl, {
          verbosity,
          simulation: true,
          customParams: [
            ...chainParams.forgeBuildParams,
            ...chainParams.forgeScriptParams,
          ],
          env: scriptEnv,
        });

        process.exit(exitCode);
      }

      // Real deployment
      const action = options.resume ? "Resuming" : "Starting";
      console.log(`${action} deployment to ${config.networkName}...\n`);

      const verifierParams = getVerifierParams({
        type: config.verifier,
        chainId: config.chainId,
        apiKey: config.verifierApiKey,
        blockscoutHostName: config.blockscoutHostName,
      });

      const exitCode = await forgeScript(scriptPath, config.rpcUrl, {
        verbosity,
        broadcast: true,
        verify: true,
        resume: options.resume,
        retries: 10,
        delay: 8,
        customParams: [
          ...chainParams.forgeBuildParams,
          ...chainParams.forgeScriptParams,
          ...verifierParams,
        ],
        env: scriptEnv,
      });

      if (exitCode === 0) {
        console.log("\nDeployment completed successfully!");
      } else {
        console.error("\nDeployment failed.");
      }

      process.exit(exitCode);
    });
}
