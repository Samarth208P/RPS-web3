import { http, createConfig } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

// Get environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

// Get current URL for metadata
const currentUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://localhost:5173'

// Create Reown (WalletConnect) connector
const reownConnector = walletConnect({
    projectId,
    metadata: {
        name: 'Rock Paper Scissors',
        description: 'Provably fair Rock Paper Scissors game on Base',
        url: currentUrl, // Use current URL instead of hardcoded
        icons: ['https://avatars.githubusercontent.com/u/37784886']
    },
    showQrModal: true,
})

// Create wagmi config
export const config = createConfig({
    chains: [baseSepolia],
    connectors: [
        injected(),
        reownConnector,
    ],
    transports: {
        [baseSepolia.id]: http(import.meta.env.VITE_BASE_SEPOLIA_RPC || 'https://sepolia.base.org'),
    },
})

// Network configuration
export const NETWORK_CONFIG = {
    chainId: baseSepolia.id,
    chainName: baseSepolia.name,
    rpcUrl: import.meta.env.VITE_BASE_SEPOLIA_RPC || 'https://sepolia.base.org',
    blockExplorer: import.meta.env.VITE_BASESCAN_URL || 'https://sepolia.basescan.org',
    nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
    },
}
