import { useState, useMemo, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { Clock, ExternalLink, ChevronDown, ChevronUp, History, Filter, Search, X, Trophy, Flame } from 'lucide-react'
import { CONTRACT_ADDRESS, ROCK_PAPER_SCISSORS_ABI } from '../config/contracts'
import { NETWORK_CONFIG } from '../config/wagmi'
import { motion, AnimatePresence } from 'framer-motion'

// ✅ Aligned with contract Choice enum: ROCK=1, PAPER=2, SCISSORS=3
const choiceEmojis = {
    1: '✊',
    2: '✋',
    3: '✌️',
}

const CHOICE_NAMES = {
    0: 'None',
    1: 'Rock',
    2: 'Paper',
    3: 'Scissors',
}

const RESULT_NAMES = {
    0: 'Pending',
    1: 'Win',
    2: 'Loss',
    3: 'Draw',
}

const GameHistory = ({ triggerRefresh }) => {
    const { address } = useAccount()
    const [expandedGame, setExpandedGame] = useState(null)
    const [showFullHistory, setShowFullHistory] = useState(false)
    const [filterType, setFilterType] = useState('all')
    const [modalFilterType, setModalFilterType] = useState('all')
    const [searchId, setSearchId] = useState('')
    const [games, setGames] = useState([])
    const [isLoadingGames, setIsLoadingGames] = useState(false)

    const { data: gameIds, isLoading, refetch } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ROCK_PAPER_SCISSORS_ABI,
        functionName: 'getPlayerGames',
        args: [address],
        enabled: !!address,
    })

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

    useEffect(() => {
        if (triggerRefresh) refetch()
    }, [triggerRefresh, refetch])

    useEffect(() => {
        if (showFullHistory) {
            setModalFilterType('all')
            setSearchId('')
        }
    }, [showFullHistory])

    useEffect(() => {
        if (showFullHistory) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [showFullHistory])

    const filteredGamesMain = useMemo(() => {
        if (!games || games.length === 0) return []

        let filtered = [...games]

        if (filterType !== 'all') {
            filtered = filtered.filter(({ game }) => {
                if (filterType === 'win') return game.result === 1
                if (filterType === 'loss') return game.result === 2
                if (filterType === 'draw') return game.result === 3
                return true
            })
        }

        return filtered.reverse()
    }, [games, filterType])

    const filteredGamesModal = useMemo(() => {
        if (!games || games.length === 0) return []

        let filtered = [...games]

        if (modalFilterType !== 'all') {
            filtered = filtered.filter(({ game }) => {
                if (modalFilterType === 'win') return game.result === 1
                if (modalFilterType === 'loss') return game.result === 2
                if (modalFilterType === 'draw') return game.result === 3
                return true
            })
        }

        if (searchId) {
            filtered = filtered.filter(({ id }) =>
                id.toString().toLowerCase().includes(searchId.toLowerCase())
            )
        }

        return filtered.reverse()
    }, [games, modalFilterType, searchId])

    const recentGames = filteredGamesMain.slice(0, 5)

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
        const isWin = game.result === 1
        const isLoss = game.result === 2
        const isDraw = game.result === 3
        const isPending = game.result === 0
        const isExpanded = expandedGame === gameId.toString()

        return (
            <div
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

                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-4 pt-4 border-t border-gray-700/50 space-y-2 overflow-hidden"
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

                            {game.randomNumber && game.randomNumber !== '0x0000000000000000000000000000000000000000000000000000000000000000' && (
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
            </div>
        )
    }

    return (
        <>
            <div className="bg-gray-800/20 rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <History className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">Recent Matches</h3>
                    </div>
                    {games.length > 5 && (
                        <button
                            onClick={() => setShowFullHistory(true)}
                            className="px-4 py-2 bg-purple-600/70 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                        >
                            <History className="w-4 h-4" />
                            View All
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

            <AnimatePresence>
                {showFullHistory && (
                    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 p-0 m-0">
                        <div className="h-full w-full flex items-center justify-center">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="bg-gray-900 border-2 border-gray-700 rounded-2xl w-full mx-4 max-w-4xl h-[96vh] overflow-hidden shadow-2xl flex flex-col"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6 border-b border-gray-700/50 bg-gray-900/95 flex-shrink-0">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                            <History className="w-6 h-6 text-purple-400" />
                                            Complete Match History
                                        </h2>
                                        <button
                                            onClick={() => setShowFullHistory(false)}
                                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5 text-gray-400 hover:text-white" />
                                        </button>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex gap-2 flex-wrap">
                                            {['all', 'win', 'loss', 'draw'].map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => setModalFilterType(type)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                        modalFilterType === type
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

                                <div className="flex-1 overflow-y-auto p-6 modal-scroll">
                                    <style>{`
                                        .modal-scroll::-webkit-scrollbar {
                                            width: 10px;
                                        }
                                        .modal-scroll::-webkit-scrollbar-track {
                                            background: #1f2937;
                                            border-radius: 5px;
                                        }
                                        .modal-scroll::-webkit-scrollbar-thumb {
                                            background: #6b21a8;
                                            border-radius: 5px;
                                        }
                                        .modal-scroll::-webkit-scrollbar-thumb:hover {
                                            background: #7c3aed;
                                        }
                                    `}</style>
                                    <div className="space-y-3">
                                        {filteredGamesModal.length > 0 ? (
                                            filteredGamesModal.map(({ game, id }) => (
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
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}

export default GameHistory
