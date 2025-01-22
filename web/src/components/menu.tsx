import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { shortString } from "@autonomys/auto-utils";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";

export function Menu() {
  const { openConnectModal } = useConnectModal();
  const { switchChainAsync } = useSwitchChain();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <Menubar className="rounded-none border-b border-none px-2 lg:px-4">
      <MenubarMenu>
        <MenubarTrigger className="font-bold">Mark Stream</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>About Mark Stream</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Preferences... <MenubarShortcut>⌘,</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Contact us</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Leaderboard</MenubarTrigger>
        <MenubarContent>
          <MenubarItem inset disabled>
            Top contributors
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset disabled>
            Most popular labels
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset disabled>
            Most popular files
          </MenubarItem>
          <MenubarItem inset disabled>
            Most popular folders
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger className="relative">Network</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup value={chain?.id?.toString()}>
            <MenubarRadioItem value="" disabled>
              Mainnet
            </MenubarRadioItem>
            <MenubarRadioItem
              value="490000"
              disabled={!isConnected}
              onClick={() => switchChainAsync({ chainId: 490000 })}
            >
              Auto EVM Taurus Testnet
            </MenubarRadioItem>
            {!isConnected && (
              <>
                <MenubarSeparator />
                <MenubarItem inset disabled>
                  No wallet connected
                </MenubarItem>
              </>
            )}
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger className="hidden md:block">Wallet</MenubarTrigger>
        <MenubarContent>
          {isConnected ? (
            <>
              <MenubarLabel>{shortString(address ?? "")}</MenubarLabel>
              <MenubarSeparator />
              <MenubarItem onClick={() => disconnect()}>
                Disconnect Wallet
              </MenubarItem>
            </>
          ) : (
            <>
              <MenubarItem inset onClick={openConnectModal}>
                Connect Wallet
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem inset disabled={isConnected}>
                No wallet connected
              </MenubarItem>
            </>
          )}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
