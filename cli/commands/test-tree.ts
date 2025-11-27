// Test tree commands: sync-tests, check-tests, test-tree

import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import type { Command } from "commander";
import { glob } from "glob";
import { getSolcVersion } from "../lib/config";
import { SOL_TEST_EXT, TREE_EXT, YAML_EXT_REGEX } from "../lib/constants";
import { processYamlFile } from "../lib/test-tree-parser";

const TEST_TREE_MARKDOWN = "TESTS.md";

async function checkBulloak(): Promise<boolean> {
  const result = await Bun.spawn(["which", "bulloak"], {
    stdout: "pipe",
    stderr: "pipe",
  }).exited;
  return result === 0;
}

export function registerTestTreeCommands(program: Command): void {
  const testTree = program
    .command("test-tree")
    .description("Test tree management commands");

  testTree
    .command("sync")
    .description("Scaffold or sync test definitions into Solidity tests")
    .action(async () => {
      // Check dependencies
      const bulloakInstalled = await checkBulloak();
      if (!bulloakInstalled) {
        console.error(
          "Error: bulloak is not installed. Install it with: cargo install bulloak"
        );
        process.exit(1);
      }

      // Find all YAML test files
      const yamlFiles = await glob("test/**/*.t.yaml");

      if (yamlFiles.length === 0) {
        console.log("No test definition files found (test/**/*.t.yaml)");
        return;
      }

      const solcVersion = getSolcVersion();
      console.log(`Using Solidity version: ${solcVersion}`);

      // Process each YAML file
      for (const yamlFile of yamlFiles) {
        const treeFile = yamlFile.replace(YAML_EXT_REGEX, TREE_EXT);
        const solFile = yamlFile.replace(YAML_EXT_REGEX, SOL_TEST_EXT);

        // Convert YAML to tree
        console.log(`[Convert]    ${yamlFile} -> ${treeFile}`);
        await processYamlFile(yamlFile);

        // Scaffold or sync
        if (existsSync(solFile)) {
          console.log(`[Sync file]  ${solFile}`);
          const proc = Bun.spawn(["bulloak", "check", "--fix", treeFile], {
            stdout: "inherit",
            stderr: "inherit",
          });
          await proc.exited;
        } else {
          console.log(`[Scaffold]   ${solFile}`);
          const proc = Bun.spawn(
            [
              "bulloak",
              "scaffold",
              "-s",
              solcVersion,
              "--vm-skip",
              "-w",
              treeFile,
            ],
            { stdout: "inherit", stderr: "inherit" }
          );
          await proc.exited;
        }
      }

      // Generate markdown summary
      await generateMarkdown();
    });

  testTree
    .command("check")
    .description("Check if Solidity test files are in sync with definitions")
    .action(async () => {
      const bulloakInstalled = await checkBulloak();
      if (!bulloakInstalled) {
        console.error(
          "Error: bulloak is not installed. Install it with: cargo install bulloak"
        );
        process.exit(1);
      }

      // Find all tree files
      const treeFiles = await glob("test/**/*.tree");

      if (treeFiles.length === 0) {
        console.log(
          "No .tree files found. Run 'bun cli test-tree sync' first."
        );
        return;
      }

      const proc = Bun.spawn(["bulloak", "check", ...treeFiles], {
        stdout: "inherit",
        stderr: "inherit",
      });

      const exitCode = await proc.exited;
      process.exit(exitCode);
    });

  testTree
    .command("generate")
    .description("Generate markdown summary of test definitions")
    .action(async () => {
      // First convert YAML to tree files
      const yamlFiles = await glob("test/**/*.t.yaml");

      for (const yamlFile of yamlFiles) {
        const treeFile = yamlFile.replace(YAML_EXT_REGEX, TREE_EXT);
        console.log(`[Convert]    ${yamlFile} -> ${treeFile}`);
        await processYamlFile(yamlFile);
      }

      await generateMarkdown();
    });
}

async function generateMarkdown(): Promise<void> {
  const treeFiles = await glob("test/**/*TREE_EXT");

  if (treeFiles.length === 0) {
    console.log("No TREE_EXT files found to generate markdown");
    return;
  }

  let markdown = "# Test tree definitions\n\n";
  markdown +=
    "Below is the graphical summary of the tests described within [test/*.t.yaml](./test)\n\n";

  for (const treeFile of treeFiles) {
    const content = await readFile(treeFile, "utf-8");
    markdown += `\`\`\`\n${content}\`\`\`\n\n`;
  }

  await writeFile(TEST_TREE_MARKDOWN, markdown);
  console.log(`[Markdown]   ${TEST_TREE_MARKDOWN}`);
}
