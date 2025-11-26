# PRD: Convert Makefile Scripts to TypeScript CLI

## Overview

Convert the existing Makefile-based build and deployment tooling to a TypeScript CLI using Bun. This will provide better type safety, easier maintenance, cross-platform compatibility, and a more modern developer experience.

## Current State Analysis

### Makefile Scripts Inventory

The current `Makefile` (396 lines) contains the following functional areas:

#### 1. Build & Initialization
| Target | Description | Complexity |
|--------|-------------|------------|
| `init` | Check dependencies (forge, lcov), run forge build | Low |
| `clean` | Remove build artifacts, test trees, coverage reports | Low |

#### 2. Testing
| Target | Description | Complexity |
|--------|-------------|------------|
| `test` | Run unit tests (excludes fork tests) | Low |
| `test-fork` | Run fork tests using RPC_URL | Low |
| `test-coverage` | Generate HTML coverage report | Medium |

#### 3. Test Tree Generation (BDD-style test scaffolding)
| Target | Description | Complexity |
|--------|-------------|------------|
| `sync-tests` | Convert YAML test definitions to .tree files, scaffold/sync Solidity tests | High |
| `check-tests` | Verify Solidity tests are in sync with definitions | Medium |
| `test-tree` | Generate markdown summary of test definitions | Medium |

#### 4. LLM Prompt Generation
| Target | Description | Complexity |
|--------|-------------|------------|
| `test-tree-prompt` | Generate LLM prompt for test definition creation | High |
| `test-prompt` | Generate LLM prompt for test implementation | High |

#### 5. Deployment
| Target | Description | Complexity |
|--------|-------------|------------|
| `predeploy` | Simulate deployment (dry run) | Medium |
| `deploy` | Deploy contracts, verify source, write artifacts | High |
| `resume` | Retry pending deployment transactions | High |

#### 6. Verification
| Target | Description | Complexity |
|--------|-------------|------------|
| `verify-etherscan` | Verify on Etherscan-compatible explorers | Medium |
| `verify-blockscout` | Verify on BlockScout | Medium |
| `verify-sourcify` | Verify on Sourcify | Medium |

#### 7. Utilities
| Target | Description | Complexity |
|--------|-------------|------------|
| `storage-info` | Show contract storage layout | Low |
| `refund` | Refund remaining balance from deployment account | Medium |
| `gas-price` | Show current gas price | Low |
| `balance` | Show deployment account balance | Low |
| `clean-nonce` / `clean-nonces` | Clear stuck transactions | Low |
| `help` | Display available commands | Low |

### External Dependencies

#### Shell Scripts
- `script/verify-contracts.sh` (238 lines) - Contract verification fallback script

#### TypeScript (Deno)
- `script/make-test-tree.ts` (185 lines) - YAML to tree format converter

#### LLM Templates
- `llm.mk` (119 lines) - LLM prompt templates for test generation

### Environment Variables Required

```
DEPLOYMENT_PRIVATE_KEY
RPC_URL
CHAIN_ID
NETWORK_NAME
VERIFIER (etherscan|blockscout|sourcify|zksync|routescan-mainnet|routescan-testnet)
ETHERSCAN_API_KEY (optional)
BLOCKSCOUT_HOST_NAME (optional)
DAO_FACTORY_ADDRESS
PLUGIN_REPO_FACTORY_ADDRESS
PLUGIN_SETUP_PROCESSOR_ADDRESS
PLUGIN_ENS_SUBDOMAIN (optional)
PLUGIN_REPO_MAINTAINER_ADDRESS
REFUND_ADDRESS (optional)
```

## Proposed Architecture

### Project Structure

