"use client";

import {
  Chain,
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

export const taurusAutoEvm: Chain = {
  id: 490000,
  name: "Auto-EVM - Autonomys Taurus Testnet",
  // network: 'auto-evm-taurus',
  nativeCurrency: {
    decimals: 18,
    name: "tAI3",
    symbol: "tAI3",
  },
  rpcUrls: {
    default: {
      http: ["https://auto-evm.taurus.autonomys.xyz/ws"],
    },
    public: {
      http: ["https://auto-evm.taurus.autonomys.xyz/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Autonomys Taurus Blockscout Explorer",
      url: "https://blockscout.taurus.autonomys.xyz/",
    },
  },
  testnet: true,
  // iconUrl: '/taurus.png',
  // iconBackground: '#000',
};

const config = getDefaultConfig({
  appName: "MarkStream",
  projectId: "1318357bac377048f34a2b26ec64fb7b",
  chains: [taurusAutoEvm],
  ssr: true,
});
const queryClient = new QueryClient();

export function RainbowKitWrapper({ children }: React.PropsWithChildren) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
