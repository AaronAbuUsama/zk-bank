#!/usr/bin/env bun
// Ink interactive CLI launcher

import React, { useState } from "react";
import { render, Box, Text } from "ink";
import { Select, Spinner } from "@inkjs/ui";
import { CommandRunner } from "./components/CommandRunner";
import { Header } from "./components/Header";
import type { CommandDefinition } from "./components/types";

// Define all available commands with metadata
const commands: CommandDefinition[] = [
  // Build commands
  {
    id: "init",
    label: "Init",
    description: "Check dependencies and build the project",
    command: ["bun", "cli", "init"],
    category: "Build",
  },
  {
    id: "clean",
    label: "Clean",
    description: "Clean build artifacts",
    command: ["bun", "cli", "clean"],
    category: "Build",
  },

  // Test commands
  {
    id: "test",
    label: "Test",
    description: "Run unit tests",
    command: ["bun", "cli", "test"],
    category: "Test",
  },
  {
    id: "test-fork",
    label: "Test (Fork)",
    description: "Run fork tests using RPC_URL",
    command: ["bun", "cli", "test", "--fork"],
    category: "Test",
  },
  {
    id: "test-coverage",
    label: "Test Coverage",
    description: "Generate test coverage report",
    command: ["bun", "cli", "test", "--coverage"],
    category: "Test",
  },

  // Test tree commands
  {
    id: "test-tree-sync",
    label: "Sync Test Trees",
    description: "Scaffold or sync test definitions into Solidity tests",
    command: ["bun", "cli", "test-tree", "sync"],
    category: "Test Tree",
  },
  {
    id: "test-tree-check",
    label: "Check Test Trees",
    description: "Verify Solidity tests match definitions",
    command: ["bun", "cli", "test-tree", "check"],
    category: "Test Tree",
  },
  {
    id: "test-tree-generate",
    label: "Generate Test Markdown",
    description: "Generate markdown summary of test definitions",
    command: ["bun", "cli", "test-tree", "generate"],
    category: "Test Tree",
  },

  // Deploy commands
  {
    id: "deploy-dry",
    label: "Deploy (Dry Run)",
    description: "Simulate deployment without broadcasting",
    command: ["bun", "cli", "deploy", "--dry-run"],
    category: "Deploy",
  },
  {
    id: "deploy",
    label: "Deploy",
    description: "Deploy contracts to network",
    command: ["bun", "cli", "deploy"],
    category: "Deploy",
  },
  {
    id: "deploy-resume",
    label: "Resume Deploy",
    description: "Resume a failed deployment",
    command: ["bun", "cli", "deploy", "--resume"],
    category: "Deploy",
  },

  // Verify commands
  {
    id: "verify",
    label: "Verify",
    description: "Verify deployed contracts on block explorers",
    command: ["bun", "cli", "verify"],
    category: "Verify",
  },
  {
    id: "verify-etherscan",
    label: "Verify (Etherscan)",
    description: "Verify contracts on Etherscan",
    command: ["bun", "cli", "verify:etherscan"],
    category: "Verify",
  },
  {
    id: "verify-blockscout",
    label: "Verify (Blockscout)",
    description: "Verify contracts on Blockscout",
    command: ["bun", "cli", "verify:blockscout"],
    category: "Verify",
  },
  {
    id: "verify-sourcify",
    label: "Verify (Sourcify)",
    description: "Verify contracts on Sourcify",
    command: ["bun", "cli", "verify:sourcify"],
    category: "Verify",
  },
];

type AppState = "select" | "running" | "done";

function App() {
  const [state, setState] = useState<AppState>("select");
  const [selectedCommand, setSelectedCommand] = useState<CommandDefinition | null>(null);
  const [exitCode, setExitCode] = useState<number | null>(null);

  const handleSelect = (value: string) => {
    const cmd = commands.find((c) => c.id === value);
    if (cmd) {
      setSelectedCommand(cmd);
      setState("running");
    }
  };

  const handleComplete = (code: number) => {
    setExitCode(code);
    setState("done");
  };

  const handleBack = () => {
    setState("select");
    setSelectedCommand(null);
    setExitCode(null);
  };

  // Group commands by category for better UX
  const options = commands.map((cmd) => ({
    label: `${cmd.label}`,
    value: cmd.id,
    description: `[${cmd.category}] ${cmd.description}`,
  }));

  return (
    <Box flexDirection="column" padding={1}>
      <Header />

      {state === "select" && (
        <Box flexDirection="column" marginTop={1}>
          <Text color="cyan">Select a command to run:</Text>
          <Box marginTop={1}>
            <Select options={options} onChange={handleSelect} />
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Use arrow keys to navigate, Enter to select, Ctrl+C to exit</Text>
          </Box>
        </Box>
      )}

      {state === "running" && selectedCommand && (
        <CommandRunner command={selectedCommand} onComplete={handleComplete} />
      )}

      {state === "done" && selectedCommand && (
        <Box flexDirection="column" marginTop={1}>
          <Box>
            {exitCode === 0 ? (
              <Text color="green">Command completed successfully</Text>
            ) : (
              <Text color="red">Command failed with exit code {exitCode}</Text>
            )}
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Press Enter to run another command, Ctrl+C to exit</Text>
          </Box>
          <Select
            options={[
              { label: "Run another command", value: "back" },
              { label: "Exit", value: "exit" },
            ]}
            onChange={(value) => {
              if (value === "back") {
                handleBack();
              } else {
                process.exit(exitCode ?? 0);
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
}

export function runApp() {
  render(<App />);
}