```
cli/
├── index.ts                  # Main CLI entry point
├── commands/
│   ├── build.ts              # init, clean
│   ├── test.ts               # test, test-fork, test-coverage
│   ├── test-tree.ts          # sync-tests, check-tests, test-tree
│   ├── deploy.ts             # predeploy, deploy, resume
│   ├── verify.ts             # verify-etherscan, verify-blockscout, verify-sourcify
│   ├── prompts.ts            # test-tree-prompt, test-prompt
│   └── utils.ts              # storage-info, refund, gas-price, balance, clean-nonce
├── lib/
│   ├── config.ts             # Environment config loader & validator
│   ├── forge.ts              # Forge command wrapper
│   ├── cast.ts               # Cast command wrapper
│   ├── verifier.ts           # Multi-verifier abstraction
│   ├── test-tree-parser.ts   # YAML to tree converter (migrate from Deno)
│   └── templates.ts          # LLM prompt templates
└── types/
    └── index.ts              # Shared type definitions
```

> Note: The existing `script/` folder will remain for Foundry Solidity scripts (DeploySimple.s.sol, etc.). The new `cli/` folder is exclusively for TypeScript tooling.

### CLI Interface Design

```bash
# Build commands
bun cli init
bun cli clean

# Test commands
bun cli test [--fork] [--coverage]
bun cli test:sync
bun cli test:check
bun cli test:tree

# Deployment commands
bun cli deploy [--dry-run] [--resume]

# Verification commands
bun cli verify --verifier <type>

# LLM prompts
bun cli prompt:test-tree --src <file>
bun cli prompt:test --def <yaml> --src <sol>

# Utilities
bun cli storage <contract>
bun cli refund
bun cli info [gas-price|balance]
bun cli nonce:clean <nonce> [--all <nonces...>]
```

### Package.json Scripts (Optional Aliases)

```json
{
  "scripts": {
    "cli": "bun run cli/index.ts",
    "build": "bun cli init",
    "clean": "bun cli clean",
    "test": "bun cli test",
    "test:fork": "bun cli test --fork",
    "test:coverage": "bun cli test --coverage",
    "deploy": "bun cli deploy",
    "deploy:dry": "bun cli deploy --dry-run",
    "verify": "bun cli verify"
  }
}
```

## Technical Requirements

### Dependencies

```json
{
  "dependencies": {
    "commander": "^12.0.0",
    "yaml": "^2.3.0",
    "chalk": "^5.3.0",
    "ora": "^8.0.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5"
  }
}
```

> Note: Bun has native `.env` loading, so `dotenv` may be optional.

### Core Library Implementations

#### 1. Config Loader (`cli/lib/config.ts`)

```typescript
interface Config {
  // Network
  rpcUrl: string;
  chainId: number;
  networkName: string;
  
  // Deployment
  deploymentPrivateKey: string;
  deploymentScript: 'DeploySimple' | 'DeployDaoWithPlugins' | 'DeployViaFactory';
  
  // Verification
  verifier: 'etherscan' | 'blockscout' | 'sourcify' | 'zksync' | 'routescan-mainnet' | 'routescan-testnet';
  verifierApiKey?: string;
  blockscoutHostName?: string;
  
  // Aragon OSx
  daoFactoryAddress?: string;
  pluginRepoFactoryAddress?: string;
  pluginSetupProcessorAddress?: string;
  
  // Plugin
  pluginEnsSubdomain?: string;
  pluginRepoMaintainerAddress?: string;
  
  // Paths
  artifactsFolder: string;
  logsFolder: string;
}

export function loadConfig(): Config;
export function validateConfig(config: Partial<Config>, requiredFields: (keyof Config)[]): void;
```

#### 2. Forge Wrapper (`cli/lib/forge.ts`)

```typescript
interface ForgeOptions {
  verbosity?: number;
  zksync?: boolean;
  customParams?: string[];
}

export async function build(options?: ForgeOptions): Promise<void>;
export async function test(options?: ForgeOptions & { match?: string; noMatch?: string }): Promise<void>;
export async function coverage(options?: ForgeOptions): Promise<void>;
export async function script(scriptPath: string, options?: ForgeOptions & ScriptOptions): Promise<void>;
export async function verify(address: string, contract: string, options: VerifyOptions): Promise<void>;
export async function inspect(contract: string, field: string): Promise<string>;
export async function clean(): Promise<void>;
```

#### 3. Cast Wrapper (`cli/lib/cast.ts`)

