import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, X, Flame, Sparkles, Zap, ExternalLink, Target } from 'lucide-react'
import { formatEther } from 'viem'
import { CHOICE_NAMES } from '../config/contracts'
import { NETWORK_CONFIG } from '../config/wagmi'
import confetti from 'canvas-confetti'
import { useEffect } from 'react'
import { soundManager } from '../utils/soundManager'

const choiceEmojis = {
    1: '✊',
    2: '✋',
    3: '✌️',
}

const GameResult = ({ result, onClose, currentStreak, gameNumber }) => {
    if (!result) return null

    const { playerChoice, houseChoice, result: gameResult, betAmount, payout, hash } = result

    const isWin = gameResult === 1
    const isLoss = gameResult === 2
    const isDraw = gameResult === 3

    // Play sound and trigger effects on mount
    useEffect(() => {
        if (isWin) {
            soundManager.play('win')
            // Colorful confetti for wins
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
            // Falling red/dark particles for loss
            const duration = 2000
            const end = Date.now() + duration
            const colors = ['#ef4444', '#7f1d1d', '#991b1b', '#450a0a']

            ;(function frame() {
                confetti({
                    particleCount: 2,
                    angle: 90,
                    spread: 45,
                    origin: { x: Math.random() * 0.6 + 0.2, y: 0 },
                    colors: colors,
                    gravity: 1.5,
                    drift: 0,
                    ticks: 200,
                    scalar: 0.8,
                })

                if (Date.now() < end) {
                    requestAnimationFrame(frame)
                }
            })()
        } else {
            soundManager.play('draw')
            // Gentle yellow/white sparkles for draw
            const duration = 2500
            const end = Date.now() + duration
            const colors = ['#fbbf24', '#fcd34d', '#fef3c7', '#ffffff']

            ;(function frame() {
                confetti({
                    particleCount: 1,
                    angle: 90,
                    spread: 360,
                    origin: { x: Math.random(), y: Math.random() * 0.5 },
                    colors: colors,
                    gravity: 0.5,
                    scalar: 0.6,
                    drift: 0,
                    ticks: 100,
                })

                if (Date.now() < end) {
                    requestAnimationFrame(frame)
                }
            })()
        }
    }, [isWin, isLoss, isDraw])

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    exit={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                    transition={{ type: 'spring', duration: 0.8, bounce: 0.4 }}
                    className="relative max-w-md w-full my-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Background Glow */}
                    <div
                        className={`absolute inset-0 rounded-2xl blur-2xl opacity-40 ${
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
                        } rounded-2xl p-6 shadow-2xl overflow-hidden`}
                    >
                        {/* Animated Particles Background */}
                        {isWin && (
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                {[...Array(15)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full"
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

                        {/* Close Button - Top Right */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>

                        {/* Result Icon & Text */}
                        <div className="text-center mb-6">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.3, type: 'spring', bounce: 0.6 }}
                                className="inline-block mb-3"
                            >
                                {isWin && (
                                    <div className="relative">
                                        <Trophy className="w-16 h-16 text-yellow-400 drop-shadow-2xl" />
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            <Sparkles className="w-6 h-6 text-yellow-300" />
                                        </motion.div>
                                    </div>
                                )}
                                {isLoss && <div className="text-6xl">💀</div>}
                                {isDraw && <div className="text-6xl">🤝</div>}
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className={`text-3xl font-black mb-2 ${
                                    isWin ? 'text-green-400' : isLoss ? 'text-red-400' : 'text-yellow-400'
                                }`}
                            >
                                {isWin ? 'VICTORY!' : isLoss ? 'DEFEATED!' : 'DRAW!'}
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-white/80 text-sm"
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
                            className="grid grid-cols-2 gap-4 mb-4"
                        >
                            {/* Player Choice */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="text-xs text-white/60 mb-1">You</div>
                                <div className="text-4xl mb-1">{choiceEmojis[playerChoice]}</div>
                                <div className="text-sm font-bold text-white">
                                    {CHOICE_NAMES[playerChoice] || 'Unknown'}
                                </div>
                            </div>

                            {/* House Choice */}
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="text-xs text-white/60 mb-1">House</div>
                                <div className="text-4xl mb-1">{choiceEmojis[houseChoice]}</div>
                                <div className="text-sm font-bold text-white">
                                    {CHOICE_NAMES[houseChoice] || 'Unknown'}
                                </div>
                            </div>
                        </motion.div>

                        {/* Payout Info */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7, type: 'spring' }}
                            className="bg-black/30 backdrop-blur-sm rounded-xl p-4 mb-4"
                        >
                            <div className="flex items-center justify-between mb-2 text-sm">
                                <span className="text-white/80">Bet Amount:</span>
                                <span className="text-white font-bold">{formatEther(betAmount)} ETH</span>
                            </div>
                            {isWin && (
                                <>
                                    <div className="flex items-center justify-between mb-2 text-sm">
                                        <span className="text-white/80">Payout:</span>
                                        <span className="text-green-400 font-bold">{formatEther(payout)} ETH</span>
                                    </div>
                                    <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-2" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-white font-semibold flex items-center gap-1 text-sm">
                                            <Zap className="w-4 h-4 text-yellow-400" />
                                            Net Profit:
                                        </span>
                                        <motion.span
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                                            className="text-lg text-green-400 font-black"
                                        >
                                            +{formatEther(payout - betAmount)} ETH
                                        </motion.span>
                                    </div>
                                </>
                            )}
                            {isLoss && (
                                <div className="flex items-center justify-between">
                                    <span className="text-white font-semibold text-sm">Net Loss:</span>
                                    <span className="text-lg text-red-400 font-black">
                                        -{formatEther(betAmount)} ETH
                                    </span>
                                </div>
                            )}
                            {isDraw && (
                                <>
                                    <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-2" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-white font-semibold flex items-center gap-1 text-sm">
                                            <span className="text-xl">💰</span>
                                            Bet Returned:
                                        </span>
                                        <span className="text-lg text-yellow-400 font-black">
                                            {formatEther(betAmount)} ETH
                                        </span>
                                    </div>
                                    <div className="text-center mt-2 text-xs text-yellow-300/80">
                                        Your bet was refunded!
                                    </div>
                                </>
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
                                className="flex items-center justify-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-4 text-sm"
                            >
                                <ExternalLink className="w-3 h-3" />
                                View Transaction
                            </motion.a>
                        )}

                        {/* Streak & Game Info - Bottom Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            className="grid grid-cols-2 gap-3"
                        >
                            {/* Streak Info */}
                            <div className={`rounded-lg p-3 border-2 ${
                                isWin
                                    ? 'bg-orange-500/20 border-orange-500/50'
                                    : 'bg-gray-700/20 border-gray-600/50'
                            }`}>
                                <div className="flex items-center justify-center gap-2 h-full">
                                    {isWin ? (
                                        <>
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 0.5, repeat: 3 }}
                                            >
                                                <Flame className="w-6 h-6 text-orange-400" />
                                            </motion.div>
                                            <div className="text-center">
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="text-sm font-bold text-orange-400"
                                                >
                                                    Streak Up!
                                                </motion.div>
                                                <div className="text-xs text-orange-300">Keep going! 🔥</div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-6 h-6 flex items-center justify-center">
                                                <span className="text-2xl">💔</span>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm font-bold text-gray-400">
                                                    Streak Broken
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Game Number */}
                            <div className="bg-purple-500/20 border-2 border-purple-500/50 rounded-lg p-3">
                                <div className="flex flex-col items-center justify-center h-full gap-1">
                                    <div className="flex items-center gap-1">
                                        <Target className="w-4 h-4 text-purple-400" />
                                        <span className="text-xs text-white/80 font-semibold">Game #</span>
                                    </div>
                                    <div className="text-2xl font-black text-purple-400">
                                        {gameNumber || result.gameId || '---'}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default GameResult
