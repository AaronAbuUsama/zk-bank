// Command runner component - executes commands and streams output

import { Spinner } from "@inkjs/ui";
import { Box, Text } from "ink";
import { useEffect, useState } from "react";
import type { CommandDefinition } from "./types";

type Props = {
  command: CommandDefinition;
  onComplete: (exitCode: number) => void;
};

async function readStreamToLines(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onLines: (lines: string[]) => void,
  isMounted: () => boolean
): Promise<void> {
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done || !isMounted()) break;

      const text = decoder.decode(value);
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length > 0) {
        onLines(lines);
      }
    }
  } catch {
    // Stream closed
  }
}

export function CommandRunner({ command, onComplete }: Props) {
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function runCommand() {
      const proc = Bun.spawn(command.command, {
        cwd: process.cwd(),
        stdout: "pipe",
        stderr: "pipe",
        env: { ...process.env, FORCE_COLOR: "1" },
      });

      const handleNewLines = (lines: string[]) => {
        setOutput((prev) => {
          const newOutput = [...prev, ...lines];
          return newOutput.slice(-20);
        });
      };

      await Promise.all([
        readStreamToLines(
          proc.stdout.getReader() as ReadableStreamDefaultReader<Uint8Array>,
          handleNewLines,
          () => isMounted
        ),
        readStreamToLines(
          proc.stderr.getReader() as ReadableStreamDefaultReader<Uint8Array>,
          handleNewLines,
          () => isMounted
        ),
      ]);

      const exitCode = await proc.exited;

      if (isMounted) {
        setIsRunning(false);
        onComplete(exitCode);
      }
    }

    runCommand();

    return () => {
      isMounted = false;
    };
  }, [command, onComplete]);

  return (
    <Box flexDirection="column" marginTop={1}>
      <Box>
        {isRunning && <Spinner label="" />}
        <Text color="yellow"> Running: </Text>
        <Text>{command.command.join(" ")}</Text>
      </Box>

      <Box
        borderColor="gray"
        borderStyle="single"
        flexDirection="column"
        marginTop={1}
        minHeight={5}
        paddingX={1}
      >
        {output.length === 0 ? (
          <Text dimColor>Waiting for output...</Text>
        ) : (
          output.map((line, idx) => (
            <Text key={`line-${idx}`} wrap="truncate">
              {line}
            </Text>
          ))
        )}
      </Box>
    </Box>
  );
}