```typescript
export async function walletAddress(privateKey: string): Promise<string>;
export async function balance(address: string, rpcUrl: string): Promise<bigint>;
export async function gasPrice(rpcUrl: string): Promise<bigint>;
export async function send(options: SendOptions): Promise<string>;
export async function toUnit(value: bigint, unit: string): Promise<string>;
```

#### 4. Test Tree Parser (`cli/lib/test-tree-parser.ts`)

Migrate the existing Deno script to Bun-compatible TypeScript:

```typescript
interface Rule {
  comment?: string;
  given?: string;
  when?: string;
  and?: Rule[];
  then?: Rule[];
  it?: string;
}

interface TreeItem {
  content: string;
  children: TreeItem[];
  comment?: string;
}

export function parseTestTree(yamlContent: string): TreeItem;
export function renderTree(root: TreeItem): string;
export function yamlToTree(yamlPath: string): Promise<string>;
```

#### 5. Verifier Abstraction (`cli/lib/verifier.ts`)

```typescript
type VerifierType = 'etherscan' | 'blockscout' | 'sourcify' | 'zksync' | 'custom';

interface VerifierConfig {
  type: VerifierType;
  apiUrl?: string;
  apiKey?: string;
  chainId: number;
}

export function getVerifierParams(config: VerifierConfig): string[];
export async function verifyContract(address: string, contract: string, config: VerifierConfig): Promise<boolean>;
export async function verifyFromBroadcast(broadcastPath: string, config: VerifierConfig): Promise<void>;
```

## Migration Plan

### Phase 1: Core Infrastructure (Week 1)
1. Create `cli/` folder structure
2. Set up CLI entry point with Commander.js (`cli/index.ts`)
3. Implement `cli/lib/config.ts` with validation
4. Implement `cli/lib/forge.ts` wrapper
5. Implement `cli/lib/cast.ts` wrapper
6. Migrate `build` and `clean` commands

### Phase 2: Testing Commands (Week 2)
1. Migrate `test`, `test-fork`, `test-coverage` commands
2. Port `script/make-test-tree.ts` from Deno to Bun (`cli/lib/test-tree-parser.ts`)
3. Implement `sync-tests`, `check-tests`, `test-tree` commands

### Phase 3: Deployment & Verification (Week 3)
1. Implement `cli/lib/verifier.ts` abstraction
2. Migrate `predeploy`, `deploy`, `resume` commands
3. Port `script/verify-contracts.sh` to TypeScript
4. Implement verification commands

### Phase 4: LLM Prompts & Utilities (Week 4)
1. Migrate LLM prompt templates from `llm.mk`
2. Implement `test-tree-prompt` and `test-prompt` commands
3. Implement utility commands (storage, refund, gas-price, balance, nonce)
4. Add `help` command with formatted output

### Phase 5: Polish & Documentation (Week 5)
1. Add comprehensive error handling
2. Add colored output and spinners
3. Write CLI documentation
4. Update README with new CLI usage
5. Remove old Makefile (or keep as legacy fallback)

## Success Criteria

1. **Feature Parity**: All Makefile targets have TypeScript equivalents
2. **Type Safety**: Full TypeScript coverage with strict mode
3. **Error Handling**: Clear error messages with actionable suggestions
4. **Performance**: CLI startup time < 500ms
5. **Cross-Platform**: Works on macOS, Linux, Windows (via WSL)
6. **Documentation**: Complete CLI help text and README updates

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Bun compatibility issues with subprocess spawning | Test thoroughly; fallback to Node.js child_process if needed |
| Complex shell pipeline translations | Break into smaller functions; use streaming where possible |
| Environment variable handling differences | Use explicit config loading; validate early |
| External tool dependencies (bulloak, deno) | Document requirements; provide installation scripts |

## Out of Scope

- Rewriting Solidity deployment scripts
- Changing the test tree YAML schema
- Modifying the LLM prompt templates (content)
- Supporting package managers other than Bun

## Open Questions

1. Should we support both Makefile and TypeScript CLI during transition?
2. Should we add interactive prompts for missing configuration?
3. Should we integrate with a task runner like Turborepo?
4. Should we add telemetry/analytics for command usage?
