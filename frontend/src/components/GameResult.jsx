import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, X, Flame, Sparkles, Zap, ExternalLink } from 'lucide-react'
import { formatEther } from 'viem'
import { CHOICE_NAMES, RESULT_NAMES } from '../config/contracts'
import { NETWORK_CONFIG } from '../config/wagmi'
import confetti from 'canvas-confetti'
import { useEffect } from 'react'
import { soundManager } from '../utils/soundManager'

const choiceEmojis = {
    1: '✊',
    2: '✋',
    3: '✌️',
}

const GameResult = ({ result, onClose, onPlayAgain }) => {
    if (!result) return null

    const { playerChoice, houseChoice, result: gameResult, betAmount, payout, hash } = result

    const isWin = gameResult === 1
    const isLoss = gameResult === 2
    const isDraw = gameResult === 3

    // Play sound and trigger confetti on mount
    useEffect(() => {
        // Play appropriate sound
        if (isWin) {
            soundManager.play('win')
            // Fire confetti
            const duration = 3000
            const end = Date.now() + duration
            const colors = ['#a855f7', '#ec4899', '#f59e0b', '#10b981']

            ;(function frame() {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors,
                })
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors,
                })

                if (Date.now() < end) {
                    requestAnimationFrame(frame)
                }
            })()
        } else if (isLoss) {
            soundManager.play('loss')
        } else {
            soundManager.play('draw')
        }
    }, [isWin, isLoss])

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    exit={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                    transition={{ type: 'spring', duration: 0.8, bounce: 0.4 }}
                    className="relative max-w-2xl w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Background Glow */}
                    <div
                        className={`absolute inset-0 rounded-3xl blur-3xl opacity-50 ${
                            isWin ? 'bg-green-500' : isLoss ? 'bg-red-500' : 'bg-yellow-500'
                        }`}
                    />

                    {/* Main Card */}
                    <div
                        className={`relative bg-gradient-to-br ${
                            isWin
                                ? 'from-green-900/90 to-emerald-900/90'
                                : isLoss
                                    ? 'from-red-900/90 to-rose-900/90'
                                    : 'from-yellow-900/90 to-orange-900/90'
                        } backdrop-blur-xl border-2 ${
                            isWin
                                ? 'border-green-500/50'
                                : isLoss
                                    ? 'border-red-500/50'
                                    : 'border-yellow-500/50'
                        } rounded-3xl p-8 shadow-2xl overflow-hidden`}
                    >
                        {/* Animated Particles Background */}
                        {isWin && (
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                {[...Array(20)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                                        initial={{
                                            x: Math.random() * 100 + '%',
                                            y: '100%',
                                            opacity: 0,
                                        }}
                                        animate={{
                                            y: '-20%',
                                            opacity: [0, 1, 0],
                                        }}
                                        transition={{
                                            duration: Math.random() * 2 + 2,
                                            repeat: Infinity,
                                            delay: Math.random() * 2,
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>

                        {/* Result Icon & Text */}
                        <div className="text-center mb-8">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.3, type: 'spring', bounce: 0.6 }}
                                className="inline-block mb-4"
                            >
                                {isWin && (
                                    <div className="relative">
                                        <Trophy className="w-24 h-24 text-yellow-400 drop-shadow-2xl" />
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            <Sparkles className="w-8 h-8 text-yellow-300" />
                                        </motion.div>
                                    </div>
                                )}
                                {isLoss && <div className="text-8xl">💀</div>}
                                {isDraw && <div className="text-8xl">🤝</div>}
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className={`text-5xl font-black mb-2 ${
                                    isWin ? 'text-green-400' : isLoss ? 'text-red-400' : 'text-yellow-400'
                                }`}
                            >
                                {isWin ? 'VICTORY!' : isLoss ? 'DEFEATED!' : 'DRAW!'}
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-white/80 text-lg"
                            >
                                {isWin
                                    ? '🎉 You crushed the house!'
                                    : isLoss
                                        ? '💔 Better luck next time!'
                                        : '🤷 Nobody wins this round!'}
                            </motion.p>
                        </div>

                        {/* Choices Display */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="grid grid-cols-2 gap-6 mb-6"
                        >
                            {/* Player Choice */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <div className="text-sm text-white/60 mb-2">You</div>
                                <div className="text-6xl mb-2">{choiceEmojis[playerChoice]}</div>
                                <div className="text-xl font-bold text-white">
                                    {CHOICE_NAMES[playerChoice] || 'Unknown'}
                                </div>
                            </div>

                            {/* House Choice */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <div className="text-sm text-white/60 mb-2">House</div>
                                <div className="text-6xl mb-2">{choiceEmojis[houseChoice]}</div>
                                <div className="text-xl font-bold text-white">
                                    {CHOICE_NAMES[houseChoice] || 'Unknown'}
                                </div>
                            </div>
                        </motion.div>

                        {/* Payout Info */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7, type: 'spring' }}
                            className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 mb-6"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-white/80">Bet Amount:</span>
                                <span className="text-white font-bold">{formatEther(betAmount)} ETH</span>
                            </div>
                            {isWin && (
                                <>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-white/80">Payout:</span>
                                        <span className="text-green-400 font-bold">{formatEther(payout)} ETH</span>
                                    </div>
                                    <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-3" />
                                    <div className="flex items-center justify-between">
                    <span className="text-white font-semibold flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      Net Profit:
                    </span>
                                        <motion.span
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                                            className="text-2xl text-green-400 font-black"
                                        >
                                            +{formatEther(payout - betAmount)} ETH
                                        </motion.span>
                                    </div>
                                </>
                            )}
                            {isLoss && (
                                <div className="flex items-center justify-between">
                                    <span className="text-white font-semibold">Net Loss:</span>
                                    <span className="text-2xl text-red-400 font-black">
                    -{formatEther(betAmount)} ETH
                  </span>
                                </div>
                            )}
                        </motion.div>

                        {/* Transaction Link */}
                        {hash && (
                            <motion.a
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                href={`${NETWORK_CONFIG.blockExplorer}/tx/${hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-6"
                            >
                                <ExternalLink className="w-4 h-4" />
                                View Transaction
                            </motion.a>
                        )}

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            <button
                                onClick={onPlayAgain}
                                className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <Flame className="w-5 h-5" />
                                Play Again
                            </button>
                            <button
                                onClick={onClose}
                                className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
                            >
                                Close
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default GameResult
