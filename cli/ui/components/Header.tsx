// CLI Header component

import { Box, Text } from "ink";

export function Header() {
  return (
    <Box flexDirection="column">
      <Box>
        <Text bold color="magenta">
          ZK Bank CLI
        </Text>
        <Text dimColor> v1.0.0</Text>
      </Box>
      <Text dimColor>Build, test, and deploy Foundry smart contracts</Text>
    </Box>
  );
}
