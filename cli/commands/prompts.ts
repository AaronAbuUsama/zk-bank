// Prompt commands: test-tree-prompt, test-prompt

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import type { Command } from "commander";
import { glob } from "glob";
import {
  TEST_FILE_GENERATION_PROMPT,
  TEST_TREE_GENERATION_PROMPT,
} from "../lib/templates";

async function readFileContent(path: string): Promise<string> {
  if (!existsSync(path)) {
    throw new Error(`File not found: ${path}`);
  }
  return readFile(path, "utf-8");
}

export function registerPromptCommands(program: Command): void {
  const prompt = program
    .command("prompt")
    .description("Generate LLM prompts for test creation");

  prompt
    .command("test-tree")
    .description("Generate LLM prompt for test definition creation")
    .requiredOption("--src <file>", "Path to the source file")
    .action(async (options) => {
      const sourceContent = await readFileContent(options.src);

      const output = TEST_TREE_GENERATION_PROMPT.replace(
        "<<SOURCE_FILE>>",
        sourceContent
      );

      console.log(output);
    });

  prompt
    .command("test")
    .description("Generate LLM prompt for test implementation")
    .requiredOption("--def <file>", "Path to the test definition YAML file")
    .requiredOption("--src <file>", "Path to the target test Solidity file")
    .option(
      "--dao-builder <file>",
      "Path to DAO builder file",
      "test/builders/SimpleBuilder.sol"
    )
    .option(
      "--test-base <file>",
      "Path to test base file",
      "test/lib/TestBase.sol"
    )
    .action(async (options) => {
      // Read all source contract files
      const contractFiles = await glob("src/**/*.sol");
      let sourceContent = "";
      for (const file of contractFiles) {
        const content = await readFileContent(file);
        sourceContent += `// File: ${file}\n${content}\n\n`;
      }

      // Read other required files
      const daoBuilderContent = existsSync(options.daoBuilder)
        ? await readFileContent(options.daoBuilder)
        : "// DAO Builder not found";

      const testBaseContent = existsSync(options.testBase)
        ? await readFileContent(options.testBase)
        : "// Test Base not found";

      const testTreeContent = await readFileContent(options.def);
      const targetTestContent = await readFileContent(options.src);

      // Replace placeholders
      const output = TEST_FILE_GENERATION_PROMPT.replace(
        "<<SOURCE>>",
        sourceContent
      )
        .replace("<<DAO_BUILDER>>", daoBuilderContent)
        .replace("<<TEST_BASE>>", testBaseContent)
        .replace("<<TEST_TREE>>", testTreeContent)
        .replace("<<TARGET_TEST_FILE>>", targetTestContent);

      console.log(output);
    });
}
