import { X, Wallet, Zap, Shield, TrendingUp, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useConnect, useAccount } from 'wagmi'
import { useEffect } from 'react'

const ConnectWallet = ({ onClose }) => {
    const { connect, connectors, isPending, error } = useConnect()
    const { isConnected } = useAccount()

    // Auto-close when connected
    useEffect(() => {
        if (isConnected && onClose) {
            setTimeout(() => {
                onClose()
            }, 500)
        }
    }, [isConnected, onClose])

    const handleConnect = (connector) => {
        try {
            connect({ connector })
        } catch (err) {
            console.error('Connection error:', err)
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.3,
                staggerChildren: 0.1,
            },
        },
        exit: { opacity: 0 },
    }

    const modalVariants = {
        hidden: { scale: 0.8, y: 50, opacity: 0 },
        visible: {
            scale: 1,
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                damping: 25,
                stiffness: 300,
            }
        },
        exit: { scale: 0.8, y: 50, opacity: 0 },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    }

    return (
        <AnimatePresence>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80"
                onClick={onClose}
            >
                <motion.div
                    variants={modalVariants}
                    className="relative w-full max-w-lg bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Animated Background */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            className="absolute top-0 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"
                            animate={{
                                scale: [1, 1.2, 1],
                                x: [0, 30, 0],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                            }}
                        />
                        <motion.div
                            className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl"
                            animate={{
                                scale: [1.2, 1, 1.2],
                                x: [0, -30, 0],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                delay: 2.5,
                            }}
                        />
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400 hover:text-white" />
                    </button>

                    {/* Content */}
                    <div className="relative z-10 p-8">
                        {/* Header */}
                        <motion.div variants={itemVariants} className="text-center mb-8">
                            <motion.div
                                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50"
                                animate={{
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                }}
                            >
                                <Wallet className="w-8 h-8 text-white" />
                            </motion.div>
                            <h2 className="text-3xl font-black text-white mb-2">Connect Wallet</h2>
                            <p className="text-gray-400">
                                Connect your wallet to start playing provably fair Rock Paper Scissors
                            </p>
                        </motion.div>

                        {/* Wallet Options */}
                        <motion.div variants={itemVariants} className="space-y-3 mb-6">
                            {connectors.map((connector) => (
                                <motion.button
                                    key={connector.uid}
                                    onClick={() => handleConnect(connector)}
                                    disabled={isPending}
                                    className="w-full p-4 bg-gray-800/20 hover:bg-gray-700/50 border border-purple-500/30 hover:border-purple-400/50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                                    whileHover={{ scale: isPending ? 1 : 1.02 }}
                                    whileTap={{ scale: isPending ? 1 : 0.98 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                                                <Wallet className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-white group-hover:text-purple-300 transition-colors">
                                                    {connector.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {isPending ? 'Connecting...' : 'Click to connect'}
                                                </div>
                                            </div>
                                        </div>
                                        <Sparkles className="w-5 h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </motion.button>
                            ))}
                        </motion.div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-3 bg-red-900/30 border border-red-500/30 rounded-lg"
                            >
                                <p className="text-red-400 text-sm">{error.message}</p>
                            </motion.div>
                        )}

                        {/* Features */}
                        <motion.div variants={itemVariants} className="space-y-3 text-sm">
                            <div className="flex items-start gap-3 text-gray-400">
                                <Zap className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-semibold text-white">Lightning-fast gameplay</div>
                                    <div>Powered by Base Sepolia</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-gray-400">
                                <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-semibold text-white">Verifiable randomness</div>
                                    <div>Via Pyth Entropy oracle</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-gray-400">
                                <TrendingUp className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-semibold text-white">95% payout ratio</div>
                                    <div>Low house edge</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Terms */}
                        <motion.p variants={itemVariants} className="text-xs text-gray-500 text-center mt-6">
                            By connecting, you agree to our Terms of Service
                        </motion.p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default ConnectWallet
