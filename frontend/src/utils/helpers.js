import { formatEther, parseEther } from 'viem'

/**
 * Format address to short version
 */
export const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Format ETH amount with specified decimals
 */
export const formatETH = (value, decimals = 4) => {
    if (!value) return '0'
    const formatted = formatEther(value)
    return parseFloat(formatted).toFixed(decimals)
}

/**
 * Generate random bytes32 for entropy
 */
export const generateRandomBytes32 = () => {
    const randomBytes = crypto.getRandomValues(new Uint8Array(32))
    return '0x' + Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
}

/**
 * Calculate potential win amount
 */
export const calculatePotentialWin = (betAmount, houseEdge = 0.05) => {
    const bet = parseFloat(betAmount)
    if (isNaN(bet) || bet <= 0) return 0
    return (bet * (1 - houseEdge) + bet).toFixed(4)
}

/**
 * Get choice emoji
 */
export const getChoiceEmoji = (choice) => {
    const emojis = {
        1: '✊',
        2: '✋',
        3: '✌️',
    }
    return emojis[choice] || '❓'
}

/**
 * Get choice name
 */
export const getChoiceName = (choice) => {
    const names = {
        0: 'None',
        1: 'Rock',
        2: 'Paper',
        3: 'Scissors',
    }
    return names[choice] || 'Unknown'
}

/**
 * Get result name
 */
export const getResultName = (result) => {
    const names = {
        0: 'Pending',
        1: 'Win',
        2: 'Lose',
        3: 'Draw',
    }
    return names[result] || 'Unknown'
}

/**
 * Validate bet amount
 */
export const validateBetAmount = (amount, min = '0.001', max = '1') => {
    const bet = parseFloat(amount)
    const minBet = parseFloat(min)
    const maxBet = parseFloat(max)

    if (isNaN(bet)) {
        return { valid: false, error: 'Invalid amount' }
    }

    if (bet < minBet) {
        return { valid: false, error: `Minimum bet is ${min} ETH` }
    }

    if (bet > maxBet) {
        return { valid: false, error: `Maximum bet is ${max} ETH` }
    }

    return { valid: true }
}

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch (error) {
        console.error('Failed to copy:', error)
        return false
    }
}

/**
 * Format timestamp to readable date
 */
export const formatTimestamp = (timestamp) => {
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleString()
}

/**
 * Get explorer URL for transaction
 */
export const getExplorerUrl = (hash, type = 'tx', chainId = 84532) => {
    const explorers = {
        84532: 'https://sepolia.basescan.org',
        8453: 'https://basescan.org',
    }

    const baseUrl = explorers[chainId] || explorers[84532]
    return `${baseUrl}/${type}/${hash}`
}

/**
 * Sleep utility
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
