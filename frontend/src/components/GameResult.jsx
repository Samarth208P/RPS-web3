import { motion } from 'framer-motion'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import { Trophy, X, Minus, ExternalLink } from 'lucide-react'
import { formatEther } from 'viem'
import { CHOICE_NAMES, RESULT_NAMES } from '../config/contracts'
import { NETWORK_CONFIG } from '../config/wagmi'

const choiceEmojis = {
    1: '✊',
    2: '✋',
    3: '✌️',
}

const GameResult = ({ result, onPlayAgain }) => {
    const { width, height } = useWindowSize()
    const isWin = result.result === 1
    const isLose = result.result === 2
    const isDraw = result.result === 3

    const getResultColor = () => {
        if (isWin) return 'from-green-500 to-emerald-600'
        if (isLose) return 'from-red-500 to-pink-600'
        return 'from-yellow-500 to-orange-600'
    }

    const getResultIcon = () => {
        if (isWin) return <Trophy className="w-16 h-16" />
        if (isLose) return <X className="w-16 h-16" />
        return <Minus className="w-16 h-16" />
    }

    const getResultMessage = () => {
        if (isWin) return 'You Win! 🎉'
        if (isLose) return 'You Lose 😢'
        return "It's a Draw! 🤝"
    }

    return (
        <>
            {isWin && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
            >
                {/* Result Icon */}
                <motion.div
                    className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${getResultColor()} mb-6`}
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: isWin ? [0, -10, 10, -10, 0] : 0,
                    }}
                    transition={{
                        duration: 0.5,
                        repeat: isWin ? 3 : 0,
                    }}
                >
                    {getResultIcon()}
                </motion.div>

                {/* Result Message */}
                <h2 className="text-4xl font-bold mb-4 text-glow">
                    {getResultMessage()}
                </h2>

                {/* Choices Display */}
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
                    {/* Player Choice */}
                    <div className={`p-4 rounded-xl ${isWin ? 'ring-2 ring-green-500' : ''} ${isLose ? 'opacity-50' : ''} bg-white/5`}>
                        <p className="text-xs text-gray-400 mb-2">You</p>
                        <div className="text-5xl mb-2">{choiceEmojis[result.playerChoice]}</div>
                        <p className="text-sm font-semibold">{CHOICE_NAMES[result.playerChoice]}</p>
                    </div>

                    {/* VS */}
                    <div className="flex items-center justify-center">
                        <div className="text-2xl font-bold text-gray-400">VS</div>
                    </div>

                    {/* House Choice */}
                    <div className={`p-4 rounded-xl ${isLose ? 'ring-2 ring-red-500' : ''} ${isWin ? 'opacity-50' : ''} bg-white/5`}>
                        <p className="text-xs text-gray-400 mb-2">House</p>
                        <div className="text-5xl mb-2">{choiceEmojis[result.houseChoice]}</div>
                        <p className="text-sm font-semibold">{CHOICE_NAMES[result.houseChoice]}</p>
                    </div>
                </div>

                {/* Payout Info */}
                <div className="glass-dark rounded-xl p-6 mb-6 max-w-md mx-auto">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Bet Amount</span>
                            <span className="font-semibold">{formatEther(result.betAmount)} ETH</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Result</span>
                            <span className={`font-semibold ${
                                isWin ? 'text-green-400' : isLose ? 'text-red-400' : 'text-yellow-400'
                            }`}>
                {RESULT_NAMES[result.result]}
              </span>
                        </div>
                        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                            <span className="text-gray-400">Payout</span>
                            <span className={`text-2xl font-bold ${
                                isWin ? 'text-green-400' : isLose ? 'text-red-400' : 'text-yellow-400'
                            }`}>
                {formatEther(result.payout)} ETH
              </span>
                        </div>
                    </div>
                </div>

                {/* Random Number Proof */}
                <details className="glass-dark rounded-xl p-4 mb-6 text-left max-w-md mx-auto cursor-pointer">
                    <summary className="font-semibold text-sm text-gray-300 cursor-pointer">
                        🔒 Provably Fair Proof
                    </summary>
                    <div className="mt-4 space-y-2 text-xs">
                        <div>
                            <p className="text-gray-400 mb-1">Random Number:</p>
                            <code className="block bg-black/30 p-2 rounded break-all text-blue-400">
                                {result.randomNumber}
                            </code>
                        </div>
                        <a
                            href={`${NETWORK_CONFIG.blockExplorer}/tx/${result.randomNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <span>View on Explorer</span>
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </details>

                {/* Play Again Button */}
                <button
                    onClick={onPlayAgain}
                    className="btn-primary text-xl px-12 py-4"
                >
                    Play Again
                </button>
            </motion.div>
        </>
    )
}

export default GameResult
