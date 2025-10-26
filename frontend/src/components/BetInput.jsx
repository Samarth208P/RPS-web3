import { useState } from 'react'
import { DollarSign, TrendingUp, Zap } from 'lucide-react'
import { MIN_BET, MAX_BET } from '../config/contracts'

const quickBets = [
    { label: '0.001', value: '0.001' },
    { label: '0.01', value: '0.01' },
    { label: '0.05', value: '0.05' },
    { label: '0.1', value: '0.1' },
]

const BetInput = ({ value, onChange, disabled }) => {
    const [error, setError] = useState('')

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

    const potentialWin = (parseFloat(value) * 1.95).toFixed(4)

    return (
        <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-gray-300">
                Bet Amount (ETH)
            </label>

            {/* Input Field */}
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <DollarSign className="w-5 h-5" />
                </div>
                <input
                    type="number"
                    step="0.001"
                    min={MIN_BET}
                    max={MAX_BET}
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    disabled={disabled}
                    className="input-field w-full pl-12 pr-4 text-lg font-semibold disabled:opacity-50"
                    placeholder="0.01"
                />
            </div>

            {/* Error Message */}
            {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
            )}

            {/* Quick Bet Buttons */}
            <div className="grid grid-cols-4 gap-2 mt-3">
                {quickBets.map((bet) => (
                    <button
                        key={bet.value}
                        onClick={() => handleChange(bet.value)}
                        disabled={disabled}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                            value === bet.value
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/5 hover:bg-white/10 text-gray-300'
                        } disabled:opacity-50`}
                    >
                        {bet.label} ETH
                    </button>
                ))}
            </div>

            {/* Potential Win Display */}
            {value && !error && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            <span className="text-sm text-gray-300">Potential Win</span>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-green-400">
                                {potentialWin} ETH
                            </p>
                            <p className="text-xs text-gray-400">
                                (95% payout ratio)
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Info */}
            <div className="mt-3 flex items-start space-x-2 text-xs text-gray-400">
                <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                    House edge: 5% • Min bet: {MIN_BET} ETH • Max bet: {MAX_BET} ETH
                </p>
            </div>
        </div>
    )
}

export default BetInput
