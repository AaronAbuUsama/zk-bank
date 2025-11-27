#!/usr/bin/env bun

/**
 * Simple script to spawn Anvil with Ethereum mainnet fork
 * and log all output to the console
 */

const proc = Bun.spawn(
  ["anvil", "--fork-url", "https://eth.llamarpc.com", "--port", "8545"],
  {
    stdout: "inherit", // Log directly to console
    stderr: "inherit", // Log errors directly to console
  }
);

console.log("🔨 Anvil starting with Ethereum mainnet fork...\n");
console.log("Press Ctrl+C to stop\n");

// Handle cleanup on exit
process.on("SIGINT", () => {
  console.log("\n\n👋 Stopping Anvil...");
  proc.kill();
  process.exit(0);
});

// Wait for process to exit
await proc.exited;
