import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther, parseEventLogs, formatEther } from 'viem'
import { toast } from 'react-hot-toast'
import { CONTRACT_ADDRESS, ROCK_PAPER_SCISSORS_ABI, CHOICES } from '../config/contracts'
import ChoiceSelector from './ChoiceSelector'
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
        error: playError,
        reset: resetWriteContract
    } = useWriteContract()

    // Wait for transaction receipt
    const {
        isLoading: isConfirming,
        isSuccess: isPlaySuccess,
        data: receipt,
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

            console.log('🎲 Starting game with:', {
                choice: selectedChoice,
                betAmount,
                totalValue: formatEther(totalValue)
            })

            // Call playGame
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

    // Handle transaction success and parse logs
    useEffect(() => {
        if (isPlaySuccess && receipt) {
            console.log('✅ Transaction confirmed!', receipt)

            // Dismiss the loading toast WITHOUT showing success message
            toast.dismiss('game')

            setIsPlaying(false)

            try {
                // Parse event logs from the receipt
                const logs = parseEventLogs({
                    abi: ROCK_PAPER_SCISSORS_ABI,
                    logs: receipt.logs,
                })

                console.log('📋 Parsed logs:', logs)

                // Find the game result event
                const gameEvent = logs.find(log =>
                    log.eventName === 'GamePlayed' ||
                    log.eventName === 'GameResult' ||
                    log.eventName === 'GameCompleted'
                )

                if (gameEvent && gameEvent.args) {
                    const result = {
                        hash: receipt.transactionHash,
                        playerChoice: Number(gameEvent.args.playerChoice || selectedChoice),
                        houseChoice: Number(gameEvent.args.houseChoice),
                        result: Number(gameEvent.args.result),
                        betAmount: gameEvent.args.betAmount || parseEther(betAmount),
                        payout: gameEvent.args.payout || 0n,
                        randomNumber: gameEvent.args.randomNumber || receipt.transactionHash,
                    }

                    console.log('🎯 Game result:', result)

                    // Pass result to parent immediately
                    if (onGameComplete) {
                        onGameComplete(result)
                    }
                } else {
                    console.warn('⚠️ No game event found in logs, falling back')

                    // Fallback result
                    const fallbackResult = {
                        hash: receipt.transactionHash,
                        playerChoice: selectedChoice,
                        houseChoice: 0,
                        result: 0,
                        betAmount: parseEther(betAmount),
                        payout: 0n,
                        randomNumber: receipt.transactionHash,
                    }

                    if (onGameComplete) {
                        onGameComplete(fallbackResult)
                    }
                }
            } catch (error) {
                console.error('Error parsing logs:', error)

                // Still trigger with fallback data
                if (onGameComplete) {
                    onGameComplete({
                        hash: receipt.transactionHash,
                        playerChoice: selectedChoice,
                        houseChoice: 0,
                        result: 0,
                        betAmount: parseEther(betAmount),
                        payout: 0n,
                        randomNumber: receipt.transactionHash,
                    })
                }
            }
        }
    }, [isPlaySuccess, receipt, selectedChoice, betAmount, onGameComplete])

    // Handle errors
    useEffect(() => {
        if (playError) {
            toast.error(playError.shortMessage || 'Transaction failed', {
                id: 'game',
                duration: 4000
            })
            setIsPlaying(false)
        }
        if (txError) {
            toast.error('Transaction reverted', {
                id: 'game',
                duration: 4000
            })
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
                            <span>
                                {isPlayPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Loading...'}
                            </span>
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
        </div>
    )
}

export default GameBoard
