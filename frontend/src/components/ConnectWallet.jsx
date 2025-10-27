import { X, Wallet, Zap, Shield, Sparkles, Flame, AlertCircle, Network } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useConnect, useAccount, useSwitchChain, useChainId } from 'wagmi'
import { useEffect, useState } from 'react'
import { baseSepolia } from 'wagmi/chains'
import { toast } from 'react-hot-toast'

const ConnectWallet = ({ onClose }) => {
    const { connect, connectors, isPending, error } = useConnect()
    const { isConnected } = useAccount()
    const { switchChain } = useSwitchChain()
    const currentChainId = useChainId()
    const [showNetworkWarning, setShowNetworkWarning] = useState(false)

    const isCorrectNetwork = currentChainId === baseSepolia.id

    // Check network after connection
    useEffect(() => {
        if (isConnected && !isCorrectNetwork) {
            setShowNetworkWarning(true)
        } else {
            setShowNetworkWarning(false)
        }
    }, [isConnected, isCorrectNetwork])

    // Auto-close when connected and on correct network
    useEffect(() => {
        if (isConnected && isCorrectNetwork && onClose) {
            setTimeout(() => {
                onClose()
            }, 500)
        }
    }, [isConnected, isCorrectNetwork, onClose])

    const handleConnect = (connector) => {
        try {
            connect({ connector })
        } catch (err) {
            console.error('Connection error:', err)
        }
    }

    const handleSwitchNetwork = async () => {
        try {
            await switchChain({ chainId: baseSepolia.id })
            toast.success('Network switched successfully!', {
                icon: '✅',
                style: {
                    background: '#1f2937',
                    color: '#fff',
                    border: '1px solid #10b981',
                },
            })
            setShowNetworkWarning(false)
        } catch (error) {
            console.error('Network switch error:', error)

            // If network doesn't exist, try to add it
            if (error.code === 4902 || error.message?.includes('Unrecognized chain') || error.message?.includes('does not support programmatic chain')) {
                await handleAddNetwork()
            } else {
                toast.error(error.shortMessage || error.message || 'Failed to switch network', {
                    style: {
                        background: '#1f2937',
                        color: '#fff',
                        border: '1px solid #ef4444',
                    },
                })
            }
        }
    }

    const handleAddNetwork = async () => {
        try {
            if (!window.ethereum) {
                toast.error('Please install MetaMask', {
                    style: {
                        background: '#1f2937',
                        color: '#fff',
                        border: '1px solid #ef4444',
                    },
                })
                return
            }

            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainId: `0x${baseSepolia.id.toString(16)}`,
                        chainName: baseSepolia.name,
                        nativeCurrency: {
                            name: 'ETH',
                            symbol: 'ETH',
                            decimals: 18,
                        },
                        rpcUrls: ['https://sepolia.base.org'],
                        blockExplorerUrls: ['https://sepolia-explorer.base.org'],
                    },
                ],
            })

            toast.success('Base Sepolia added successfully!', {
                icon: '✅',
                style: {
                    background: '#1f2937',
                    color: '#fff',
                    border: '1px solid #10b981',
                },
            })

            setShowNetworkWarning(false)
        } catch (error) {
            console.error('Add network error:', error)
            toast.error(error.message || 'Failed to add network', {
                style: {
                    background: '#1f2937',
                    color: '#fff',
                    border: '1px solid #ef4444',
                },
            })
        }
    }

    const handleClose = (e) => {
        e.stopPropagation()
        if (onClose) onClose()
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.2,
            },
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.2,
            }
        },
    }

    const modalVariants = {
        hidden: { scale: 0.9, y: 20, opacity: 0 },
        visible: {
            scale: 1,
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                damping: 20,
                stiffness: 300,
                delay: 0.1,
            }
        },
        exit: {
            scale: 0.9,
            y: 20,
            opacity: 0,
            transition: {
                duration: 0.2,
            }
        },
    }

    return (
        <AnimatePresence>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
                onClick={handleClose}
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                }}
            >
                {/* Extra dark overlay for more emphasis */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60"
                />

                <motion.div
                    variants={modalVariants}
                    className="relative w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Glow effect behind modal */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-pink-600/30 blur-3xl rounded-3xl" />

                    {/* Main modal */}
                    <div className="relative bg-gradient-to-br from-gray-900 via-purple-950/60 to-gray-900 rounded-2xl border-2 border-purple-500/30 shadow-2xl overflow-hidden">
                        {/* Animated Background Effects */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <motion.div
                                className="absolute top-0 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"
                                animate={{
                                    scale: [1, 1.3, 1],
                                    x: [0, 40, 0],
                                    opacity: [0.3, 0.5, 0.3],
                                }}
                                transition={{
                                    duration: 5,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            />
                            <motion.div
                                className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl"
                                animate={{
                                    scale: [1.3, 1, 1.3],
                                    x: [0, -40, 0],
                                    opacity: [0.5, 0.3, 0.5],
                                }}
                                transition={{
                                    duration: 5,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: 2.5,
                                }}
                            />

                            {/* Floating particles */}
                            {[...Array(10)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 bg-purple-400/50 rounded-full"
                                    initial={{
                                        x: Math.random() * 100 + '%',
                                        y: '100%',
                                    }}
                                    animate={{
                                        y: '-20%',
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

                        {/* Close Button - FIXED */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 z-50 p-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg transition-all duration-200 group border border-gray-700/50 hover:border-gray-600"
                        >
                            <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                        </button>

                        {/* Content */}
                        <div className="relative z-10 p-8">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <motion.div
                                    className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50 relative"
                                    animate={{
                                        boxShadow: [
                                            '0 10px 30px rgba(168, 85, 247, 0.3)',
                                            '0 10px 40px rgba(168, 85, 247, 0.5)',
                                            '0 10px 30px rgba(168, 85, 247, 0.3)',
                                        ],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                    }}
                                >
                                    <Wallet className="w-10 h-10 text-white" />

                                    {/* Pulsing ring */}
                                    <motion.div
                                        className="absolute inset-0 rounded-2xl border-2 border-purple-400"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.5, 0, 0.5],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                        }}
                                    />
                                </motion.div>

                                <motion.h2
                                    className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Connect Wallet
                                </motion.h2>

                                <motion.p
                                    className="text-gray-400 text-sm"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Start playing provably fair Rock Paper Scissors
                                </motion.p>
                            </div>

                            {/* Network Warning */}
                            <AnimatePresence>
                                {showNetworkWarning && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 bg-yellow-900/30 border-2 border-yellow-500/50 rounded-xl">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <h3 className="text-yellow-400 font-bold mb-1 flex items-center gap-2">
                                                        Wrong Network
                                                    </h3>
                                                    <p className="text-yellow-200/80 text-sm mb-3">
                                                        Switch to Base Sepolia to continue
                                                    </p>
                                                    <motion.button
                                                        onClick={handleSwitchNetwork}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2"
                                                    >
                                                        <Network className="w-4 h-4" />
                                                        Switch to Base Sepolia
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Wallet Options */}
                            <motion.div
                                className="space-y-3 mb-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                {connectors.map((connector, index) => (
                                    <motion.button
                                        key={connector.uid}
                                        onClick={() => handleConnect(connector)}
                                        disabled={isPending}
                                        className="w-full p-4 bg-gray-800/50 hover:bg-gray-700/60 border-2 border-purple-500/30 hover:border-purple-400/60 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                                        whileHover={{ scale: isPending ? 1 : 1.02, y: -2 }}
                                        whileTap={{ scale: isPending ? 1 : 0.98 }}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                    >
                                        {/* Hover gradient effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-pink-600/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="relative flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                                                    <Wallet className="w-6 h-6 text-white" />
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
                                            <motion.div
                                                animate={{ rotate: [0, 10, -10, 0] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                <Sparkles className="w-5 h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </motion.div>
                                        </div>
                                    </motion.button>
                                ))}
                            </motion.div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -10, height: 0 }}
                                        className="mb-6 p-4 bg-red-900/30 border-2 border-red-500/30 rounded-lg"
                                    >
                                        <p className="text-red-400 text-sm font-medium">{error.message}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Features */}
                            <motion.div
                                className="space-y-3 text-sm bg-black/20 rounded-xl p-4 border border-purple-500/20"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <div className="flex items-start gap-3 text-gray-400">
                                    <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-semibold text-white">Lightning-fast gameplay</div>
                                        <div className="text-xs">Powered by Base Sepolia testnet</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-gray-400">
                                    <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-semibold text-white">Verifiable randomness</div>
                                        <div className="text-xs">Via Pyth Entropy oracle</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-gray-400">
                                    <Flame className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-semibold text-white">95% payout ratio</div>
                                        <div className="text-xs">Only 5% house edge</div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Terms */}
                            <motion.p
                                className="text-xs text-gray-600 text-center mt-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                By connecting, you agree to our Terms of Service
                            </motion.p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default ConnectWallet
