#!/usr/bin/env bun
// Main CLI entry point - Routes to Commander (with args) or Ink (interactive)

import { Command } from "commander";
import { registerBuildCommands } from "./commands/build";
import { registerTestCommands } from "./commands/test";
import { registerTestTreeCommands } from "./commands/test-tree";
import { registerDeployCommands } from "./commands/deploy";
import { registerVerifyCommands } from "./commands/verify";
import { registerPromptCommands } from "./commands/prompts";
import { registerUtilCommands } from "./commands/utils";
import { registerChainCommands } from "./commands/chain";

// Check if any arguments were passed (beyond node/bun and script path)
const hasArgs = process.argv.length > 2;

if (hasArgs) {
  // Commander mode: direct command execution
  const program = new Command();

  program
    .name("zk-bank")
    .description("ZK Bank CLI - Build, test, and deploy Foundry smart contracts")
    .version("1.0.0");

  // Register all command groups
  registerBuildCommands(program);
  registerTestCommands(program);
  registerTestTreeCommands(program);
  registerDeployCommands(program);
  registerVerifyCommands(program);
  registerPromptCommands(program);
  registerUtilCommands(program);
  registerChainCommands(program);

  // Parse and execute
  program.parse();
} else {
  // Ink mode: interactive launcher
  const { runApp } = await import("./app");
  runApp();
}
