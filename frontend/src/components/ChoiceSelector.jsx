import { motion } from 'framer-motion'
import { CHOICES } from '../../../../Project/rock-paper-scissors-web3/frontend/src/config/contracts.js'
import { Sparkles } from 'lucide-react'

const choices = [
    {
        id: CHOICES.ROCK,
        name: 'Rock',
        emoji: '✊',
        color: 'from-red-500 to-orange-600',
        hoverGlow: 'shadow-red-500/50',
        description: 'Crushes Scissors',
    },
    {
        id: CHOICES.PAPER,
        name: 'Paper',
        emoji: '✋',
        color: 'from-blue-500 to-cyan-600',
        hoverGlow: 'shadow-blue-500/50',
        description: 'Covers Rock',
    },
    {
        id: CHOICES.SCISSORS,
        name: 'Scissors',
        emoji: '✌️',
        color: 'from-purple-500 to-pink-600',
        hoverGlow: 'shadow-purple-500/50',
        description: 'Cuts Paper',
    },
]

const ChoiceSelector = ({ selected, onSelect, disabled }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {choices.map((choice) => {
                const isSelected = selected === choice.id

                return (
                    <motion.button
                        key={choice.id}
                        onClick={() => !disabled && onSelect(choice.id)}
                        disabled={disabled}
                        className={`relative group overflow-hidden rounded-2xl p-6 transition-all duration-200 ${
                            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                        whileHover={!disabled ? { scale: 1.05, y: -5 } : {}}
                        whileTap={!disabled ? { scale: 0.98 } : {}}
                        transition={{ duration: 0.15 }}
                        animate={
                            isSelected
                                ? {
                                    boxShadow: [
                                        '0 0 20px rgba(168, 85, 247, 0.4)',
                                        '0 0 40px rgba(168, 85, 247, 0.6)',
                                        '0 0 20px rgba(168, 85, 247, 0.4)',
                                    ],
                                }
                                : {}
                        }
                    >
                        {/* Animated Background */}
                        <div
                            className={`absolute inset-0 bg-gradient-to-br ${choice.color} opacity-${
                                isSelected ? '100' : '80'
                            } transition-opacity duration-150 ${
                                !disabled && 'group-hover:opacity-100'
                            }`}
                        />

                        {/* Glow Effect on Hover */}
                        {!disabled && (
                            <div
                                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 blur-xl ${choice.hoverGlow}`}
                            />
                        )}

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center gap-3">
                            {/* Emoji with Tilt Animation ONLY when selected */}
                            <motion.div
                                className="text-6xl"
                                animate={
                                    isSelected
                                        ? {
                                            rotate: [-10, 10, -10, 0],
                                        }
                                        : {}
                                }
                                transition={{
                                    duration: 0.6,
                                    repeat: isSelected ? Infinity : 0,
                                    repeatDelay: 1,
                                }}
                                whileHover={!disabled ? { scale: 1.2 } : {}}
                            >
                                {choice.emoji}
                            </motion.div>

                            {/* Name */}
                            <div className="text-xl font-bold text-white drop-shadow-lg">
                                {choice.name}
                            </div>

                            {/* Description */}
                            <div className="text-sm text-white/80 font-medium">
                                {choice.description}
                            </div>

                            {/* Selected Indicator */}
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg"
                                >
                                    <Sparkles className="w-4 h-4 text-white" />
                                </motion.div>
                            )}
                        </div>

                        {/* Shine Effect */}
                        {!disabled && (
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.4 }}
                            />
                        )}
                    </motion.button>
                )
            })}
        </div>
    )
}

export default ChoiceSelector
