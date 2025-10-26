import { Wallet, Zap, Shield, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useConnect } from 'wagmi'

const ConnectWallet = () => {
    const { connect, connectors, isPending } = useConnect()

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.2,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-2xl w-full"
            >
                {/* Main Card */}
                <motion.div variants={itemVariants} className="card text-center mb-8">
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 animate-float">
                            <span className="text-5xl">🎮</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-3 text-glow">
                            Welcome to RPS
                        </h2>
                        <p className="text-gray-300 text-lg">
                            Connect your wallet to start playing provably fair Rock Paper Scissors
                        </p>
                    </div>

                    {/* Connect Buttons */}
                    <div className="space-y-3 mb-6">
                        {connectors.map((connector) => (
                            <button
                                key={connector.id}
                                onClick={() => connect({ connector })}
                                disabled={isPending}
                                className="w-full btn-primary flex items-center justify-center space-x-3 text-lg py-4"
                            >
                                <Wallet className="w-6 h-6" />
                                <span>
                  {isPending ? 'Connecting...' : `Connect with ${connector.name}`}
                </span>
                            </button>
                        ))}
                    </div>

                    <p className="text-sm text-gray-400">
                        By connecting, you agree to our Terms of Service
                    </p>
                </motion.div>

                {/* Features */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    <div className="card text-center hover:scale-105 transition-transform duration-300">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-xl mb-3">
                            <Zap className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="font-bold mb-2">Instant Games</h3>
                        <p className="text-sm text-gray-400">
                            Lightning-fast gameplay powered by Base
                        </p>
                    </div>

                    <div className="card text-center hover:scale-105 transition-transform duration-300">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-xl mb-3">
                            <Shield className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="font-bold mb-2">Provably Fair</h3>
                        <p className="text-sm text-gray-400">
                            Verifiable randomness via Pyth Entropy
                        </p>
                    </div>

                    <div className="card text-center hover:scale-105 transition-transform duration-300">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-xl mb-3">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                        <h3 className="font-bold mb-2">Win Big</h3>
                        <p className="text-sm text-gray-400">
                            95% payout ratio with low house edge
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}

export default ConnectWallet
