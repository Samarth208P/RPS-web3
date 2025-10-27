import { useState } from 'react'
import { useAccount } from 'wagmi'
import { AnimatePresence } from 'framer-motion'
import Header from './Header'
import ConnectWallet from './ConnectWallet'
import GameBoard from './GameBoard'
import StatsPanel from './StatsPanel'
import GameHistory from './GameHistory'
import GameResult from './GameResult'
import ParticleBackground from './ParticleBackground'

const GameContainer = () => {
    const { isConnected } = useAccount()
    const [showConnectModal, setShowConnectModal] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [showResult, setShowResult] = useState(false)
    const [gameResult, setGameResult] = useState(null)

    const handleGameComplete = (result) => {
        console.log('🎲 Game completed:', result)
        setGameResult(result)
        setShowResult(true)
    }

    const handlePlayAgain = () => {
        console.log('🔄 Play again clicked')
        setShowResult(false)
        setTimeout(() => {
            setGameResult(null)
            setRefreshTrigger(prev => prev + 1)
            console.log('✨ Page refreshed')
        }, 300)
    }

    const handleResultClose = () => {
        setShowResult(false)
        setTimeout(() => {
            setGameResult(null)
            setRefreshTrigger(prev => prev + 1)
        }, 300)
    }

    if (!isConnected) {
        return (
            <>
                <ParticleBackground />
                <Header onConnect={() => setShowConnectModal(true)} />
                <main className="min-h-screen py-8 px-4 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center py-20">
                            <h2 className="text-4xl font-bold text-white mb-4">
                                Connect your wallet to play
                            </h2>
                            <p className="text-gray-400 mb-8">
                                Challenge the house in Rock Paper Scissors with crypto!
                            </p>
                            <button
                                onClick={() => setShowConnectModal(true)}
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105"
                            >
                                Connect Wallet
                            </button>
                        </div>
                    </div>
                </main>

                <AnimatePresence>
                    {showConnectModal && (
                        <ConnectWallet onClose={() => setShowConnectModal(false)} />
                    )}
                </AnimatePresence>
            </>
        )
    }

    return (
        <>
            <ParticleBackground />
            <Header onConnect={() => setShowConnectModal(true)} />

            <main className="min-h-screen py-8 px-4 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Game Board */}
                        <div className="lg:col-span-2 space-y-6">
                            <GameBoard onGameComplete={handleGameComplete} />
                            <GameHistory triggerRefresh={refreshTrigger} />
                        </div>

                        {/* Right Column - Stats */}
                        <div className="space-y-6">
                            <StatsPanel />
                        </div>
                    </div>
                </div>
            </main>

            {/* Game Result Modal */}
            <AnimatePresence>
                {showResult && gameResult && (
                    <GameResult
                        result={gameResult}
                        onClose={handleResultClose}
                        onPlayAgain={handlePlayAgain}
                    />
                )}
            </AnimatePresence>

            {/* Connect Wallet Modal */}
            <AnimatePresence>
                {showConnectModal && (
                    <ConnectWallet onClose={() => setShowConnectModal(false)} />
                )}
            </AnimatePresence>
        </>
    )
}

export default GameContainer
