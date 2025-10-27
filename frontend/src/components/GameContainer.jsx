import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { CONTRACT_ADDRESS, ROCK_PAPER_SCISSORS_ABI } from '../config/contracts'
import Header from './Header'
import ConnectWallet from './ConnectWallet'
import GameBoard from './GameBoard'
import StatsPanel from './StatsPanel'
import GameHistory from './GameHistory'
import GameResult from './GameResult'
import Leaderboard from './Leaderboard'
import ParticleBackground from './ParticleBackground'
import SetUsernameModal from './SetUsernameModal'
import * as ethers from 'ethers' // for decodeBytes32String / toUtf8String (works with ethers v6)

const GameContainer = () => {
    const { isConnected, address } = useAccount()
    const [showConnectModal, setShowConnectModal] = useState(false)
    const [showUsernameModal, setShowUsernameModal] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [showResult, setShowResult] = useState(false)
    const [gameResult, setGameResult] = useState(null)
    const [isBattleActive, setIsBattleActive] = useState(false)
    const [games, setGames] = useState([])

    // Helper: decode usernames from bytes32 / hex / string
    const decodeUsername = (raw) => {
        if (!raw && raw !== '') return null
        // If already a normal string
        if (typeof raw === 'string' && !raw.startsWith('0x')) {
            return raw.replace(/\0/g, '').trim()
        }

        // If it's a 0x... hex value (could be bytes32 or utf8-encoded)
        if (typeof raw === 'string' && raw.startsWith('0x')) {
            // Try bytes32 decode first (ethers v6)
            try {
                // decodeBytes32String works for 32byte padded strings
                const decoded = ethers.decodeBytes32String(raw)
                if (decoded && decoded.length > 0) return decoded.replace(/\0/g, '').trim()
            } catch (e) {
                // ignore and try utf8 decode
            }

            try {
                // try interpreting as utf8 string (handles variable length hex)
                const utf8 = ethers.toUtf8String(raw)
                if (utf8 && utf8.length > 0) return utf8.replace(/\0/g, '').trim()
            } catch (e) {
                // fallback to returning raw hex
                return raw
            }
        }

        // fallback
        return String(raw).replace(/\0/g, '').trim()
    }

    // Check if user has username from blockchain
    const {
        data: usernameData,
        isLoading: usernameLoading,
        refetch: refetchUsername,
        isFetched: usernameFetched
    } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ROCK_PAPER_SCISSORS_ABI,
        functionName: 'getUsername',
        args: [address],
        enabled: !!address,
    })

    // decoded username (string or null)
    const decodedUsername = useMemo(() => {
        if (usernameData === undefined || usernameData === null) return null
        return decodeUsername(usernameData)
    }, [usernameData])

    const hasUsername = useMemo(() => {
        if (!decodedUsername) return false
        return decodedUsername !== '' && decodedUsername.length > 0
    }, [decodedUsername])

    // Check localStorage cache
    const isAddressCached = useCallback((addr) => {
        if (!addr) return false
        try {
            const saved = localStorage.getItem('checkedUsernameAddresses')
            const cached = saved ? JSON.parse(saved) : {}
            return cached[addr.toLowerCase()] === true
        } catch {
            return false
        }
    }, [])

    // Save to localStorage
    const cacheAddress = useCallback((addr) => {
        if (!addr) return
        try {
            const saved = localStorage.getItem('checkedUsernameAddresses')
            const cached = saved ? JSON.parse(saved) : {}
            cached[addr.toLowerCase()] = true
            localStorage.setItem('checkedUsernameAddresses', JSON.stringify(cached))
            console.log('✅ Cached address:', addr)
        } catch (error) {
            console.error('Error caching address:', error)
        }
    }, [])

    // Save to localStorage when username is confirmed
    useEffect(() => {
        if (address && hasUsername && usernameFetched && !isAddressCached(address)) {
            cacheAddress(address)
        }
    }, [address, hasUsername, usernameFetched, isAddressCached, cacheAddress])

    // Show username modal logic - FIXED: No infinite loop
    useEffect(() => {
        if (!isConnected || !address) {
            setShowUsernameModal(false)
            return
        }

        // Check localStorage cache first
        if (isAddressCached(address)) {
            setShowUsernameModal(false)
            return
        }

        if (usernameLoading) {
            console.log('⏳ Loading username from blockchain...')
            return
        }

        // Show modal only if no username found on-chain
        if (usernameFetched) {
            if (!hasUsername) {
                console.log('📝 No username found, showing modal for:', address)
                setShowUsernameModal(true)
            } else {
                console.log('✅ Username exists:', decodedUsername)
                setShowUsernameModal(false)
                cacheAddress(address)
            }
        }
    }, [isConnected, address, usernameLoading, hasUsername, usernameFetched, decodedUsername, isAddressCached, cacheAddress])

    // Get player's game IDs from blockchain
    const { data: gameIds } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ROCK_PAPER_SCISSORS_ABI,
        functionName: 'getPlayerGames',
        args: [address],
        enabled: !!address && hasUsername,
    })

    // Fetch all games from blockchain
    useEffect(() => {
        const fetchGames = async () => {
            if (!gameIds || gameIds.length === 0) {
                setGames([])
                return
            }

            try {
                const { readContract } = await import('wagmi/actions')
                const { config } = await import('../config/wagmi')

                const gamePromises = Array.from(gameIds).map(async (gameId) => {
                    const game = await readContract(config, {
                        address: CONTRACT_ADDRESS,
                        abi: ROCK_PAPER_SCISSORS_ABI,
                        functionName: 'getGame',
                        args: [gameId],
                    })
                    // normalize returned structure if necessary
                    return { ...game, gameId }
                })

                const fetchedGames = await Promise.all(gamePromises)
                setGames(fetchedGames)
            } catch (error) {
                console.error('Error fetching games from blockchain:', error)
            }
        }

        fetchGames()
    }, [gameIds, refreshTrigger])

    // Calculate current streak
    const currentStreak = useMemo(() => {
        if (!games || games.length === 0) return 0

        const sortedGames = [...games].sort((a, b) => Number(b.gameId) - Number(a.gameId))

        let streak = 0
        for (const game of sortedGames) {
            if (game.result === 0) continue
            if (game.result === 1) {
                streak++
            } else {
                break
            }
        }

        return streak
    }, [games])

    const handleGameComplete = (result) => {
        console.log('🎲 Game completed on-chain:', result)
        setGameResult(result)
        setShowResult(true)
    }

    const handleBattleStart = () => {
        setIsBattleActive(true)
    }

    const handleBattleEnd = () => {
        setIsBattleActive(false)
    }

    const handleResultClose = () => {
        setShowResult(false)
        setTimeout(() => {
            setGameResult(null)
            setRefreshTrigger(prev => prev + 1)
        }, 300)
    }

    const handleUsernameSet = async () => {
        console.log('✅ Username set on-chain, refetching...')

        if (address) {
            cacheAddress(address)
        }

        // Wait for blockchain to update
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Refetch username
        await refetchUsername()

        setShowUsernameModal(false)

        toast.success('Welcome! You can now start playing!', {
            icon: '🎉',
            duration: 3000,
            style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #10b981',
            },
        })
    }

    // Not connected state
    if (!isConnected) {
        return (
            <>
                <ParticleBackground />
                <Header onConnect={() => setShowConnectModal(true)} />
                <main className="min-h-screen py-8 px-4 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center py-20">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <h2 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                                    Connect your wallet to play
                                </h2>
                                <p className="text-gray-400 text-lg mb-8">
                                    Challenge the house in Rock Paper Scissors with crypto!
                                </p>
                                <button
                                    onClick={() => setShowConnectModal(true)}
                                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/50"
                                >
                                    Connect Wallet
                                </button>
                            </motion.div>
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

    // Connected but no username - show setup modal
    if (isConnected && showUsernameModal) {
        return (
            <>
                <ParticleBackground />
                <AnimatePresence>
                    <SetUsernameModal
                        onSuccess={handleUsernameSet}
                        canClose={false}
                    />
                </AnimatePresence>
            </>
        )
    }

    // Loading state while checking username
    if (isConnected && usernameLoading && !isAddressCached(address)) {
        return (
            <>
                <ParticleBackground />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white text-lg">Loading from blockchain...</p>
                    </div>
                </div>
            </>
        )
    }

    // Connected with username - show game
    return (
        <>
            <ParticleBackground />

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
                            <Leaderboard />
                        </div>

                        {/* Right Column - Stats */}
                        <div className="space-y-6">
                            <StatsPanel triggerRefresh={refreshTrigger} />
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
