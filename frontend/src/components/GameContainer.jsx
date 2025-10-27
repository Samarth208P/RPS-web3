import { useState, useEffect } from 'react'
import { useAccount, useWaitForTransactionReceipt } from 'wagmi'
import { AnimatePresence } from 'framer-motion'
import Header from './Header'
import ConnectWallet from './ConnectWallet'
import GameBoard from './GameBoard'
import StatsPanel from './StatsPanel'
import GameHistory from './GameHistory'
import GameResult from './GameResult'

const GameContainer = () => {
    const { isConnected } = useAccount()
    const [showConnectModal, setShowConnectModal] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [isMatching, setIsMatching] = useState(false)
    const [showResult, setShowResult] = useState(false)
    const [gameResult, setGameResult] = useState(null)
    const [txHash, setTxHash] = useState(undefined)

    // Wait for transaction receipt - only enabled when hash exists
    const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
        hash: txHash,
        enabled: !!txHash, // Only run when we have a hash
    })

    // Debug logs
    useEffect(() => {
        console.log('🎮 Game State:', {
            txHash,
            isConfirming,
            isSuccess,
            isMatching,
            showResult,
            hasGameResult: !!gameResult
        })
    }, [txHash, isConfirming, isSuccess, isMatching, showResult, gameResult])

    useEffect(() => {
        if (isSuccess && txHash && receipt) {
            console.log('✅ Transaction confirmed!', receipt)

            // Transaction confirmed, show 5-second matching animation
            setIsMatching(true)

            const timer = setTimeout(() => {
                console.log('🎯 Showing result after 5 seconds')
                // After 5 seconds, hide matching and show result
                setIsMatching(false)
                setShowResult(true)
            }, 5000)

            return () => clearTimeout(timer)
        }
    }, [isSuccess, txHash, receipt])

    const handleGameComplete = (result) => {
        console.log('🎲 Game completed:', result)

        // Store the transaction hash
        if (result?.hash) {
            console.log('📝 Setting transaction hash:', result.hash)
            setTxHash(result.hash)
            setGameResult(result)
        } else {
            console.error('❌ No hash received from GameBoard!')
            // If no hash (might be for reading results), just show result immediately
            if (result) {
                setGameResult(result)
                setShowResult(true)
            }
        }
    }

    const handlePlayAgain = () => {
        console.log('🔄 Play again clicked')

        // Hide result first
        setShowResult(false)

        // Wait for exit animation, then refresh and reset
        setTimeout(() => {
            setGameResult(null)
            setTxHash(undefined)
            setIsMatching(false)

            // Trigger page refresh - stats and history will reload
            setRefreshTrigger(prev => prev + 1)
            console.log('✨ Page refreshed')
        }, 300)
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

            {/* Matching Animation Overlay */}
            <AnimatePresence mode="wait">
                {(isConfirming || isMatching) && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-10 text-center space-y-6 max-w-md border border-white/10 shadow-2xl">
                            {/* Animated Spinner */}
                            <div className="relative w-24 h-24 mx-auto">
                                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <div className="absolute inset-2 border-4 border-purple-500/40 border-b-transparent rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold text-white">
                                    {isConfirming ? '⚡ Confirming...' : '🎮 Matching...'}
                                </h2>

                                <p className="text-gray-300 text-lg">
                                    {isConfirming
                                        ? 'Processing your bet on blockchain'
                                        : 'Finding your opponent...'
                                    }
                                </p>
                            </div>

                            {/* Animated dots */}
                            {isMatching && (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            )}

                            {/* Progress bar */}
                            {isMatching && (
                                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse"
                                        style={{
                                            width: '100%',
                                            animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                        }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Game Result Modal */}
            <AnimatePresence mode="wait">
                {showResult && gameResult && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
                            <GameResult
                                result={gameResult}
                                onPlayAgain={handlePlayAgain}
                            />
                        </div>
                    </div>
                )}
            </AnimatePresence>

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
