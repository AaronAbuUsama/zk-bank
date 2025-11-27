// Run this program with:
// $ cat file.t.yaml | deno run test/script/make-test-tree.ts

import { parse } from "jsr:@std/yaml";

// Regex pattern
const CLEAN_TEXT_REGEX = /[^a-zA-Z0-9 ]/g;

type Rule = {
  comment?: string;
  given?: string;
  when?: string;
  and?: Rule[];
  then?: Rule[];
  it?: string;
};

type TreeItem = {
  content: string;
  children: TreeItem[];
  comment?: string;
};

async function main() {
  const content = await readStdinText();
  const tree = parseTestTree(content);
  dedupeNodeNames(tree);

  const strTree = renderTree(tree);
  Bun.stdout.write(new TextEncoder().encode(strTree));
}

function parseTestTree(content: string): TreeItem {
  const data: { [k: string]: Rule[] } = parse(content);
  if (!data || typeof data !== "object") {
    throw new Error("The file format is not a valid yaml object");
  }

  const rootKeys = Object.keys(data);
  if (rootKeys.length > 1) {
    throw new Error("The test definition must have only one root node");
  }
  const [rootKey] = rootKeys;
  if (!(rootKey && data[rootKey])) {
    throw new Error("A root node needs to be defined");
  }
  if (!data[rootKey]?.length) {
    throw new Error("The root node needs to include at least one element");
  }

  return {
    content: rootKey,
    children: parseRuleChildren(data[rootKey]),
  };
}

function parseRuleChildren(lines: Rule[]): TreeItem[] {
  if (!lines?.length) return [];

  const result: TreeItem[] = lines.map((rule) => {
    if (!(rule.when || rule.given || rule.it))
      throw new Error("All rules should have a 'given', 'when' or 'it' rule");

    let content = "";
    if (rule.given) {
      content = `Given ${cleanText(rule.given)}`;
    } else if (rule.when) {
      content = `When ${cleanText(rule.when)}`;
    } else if (rule.it) {
      content = `It ${rule.it}`;
    }

    let children: TreeItem[] = [];
    if (rule.and?.length) {
      children = parseRuleChildren(rule.and);
    } else if (rule.then?.length) {
      children = parseRuleChildren(rule.then);
    }

    const item: TreeItem = {
      content,
      children,
    };

    if (rule.comment) item.comment = rule.comment;
    return item;
  });

  return result;
}

function dedupeNodeNames(
  node: TreeItem,
  seenItems = new Set<string>()
): Set<string> {
  if (!node.children?.length) return seenItems;

  let currentSeenItems = seenItems;

  // If a node has been seen before, append a suffix to it
  for (const child of node.children) {
    let str = child.content.trim();
    if (str.startsWith("It ")) continue;
    if (currentSeenItems.has(str)) {
      let suffixIdx = 1;
      do {
        suffixIdx++;
        str = `${child.content.trim()} ${suffixIdx.toString()}`;
      } while (currentSeenItems.has(str));

      child.content = str;
    }
    currentSeenItems.add(str);

    // Process children
    currentSeenItems = dedupeNodeNames(child, currentSeenItems);
  }
  return currentSeenItems;
}

function renderTree(root: TreeItem): string {
  let result = `${root.content}\n`;

  for (let i = 0; i < root.children?.length; i++) {
    const item = root.children[i];
    const newLines = renderTreeItem(item, i === root.children.length - 1);
    result += `${newLines.join("\n")}\n`;
  }

  return result;
}

function buildPrefix(isLast: boolean, currentPrefix: string): string {
  return isLast ? `${currentPrefix}    ` : `${currentPrefix}│   `;
}

function renderTreeItem(
  root: TreeItem,
  isLast: boolean,
  prefix = ""
): string[] {
  const result: string[] = [];
  const content = root.comment
    ? `${root.content} // ${root.comment}`
    : root.content;

  const connector = isLast ? "└──" : "├──";
  result.push(`${prefix}${connector} ${content}`);

  if (!root.children?.length) return result;

  for (let i = 0; i < root.children.length; i++) {
    const item = root.children[i];
    const isLastChild = i === root.children.length - 1;
    const newPrefix = buildPrefix(isLast, prefix);
    const lines = renderTreeItem(item, isLastChild, newPrefix);
    result.push(...lines);
  }

  return result;
}

function cleanText(input: string): string {
  return input.replace(CLEAN_TEXT_REGEX, "").trim();
}

async function readStdinText(): Promise<string> {
  return await Bun.stdin.text();
}

if (import.meta.main) {
  main();
}
