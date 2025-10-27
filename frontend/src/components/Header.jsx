import { useState, useEffect } from 'react'
import { Wallet, TrendingUp, ExternalLink, Shield, Volume2, VolumeX, User, Edit2, Gift, X } from 'lucide-react'
import { useAccount, useDisconnect, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther } from 'viem'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { NETWORK_CONFIG } from '../config/wagmi'
import { CONTRACT_ADDRESS, ROCK_PAPER_SCISSORS_ABI } from '../config/contracts'
import { soundManager } from '../utils/soundManager'

const Header = ({ onConnect }) => {
    const { address, isConnected } = useAccount()
    const { disconnect } = useDisconnect()
    const { data: balance } = useBalance({ address })

    const [isMusicPlaying, setIsMusicPlaying] = useState(false)
    const [showUsernameModal, setShowUsernameModal] = useState(false)
    const [usernameInput, setUsernameInput] = useState('')
    const [showBonusModal, setShowBonusModal] = useState(false)

    // Read username
    const { data: currentUsername, refetch: refetchUsername } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ROCK_PAPER_SCISSORS_ABI,
        functionName: 'usernames',
        args: [address],
        enabled: !!address,
    })

    // Read welcome bonus status
    const { data: hasClaimed } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ROCK_PAPER_SCISSORS_ABI,
        functionName: 'hasClaimedWelcomeBonus',
        args: [address],
        enabled: !!address,
    })

    const { data: bonusAmount } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ROCK_PAPER_SCISSORS_ABI,
        functionName: 'welcomeBonusAmount',
    })

    const { data: bonusEnabled } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ROCK_PAPER_SCISSORS_ABI,
        functionName: 'welcomeBonusEnabled',
    })

    // Set username
    const { writeContract: setUsername, data: usernameHash } = useWriteContract()
    const { isLoading: isSettingUsername, isSuccess: usernameSuccess } = useWaitForTransactionReceipt({
        hash: usernameHash,
    })

    // Claim bonus
    const { writeContract: claimBonus, data: bonusHash } = useWriteContract()
    const { isLoading: isClaimingBonus, isSuccess: bonusSuccess } = useWaitForTransactionReceipt({
        hash: bonusHash,
    })

    useEffect(() => {
        if (usernameSuccess) {
            toast.success('Username set successfully!')
            setShowUsernameModal(false)
            setUsernameInput('')
            refetchUsername()
        }
    }, [usernameSuccess, refetchUsername])

    useEffect(() => {
        if (bonusSuccess) {
            toast.success(`Welcome bonus claimed! ${formatEther(bonusAmount || 0n)} ETH added`)
            setShowBonusModal(false)
        }
    }, [bonusSuccess, bonusAmount])

    const formatAddress = (addr) => {
        if (!addr) return ''
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    const toggleMusic = () => {
        const isPlaying = soundManager.toggleMusic()
        setIsMusicPlaying(isPlaying)
    }

    const handleSetUsername = () => {
        if (usernameInput.length < 3 || usernameInput.length > 15) {
            toast.error('Username must be 3-15 characters')
            return
        }

        setUsername({
            address: CONTRACT_ADDRESS,
            abi: ROCK_PAPER_SCISSORS_ABI,
            functionName: 'setUsername',
            args: [usernameInput],
        })
    }

    const handleClaimBonus = () => {
        claimBonus({
            address: CONTRACT_ADDRESS,
            abi: ROCK_PAPER_SCISSORS_ABI,
            functionName: 'claimWelcomeBonus',
        })
    }

    // Show gift icon if eligible for bonus
    const showGiftIcon = isConnected && !hasClaimed && bonusEnabled

    return (
        <>
            <header className="border-b border-gray-800/30 sticky top-0 pt-3 z-50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo & Title */}
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="w-12 h-12 object-contain"
                            />
                            <div>
                                <h1 className="text-2xl font-bold text-white">Rock Paper Scissors</h1>
                                <p className="text-sm text-gray-400">Powered by Pyth Entropy</p>
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-3">
                            {/* Music Toggle */}
                            <button
                                onClick={toggleMusic}
                                className="p-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg transition-all group"
                                title={isMusicPlaying ? 'Mute Music' : 'Play Music'}
                            >
                                {isMusicPlaying ? (
                                    <Volume2 className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                                ) : (
                                    <VolumeX className="w-5 h-5 text-gray-500 group-hover:text-gray-400" />
                                )}
                            </button>

                            {/* Welcome Bonus Gift Icon */}
                            {showGiftIcon && (
                                <motion.button
                                    onClick={() => setShowBonusModal(true)}
                                    className="relative p-2 bg-green-600/20 hover:bg-green-600/40 border border-green-500/50 rounded-lg transition-all group"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    title="Claim Welcome Bonus"
                                >
                                    <Gift className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                                </motion.button>
                            )}

                            {/* Contract Verification Button */}
                            <a
                                href={`${NETWORK_CONFIG.blockExplorer}/address/${CONTRACT_ADDRESS}#code`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg transition-colors group"
                                title="Verify Smart Contract"
                            >
                                <Shield className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                                    Verify Contract
                                </span>
                                <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-purple-400" />
                            </a>

                            {/* Mobile Contract Button */}
                            <a
                                href={`${NETWORK_CONFIG.blockExplorer}/address/${CONTRACT_ADDRESS}#code`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="md:hidden p-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg transition-colors"
                                title="Verify Contract"
                            >
                                <Shield className="w-5 h-5 text-purple-400" />
                            </a>

                            {/* Username Badge (if set) */}
                            {isConnected && currentUsername && (
                                <button
                                    onClick={() => setShowUsernameModal(true)}
                                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 rounded-lg transition-all group"
                                >
                                    <User className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm font-medium text-purple-300">{currentUsername}</span>
                                    <Edit2 className="w-3 h-3 text-purple-400/60 group-hover:text-purple-300" />
                                </button>
                            )}

                            {/* Balance (if connected) */}
                            {isConnected && balance && (
                                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                    <span className="text-sm font-medium text-white">
                                        {Number(formatEther(balance.value)).toFixed(4)} ETH
                                    </span>
                                </div>
                            )}

                            {/* Wallet Button */}
                            {isConnected ? (
                                <button
                                    onClick={() => disconnect()}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                                >
                                    <Wallet className="w-4 h-4" />
                                    <span className="text-sm font-medium">{formatAddress(address)}</span>
                                </button>
                            ) : (
                                <button
                                    onClick={onConnect}
                                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    <Wallet className="w-4 h-4" />
                                    <span>Connect Wallet</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Username Modal */}
            <AnimatePresence>
                {showUsernameModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowUsernameModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-gray-900 border border-gray-700/50 p-6 rounded-2xl max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-bold flex items-center gap-2">
                                    <User className="text-purple-400" />
                                    Set Username
                                </h3>
                                <button
                                    onClick={() => setShowUsernameModal(false)}
                                    className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-gray-400 text-sm mb-4">
                                Choose a unique username (3-15 characters)
                            </p>

                            {currentUsername && (
                                <div className="mb-4 p-3 bg-purple-600/10 border border-purple-500/20 rounded-lg">
                                    <p className="text-sm text-purple-300">
                                        Current: <span className="font-semibold">{currentUsername}</span>
                                    </p>
                                </div>
                            )}

                            <input
                                type="text"
                                placeholder="Enter username"
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none mb-4 text-white"
                                maxLength={15}
                                disabled={isSettingUsername}
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowUsernameModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all"
                                    disabled={isSettingUsername}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSetUsername}
                                    disabled={isSettingUsername || !usernameInput}
                                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSettingUsername ? 'Setting...' : 'Set Username'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Welcome Bonus Modal */}
            <AnimatePresence>
                {showBonusModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowBonusModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-gray-900 border border-green-500/30 p-6 rounded-2xl max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                    className="inline-block text-6xl mb-4"
                                >
                                    🎁
                                </motion.div>
                                <h3 className="text-2xl font-bold text-green-400 mb-2">
                                    Welcome Bonus!
                                </h3>
                                <p className="text-gray-300 mb-6">
                                    Claim your welcome bonus of <span className="font-bold text-green-400">{formatEther(bonusAmount || 0n)} ETH</span> to start playing!
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowBonusModal(false)}
                                        className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all"
                                        disabled={isClaimingBonus}
                                    >
                                        Later
                                    </button>
                                    <button
                                        onClick={handleClaimBonus}
                                        disabled={isClaimingBonus}
                                        className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Gift size={18} />
                                        {isClaimingBonus ? 'Claiming...' : 'Claim Now'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default Header
