import { useReadContract, useAccount } from 'wagmi'
import { formatEther } from 'viem'
import { BarChart3, TrendingUp, Users, Coins, Trophy, Flame, Target, Zap } from 'lucide-react'
import { CONTRACT_ADDRESS, ROCK_PAPER_SCISSORS_ABI } from '../config/contracts'
import { motion } from 'framer-motion'
import { useMemo, useEffect, useState } from 'react'

const StatsPanel = () => {
    const { address } = useAccount()
    const [animatedEarnings, setAnimatedEarnings] = useState(0)
    const [games, setGames] = useState([])
    const [isLoadingGames, setIsLoadingGames] = useState(false)

    // Global stats
    const { data: stats, isLoading: statsLoading } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ROCK_PAPER_SCISSORS_ABI,
        functionName: 'getStats',
    })

    // Player game IDs
    const { data: gameIds } = useReadContract({
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

                const gamePromises = gameIds.map(async (gameId) => {
                    try {
                        const game = await readContract(config, {
                            address: CONTRACT_ADDRESS,
                            abi: ROCK_PAPER_SCISSORS_ABI,
                            functionName: 'getGame',
                            args: [gameId],
                        })
                        return game
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

    // Calculate player-specific stats
    // Calculate player-specific stats
    const playerStats = useMemo(() => {
        if (!games || games.length === 0) {
            return {
                totalGames: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                winRate: 0,
                totalBet: 0n,
                totalPayout: 0n,
                netProfit: 0n,
                currentStreak: 0,
                bestStreak: 0,
                choiceDistribution: { rock: 0, paper: 0, scissors: 0 },
            }
        }

        let wins = 0
        let losses = 0
        let draws = 0
        let totalBet = 0n
        let totalPayout = 0n
        let currentStreak = 0
        let bestStreak = 0
        let tempStreak = 0
        const choiceCount = { 1: 0, 2: 0, 3: 0 }

        // Create array with gameId for proper sorting
        const gamesWithIds = games.map((game, index) => ({
            ...game,
            arrayIndex: index,
        }))

        // Sort by gameId (highest = most recent)
        const sortedGames = [...gamesWithIds].sort((a, b) => {
            const idA = Number(a.gameId || a.arrayIndex)
            const idB = Number(b.gameId || b.arrayIndex)
            return idB - idA // Descending order
        })

        console.log('🎮 Sorted Games for Streak Calculation:')
        sortedGames.slice(0, 5).forEach((game, i) => {
            console.log(`  ${i}: GameID=${game.gameId?.toString()}, Result=${game.result} (1=WIN, 2=LOSE, 3=DRAW)`)
        })

        // Calculate current streak from most recent games
        for (let i = 0; i < sortedGames.length; i++) {
            const game = sortedGames[i]

            // Skip pending games
            if (!game.result || game.result === 0) {
                console.log(`  ⏳ Skipping pending game at index ${i}`)
                continue
            }

            // If it's a win, increment current streak
            if (game.result === 1) {
                currentStreak++
                console.log(`  ✅ Win at index ${i}, streak now: ${currentStreak}`)
            } else {
                // Stop at first loss or draw
                console.log(`  ❌ Non-win at index ${i} (result=${game.result}), stopping streak`)
                break
            }
        }

        console.log(`🔥 Final Current Streak: ${currentStreak}`)

        // Process all games for other stats
        sortedGames.forEach((game) => {
            // Skip pending games
            if (!game.result || game.result === 0) return

            totalBet += game.betAmount

            // Count choices
            if (game.playerChoice) {
                choiceCount[game.playerChoice] = (choiceCount[game.playerChoice] || 0) + 1
            }

            // GameResult: 0=PENDING, 1=WIN, 2=LOSE, 3=DRAW
            if (game.result === 1) {
                wins++
                totalPayout += game.payout
                tempStreak++
                bestStreak = Math.max(bestStreak, tempStreak)
            } else {
                tempStreak = 0
                if (game.result === 2) {
                    losses++
                } else if (game.result === 3) {
                    draws++
                }
            }
        })

        const totalGames = wins + losses + draws
        const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0
        const netProfit = totalPayout - totalBet

        return {
            totalGames,
            wins,
            losses,
            draws,
            winRate: winRate.toFixed(1),
            totalBet,
            totalPayout,
            netProfit,
            currentStreak,
            bestStreak,
            choiceDistribution: {
                rock: choiceCount[1] || 0,
                paper: choiceCount[2] || 0,
                scissors: choiceCount[3] || 0,
            },
        }
    }, [games])


    // Get streak intensity styling
    const getStreakIntensity = (streak) => {
        if (streak === 0) {
            return {
                bgColor: 'bg-gray-500/20',
                borderColor: 'border-gray-500/50',
                textColor: 'text-gray-400',
                glowColor: 'shadow-gray-500/20',
                animation: '',
            }
        } else if (streak < 3) {
            return {
                bgColor: 'bg-orange-500/20',
                borderColor: 'border-orange-500/50',
                textColor: 'text-orange-400',
                glowColor: 'shadow-orange-500/30',
                animation: '',
            }
        } else if (streak < 5) {
            return {
                bgColor: 'bg-red-500/30',
                borderColor: 'border-red-500/60',
                textColor: 'text-red-400',
                glowColor: 'shadow-red-500/40',
                animation: 'animate-pulse',
            }
        } else if (streak < 10) {
            return {
                bgColor: 'bg-gradient-to-br from-red-600/40 to-orange-600/40',
                borderColor: 'border-red-400/70',
                textColor: 'text-red-300',
                glowColor: 'shadow-red-500/60 shadow-lg',
                animation: 'animate-pulse',
            }
        } else {
            return {
                bgColor: 'bg-gradient-to-br from-yellow-500/50 to-red-600/50',
                borderColor: 'border-yellow-400/80',
                textColor: 'text-yellow-300',
                glowColor: 'shadow-yellow-500/80 shadow-2xl',
                animation: 'animate-bounce',
            }
        }
    }

    const streakStyle = getStreakIntensity(playerStats.currentStreak)

    // Animate earnings counter
    useEffect(() => {
        const target = parseFloat(formatEther(playerStats.netProfit))
        const duration = 2000
        const steps = 60
        const increment = target / steps
        const stepDuration = duration / steps

        let current = 0
        const interval = setInterval(() => {
            current += increment
            if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
                setAnimatedEarnings(target)
                clearInterval(interval)
            } else {
                setAnimatedEarnings(current)
            }
        }, stepDuration)

        return () => clearInterval(interval)
    }, [playerStats.netProfit])

    // Achievement definitions
    const achievements = [
        {
            id: 'first_win',
            name: 'First Blood',
            description: 'Win your first game',
            icon: '🎯',
            unlocked: playerStats.wins >= 1,
        },
        {
            id: 'win_5',
            name: 'Rising Star',
            description: 'Win 5 games',
            icon: '⭐',
            unlocked: playerStats.wins >= 5,
        },
        {
            id: 'win_10',
            name: 'Veteran',
            description: 'Win 10 games',
            icon: '🏆',
            unlocked: playerStats.wins >= 10,
        },
        {
            id: 'play_10',
            name: 'Dedicated',
            description: 'Play 10 games',
            icon: '🎮',
            unlocked: playerStats.totalGames >= 10,
        },
        {
            id: 'streak_3',
            name: 'On Fire',
            description: 'Win 3 games in a row',
            icon: '🔥',
            unlocked: playerStats.bestStreak >= 3,
        },
        {
            id: 'streak_5',
            name: 'Unstoppable',
            description: 'Win 5 games in a row',
            icon: '💥',
            unlocked: playerStats.bestStreak >= 5,
        },
    ]

    const unlockedAchievements = achievements.filter((a) => a.unlocked)

    if (statsLoading) {
        return (
            <div className="bg-gray-800/20 rounded-2xl p-6 border border-gray-700/50">
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-gray-700/30 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    const statsItems = stats
        ? [
            {
                label: 'Total Games',
                value: stats[0].toString(),
                icon: BarChart3,
                color: 'text-blue-400',
            },
            {
                label: 'Total Wins',
                value: stats[1].toString(),
                icon: Trophy,
                color: 'text-green-400',
            },
            {
                label: 'Total Losses',
                value: stats[2].toString(),
                icon: TrendingUp,
                color: 'text-red-400',
            },
            {
                label: 'House Balance',
                value: `${Number(formatEther(stats[4])).toFixed(2)} ETH`,
                icon: Coins,
                color: 'text-yellow-400',
            },
        ]
        : []

    return (
        <div className="space-y-6">
            {/* Global Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/20 rounded-2xl p-6 border border-gray-700/50"
            >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Global Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {statsItems.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <item.icon className={`w-4 h-4 ${item.color}`} />
                                <span className="text-gray-400 text-sm">{item.label}</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{item.value}</div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Player Stats */}
            {playerStats.totalGames > 0 && (
                <>
                    {/* Earnings Counter */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-800/20 rounded-2xl p-6 border border-gray-700/50"
                    >
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            Total Earnings
                        </h3>
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={`text-4xl font-black ${
                                animatedEarnings >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                        >
                            {animatedEarnings >= 0 ? '+' : ''}
                            {animatedEarnings.toFixed(5)} ETH
                        </motion.div>
                        <div className="text-sm text-gray-400 mt-2">
                            Wagered: {formatEther(playerStats.totalBet)} ETH • Payout:{' '}
                            {formatEther(playerStats.totalPayout)} ETH
                        </div>
                    </motion.div>

                    {/* Win Rate & Streaks */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gray-800/20 rounded-2xl p-6 border border-gray-700/50"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-400" />
                            Performance
                        </h3>

                        {/* Win Rate Circle */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex-1">
                                <div className="text-4xl font-black text-white mb-1">
                                    {playerStats.winRate}%
                                </div>
                                <div className="text-sm text-gray-400">Win Rate</div>
                                <div className="flex gap-4 mt-2 text-sm">
                                    <span className="text-green-400">{playerStats.wins}W</span>
                                    <span className="text-red-400">{playerStats.losses}L</span>
                                    <span className="text-gray-400">{playerStats.draws}D</span>
                                </div>
                            </div>

                            {/* Win Streak */}
                            <div className="flex flex-col items-end gap-3">
                                {/* Current Streak - Dynamic Intensity */}
                                <motion.div
                                    className={`${streakStyle.bgColor} border ${streakStyle.borderColor} rounded-xl px-4 py-3 ${streakStyle.glowColor} ${streakStyle.animation}`}
                                    animate={playerStats.currentStreak >= 5 ? {
                                        scale: [1, 1.05, 1],
                                    } : {}}
                                    transition={{ duration: 0.5, repeat: playerStats.currentStreak >= 5 ? Infinity : 0 }}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Flame className={`w-4 h-4 ${streakStyle.textColor}`} />
                                        <span className={`text-xs font-semibold ${streakStyle.textColor}`}>
                                            Current Streak
                                        </span>
                                    </div>
                                    <div className={`text-3xl font-black ${streakStyle.textColor}`}>
                                        {playerStats.currentStreak}
                                        {playerStats.currentStreak >= 10 && (
                                            <span className="ml-1 text-2xl">🔥🔥🔥</span>
                                        )}
                                        {playerStats.currentStreak >= 5 && playerStats.currentStreak < 10 && (
                                            <span className="ml-1 text-2xl">🔥</span>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Best Streak */}
                                <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl px-4 py-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Trophy className="w-4 h-4 text-purple-400" />
                                        <span className="text-xs text-purple-400 font-semibold">
                                            Best Streak
                                        </span>
                                    </div>
                                    <div className="text-3xl font-black text-purple-400">
                                        {playerStats.bestStreak}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Choice Distribution */}
                        <div>
                            <div className="text-sm text-gray-400 mb-2">Choice Distribution</div>
                            <div className="space-y-2">
                                {[
                                    {
                                        name: 'Rock',
                                        emoji: '✊',
                                        count: playerStats.choiceDistribution.rock,
                                        color: 'bg-red-500',
                                    },
                                    {
                                        name: 'Paper',
                                        emoji: '✋',
                                        count: playerStats.choiceDistribution.paper,
                                        color: 'bg-blue-500',
                                    },
                                    {
                                        name: 'Scissors',
                                        emoji: '✌️',
                                        count: playerStats.choiceDistribution.scissors,
                                        color: 'bg-purple-500',
                                    },
                                ].map((choice) => {
                                    const percentage =
                                        playerStats.totalGames > 0
                                            ? ((choice.count / playerStats.totalGames) * 100).toFixed(1)
                                            : 0
                                    return (
                                        <div key={choice.name} className="flex items-center gap-3">
                                            <div className="text-xl">{choice.emoji}</div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm text-white">{choice.name}</span>
                                                    <span className="text-xs text-gray-400">
                                                        {choice.count} ({percentage}%)
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        transition={{ duration: 1, delay: 0.5 }}
                                                        className={`h-full ${choice.color}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Achievements */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gray-800/20 rounded-2xl p-6 border border-gray-700/50"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            Achievements ({unlockedAchievements.length}/{achievements.length})
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {achievements.map((achievement, index) => (
                                <motion.div
                                    key={achievement.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + index * 0.05 }}
                                    className={`relative rounded-xl p-4 border transition-all duration-300 ${
                                        achievement.unlocked
                                            ? 'bg-gradient-to-br from-yellow-900/50 to-orange-900/50 border-yellow-500/50 hover:border-yellow-400/70'
                                            : 'bg-gray-900/30 border-gray-700/30 opacity-50'
                                    }`}
                                >
                                    <div className="text-3xl mb-2">{achievement.icon}</div>
                                    <div className="text-sm font-bold text-white mb-1">
                                        {achievement.name}
                                    </div>
                                    <div className="text-xs text-gray-400">{achievement.description}</div>
                                    {achievement.unlocked && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1"
                                        >
                                            <Zap className="w-3 h-3 text-white" />
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    )
}

export default StatsPanel
