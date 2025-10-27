import { useState, useEffect, useMemo, useRef } from 'react'
import { Trophy, TrendingUp, Crown, Medal, Award, Flame, X, Search, ChevronDown, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount, useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { CONTRACT_ADDRESS, ROCK_PAPER_SCISSORS_ABI } from '../config/contracts'

const SORT_OPTIONS = [
    { value: 'wins', label: 'Most Wins', icon: '🏆' },
    { value: 'maxStreak', label: 'Max Streak', icon: '🔥' },
    { value: 'profit', label: 'Highest Earnings', icon: '💰' },
    { value: 'losses', label: 'Most Losses', icon: '😢' },
    { value: 'draws', label: 'Most Draws', icon: '🤝' },
    { value: 'totalWagered', label: 'Highest Bets', icon: '💸' },
    { value: 'totalGames', label: 'Most Games', icon: '🎮' },
]

const Leaderboard = () => {
    const { address } = useAccount()
    const [showFullLeaderboard, setShowFullLeaderboard] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [leaderboardData, setLeaderboardData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [sortBy, setSortBy] = useState('wins')
    const [showSortDropdown, setShowSortDropdown] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState('bottom')
    const [isRefreshing, setIsRefreshing] = useState(false)
    const dropdownButtonRef = useRef(null)
    const dropdownButtonModalRef = useRef(null)

    // Get all players from blockchain
    const { data: allPlayers, refetch } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ROCK_PAPER_SCISSORS_ABI,
        functionName: 'getAllPlayers',
        enabled: true,
    })

    // Calculate dropdown position
    const calculateDropdownPosition = (buttonRef) => {
        if (!buttonRef.current) return 'bottom'

        const buttonRect = buttonRef.current.getBoundingClientRect()
        const dropdownHeight = 350 // Updated for 7 options
        const spaceBelow = window.innerHeight - buttonRect.bottom
        const spaceAbove = buttonRect.top

        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
            return 'top'
        }

        return 'bottom'
    }

    // Update position when dropdown opens
    useEffect(() => {
        if (showSortDropdown) {
            const position = calculateDropdownPosition(
                showFullLeaderboard ? dropdownButtonModalRef : dropdownButtonRef
            )
            setDropdownPosition(position)
        }
    }, [showSortDropdown, showFullLeaderboard])

    // Manual refresh function
    const handleRefresh = async () => {
        setIsRefreshing(true)
        await refetch()
        setTimeout(() => setIsRefreshing(false), 500)
    }

    // Fetch player stats from blockchain
    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (!allPlayers || allPlayers.length === 0) {
                setLeaderboardData([])
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            try {
                const { readContract } = await import('wagmi/actions')
                const { config } = await import('../config/wagmi')

                const statsPromises = allPlayers.map(async (playerAddress) => {
                    try {
                        // Call getPlayerStats - returns: wins, losses, draws, totalWagered, totalPayout, maxStreak
                        const stats = await readContract(config, {
                            address: CONTRACT_ADDRESS,
                            abi: ROCK_PAPER_SCISSORS_ABI,
                            functionName: 'getPlayerStats',
                            args: [playerAddress],
                        })

                        // Call getUsername - returns string
                        const username = await readContract(config, {
                            address: CONTRACT_ADDRESS,
                            abi: ROCK_PAPER_SCISSORS_ABI,
                            functionName: 'getUsername',
                            args: [playerAddress],
                        })

                        // Parse stats array from contract
                        // stats[0] = wins (uint256)
                        // stats[1] = losses (uint256)
                        // stats[2] = draws (uint256)
                        // stats[3] = totalWagered (uint256 in wei)
                        // stats[4] = totalPayout (uint256 in wei)
                        // stats[5] = maxStreak (uint256)

                        const wins = Number(stats[0])
                        const losses = Number(stats[1])
                        const draws = Number(stats[2])
                        const totalWagered = parseFloat(formatEther(stats[3]))
                        const totalPayout = parseFloat(formatEther(stats[4]))
                        const maxStreak = Number(stats[5])

                        const profit = totalPayout - totalWagered
                        const totalGames = wins + losses + draws

                        return {
                            address: playerAddress,
                            username: username || `Player_${playerAddress.slice(2, 8)}`,
                            wins,
                            losses,
                            draws,
                            totalGames,
                            totalWagered,
                            totalPayout,
                            profit,
                            maxStreak,
                            winRate: totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0,
                        }
                    } catch (error) {
                        console.error(`Error fetching stats for ${playerAddress}:`, error)
                        return null
                    }
                })

                const playerStats = await Promise.all(statsPromises)
                const validStats = playerStats.filter(stat => stat !== null)

                setLeaderboardData(validStats)
                console.log(`✅ Loaded ${validStats.length} players from blockchain`)
            } catch (error) {
                console.error('Error fetching leaderboard from blockchain:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchLeaderboard()
    }, [allPlayers])

    // Refetch on modal close
    useEffect(() => {
        if (!showFullLeaderboard) {
            refetch()
        }
    }, [showFullLeaderboard, refetch])

    useEffect(() => {
        if (showFullLeaderboard) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [showFullLeaderboard])

    // Sort leaderboard
    const sortedData = useMemo(() => {
        const sorted = [...leaderboardData].sort((a, b) => {
            switch (sortBy) {
                case 'wins':
                    return b.wins - a.wins || b.totalGames - a.totalGames
                case 'losses':
                    return b.losses - a.losses || b.totalGames - a.totalGames
                case 'draws':
                    return b.draws - a.draws || b.totalGames - a.totalGames
                case 'maxStreak':
                    return b.maxStreak - a.maxStreak || b.wins - a.wins
                case 'profit':
                    return b.profit - a.profit
                case 'totalWagered':
                    return b.totalWagered - a.totalWagered
                case 'totalGames':
                    return b.totalGames - a.totalGames
                default:
                    return b.wins - a.wins || b.totalGames - a.totalGames
            }
        })

        return sorted.map((player, index) => ({
            ...player,
            rank: index + 1,
        }))
    }, [leaderboardData, sortBy])

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown className="text-yellow-400" size={20} />
        if (rank === 2) return <Medal className="text-gray-300" size={20} />
        if (rank === 3) return <Award className="text-orange-400" size={20} />
        return <div className="w-5 h-5 flex items-center justify-center text-white/60 font-bold text-sm">{rank}</div>
    }

    const getRankBg = (rank) => {
        if (rank === 1) return 'from-yellow-900/40 to-amber-900/40 border-yellow-500/30'
        if (rank === 2) return 'from-gray-900/40 to-slate-900/40 border-gray-300/30'
        if (rank === 3) return 'from-orange-900/40 to-red-900/40 border-orange-500/30'
        return 'from-gray-900/40 to-slate-900/40 border-gray-700/30'
    }

    const filteredData = useMemo(() => {
        return sortedData.filter((player) =>
            player.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            player.address?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [sortedData, searchQuery])

    const topPlayers = sortedData.slice(0, 5)
    const currentSortOption = SORT_OPTIONS.find(opt => opt.value === sortBy)

    if (isLoading) {
        return (
            <div className="bg-gray-800/20 rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center gap-3 mb-4">
                    <Trophy className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-gray-700/30 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    const PlayerCard = ({ player, isHighlighted = false }) => (
        <div
            className={`bg-gradient-to-br ${getRankBg(player.rank)} backdrop-blur-sm rounded-xl p-4 border cursor-default hover:scale-[1.02] transition-all duration-200 ${
                isHighlighted ? 'ring-2 ring-purple-500' : ''
            }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        {getRankIcon(player.rank)}
                        <div>
                            <div className="font-bold text-white flex items-center gap-2">
                                {player.username}
                                {player.rank <= 3 && <Flame className="w-4 h-4 text-orange-400" />}
                            </div>
                            <div className="text-xs text-gray-500">{player.address.slice(0, 10)}...</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-sm text-gray-400">Wins</div>
                        <div className="text-lg font-bold text-green-400">{player.wins}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">Max Streak</div>
                        <div className="text-lg font-bold text-orange-400 flex items-center gap-1">
                            {player.maxStreak}
                            {player.maxStreak >= 5 && <Flame className="w-4 h-4" />}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">Profit</div>
                        <div className={`text-lg font-bold ${player.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {player.profit >= 0 ? '+' : ''}{player.profit.toFixed(4)} ETH
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    // Dropdown component with smart positioning
    const SortDropdown = ({ isModal = false }) => {
        const buttonRef = isModal ? dropdownButtonModalRef : dropdownButtonRef

        return (
            <div className="relative z-20">
                <button
                    ref={buttonRef}
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className={`px-${isModal ? '4' : '3'} py-2 ${isModal ? 'bg-gray-800 border border-gray-700' : 'bg-gray-700/50'} hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isModal ? 'whitespace-nowrap' : ''}`}
                >
                    <span>{currentSortOption?.icon}</span>
                    <span className={isModal ? '' : 'hidden sm:inline'}>{currentSortOption?.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {showSortDropdown && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowSortDropdown(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, y: dropdownPosition === 'bottom' ? -10 : 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: dropdownPosition === 'bottom' ? -10 : 10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className={`absolute right-0 ${dropdownPosition === 'bottom' ? 'mt-2' : 'bottom-full mb-2'} w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-30 overflow-hidden`}
                                style={{
                                    maxHeight: '350px',
                                    overflowY: 'auto'
                                }}
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setSortBy(option.value)
                                            setShowSortDropdown(false)
                                        }}
                                        className={`w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3 ${
                                            sortBy === option.value ? 'bg-purple-600/20 text-purple-400' : 'text-gray-300'
                                        }`}
                                    >
                                        <span className="text-xl">{option.icon}</span>
                                        <span className="font-medium">{option.label}</span>
                                    </button>
                                ))}
                            </motion.div>
                        </>
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
                        <Trophy className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">Top Players</h3>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="p-1 hover:bg-gray-700/50 rounded transition-colors disabled:opacity-50"
                            title="Refresh leaderboard"
                        >
                            <RefreshCw className={`w-4 h-4 text-gray-400 hover:text-white ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <SortDropdown />

                        {leaderboardData.length > 5 && (
                            <button
                                onClick={() => setShowFullLeaderboard(true)}
                                className="px-4 py-2 bg-purple-600/70 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                            >
                                <TrendingUp className="w-4 h-4" />
                                <span className="hidden sm:inline">View All</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    {topPlayers.length > 0 ? (
                        topPlayers.map((player) => (
                            <PlayerCard
                                key={player.address}
                                player={player}
                                isHighlighted={player.address.toLowerCase() === address?.toLowerCase()}
                            />
                        ))
                    ) : (
                        <p className="text-gray-400 text-center py-8">No players yet. Be the first!</p>
                    )}
                </div>
            </div>

            {/* Full Leaderboard Modal */}
            <AnimatePresence>
                {showFullLeaderboard && (
                    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-gray-900 border-2 border-gray-700 rounded-2xl w-full max-w-4xl h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-700/50 bg-gray-900/95 flex-shrink-0">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <Trophy className="w-6 h-6 text-purple-400" />
                                        Full Leaderboard
                                        <span className="text-sm font-normal text-gray-400">
                                            ({currentSortOption?.label})
                                        </span>
                                    </h2>
                                    <button
                                        onClick={() => setShowFullLeaderboard(false)}
                                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-400 hover:text-white" />
                                    </button>
                                </div>

                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search by username or address..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                                        />
                                    </div>

                                    <SortDropdown isModal={true} />
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
                                    {filteredData.length > 0 ? (
                                        filteredData.map((player) => (
                                            <PlayerCard
                                                key={player.address}
                                                player={player}
                                                isHighlighted={player.address.toLowerCase() === address?.toLowerCase()}
                                            />
                                        ))
                                    ) : (
                                        <p className="text-gray-400 text-center py-12">No players found</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}

export default Leaderboard
