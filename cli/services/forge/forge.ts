// Forge command wrapper

import type {
  ForgeOptions,
  ForgeScriptOptions,
  ForgeTestOptions,
  VerifyOptions,
} from "../../types";

async function runCommand(
  args: string[],
  options?: { env?: Record<string, string>; cwd?: string }
): Promise<{ success: boolean; stdout: string; stderr: string; code: number }> {
  const proc = Bun.spawn(args, {
    cwd: options?.cwd || process.cwd(),
    env: { ...process.env, ...options?.env },
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const code = await proc.exited;

  return { success: code === 0, stdout, stderr, code };
}

async function runCommandStreaming(
  args: string[],
  options?: { env?: Record<string, string>; cwd?: string }
): Promise<number> {
  const proc = Bun.spawn(args, {
    cwd: options?.cwd || process.cwd(),
    env: { ...process.env, ...options?.env },
    stdout: "inherit",
    stderr: "inherit",
  });

  return await proc.exited;
}

function buildBaseArgs(options?: ForgeOptions): string[] {
  const args: string[] = [];

  if (options?.verbosity) {
    args.push(`-${"v".repeat(options.verbosity)}`);
  }

  if (options?.zksync) {
    args.push("--zksync");
  }

  if (options?.customParams) {
    args.push(...options.customParams);
  }

  return args;
}

export async function build(options?: ForgeOptions): Promise<number> {
  const args = ["forge", "build", ...buildBaseArgs(options)];
  return await runCommandStreaming(args);
}

export async function clean(): Promise<number> {
  return await runCommandStreaming(["forge", "clean"]);
}

export async function test(options?: ForgeTestOptions): Promise<number> {
  const args = ["forge", "test", ...buildBaseArgs(options)];

  if (options?.match) {
    args.push("--match-test", options.match);
  }

  if (options?.noMatch) {
    args.push("--no-match-test", options.noMatch);
  }

  if (options?.matchPath) {
    args.push("--match-path", options.matchPath);
  }

  if (options?.noMatchPath) {
    args.push("--no-match-path", options.noMatchPath);
  }

  const env: Record<string, string> = {};

  // Disable Etherscan API key for local tests (speeds up tests)
  if (!options?.fork) {
    env.ETHERSCAN_API_KEY = "";
  }

  return await runCommandStreaming(args, { env });
}

export async function coverage(options?: ForgeOptions): Promise<number> {
  const args = [
    "forge",
    "coverage",
    "--report",
    "lcov",
    ...buildBaseArgs(options),
  ];
  return await runCommandStreaming(args);
}

export async function script(
  scriptPath: string,
  rpcUrl: string,
  options?: ForgeScriptOptions & { env?: Record<string, string> }
): Promise<number> {
  const args = ["forge", "script", scriptPath, "--rpc-url", rpcUrl];

  args.push(...buildBaseArgs(options));

  if (options?.broadcast) {
    args.push("--broadcast");
  }

  if (options?.verify) {
    args.push("--verify");
  }

  if (options?.resume) {
    args.push("--resume");
  }

  if (options?.retries) {
    args.push("--retries", options.retries.toString());
  }

  if (options?.delay) {
    args.push("--delay", options.delay.toString());
  }

  const env: Record<string, string> = { ...options?.env };
  if (options?.simulation) {
    env.SIMULATION = "true";
  }

  return await runCommandStreaming(args, { env });
}

type VerifierConfig = {
  verifierName: string;
  needsUrl: boolean;
  needsApiKey: boolean;
  needsChainId: boolean;
  customApiKey?: string;
};

const VERIFIER_CONFIGS: Record<string, VerifierConfig> = {
  etherscan: {
    verifierName: "etherscan",
    needsUrl: true,
    needsApiKey: true,
    needsChainId: false,
  },
  blockscout: {
    verifierName: "blockscout",
    needsUrl: true,
    needsApiKey: false,
    needsChainId: false,
  },
  sourcify: {
    verifierName: "sourcify",
    needsUrl: false,
    needsApiKey: false,
    needsChainId: true,
  },
  zksync: {
    verifierName: "zksync",
    needsUrl: true,
    needsApiKey: false,
    needsChainId: false,
  },
  "routescan-mainnet": {
    verifierName: "custom",
    needsUrl: true,
    needsApiKey: false,
    needsChainId: false,
    customApiKey: "verifyContract",
  },
  "routescan-testnet": {
    verifierName: "custom",
    needsUrl: true,
    needsApiKey: false,
    needsChainId: false,
    customApiKey: "verifyContract",
  },
};

function buildVerifierArgs(
  verifier: VerifyOptions["verifier"],
  options: VerifyOptions
): string[] {
  const args: string[] = [];
  const config = VERIFIER_CONFIGS[verifier] || {
    verifierName: verifier,
    needsUrl: true,
    needsApiKey: false,
    needsChainId: false,
  };

  args.push("--verifier", config.verifierName);

  if (config.needsUrl && options.verifierUrl) {
    args.push("--verifier-url", options.verifierUrl);
  }

  if (config.needsApiKey && options.apiKey) {
    args.push("--etherscan-api-key", options.apiKey);
  }

  if (config.needsChainId) {
    args.push("--chain-id", options.chainId.toString());
  }

  if (config.customApiKey) {
    args.push("--etherscan-api-key", config.customApiKey);
  }

  return args;
}

function buildOptionalArgs(options: VerifyOptions): string[] {
  const args: string[] = [];

  if (options.constructorArgs) {
    args.push("--constructor-args", options.constructorArgs);
  }

  if (options.compilerVersion) {
    args.push("--compiler-version", options.compilerVersion);
  }

  if (options.numOptimizations) {
    args.push("--num-of-optimizations", options.numOptimizations.toString());
  }

  return args;
}

export async function verify(
  address: string,
  contractPath: string,
  options: VerifyOptions
): Promise<number> {
  const args = ["forge", "verify-contract", "--watch"];

  args.push(...buildVerifierArgs(options.verifier, options));
  args.push(...buildOptionalArgs(options));
  args.push(address, contractPath);

  return await runCommandStreaming(args);
}

export async function inspect(
  contract: string,
  field: string
): Promise<{ success: boolean; output: string }> {
  const result = await runCommand(["forge", "inspect", contract, field]);
  return {
    success: result.success,
    output: result.success ? result.stdout : result.stderr,
  };
}

export async function checkInstalled(): Promise<boolean> {
  const result = await runCommand(["which", "forge"]);
  return result.success;
}

export async function installFoundry(): Promise<void> {
  console.log("Installing Foundry...");
  const proc = Bun.spawn(
    ["bash", "-c", "curl -L https://foundry.paradigm.xyz | bash"],
    {
      stdout: "inherit",
      stderr: "inherit",
    }
  );
  await proc.exited;
}
