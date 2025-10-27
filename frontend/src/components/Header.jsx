import { Wallet, TrendingUp, ExternalLink, Shield } from 'lucide-react'
import { useAccount, useDisconnect, useBalance } from 'wagmi'
import { formatEther } from 'viem'
import { NETWORK_CONFIG } from '../config/wagmi'
import { CONTRACT_ADDRESS } from '../config/contracts'

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
        <header className="border-b border-gray-800/30 sticky top-0 pt-3 z-50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo & Title */}
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="w-12 h-12 object-contain"
                        />
                        <div>
                            <h1 className="text-2xl font-bold text-white">Rock Paper Scissors</h1>
                            <p className="text-sm text-gray-400">Powered by Pyth Entropy</p>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-3">
                        {/* Contract Verification Button */}
                        <a
                            href={`${NETWORK_CONFIG.blockExplorer}/address/${CONTRACT_ADDRESS}#code`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg transition-colors group"
                            title="Verify Smart Contract"
                        >
                            <Shield className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                            <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                                Verify Contract
                            </span>
                            <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-purple-400" />
                        </a>

                        {/* Mobile Contract Button */}
                        <a
                            href={`${NETWORK_CONFIG.blockExplorer}/address/${CONTRACT_ADDRESS}#code`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="md:hidden p-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg transition-colors"
                            title="Verify Contract"
                        >
                            <Shield className="w-5 h-5 text-purple-400" />
                        </a>

                        {/* Balance (if connected) */}
                        {isConnected && balance && (
                            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                                <TrendingUp className="w-4 h-4 text-green-400" />
                                <span className="text-sm font-medium text-white">
                                    {Number(formatEther(balance.value)).toFixed(4)} ETH
                                </span>
                            </div>
                        )}

                        {/* Wallet Button */}
                        {isConnected ? (
                            <button
                                onClick={() => disconnect()}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                            >
                                <Wallet className="w-4 h-4" />
                                <span className="text-sm font-medium">{formatAddress(address)}</span>
                            </button>
                        ) : (
                            <button
                                onClick={onConnect}
                                className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                            >
                                <Wallet className="w-4 h-4" />
                                <span>Connect Wallet</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
