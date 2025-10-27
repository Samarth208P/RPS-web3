import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { DollarSign, TrendingUp, Zap, RotateCcw } from 'lucide-react'
import { MIN_BET, MAX_BET, CONTRACT_ADDRESS, ROCK_PAPER_SCISSORS_ABI } from '../config/contracts'

const quickBets = [
    { label: '0.001', value: '0.001' },
    { label: '0.01', value: '0.01' },
    { label: '0.05', value: '0.05' },
    { label: '0.1', value: '0.1' },
]

const BetInput = ({ value, onChange, disabled }) => {
    const { address } = useAccount()
    const [error, setError] = useState('')
    const [lastBetFromChain, setLastBetFromChain] = useState(null)

    // Get player's game IDs from contract
    const { data: gameIds } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ROCK_PAPER_SCISSORS_ABI,
        functionName: 'getPlayerGames',
        args: [address],
        enabled: !!address,
    })

    // Fetch last game bet amount from blockchain
    useEffect(() => {
        const fetchLastBet = async () => {
            if (!gameIds || gameIds.length === 0) {
                setLastBetFromChain(null)
                return
            }

            try {
                const { readContract } = await import('wagmi/actions')
                const { config } = await import('../config/wagmi')

                // Get the most recent game (last in array)
                const lastGameId = gameIds[gameIds.length - 1]

                const game = await readContract(config, {
                    address: CONTRACT_ADDRESS,
                    abi: ROCK_PAPER_SCISSORS_ABI,
                    functionName: 'getGame',
                    args: [lastGameId],
                })

                if (game && game.betAmount) {
                    const betInEth = formatEther(game.betAmount)
                    setLastBetFromChain(betInEth)
                }
            } catch (error) {
                console.error('Error fetching last bet:', error)
            }
        }

        fetchLastBet()
    }, [gameIds])

    const handleChange = (newValue) => {
        const num = parseFloat(newValue)
        if (isNaN(num) || num < parseFloat(MIN_BET)) {
            setError(`Minimum bet is ${MIN_BET} ETH`)
        } else if (num > parseFloat(MAX_BET)) {
            setError(`Maximum bet is ${MAX_BET} ETH`)
        } else {
            setError('')
        }
        onChange(newValue)
    }

    const handleRepeatLast = () => {
        if (lastBetFromChain) {
            handleChange(lastBetFromChain)
        }
    }

    const potentialWin = (parseFloat(value) * 1.95).toFixed(4)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    Bet Amount
                </label>
                {lastBetFromChain && (
                    <button
                        onClick={handleRepeatLast}
                        disabled={disabled}
                        className="flex items-center gap-2 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RotateCcw className="w-3 h-3" />
                        Repeat Last ({lastBetFromChain} ETH)
                    </button>
                )}
            </div>

            <div className="relative">
                <input
                    type="number"
                    step="0.001"
                    min={MIN_BET}
                    max={MAX_BET}
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    disabled={disabled}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Enter bet amount"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    ETH
                </span>
            </div>

            {error && <p className="text-red-400 text-sm flex items-center gap-2">⚠️ {error}</p>}

            {/* Quick Bet Buttons */}
            <div className="grid grid-cols-4 gap-2">
                {quickBets.map((bet) => (
                    <button
                        key={bet.value}
                        onClick={() => handleChange(bet.value)}
                        disabled={disabled}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/40 hover:to-pink-600/40 border border-purple-500/30 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                    >
                        {bet.label}
                    </button>
                ))}
            </div>

            {/* Potential Win Display */}
            <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        Potential Win
                    </span>
                    <span className="text-2xl font-bold text-green-400">{potentialWin} ETH</span>
                </div>
                <div className="text-xs text-gray-500 text-right">(95% payout ratio)</div>
            </div>

            <div className="text-xs text-gray-500 text-center">
                House edge: 5% • Min bet: {MIN_BET} ETH • Max bet: {MAX_BET} ETH
            </div>
        </div>
    )
}

export default BetInput
