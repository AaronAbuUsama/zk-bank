// CLI Header component

import React from "react";
import { Box, Text } from "ink";

export function Header() {
  return (
    <Box flexDirection="column">
      <Box>
        <Text color="magenta" bold>
          ZK Bank CLI
        </Text>
        <Text dimColor> v1.0.0</Text>
      </Box>
      <Text dimColor>Build, test, and deploy Foundry smart contracts</Text>
    </Box>
  );
}
