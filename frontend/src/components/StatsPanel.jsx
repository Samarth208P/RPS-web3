import { useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { BarChart3, TrendingUp, Users, Coins } from 'lucide-react'
import { CONTRACT_ADDRESS, ROCK_PAPER_SCISSORS_ABI } from '../config/contracts'
import { motion } from 'framer-motion'

const StatsPanel = () => {
    const { data: stats, isLoading } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ROCK_PAPER_SCISSORS_ABI,
        functionName: 'getStats',
    })

    if (isLoading) {
        return (
            <div className="card">
                <h3 className="text-xl font-bold mb-4">Game Statistics</h3>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                            <div className="h-8 bg-white/10 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const [totalGames, wins, losses, draws, houseBalance] = stats || [0n, 0n, 0n, 0n, 0n]

    const winRate = totalGames > 0 ? (Number(wins) / Number(totalGames) * 100).toFixed(1) : 0
    const loseRate = totalGames > 0 ? (Number(losses) / Number(totalGames) * 100).toFixed(1) : 0
    const drawRate = totalGames > 0 ? (Number(draws) / Number(totalGames) * 100).toFixed(1) : 0

    const statItems = [
        {
            label: 'Total Games',
            value: totalGames.toString(),
            icon: BarChart3,
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'bg-blue-500/10',
            iconColor: 'text-blue-400',
        },
        {
            label: 'House Balance',
            value: `${parseFloat(formatEther(houseBalance)).toFixed(4)} ETH`,
            icon: Coins,
            color: 'from-purple-500 to-pink-600',
            bgColor: 'bg-purple-500/10',
            iconColor: 'text-purple-400',
        },
        {
            label: 'Player Wins',
            value: wins.toString(),
            subtitle: `${winRate}% win rate`,
            icon: TrendingUp,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'bg-green-500/10',
            iconColor: 'text-green-400',
        },
        {
            label: 'Total Draws',
            value: draws.toString(),
            subtitle: `${drawRate}% draw rate`,
            icon: Users,
            color: 'from-yellow-500 to-orange-600',
            bgColor: 'bg-yellow-500/10',
            iconColor: 'text-yellow-400',
        },
    ]

    return (
        <div className="card">
            <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                <BarChart3 className="w-6 h-6" />
                <span>Game Statistics</span>
            </h3>

            <div className="space-y-4">
                {statItems.map((item, index) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`${item.bgColor} rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm text-gray-400 mb-1">{item.label}</p>
                                <p className="text-2xl font-bold">{item.value}</p>
                                {item.subtitle && (
                                    <p className="text-xs text-gray-400 mt-1">{item.subtitle}</p>
                                )}
                            </div>
                            <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center`}>
                                <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Win Rate Chart */}
            {totalGames > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                    <h4 className="text-sm font-semibold mb-3 text-gray-300">Distribution</h4>
                    <div className="space-y-2">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Wins</span>
                                <span className="text-green-400 font-semibold">{winRate}%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${winRate}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Losses</span>
                                <span className="text-red-400 font-semibold">{loseRate}%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${loseRate}%` }}
                                    transition={{ duration: 1, delay: 0.7 }}
                                    className="h-full bg-gradient-to-r from-red-500 to-pink-600"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Draws</span>
                                <span className="text-yellow-400 font-semibold">{drawRate}%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${drawRate}%` }}
                                    transition={{ duration: 1, delay: 0.9 }}
                                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StatsPanel
