import { motion } from 'framer-motion'
import { CHOICES } from '../config/contracts'

const choices = [
    {
        id: CHOICES.ROCK,
        name: 'Rock',
        emoji: '✊',
        color: 'from-red-500 to-orange-600',
        description: 'Crushes Scissors'
    },
    {
        id: CHOICES.PAPER,
        name: 'Paper',
        emoji: '✋',
        color: 'from-blue-500 to-cyan-600',
        description: 'Covers Rock'
    },
    {
        id: CHOICES.SCISSORS,
        name: 'Scissors',
        emoji: '✌️',
        color: 'from-purple-500 to-pink-600',
        description: 'Cuts Paper'
    },
]

const ChoiceSelector = ({ selected, onSelect, disabled }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 my-8">
            {choices.map((choice, index) => (
                <motion.button
                    key={choice.id}
                    onClick={() => !disabled && onSelect(choice.id)}
                    disabled={disabled}
                    className={`choice-button ${selected === choice.id ? 'selected' : ''}`}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: disabled ? 1 : 1.05 }}
                    whileTap={{ scale: disabled ? 1 : 0.95 }}
                >
                    {/* Glow effect */}
                    {selected === choice.id && (
                        <motion.div
                            className={`absolute inset-0 bg-gradient-to-r ${choice.color} opacity-20 blur-xl rounded-2xl`}
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.2, 0.3, 0.2],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                            }}
                        />
                    )}

                    <div className="relative z-10">
                        {/* Emoji */}
                        <motion.div
                            className="text-6xl md:text-7xl mb-4"
                            animate={selected === choice.id ? {
                                rotate: [0, -10, 10, -10, 0],
                                scale: [1, 1.1, 1],
                            } : {}}
                            transition={{
                                duration: 0.5,
                                repeat: selected === choice.id ? Infinity : 0,
                                repeatDelay: 1,
                            }}
                        >
                            {choice.emoji}
                        </motion.div>

                        {/* Name */}
                        <h3 className="text-xl md:text-2xl font-bold mb-2">
                            {choice.name}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-400">
                            {choice.description}
                        </p>

                        {/* Selected indicator */}
                        {selected === choice.id && (
                            <motion.div
                                className="mt-4 flex items-center justify-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                            >
                                <div className={`px-4 py-1 rounded-full bg-gradient-to-r ${choice.color} text-white text-sm font-semibold`}>
                                    Selected
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.button>
            ))}
        </div>
    )
}

export default ChoiceSelector
