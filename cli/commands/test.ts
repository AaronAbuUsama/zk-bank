// Test commands: test, test --fork, test --coverage

import { Command } from "commander";
import * as forge from "../lib/forge";
import { loadConfig, getChainCustomParams } from "../lib/config";
import { existsSync } from "node:fs";

export function registerTestCommands(program: Command): void {
  program
    .command("test")
    .description("Run tests")
    .option("-f, --fork", "Run fork tests only (using RPC_URL)")
    .option("-c, --coverage", "Generate coverage report")
    .option("-v, --verbosity <level>", "Verbosity level (1-5)", "3")
    .option("-m, --match <pattern>", "Only run tests matching pattern")
    .option("--no-match <pattern>", "Skip tests matching pattern")
    .action(async (options) => {
      const config = loadConfig();
      const chainParams = config.chainId
        ? getChainCustomParams(config.chainId)
        : { forgeBuildParams: [], forgeScriptParams: [] };

      const verbosity = parseInt(options.verbosity, 10);

      if (options.coverage) {
        console.log("Generating coverage report...");

        const exitCode = await forge.coverage({
          verbosity,
          customParams: chainParams.forgeBuildParams,
        });

        if (exitCode !== 0) {
          process.exit(exitCode);
        }

        // Generate HTML report if lcov.info exists
        if (existsSync("lcov.info")) {
          console.log("Generating HTML report...");
          const genhtml = Bun.spawn(["genhtml", "lcov.info", "-o", "report"], {
            stdout: "inherit",
            stderr: "inherit",
          });
          await genhtml.exited;

          // Try to open the report
          if (existsSync("report/index.html")) {
            const openCmd =
              process.platform === "darwin" ? "open" : "xdg-open";
            Bun.spawn([openCmd, "report/index.html"], {
              stdout: "ignore",
              stderr: "ignore",
            });
          }
        }

        return;
      }

      if (options.fork) {
        console.log("Running fork tests...");
        const exitCode = await forge.test({
          verbosity,
          matchPath: "./test/fork-tests/*.sol",
          customParams: chainParams.forgeBuildParams,
        });
        process.exit(exitCode);
      }

      // Regular unit tests (exclude fork tests)
      console.log("Running unit tests...");
      const exitCode = await forge.test({
        verbosity,
        noMatchPath: "./test/fork-tests/*.sol",
        match: options.match,
        customParams: chainParams.forgeBuildParams,
      });
      process.exit(exitCode);
    });
}
