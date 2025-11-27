// Cast command wrapper

import type { CastSendOptions } from "../types";
import { TX_HASH_REGEX } from "./constants";

async function runCommand(
  args: string[]
): Promise<{ success: boolean; stdout: string; stderr: string; code: number }> {
  const proc = Bun.spawn(args, {
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const code = await proc.exited;

  return {
    success: code === 0,
    stdout: stdout.trim(),
    stderr: stderr.trim(),
    code,
  };
}

export async function walletAddress(
  privateKey: string
): Promise<string | null> {
  const result = await runCommand([
    "cast",
    "wallet",
    "address",
    "--private-key",
    privateKey,
  ]);

  if (!result.success) {
    return null;
  }

  return result.stdout;
}

export async function balance(
  address: string,
  rpcUrl: string
): Promise<bigint | null> {
  const result = await runCommand([
    "cast",
    "balance",
    address,
    "--rpc-url",
    rpcUrl,
  ]);

  if (!result.success) {
    return null;
  }

  try {
    return BigInt(result.stdout);
  } catch {
    return null;
  }
}

export async function gasPrice(rpcUrl: string): Promise<bigint | null> {
  const result = await runCommand(["cast", "gas-price", "--rpc-url", rpcUrl]);

  if (!result.success) {
    return null;
  }

  try {
    return BigInt(result.stdout);
  } catch {
    return null;
  }
}

export async function toUnit(
  value: bigint,
  unit: string
): Promise<string | null> {
  const result = await runCommand([
    "cast",
    "--to-unit",
    value.toString(),
    unit,
  ]);

  if (!result.success) {
    return null;
  }

  return result.stdout;
}

export async function send(options: CastSendOptions): Promise<{
  success: boolean;
  txHash?: string;
  error?: string;
}> {
  const args = [
    "cast",
    "send",
    "--private-key",
    options.privateKey,
    "--rpc-url",
    options.rpcUrl,
  ];

  if (options.value !== undefined) {
    args.push("--value", options.value.toString());
  }

  if (options.nonce !== undefined) {
    args.push("--nonce", options.nonce.toString());
  }

  args.push(options.to);

  const proc = Bun.spawn(args, {
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const code = await proc.exited;

  if (code !== 0) {
    return { success: false, error: stderr || stdout };
  }

  // Extract tx hash from output
  const txHashMatch = stdout.match(TX_HASH_REGEX);
  return {
    success: true,
    txHash: txHashMatch?.[0],
  };
}

export async function sendStreaming(options: CastSendOptions): Promise<number> {
  const args = [
    "cast",
    "send",
    "--private-key",
    options.privateKey,
    "--rpc-url",
    options.rpcUrl,
  ];

  if (options.value !== undefined) {
    args.push("--value", options.value.toString());
  }

  if (options.nonce !== undefined) {
    args.push("--nonce", options.nonce.toString());
  }

  args.push(options.to);

  const proc = Bun.spawn(args, {
    stdout: "inherit",
    stderr: "inherit",
  });

  return await proc.exited;
}

export async function checkInstalled(): Promise<boolean> {
  const result = await runCommand(["which", "cast"]);
  return result.success;
}
