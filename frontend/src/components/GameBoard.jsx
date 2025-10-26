import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther } from 'viem'
import { toast } from 'react-hot-toast'
import { CONTRACT_ADDRESS, ROCK_PAPER_SCISSORS_ABI, CHOICES } from '../config/contracts'
import ChoiceSelector from './ChoiceSelector'
import GameResult from './GameResult'
import BetInput from './BetInput'
import { Loader2 } from 'lucide-react'

const GameBoard = ({ onGameComplete }) => {
    const { address } = useAccount()
    const [betAmount, setBetAmount] = useState('0.01')
    const [selectedChoice, setSelectedChoice] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)

    // Get entropy fee
    const { data: entropyFee } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ROCK_PAPER_SCISSORS_ABI,
        functionName: 'getEntropyFee',
    })

    // Play game transaction
    const {
        writeContract: playGame,
        data: playHash,
        isPending: isPlayPending,
        error: playError
    } = useWriteContract()

    // Wait for transaction
    const {
        isLoading: isConfirming,
        isSuccess: isPlaySuccess,
        error: txError
    } = useWaitForTransactionReceipt({
        hash: playHash,
    })

    // Handle play game
    const handlePlay = async () => {
        if (!selectedChoice || !betAmount) {
            toast.error('Please select a choice and enter bet amount')
            return
        }

        try {
            setIsPlaying(true)

            // Generate random number for entropy
            const randomBytes = crypto.getRandomValues(new Uint8Array(32))
            const randomHex = '0x' + Array.from(randomBytes)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('')

            // Calculate total value (bet + entropy fee)
            const totalValue = parseEther(betAmount) + BigInt(entropyFee || 0)

            // Call playGame - this will now handle everything in one transaction
            playGame({
                address: CONTRACT_ADDRESS,
                abi: ROCK_PAPER_SCISSORS_ABI,
                functionName: 'playGame',
                args: [selectedChoice, randomHex],
                value: totalValue,
            })

            toast.loading('Starting game...', { id: 'game' })
        } catch (error) {
            console.error('Error playing game:', error)
            toast.error(error.shortMessage || error.message || 'Failed to start game')
            setIsPlaying(false)
        }
    }

    // Handle success
    useEffect(() => {
        if (isPlaySuccess) {
            toast.success('Game completed! Check the result below.', { id: 'game' })
            setIsPlaying(false)

            // Trigger refresh
            if (onGameComplete) {
                setTimeout(() => {
                    onGameComplete()
                }, 2000)
            }

            // Reset for next game
            setTimeout(() => {
                setSelectedChoice(null)
            }, 3000)
        }
    }, [isPlaySuccess])

    // Handle errors
    useEffect(() => {
        if (playError) {
            toast.error(playError.shortMessage || 'Transaction failed', { id: 'game' })
            setIsPlaying(false)
        }
        if (txError) {
            toast.error('Transaction reverted', { id: 'game' })
            setIsPlaying(false)
        }
    }, [playError, txError])

    const isLoading = isPlayPending || isConfirming || isPlaying

    return (
        <div className="card">
            <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-2 text-glow">
                    Choose Your Weapon
                </h2>
                <p className="text-gray-300">
                    Select your choice and place your bet
                </p>
            </div>

            <BetInput
                value={betAmount}
                onChange={setBetAmount}
                disabled={isLoading}
            />

            <ChoiceSelector
                selected={selectedChoice}
                onSelect={setSelectedChoice}
                disabled={isLoading}
            />

            <div className="mt-8 text-center">
                <button
                    onClick={handlePlay}
                    disabled={!selectedChoice || !betAmount || isLoading}
                    className="btn-primary text-xl px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <span className="flex items-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Processing...</span>
            </span>
                    ) : (
                        'Play Game'
                    )}
                </button>

                {entropyFee && !isLoading && (
                    <div className="mt-4 text-sm text-gray-400">
                        <p>Bet: {betAmount} ETH</p>
                        <p>Entropy fee: {(Number(entropyFee) / 1e18).toFixed(6)} ETH</p>
                        <p className="font-semibold text-white mt-1">
                            Total: {(parseFloat(betAmount) + Number(entropyFee) / 1e18).toFixed(6)} ETH
                        </p>
                    </div>
                )}
            </div>

            {isPlaySuccess && (
                <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                    <p className="text-green-400 font-semibold">
                        ✓ Game completed! Check your game history below.
                    </p>
                </div>
            )}
        </div>
    )
}

export default GameBoard
