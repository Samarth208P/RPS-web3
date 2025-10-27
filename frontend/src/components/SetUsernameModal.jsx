import { useState, useEffect, useRef } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { motion } from 'framer-motion'
import { User, Sparkles, Zap, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { CONTRACT_ADDRESS, ROCK_PAPER_SCISSORS_ABI } from '../config/contracts'

const SetUsernameModal = ({ onSuccess, canClose = false }) => {
    const { address } = useAccount()
    const [username, setUsername] = useState('')
    const [error, setError] = useState('')
    const hasSucceededRef = useRef(false)

    const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const validateUsername = (name) => {
        if (!name) return 'Username is required'
        if (name.length < 3) return 'Username must be at least 3 characters'
        if (name.length > 20) return 'Username must be less than 20 characters'
        if (!/^[a-zA-Z0-9_]+$/.test(name)) return 'Only letters, numbers and underscore allowed'
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const validationError = validateUsername(username)
        if (validationError) {
            setError(validationError)
            return
        }

        setError('')

        try {
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: ROCK_PAPER_SCISSORS_ABI,
                functionName: 'setUsername',
                args: [username],
            })
        } catch (err) {
            console.error('Error setting username:', err)
            toast.error('Failed to set username', {
                style: {
                    background: '#1f2937',
                    color: '#fff',
                    border: '1px solid #ef4444',
                },
            })
        }
    }

    // Handle success - only trigger once using ref
    useEffect(() => {
        if (isSuccess && !hasSucceededRef.current) {
            hasSucceededRef.current = true

            console.log('✅ Username set successfully for:', address)

            toast.success(`Welcome, ${username}! 🎉`, {
                duration: 3000,
                style: {
                    background: '#1f2937',
                    color: '#fff',
                    border: '1px solid #10b981',
                },
            })

            // Wait for blockchain state to update
            setTimeout(() => {
                if (onSuccess) onSuccess()
            }, 1000)
        }
    }, [isSuccess, username, onSuccess, address])

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-md"
            >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-pink-600/30 blur-3xl rounded-3xl" />

                {/* Main card */}
                <div className="relative bg-gradient-to-br from-gray-900 via-purple-950/60 to-gray-900 rounded-2xl border-2 border-purple-500/30 shadow-2xl overflow-hidden">
                    {/* Animated background */}
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
                            }}
                        />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-8">
                        {/* Icon */}
                        <motion.div
                            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50"
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
                            <User className="w-10 h-10 text-white" />
                        </motion.div>

                        {/* Title */}
                        <h2 className="text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                            Choose Your Username
                        </h2>
                        <p className="text-gray-400 text-center text-sm mb-6">
                            This will be visible on the leaderboard
                        </p>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value)
                                        setError('')
                                    }}
                                    placeholder="Enter username"
                                    disabled={isPending || isConfirming || hasSucceededRef.current}
                                    className="w-full px-4 py-3 bg-gray-800/50 border-2 border-purple-500/30 focus:border-purple-400 rounded-xl text-white placeholder-gray-500 transition-all outline-none disabled:opacity-50"
                                    maxLength={20}
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-red-400 text-sm mt-2">{error}</p>
                                )}
                                {writeError && (
                                    <p className="text-red-400 text-sm mt-2">
                                        {writeError.shortMessage || writeError.message}
                                    </p>
                                )}
                            </div>

                            {/* Requirements */}
                            <div className="bg-black/20 rounded-xl p-4 space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Check className="w-4 h-4" />
                                    <span>3-20 characters</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Check className="w-4 h-4" />
                                    <span>Letters, numbers, underscore only</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Check className="w-4 h-4" />
                                    <span>Cannot be changed later</span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={isPending || isConfirming || hasSucceededRef.current || !username}
                                whileHover={{ scale: isPending || isConfirming || hasSucceededRef.current ? 1 : 1.02 }}
                                whileTap={{ scale: isPending || isConfirming || hasSucceededRef.current ? 1 : 0.98 }}
                                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-purple-500/50 disabled:shadow-none disabled:cursor-not-allowed"
                            >
                                {isConfirming ? (
                                    <>
                                        <Zap className="w-5 h-5 animate-pulse" />
                                        Setting Username...
                                    </>
                                ) : isPending ? (
                                    <>
                                        <Zap className="w-5 h-5 animate-pulse" />
                                        Confirm in Wallet...
                                    </>
                                ) : hasSucceededRef.current ? (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Username Set!
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Set Username
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Info */}
                        <p className="text-xs text-gray-600 text-center mt-6">
                            Your username will be stored on the blockchain and cannot be changed
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default SetUsernameModal
