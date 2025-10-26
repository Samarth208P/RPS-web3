import { useState } from 'react'
import { useAccount } from 'wagmi'
import Header from './Header'
import ConnectWallet from './ConnectWallet'
import GameBoard from './GameBoard'
import StatsPanel from './StatsPanel'
import GameHistory from './GameHistory'

const GameContainer = () => {
    const { isConnected } = useAccount()
    const [showConnectModal, setShowConnectModal] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const handleGameComplete = () => {
        // Trigger refresh of stats and history
        setRefreshTrigger(prev => prev + 1)
    }

    if (!isConnected) {
        return (
            <>
                <Header onConnect={() => setShowConnectModal(true)} />
                <ConnectWallet />
            </>
        )
    }

    return (
        <>
            <Header onConnect={() => setShowConnectModal(true)} />

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Game Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <GameBoard onGameComplete={handleGameComplete} />
                        <GameHistory key={refreshTrigger} />
                    </div>

                    {/* Side Panel */}
                    <div className="space-y-6">
                        <StatsPanel key={refreshTrigger} />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-400 text-sm">
                <p className="mb-2">
                    Built with ❤️ using{' '}
                    <a
                        href="https://www.pyth.network/entropy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        Pyth Entropy
                    </a>
                    {' '}on{' '}
                    <a
                        href="https://base.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        Base
                    </a>
                </p>
                <p className="text-xs text-gray-500">
                    Play responsibly. Blockchain transactions are irreversible.
                </p>
            </footer>
        </>
    )
}

export default GameContainer
