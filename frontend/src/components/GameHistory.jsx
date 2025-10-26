import { useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { Clock, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { CONTRACT_ADDRESS, ROCK_PAPER_SCISSORS_ABI, CHOICE_NAMES, RESULT_NAMES } from '../config/contracts'
import { NETWORK_CONFIG } from '../config/wagmi'
import { motion, AnimatePresence } from 'framer-motion'

const choiceEmojis = {
    1: '✊',
    2: '✋',
    3: '✌️',
}

const GameHistory = () => {
    const { address } = useAccount()
    const [expandedGame, setExpandedGame] = useState(null)

    const { data: gameIds, isLoading } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ROCK_PAPER_SCISSORS_ABI,
        functionName: 'getPlayerGames',
        args: [address],
    })

    if (isLoading) {
        return (
            <div className="card">
                <h3 className="text-xl font-bold mb-4">Your Game History</h3>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse glass-dark rounded-lg p-4">
                            <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                            <div className="h-6 bg-white/10 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (!gameIds || gameIds.length === 0) {
        return (
            <div className="card text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                    <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Games Yet</h3>
                <p className="text-gray-400">
                    Your game history will appear here after you play
                </p>
            </div>
        )
    }

    // Show last 10 games
    const recentGameIds = gameIds.slice(-10).reverse()

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center space-x-2">
                    <Clock className="w-6 h-6" />
                    <span>Your Game History</span>
                </h3>
                <span className="text-sm text-gray-400">
          {gameIds.length} total game{gameIds.length !== 1 ? 's' : ''}
        </span>
            </div>

            <div className="space-y-3">
                {recentGameIds.map((gameId) => (
                    <GameHistoryItem
                        key={gameId.toString()}
                        gameId={gameId}
                        expanded={expandedGame === gameId.toString()}
                        onToggle={() => setExpandedGame(
                            expandedGame === gameId.toString() ? null : gameId.toString()
                        )}
                    />
                ))}
            </div>
        </div>
    )
}

const GameHistoryItem = ({ gameId, expanded, onToggle }) => {
    const { data: game } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ROCK_PAPER_SCISSORS_ABI,
        functionName: 'getGame',
        args: [gameId],
    })

    if (!game) return null

    const isWin = game.result === 1
    const isLose = game.result === 2
    const isDraw = game.result === 3

    const getResultColor = () => {
        if (isWin) return 'border-green-500/50 bg-green-500/5'
        if (isLose) return 'border-red-500/50 bg-red-500/5'
        return 'border-yellow-500/50 bg-yellow-500/5'
    }

    const getResultBadge = () => {
        if (isWin) return 'bg-green-500/20 text-green-400'
        if (isLose) return 'bg-red-500/20 text-red-400'
        return 'bg-yellow-500/20 text-yellow-400'
    }

    return (
        <motion.div
            layout
            className={`glass-dark rounded-lg border ${getResultColor()} overflow-hidden transition-all duration-300`}
        >
            {/* Summary */}
            <div
                onClick={onToggle}
                className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                            {choiceEmojis[game.playerChoice]}
                        </div>
                        <div>
                            <p className="font-semibold">
                                {CHOICE_NAMES[game.playerChoice]} vs {CHOICE_NAMES[game.houseChoice]}
                            </p>
                            <p className="text-xs text-gray-400">
                                Game #{gameId.toString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getResultBadge()}`}>
              {RESULT_NAMES[game.result]}
            </span>
                        {expanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                </div>
            </div>

            {/* Details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-white/10"
                    >
                        <div className="p-4 space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="glass-dark rounded-lg p-3">
                                    <p className="text-xs text-gray-400 mb-1">Your Choice</p>
                                    <p className="font-semibold flex items-center space-x-2">
                                        <span className="text-xl">{choiceEmojis[game.playerChoice]}</span>
                                        <span>{CHOICE_NAMES[game.playerChoice]}</span>
                                    </p>
                                </div>
                                <div className="glass-dark rounded-lg p-3">
                                    <p className="text-xs text-gray-400 mb-1">House Choice</p>
                                    <p className="font-semibold flex items-center space-x-2">
                                        <span className="text-xl">{choiceEmojis[game.houseChoice]}</span>
                                        <span>{CHOICE_NAMES[game.houseChoice]}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="glass-dark rounded-lg p-3">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-400">Bet Amount</span>
                                    <span className="font-semibold">{formatEther(game.betAmount)} ETH</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Payout</span>
                                    <span className={`font-bold ${
                                        isWin ? 'text-green-400' : isLose ? 'text-red-400' : 'text-yellow-400'
                                    }`}>
                    {formatEther(game.payout)} ETH
                  </span>
                                </div>
                            </div>

                            <details className="glass-dark rounded-lg p-3">
                                <summary className="cursor-pointer text-xs text-gray-400 font-semibold">
                                    🔒 Provably Fair Proof
                                </summary>
                                <div className="mt-2 space-y-2">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Random Number:</p>
                                        <code className="block bg-black/30 p-2 rounded break-all text-xs text-blue-400">
                                            {game.randomNumber}
                                        </code>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Sequence Number:</p>
                                        <code className="block bg-black/30 p-2 rounded text-xs text-purple-400">
                                            {game.entropySequenceNumber.toString()}
                                        </code>
                                    </div>
                                    <a
                                        href={`${NETWORK_CONFIG.blockExplorer}/address/${CONTRACT_ADDRESS}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors text-xs"
                                    >
                                        <span>View Contract on Explorer</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </details>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default GameHistory
