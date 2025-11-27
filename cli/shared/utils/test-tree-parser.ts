// Test tree parser - converts YAML test definitions to .tree format
// Ported from Deno to Bun

import { parse } from "yaml";
import type { Rule, TreeItem } from "../types";

export function parseTestTree(content: string): TreeItem {
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

  return lines.map((rule) => {
    if (!(rule.when || rule.given || rule.it)) {
      throw new Error("All rules should have a 'given', 'when' or 'it' rule");
    }

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

    const result: TreeItem = {
      content,
      children,
    };

    if (rule.comment) {
      result.comment = rule.comment;
    }

    return result;
  });
}

export function dedupeNodeNames(
  node: TreeItem,
  seenItems = new Set<string>()
): Set<string> {
  if (!node.children?.length) return seenItems;

  let currentSeenItems = seenItems;

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

export function renderTree(root: TreeItem): string {
  let result = `${root.content}\n`;

  for (let i = 0; i < root.children?.length; i++) {
    const item = root.children[i];
    const newLines = renderTreeItem(item, i === root.children.length - 1);
    result += `${newLines.join("\n")}\n`;
  }

  return result;
}

function formatNodeContent(item: TreeItem): string {
  return item.comment ? `${item.content} // ${item.comment}` : item.content;
}

function getTreeConnector(isLast: boolean): string {
  return isLast ? "\u2514\u2500\u2500" : "\u251c\u2500\u2500";
}

function buildChildPrefix(
  isLastParent: boolean,
  currentPrefix: string
): string {
  return isLastParent ? `${currentPrefix}    ` : `${currentPrefix}\u2502   `;
}

function renderChildren(
  children: TreeItem[],
  isLastParent: boolean,
  prefix: string
): string[] {
  const result: string[] = [];
  if (!children?.length) return result;

  for (let i = 0; i < children.length; i++) {
    const item = children[i];
    const isLastChild = i === children.length - 1;
    const newPrefix = buildChildPrefix(isLastParent, prefix);
    const lines = renderTreeItem(item, isLastChild, newPrefix);
    result.push(...lines);
  }

  return result;
}

function renderTreeItem(
  root: TreeItem,
  lastChildren: boolean,
  prefix = ""
): string[] {
  const result: string[] = [];
  const content = formatNodeContent(root);
  const connector = getTreeConnector(lastChildren);

  result.push(`${prefix}${connector} ${content}`);

  if (root.children?.length) {
    const childLines = renderChildren(root.children, lastChildren, prefix);
    result.push(...childLines);
  }

  return result;
}

function cleanText(input: string): string {
  return input.replace(/[^a-zA-Z0-9 ]/g, "").trim();
}

const YAML_EXT_REGEX = /\.t\.yaml$/;

export async function yamlToTree(yamlPath: string): Promise<string> {
  const content = await Bun.file(yamlPath).text();
  const tree = parseTestTree(content);
  dedupeNodeNames(tree);
  return renderTree(tree);
}

export async function processYamlFile(yamlPath: string): Promise<void> {
  const treePath = yamlPath.replace(YAML_EXT_REGEX, ".tree");
  const treeContent = await yamlToTree(yamlPath);
  await Bun.write(treePath, treeContent);
}
