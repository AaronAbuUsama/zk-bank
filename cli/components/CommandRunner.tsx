// Command runner component - executes commands and streams output

import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import { Spinner } from "@inkjs/ui";
import type { CommandDefinition } from "./types";

interface Props {
  command: CommandDefinition;
  onComplete: (exitCode: number) => void;
}

export function CommandRunner({ command, onComplete }: Props) {
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const { exit } = useApp();

  useEffect(() => {
    let isMounted = true;

    async function runCommand() {
      const proc = Bun.spawn(command.command, {
        cwd: process.cwd(),
        stdout: "pipe",
        stderr: "pipe",
        env: { ...process.env, FORCE_COLOR: "1" },
      });

      // Stream stdout
      const stdoutReader = proc.stdout.getReader();
      const stderrReader = proc.stderr.getReader();

      async function readStream(
        reader: ReadableStreamDefaultReader<Uint8Array>,
        prefix?: string
      ) {
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (!isMounted) break;

            const text = decoder.decode(value);
            const lines = text.split("\n").filter((l) => l.trim());
            if (lines.length > 0) {
              setOutput((prev) => {
                const newOutput = [...prev, ...lines];
                // Keep last 20 lines to avoid memory issues
                return newOutput.slice(-20);
              });
            }
          }
        } catch {
          // Stream closed
        }
      }

      // Read both streams concurrently
      await Promise.all([readStream(stdoutReader), readStream(stderrReader)]);

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
        flexDirection="column"
        marginTop={1}
        borderStyle="single"
        borderColor="gray"
        paddingX={1}
        minHeight={5}
      >
        {output.length === 0 ? (
          <Text dimColor>Waiting for output...</Text>
        ) : (
          output.map((line, i) => (
            <Text key={i} wrap="truncate">
              {line}
            </Text>
          ))
        )}
      </Box>
    </Box>
  );
}
