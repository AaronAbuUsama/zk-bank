// Build commands: init, clean

import { Command } from "commander";
import * as forge from "../lib/forge";
import { loadConfig, getChainCustomParams } from "../lib/config";
import { glob } from "glob";
import { rm } from "node:fs/promises";

export function registerBuildCommands(program: Command): void {
  program
    .command("init")
    .description("Check dependencies and build the project")
    .action(async () => {
      console.log("Checking dependencies...");

      // Check forge
      const forgeInstalled = await forge.checkInstalled();
      if (!forgeInstalled) {
        console.log("Forge not found. Installing Foundry...");
        await forge.installFoundry();
      }

      // Check lcov (optional, just warn)
      const lcovResult = await Bun.spawn(["which", "lcov"], {
        stdout: "pipe",
        stderr: "pipe",
      }).exited;
      if (lcovResult !== 0) {
        console.log(
          "Note: lcov can be installed by running 'sudo apt install lcov' or 'brew install lcov'"
        );
      }

      // Build with chain-specific params if available
      const config = loadConfig();
      const chainParams = config.chainId
        ? getChainCustomParams(config.chainId)
        : { forgeBuildParams: [], forgeScriptParams: [] };

      console.log("Building project...");
      const exitCode = await forge.build({
        customParams: chainParams.forgeBuildParams,
      });

      if (exitCode !== 0) {
        process.exit(exitCode);
      }

      console.log("Build completed successfully!");
    });

  program
    .command("clean")
    .description("Clean build artifacts")
    .action(async () => {
      console.log("Cleaning build artifacts...");

      // Clean forge artifacts
      await forge.clean();

      // Clean test tree files
      const treeFiles = await glob("test/**/*.tree");
      for (const file of treeFiles) {
        await rm(file, { force: true });
      }
      console.log(`Removed ${treeFiles.length} .tree files`);

      // Clean coverage files
      const coverageFiles = await glob("lcov.info*");
      for (const file of coverageFiles) {
        await rm(file, { force: true });
      }

      // Clean report directory
      await rm("./report", { recursive: true, force: true });
      await rm("./out", { recursive: true, force: true });

      console.log("Clean completed!");
    });
}
