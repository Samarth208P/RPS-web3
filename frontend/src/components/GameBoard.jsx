import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther, parseEventLogs, formatEther } from 'viem'
import { toast } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import { CONTRACT_ADDRESS, ROCK_PAPER_SCISSORS_ABI, CHOICES } from '../config/contracts'
import ChoiceSelector from './ChoiceSelector'
import BetInput from './BetInput'
import BattleAnimation from './BattleAnimation'
import { Zap, Gamepad2 } from 'lucide-react'
import { soundManager } from '../utils/soundManager'

const GameBoard = ({ onGameComplete, onBattleStart, onBattleEnd }) => {
    const { address } = useAccount()
    const [betAmount, setBetAmount] = useState('0.01')
    const [selectedChoice, setSelectedChoice] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [lastGameConfig, setLastGameConfig] = useState(null)
    const [currentGameId, setCurrentGameId] = useState(null)
    const [showBattleAnimation, setShowBattleAnimation] = useState(false)
    const [battleHouseChoice, setBattleHouseChoice] = useState(null)

    const { data: entropyFee } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ROCK_PAPER_SCISSORS_ABI,
        functionName: 'getEntropyFee',
    })

    const {
        writeContract: playGame,
        data: playHash,
        isPending: isPlayPending,
        error: playError,
    } = useWriteContract()

    const {
        isLoading: isConfirming,
        isSuccess: isPlaySuccess,
        data: receipt,
        error: txError,
    } = useWaitForTransactionReceipt({
        hash: playHash,
    })

    const handlePlay = async () => {
        if (!selectedChoice || !betAmount) {
            toast.error('Please select a choice and enter bet amount', {
                icon: '⚠️',
                style: {
                    background: '#1f2937',
                    color: '#fff',
                    border: '1px solid #374151',
                },
            })
            return
        }

        try {
            setIsPlaying(true)
            soundManager.play('click')
            setLastGameConfig({ choice: selectedChoice, bet: betAmount })

            const randomBytes = crypto.getRandomValues(new Uint8Array(32))
            const randomHex =
                '0x' +
                Array.from(randomBytes)
                    .map((b) => b.toString(16).padStart(2, '0'))
                    .join('')

            const totalValue = parseEther(betAmount) + BigInt(entropyFee || 0)

            playGame({
                address: CONTRACT_ADDRESS,
                abi: ROCK_PAPER_SCISSORS_ABI,
                functionName: 'playGame',
                args: [selectedChoice, randomHex],
                value: totalValue,
            })
        } catch (error) {
            console.error('Error playing game:', error)
            toast.error(error.shortMessage || error.message || 'Failed to start game', {
                icon: '❌',
                style: {
                    background: '#1f2937',
                    color: '#fff',
                    border: '1px solid #ef4444',
                },
            })
            setIsPlaying(false)
            if (onBattleEnd) onBattleEnd()
        }
    }

    const handleQuickRepeat = () => {
        if (lastGameConfig && !isPlaying) {
            setSelectedChoice(lastGameConfig.choice)
            setBetAmount(lastGameConfig.bet)
            soundManager.play('select')
        }
    }

    useEffect(() => {
        if (isPlaySuccess && receipt) {
            console.log('✅ Transaction confirmed!', receipt)

            setShowBattleAnimation(true)
            setBattleHouseChoice(null)

            if (onBattleStart) onBattleStart()

            try {
                const logs = parseEventLogs({
                    abi: ROCK_PAPER_SCISSORS_ABI,
                    logs: receipt.logs,
                })

                const gameCreatedEvent = logs.find((log) => log.eventName === 'GameCreated')
                const gameRevealedEvent = logs.find((log) => log.eventName === 'GameRevealed')

                if (gameCreatedEvent) {
                    const gameId = gameCreatedEvent.args.gameId
                    setCurrentGameId(gameId)

                    if (gameRevealedEvent) {
                        setBattleHouseChoice(Number(gameRevealedEvent.args.houseChoice))

                        setTimeout(() => {
                            handleGameResult(gameRevealedEvent, gameId)
                        }, 3000)
                    } else {
                        pollGameResult(gameId)
                    }
                }
            } catch (error) {
                console.error('Error parsing logs:', error)
                setShowBattleAnimation(false)
                setIsPlaying(false)
                if (onBattleEnd) onBattleEnd()
            }
        }
    }, [isPlaySuccess, receipt])

    const handleGameResult = (gameRevealedEvent, gameId) => {
        const result = {
            hash: receipt.transactionHash,
            gameId: Number(gameId),
            playerChoice: Number(gameRevealedEvent.playerChoice),
            houseChoice: Number(gameRevealedEvent.houseChoice),
            result: Number(gameRevealedEvent.result),
            betAmount: parseEther(betAmount),
            payout: gameRevealedEvent.payout || 0n,
            randomNumber: gameRevealedEvent.randomNumber,
        }

        setShowBattleAnimation(false)
        setIsPlaying(false)

        if (onBattleEnd) onBattleEnd()

        if (onGameComplete) {
            onGameComplete(result)
        }
    }

    const pollGameResult = async (gameId) => {
        let attempts = 0
        const maxAttempts = 30

        const poll = async () => {
            try {
                const { readContract } = await import('wagmi/actions')
                const { config } = await import('../config/wagmi')

                const game = await readContract(config, {
                    address: CONTRACT_ADDRESS,
                    abi: ROCK_PAPER_SCISSORS_ABI,
                    functionName: 'getGame',
                    args: [gameId],
                })

                if (game.revealed && game.result !== 0) {
                    setBattleHouseChoice(Number(game.houseChoice))

                    const result = {
                        hash: receipt.transactionHash,
                        gameId: Number(gameId),
                        playerChoice: Number(game.playerChoice),
                        houseChoice: Number(game.houseChoice),
                        result: Number(game.result),
                        betAmount: game.betAmount,
                        payout: game.payout,
                        randomNumber: game.randomNumber,
                    }

                    setTimeout(() => {
                        setShowBattleAnimation(false)
                        setIsPlaying(false)

                        if (onBattleEnd) onBattleEnd()

                        if (onGameComplete) {
                            onGameComplete(result)
                        }
                    }, 2000)
                } else if (attempts < maxAttempts) {
                    attempts++
                    setTimeout(poll, 2000)
                } else {
                    setShowBattleAnimation(false)
                    setIsPlaying(false)

                    if (onBattleEnd) onBattleEnd()

                    toast.error('Game result timeout. Check history later.', {
                        duration: 4000,
                        style: {
                            background: '#1f2937',
                            color: '#fff',
                            border: '1px solid #ef4444',
                        },
                    })
                }
            } catch (error) {
                console.error('Poll error:', error)
                if (attempts < maxAttempts) {
                    attempts++
                    setTimeout(poll, 2000)
                } else {
                    setShowBattleAnimation(false)
                    setIsPlaying(false)
                    if (onBattleEnd) onBattleEnd()
                }
            }
        }

        poll()
    }

    useEffect(() => {
        if (playError) {
            toast.error(playError.shortMessage || 'Transaction failed', {
                duration: 4000,
                icon: '❌',
                style: {
                    background: '#1f2937',
                    color: '#fff',
                    border: '1px solid #ef4444',
                },
            })
            setIsPlaying(false)
            setShowBattleAnimation(false)
            if (onBattleEnd) onBattleEnd()
        }
        if (txError) {
            toast.error('Transaction reverted', {
                duration: 4000,
                icon: '❌',
                style: {
                    background: '#1f2937',
                    color: '#fff',
                    border: '1px solid #ef4444',
                },
            })
            setIsPlaying(false)
            setShowBattleAnimation(false)
            if (onBattleEnd) onBattleEnd()
        }
    }, [playError, txError])

    const isLoading = isPlayPending || isConfirming

    return (
        <>
            <div className="bg-gray-800/20 rounded-2xl p-6 border border-gray-700/50 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Gamepad2 className="w-6 h-6 text-purple-400" />
                        Rock • Paper • Scissors
                    </h2>
                </div>

                <p className="text-gray-400 text-center">Select your choice and place your bet</p>

                <ChoiceSelector
                    selected={selectedChoice}
                    onSelect={(choice) => {
                        setSelectedChoice(choice)
                        soundManager.play('select')
                    }}
                    disabled={isLoading || showBattleAnimation}
                />

                <BetInput
                    value={betAmount}
                    onChange={setBetAmount}
                    disabled={isLoading || showBattleAnimation}
                    onQuickRepeat={handleQuickRepeat}
                />

                {entropyFee && (
                    <div className="bg-gray-900/50 rounded-lg p-3 space-y-1 text-sm">
                        <div className="flex justify-between text-gray-400">
                            <span>Bet:</span>
                            <span className="text-white font-medium">{betAmount} ETH</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                            <span>Entropy fee:</span>
                            <span className="text-white font-medium">
                                {(Number(entropyFee) / 1e18).toFixed(6)} ETH
                            </span>
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                        <div className="flex justify-between font-semibold">
                            <span className="text-purple-400">Total:</span>
                            <span className="text-white">
                                {(parseFloat(betAmount) + Number(entropyFee) / 1e18).toFixed(6)} ETH
                            </span>
                        </div>
                    </div>
                )}

                <button
                    onClick={handlePlay}
                    disabled={!selectedChoice || !betAmount || isLoading || showBattleAnimation}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-purple-500/50 disabled:shadow-none"
                >
                    {isLoading || showBattleAnimation ? (
                        <>
                            <Zap className="w-5 h-5 animate-pulse" />
                            {isConfirming ? 'Confirming Transaction...' : showBattleAnimation ? 'Battle in Progress...' : 'Signing...'}
                        </>
                    ) : (
                        <>
                            <Zap className="w-5 h-5" />
                            Play Game
                        </>
                    )}
                </button>
            </div>

            <AnimatePresence>
                {showBattleAnimation && (
                    <BattleAnimation
                        playerChoice={selectedChoice}
                        houseChoice={battleHouseChoice}
                        onComplete={() => {}}
                    />
                )}
            </AnimatePresence>
        </>
    )
}

export default GameBoard
