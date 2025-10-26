import { Wallet, TrendingUp } from 'lucide-react'
import { useAccount, useDisconnect, useBalance } from 'wagmi'
import { formatEther } from 'viem'
import { NETWORK_CONFIG } from '../config/wagmi'

const Header = ({ onConnect }) => {
    const { address, isConnected } = useAccount()
    const { disconnect } = useDisconnect()
    const { data: balance } = useBalance({
        address: address,
    })

    const formatAddress = (addr) => {
        if (!addr) return ''
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    return (
        <header className="w-full py-6 px-4 md:px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
                        <span className="text-2xl">✊</span>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-glow">
                            Rock Paper Scissors
                        </h1>
                        <p className="text-xs md:text-sm text-blue-300">Powered by Pyth Entropy</p>
                    </div>
                </div>

                {/* Wallet Section */}
                <div className="flex items-center space-x-4">
                    {isConnected ? (
                        <>
                            {/* Balance Display */}
                            <div className="hidden md:flex items-center space-x-2 glass-dark px-4 py-4 rounded-xl">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                                <div className="text-left">
                                    <p className="font-semibold text-white">
                                        {balance ? parseFloat(formatEther(balance.value)).toFixed(4) : '0.0000'} ETH
                                    </p>
                                </div>
                            </div>

                            {/* Connected Wallet */}
                            <div className="flex items-center space-x-3 glass-dark px-4 py-3 rounded-xl">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="hidden md:inline font-mono text-s">
                  {formatAddress(address)}
                </span>
                                <button
                                    onClick={() => disconnect()}
                                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs text-red-400 transition-all duration-300"
                                >
                                    Disconnect
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={onConnect}
                            className="btn-primary flex items-center space-x-2"
                        >
                            <Wallet className="w-5 h-5" />
                            <span>Connect Wallet</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Network Indicator */}
            <div className="max-w-7xl mx-auto mt-4">
                <div className="inline-flex items-center space-x-2 glass-dark px-3 py-1 rounded-lg text-xs">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-gray-300">{NETWORK_CONFIG.chainName}</span>
                </div>
            </div>
        </header>
    )
}

export default Header
