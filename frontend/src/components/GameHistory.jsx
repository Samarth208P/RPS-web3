import { useState, useMemo, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { Clock, ExternalLink, ChevronDown, ChevronUp, History, Filter, Search, X, Trophy, Flame } from 'lucide-react'
import { CONTRACT_ADDRESS, ROCK_PAPER_SCISSORS_ABI, CHOICE_NAMES, RESULT_NAMES } from '../config/contracts'
import { NETWORK_CONFIG } from '../config/wagmi'
import { motion, AnimatePresence } from 'framer-motion'

const choiceEmojis = {
    1: '✊',
    2: '✋',
    3: '✌️',
}

const GameHistory = ({ triggerRefresh }) => {
    const { address } = useAccount()
    const [expandedGame, setExpandedGame] = useState(null)
    const [showFullHistory, setShowFullHistory] = useState(false)
    const [filterType, setFilterType] = useState('all') // all, win, loss, draw
    const [searchId, setSearchId] = useState('')
    const [games, setGames] = useState([])
    const [isLoadingGames, setIsLoadingGames] = useState(false)

    // Fetch game IDs for the player
    const { data: gameIds, isLoading, refetch } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ROCK_PAPER_SCISSORS_ABI,
        functionName: 'getPlayerGames',
        args: [address],
        enabled: !!address,
    })

    // Fetch individual game details
    useEffect(() => {
        const fetchGames = async () => {
            if (!gameIds || gameIds.length === 0) {
                setGames([])
                return
            }

            setIsLoadingGames(true)
            try {
                const { readContract } = await import('wagmi/actions')
                const { config } = await import('../config/wagmi')

                // Fetch all games in parallel
                const gamePromises = gameIds.map(async (gameId) => {
                    try {
                        const game = await readContract(config, {
                            address: CONTRACT_ADDRESS,
                            abi: ROCK_PAPER_SCISSORS_ABI,
                            functionName: 'getGame',
                            args: [gameId],
                        })
                        return { game, id: gameId }
                    } catch (error) {
                        console.error(`Error fetching game ${gameId}:`, error)
                        return null
                    }
                })

                const fetchedGames = await Promise.all(gamePromises)
                setGames(fetchedGames.filter((g) => g !== null))
            } catch (error) {
                console.error('Error fetching games:', error)
            } finally {
                setIsLoadingGames(false)
            }
        }

        fetchGames()
    }, [gameIds])

    // Refetch when triggerRefresh changes
    useEffect(() => {
        if (triggerRefresh) refetch()
    }, [triggerRefresh, refetch])

    // Filter and search games
    const filteredGames = useMemo(() => {
        if (!games || games.length === 0) return []

        let filtered = [...games]

        // Apply filter
        if (filterType !== 'all') {
            filtered = filtered.filter(({ game }) => {
                // GameResult: 0=PENDING, 1=WIN, 2=LOSE, 3=DRAW
                if (filterType === 'win') return game.result === 1
                if (filterType === 'loss') return game.result === 2
                if (filterType === 'draw') return game.result === 3
                return true
            })
        }

        // Apply search
        if (searchId) {
            filtered = filtered.filter(({ id }) =>
                id.toString().toLowerCase().includes(searchId.toLowerCase())
            )
        }

        return filtered.reverse() // Most recent first
    }, [games, filterType, searchId])

    // Last 5 games for quick view
    const recentGames = filteredGames.slice(0, 5)

    if (isLoading || isLoadingGames) {
        return (
            <div className="bg-gray-800/20 rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center gap-3 mb-4">
                    <History className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Match History</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-gray-700/30 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    if (!games || games.length === 0) {
        return (
            <div className="bg-gray-800/20 rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center gap-3 mb-4">
                    <History className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Match History</h3>
                </div>
                <p className="text-gray-400 text-center py-8">
                    Your match history will appear here after you play
                </p>
            </div>
        )
    }

    const GameCard = ({ game, gameId, compact = false }) => {
        // GameResult: 0=PENDING, 1=WIN, 2=LOSE, 3=DRAW
        const isWin = game.result === 1
        const isLoss = game.result === 2
        const isDraw = game.result === 3
        const isPending = game.result === 0
        const isExpanded = expandedGame === gameId.toString()

        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-gradient-to-br ${
                    isPending
                        ? 'from-yellow-900/40 to-orange-900/40 border-yellow-500/30'
                        : isWin
                            ? 'from-green-900/40 to-emerald-900/40 border-green-500/30'
                            : isLoss
                                ? 'from-red-900/40 to-rose-900/40 border-red-500/30'
                                : 'from-gray-900/40 to-slate-900/40 border-gray-500/30'
                } backdrop-blur-sm rounded-xl p-4 border cursor-pointer hover:scale-[1.02] transition-all duration-200`}
                onClick={() => setExpandedGame(isExpanded ? null : gameId.toString())}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Result Badge */}
                        <div
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                                isPending
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : isWin
                                        ? 'bg-green-500/20 text-green-400'
                                        : isLoss
                                            ? 'bg-red-500/20 text-red-400'
                                            : 'bg-gray-500/20 text-gray-400'
                            }`}
                        >
                            {isPending ? '⏳ PENDING' : isWin ? '🏆 WIN' : isLoss ? '💀 LOSS' : '🤝 DRAW'}
                        </div>

                        {/* Choices */}
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{choiceEmojis[game.playerChoice]}</span>
                            <span className="text-gray-500 text-sm">vs</span>
                            <span className="text-2xl">
                {game.houseChoice === 0 ? '❓' : choiceEmojis[game.houseChoice]}
              </span>
                        </div>

                        {!compact && (
                            <div className="text-sm text-gray-400">
                                {CHOICE_NAMES[game.playerChoice]} vs{' '}
                                {game.houseChoice === 0 ? '...' : CHOICE_NAMES[game.houseChoice]}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Payout */}
                        <div className="text-right">
                            {isPending ? (
                                <>
                                    <div className="text-lg font-bold text-yellow-400">Pending</div>
                                    <div className="text-xs text-gray-500">
                                        Bet: {formatEther(game.betAmount)} ETH
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div
                                        className={`text-lg font-bold ${
                                            isWin ? 'text-green-400' : isLoss ? 'text-red-400' : 'text-gray-400'
                                        }`}
                                    >
                                        {isWin
                                            ? `+${formatEther(game.payout - game.betAmount)}`
                                            : isLoss
                                                ? `-${formatEther(game.betAmount)}`
                                                : '0'}{' '}
                                        ETH
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Bet: {formatEther(game.betAmount)} ETH
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Expand icon */}
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 pt-4 border-t border-gray-700/50 space-y-2"
                        >
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Game ID:</span>
                                    <span className="text-white ml-2">#{gameId.toString()}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Result:</span>
                                    <span className="text-white ml-2">{RESULT_NAMES[game.result]}</span>
                                </div>
                                {game.payout > 0n && (
                                    <div>
                                        <span className="text-gray-500">Payout:</span>
                                        <span className="text-white ml-2">{formatEther(game.payout)} ETH</span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-gray-500">Timestamp:</span>
                                    <span className="text-white ml-2">
                    {new Date(Number(game.timestamp) * 1000).toLocaleString()}
                  </span>
                                </div>
                            </div>

                            {game.randomNumber !== '0x0000000000000000000000000000000000000000000000000000000000000000' && (
                                <div className="text-xs">
                                    <span className="text-gray-500">Random Number:</span>
                                    <div className="text-white font-mono bg-gray-900/50 p-2 rounded mt-1 break-all">
                                        {game.randomNumber}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        )
    }

    return (
        <>
            {/* Quick View - Last 5 Matches */}
            <div className="bg-gray-800/20 rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <History className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">Recent Matches</h3>
                    </div>
                    {games.length > 5 && (
                        <button
                            onClick={() => setShowFullHistory(true)}
                            className="px-4 py-2 opacity-70 bg-purple-700 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                        >
                            <History className="w-4 h-4" />
                            View All History
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    {recentGames.length > 0 ? (
                        recentGames.map(({ game, id }) => (
                            <GameCard key={id.toString()} game={game} gameId={id} />
                        ))
                    ) : (
                        <p className="text-gray-400 text-center py-8">No matches found</p>
                    )}
                </div>
            </div>

            {/* Full History Modal */}
            <AnimatePresence>
                {showFullHistory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowFullHistory(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-700/50">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <History className="w-6 h-6 text-purple-400" />
                                        Complete Match History
                                    </h2>
                                    <button
                                        onClick={() => setShowFullHistory(false)}
                                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>

                                {/* Filters and Search */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {/* Filter Buttons */}
                                    <div className="flex gap-2 flex-wrap">
                                        {['all', 'win', 'loss', 'draw'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setFilterType(type)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                    filterType === type
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                                }`}
                                            >
                                                {type === 'all' && '📊 All'}
                                                {type === 'win' && '🏆 Wins'}
                                                {type === 'loss' && '💀 Losses'}
                                                {type === 'draw' && '🤝 Draws'}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Search Input */}
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search by Game ID..."
                                            value={searchId}
                                            onChange={(e) => setSearchId(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
                                <div className="space-y-3">
                                    {filteredGames.length > 0 ? (
                                        filteredGames.map(({ game, id }) => (
                                            <GameCard key={id.toString()} game={game} gameId={id} />
                                        ))
                                    ) : (
                                        <p className="text-gray-400 text-center py-12">
                                            No matches found with current filters
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default GameHistory
