import { useState, useEffect, useMemo } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { AnimatePresence, motion } from 'framer-motion'
import { CONTRACT_ADDRESS, ROCK_PAPER_SCISSORS_ABI } from '../config/contracts'
import Header from './Header'
import ConnectWallet from './ConnectWallet'
import GameBoard from './GameBoard'
import StatsPanel from './StatsPanel'
import GameHistory from './GameHistory'
import GameResult from './GameResult'
import ParticleBackground from './ParticleBackground'

const GameContainer = () => {
    const { isConnected, address } = useAccount()
    const [showConnectModal, setShowConnectModal] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [showResult, setShowResult] = useState(false)
    const [gameResult, setGameResult] = useState(null)
    const [isBattleActive, setIsBattleActive] = useState(false)
    const [games, setGames] = useState([])

    // Get player's game IDs
    const { data: gameIds } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ROCK_PAPER_SCISSORS_ABI,
        functionName: 'getPlayerGames',
        args: [address],
        enabled: !!address,
    })

    // Fetch all games
    useEffect(() => {
        const fetchGames = async () => {
            if (!gameIds || gameIds.length === 0) {
                setGames([])
                return
            }

            try {
                const { readContract } = await import('wagmi/actions')
                const { config } = await import('../config/wagmi')

                const gamePromises = gameIds.map(async (gameId) => {
                    const game = await readContract(config, {
                        address: CONTRACT_ADDRESS,
                        abi: ROCK_PAPER_SCISSORS_ABI,
                        functionName: 'getGame',
                        args: [gameId],
                    })
                    return { ...game, gameId }
                })

                const fetchedGames = await Promise.all(gamePromises)
                setGames(fetchedGames)
            } catch (error) {
                console.error('Error fetching games:', error)
            }
        }

        fetchGames()
    }, [gameIds, refreshTrigger])

    // Calculate current streak
    const currentStreak = useMemo(() => {
        if (!games || games.length === 0) return 0

        // Sort by gameId descending (most recent first)
        const sortedGames = [...games].sort((a, b) => Number(b.gameId) - Number(a.gameId))

        let streak = 0
        for (const game of sortedGames) {
            // Skip pending games
            if (game.result === 0) continue

            // If win, increment streak
            if (game.result === 1) {
                streak++
            } else {
                // Stop at first loss or draw
                break
            }
        }

        return streak
    }, [games])

    const handleGameComplete = (result) => {
        console.log('🎲 Game completed:', result)
        setGameResult(result)
        setShowResult(true)
    }

    const handleBattleStart = () => {
        setIsBattleActive(true)
    }

    const handleBattleEnd = () => {
        setIsBattleActive(false)
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

            {/* Hide header during battle animation */}
            <AnimatePresence>
                {!isBattleActive && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Header onConnect={() => setShowConnectModal(true)} />
                    </motion.div>
                )}
            </AnimatePresence>

            <main className={`min-h-screen px-4 relative z-10 ${isBattleActive ? 'pt-0' : 'py-8'}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Game Board */}
                        <div className="lg:col-span-2 space-y-6">
                            <GameBoard
                                onGameComplete={handleGameComplete}
                                onBattleStart={handleBattleStart}
                                onBattleEnd={handleBattleEnd}
                            />
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
                        currentStreak={currentStreak}
                        gameNumber={gameResult.gameId}
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
