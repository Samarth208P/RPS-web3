import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { soundManager } from '../utils/soundManager'
import { Zap, Flame, Sparkles, Target } from 'lucide-react'

const choiceEmojis = {
    1: '✊',
    2: '✋',
    3: '✌️',
}

const choiceNames = {
    1: 'ROCK',
    2: 'PAPER',
    3: 'SCISSORS',
}

const BattleAnimation = ({ playerChoice, houseChoice, onComplete }) => {
    const [shakeCount, setShakeCount] = useState(0)
    const [showResult, setShowResult] = useState(false)
    const [totalShakes, setTotalShakes] = useState(0)

    useEffect(() => {
        soundManager.play('shake')

        const shakeInterval = setInterval(() => {
            setShakeCount((prev) => {
                const newCount = (prev + 1) % 3
                setTotalShakes((t) => t + 1)

                if (newCount === 0) {
                    soundManager.play('shake')
                }

                return newCount
            })
        }, 500)

        return () => clearInterval(shakeInterval)
    }, [])

    useEffect(() => {
        if (houseChoice && !showResult) {
            const timeout = setTimeout(() => {
                soundManager.play('reveal')
                setShowResult(true)
                setTimeout(() => {
                    if (onComplete) onComplete()
                }, 1500)
            }, 500)

            return () => clearTimeout(timeout)
        }
    }, [houseChoice, showResult, onComplete])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
            style={{ isolation: 'isolate' }}
        >
            {/* Solid Background - covers everything */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/90 to-black" />

            {/* Animated Grid */}
            <div className="absolute inset-0 opacity-20">
                <motion.div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
              linear-gradient(to right, rgba(168, 85, 247, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(168, 85, 247, 0.3) 1px, transparent 1px)
            `,
                        backgroundSize: '50px 50px',
                    }}
                    animate={{
                        backgroundPosition: ['0px 0px', '50px 50px'],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            </div>

            {/* Glowing Orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.5, 1],
                        x: [0, 50, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/30 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        x: [0, -50, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                />
            </div>

            {/* Floating Particles */}
            {!showResult && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(15)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-purple-400 rounded-full"
                            initial={{
                                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                                y: typeof window !== 'undefined' ? window.innerHeight + 50 : 1000,
                            }}
                            animate={{
                                y: -50,
                                opacity: [0, 1, 0],
                            }}
                            transition={{
                                duration: Math.random() * 3 + 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Main Container - Centered Content */}
            <div className="relative w-full h-full flex flex-col items-center justify-center px-4 py-8">
                {/* Title Section */}
                <div className="absolute top-12 left-0 right-0 flex justify-center z-10">
                    <AnimatePresence mode="wait">
                        {!showResult ? (
                            <motion.div
                                key="battle-title"
                                initial={{ opacity: 0, y: -50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="text-center"
                            >
                                <motion.div
                                    className="relative inline-block"
                                    animate={{
                                        scale: [1, 1.05, 1],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <motion.div
                                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 drop-shadow-2xl"
                                        animate={{
                                            backgroundPosition: ['0%', '100%', '0%'],
                                        }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        style={{ backgroundSize: '200% 100%' }}
                                    >
                                        ROCK • PAPER • SCISSORS!
                                    </motion.div>

                                    <motion.div
                                        className="absolute inset-0 blur-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-50"
                                        animate={{
                                            opacity: [0.3, 0.6, 0.3],
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </motion.div>

                                <motion.div
                                    className="text-sm sm:text-base md:text-lg text-purple-300 mt-3 font-bold flex items-center justify-center gap-3"
                                    animate={{ opacity: [0.6, 1, 0.6] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <Target className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" style={{ animationDuration: '3s' }} />
                                    <span>Waiting for blockchain...</span>
                                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                                </motion.div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="reveal-title"
                                initial={{ opacity: 0, scale: 0.5, y: -50 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                            >
                                <motion.div
                                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-yellow-400 drop-shadow-2xl"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        textShadow: [
                                            '0 0 20px rgba(250, 204, 21, 0.5)',
                                            '0 0 40px rgba(250, 204, 21, 0.8)',
                                            '0 0 20px rgba(250, 204, 21, 0.5)',
                                        ]
                                    }}
                                    transition={{ duration: 0.5, repeat: 2 }}
                                >
                                    REVEAL!
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Battle Arena - Centered */}
                <div className="flex items-center justify-center gap-4 sm:gap-8 md:gap-12 lg:gap-20 w-full max-w-7xl">
                    {/* Player Side */}
                    <motion.div
                        className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6 flex-1 max-w-xs"
                        initial={{ x: -200, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: 'spring', damping: 20 }}
                    >
                        {/* Player Badge */}
                        <motion.div
                            className="relative"
                            animate={showResult ? { scale: 1 } : { scale: [1, 1.08, 1] }}
                            transition={{ duration: 1, repeat: showResult ? 0 : Infinity }}
                        >
                            <div className="relative px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 rounded-full border-2 border-purple-300 shadow-lg shadow-purple-500/50">
                <span className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-wider">
                  YOU
                </span>

                                <motion.div
                                    className="absolute inset-0 rounded-full border-2 border-purple-400"
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.5, 0, 0.5],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </div>
                        </motion.div>

                        {/* Player Hand */}
                        <div className="relative">
                            <motion.div
                                className="absolute inset-0 bg-purple-500/40 rounded-full blur-3xl"
                                animate={
                                    showResult
                                        ? { scale: [1, 1.8, 1], opacity: [0.4, 0.8, 0.4] }
                                        : { scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }
                                }
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />

                            <motion.div
                                className="relative z-10"
                                animate={
                                    !showResult
                                        ? {
                                            y: [0, -60, 0],
                                            rotate: [0, -25, 0],
                                            scale: [1, 0.95, 1],
                                        }
                                        : {
                                            scale: [1, 1.5, 1.2],
                                            rotate: [0, -15, 5, 0],
                                        }
                                }
                                transition={{
                                    duration: 0.5,
                                    times: [0, 0.5, 1],
                                    repeat: showResult ? 0 : Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                <motion.div
                                    className="text-[100px] sm:text-[140px] md:text-[180px] lg:text-[220px] drop-shadow-2xl"
                                    style={{
                                        filter: 'drop-shadow(0 0 30px rgba(168, 85, 247, 0.8))',
                                    }}
                                >
                                    {showResult ? choiceEmojis[playerChoice] : '✊'}
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Choice Name */}
                        <AnimatePresence>
                            {showResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ type: 'spring', damping: 15 }}
                                    className="text-center"
                                >
                                    <motion.div
                                        className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-lg"
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 0.5, repeat: 2 }}
                                    >
                                        {choiceNames[playerChoice]}
                                    </motion.div>
                                    <div className="text-xs sm:text-sm md:text-base text-purple-300 font-semibold">
                                        Your Choice
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* VS Section */}
                    <div className="relative flex flex-col items-center gap-4 sm:gap-6">
                        <motion.div
                            className="relative"
                            animate={{
                                scale: [1, 1.3, 1],
                                rotate: [0, 10, -10, 0],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                            }}
                        >
                            {!showResult && (
                                <>
                                    <motion.div
                                        className="absolute inset-0 -m-6 sm:-m-8 border-4 border-purple-500/30 rounded-full"
                                        animate={{
                                            scale: [1, 2, 1],
                                            opacity: [0.6, 0, 0.6],
                                            rotate: [0, 180, 360],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                        }}
                                    />
                                    <motion.div
                                        className="absolute inset-0 -m-6 sm:-m-8 border-4 border-pink-500/30 rounded-full"
                                        animate={{
                                            scale: [1, 2, 1],
                                            opacity: [0.6, 0, 0.6],
                                            rotate: [360, 180, 0],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            delay: 1,
                                        }}
                                    />
                                </>
                            )}

                            <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-purple-500 drop-shadow-2xl">
                  VS
                </span>

                                <motion.div
                                    className="absolute inset-0 blur-xl bg-gradient-to-r from-red-500 via-yellow-400 to-purple-500 opacity-60"
                                    animate={{
                                        opacity: [0.4, 0.8, 0.4],
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                            </div>
                        </motion.div>

                        {!showResult && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center gap-2 sm:gap-3"
                            >
                                <div className="flex gap-2">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="relative"
                                            animate={{
                                                scale: i === shakeCount ? [1, 1.3, 1] : 1,
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Zap
                                                className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 ${
                                                    i <= shakeCount
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-gray-600 fill-gray-600'
                                                }`}
                                            />
                                            {i === shakeCount && (
                                                <motion.div
                                                    className="absolute inset-0"
                                                    initial={{ scale: 1, opacity: 1 }}
                                                    animate={{ scale: 2, opacity: 0 }}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-yellow-400 fill-yellow-400" />
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                                <motion.div
                                    className="text-xs sm:text-sm text-purple-300 font-bold"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    Shake {shakeCount + 1}/3
                                </motion.div>
                            </motion.div>
                        )}
                    </div>

                    {/* House Side */}
                    <motion.div
                        className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6 flex-1 max-w-xs"
                        initial={{ x: 200, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: 'spring', damping: 20 }}
                    >
                        {/* House Badge */}
                        <motion.div
                            className="relative"
                            animate={showResult ? { scale: 1 } : { scale: [1, 1.08, 1] }}
                            transition={{ duration: 1, repeat: showResult ? 0 : Infinity, delay: 0.5 }}
                        >
                            <div className="relative px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-pink-600 via-pink-500 to-pink-600 rounded-full border-2 border-pink-300 shadow-lg shadow-pink-500/50">
                <span className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-wider">
                  HOUSE
                </span>

                                <motion.div
                                    className="absolute inset-0 rounded-full border-2 border-pink-400"
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.5, 0, 0.5],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                />
                            </div>
                        </motion.div>

                        {/* House Hand */}
                        <div className="relative">
                            <motion.div
                                className="absolute inset-0 bg-pink-500/40 rounded-full blur-3xl"
                                animate={
                                    showResult
                                        ? { scale: [1, 1.8, 1], opacity: [0.4, 0.8, 0.4] }
                                        : { scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }
                                }
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                            />

                            <motion.div
                                className="relative z-10 scale-x-[-1]"
                                animate={
                                    !showResult
                                        ? {
                                            y: [0, -60, 0],
                                            rotate: [0, 25, 0],
                                            scale: [1, 0.95, 1],
                                        }
                                        : {
                                            scale: [1, 1.5, 1.2],
                                            rotate: [0, 15, -5, 0],
                                        }
                                }
                                transition={{
                                    duration: 0.5,
                                    times: [0, 0.5, 1],
                                    repeat: showResult ? 0 : Infinity,
                                    ease: 'easeInOut',
                                    delay: 0.1,
                                }}
                            >
                                <motion.div
                                    className="text-[100px] sm:text-[140px] md:text-[180px] lg:text-[220px] drop-shadow-2xl"
                                    style={{
                                        filter: 'drop-shadow(0 0 30px rgba(236, 72, 153, 0.8))',
                                    }}
                                >
                                    {showResult && houseChoice ? choiceEmojis[houseChoice] : '✊'}
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Choice Name */}
                        <AnimatePresence>
                            {showResult && houseChoice && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ type: 'spring', damping: 15 }}
                                    className="text-center"
                                >
                                    <motion.div
                                        className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-lg"
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 0.5, repeat: 2 }}
                                    >
                                        {choiceNames[houseChoice]}
                                    </motion.div>
                                    <div className="text-xs sm:text-sm md:text-base text-pink-300 font-semibold">
                                        House Choice
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Bottom Progress Bar */}
                {!showResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-8 sm:bottom-12 left-0 right-0 flex justify-center"
                    >
                        <div className="flex gap-2 sm:gap-3">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="relative w-16 sm:w-20 md:w-24 h-2 sm:h-3 rounded-full overflow-hidden bg-gray-800/20"
                                    animate={
                                        i === shakeCount
                                            ? {
                                                boxShadow: [
                                                    '0 0 10px rgba(168, 85, 247, 0.5)',
                                                    '0 0 20px rgba(168, 85, 247, 0.8)',
                                                    '0 0 10px rgba(168, 85, 247, 0.5)',
                                                ],
                                            }
                                            : {}
                                    }
                                    transition={{ duration: 0.5 }}
                                >
                                    <motion.div
                                        className={`h-full rounded-full ${
                                            i <= shakeCount
                                                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500'
                                                : 'bg-gray-700'
                                        }`}
                                        animate={
                                            i === shakeCount
                                                ? {
                                                    backgroundPosition: ['0%', '100%', '0%'],
                                                }
                                                : {}
                                        }
                                        transition={{ duration: 1, repeat: Infinity }}
                                        style={{ backgroundSize: '200% 100%' }}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}

export default BattleAnimation
