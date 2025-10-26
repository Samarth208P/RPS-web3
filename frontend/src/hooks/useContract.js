import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESS, ROCK_PAPER_SCISSORS_ABI } from '../config/contracts'

export const useGameContract = () => {
    const { writeContract, data: hash, isPending } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const playGame = (choice, randomNumber, value) => {
        return writeContract({
            address: CONTRACT_ADDRESS,
            abi: ROCK_PAPER_SCISSORS_ABI,
            functionName: 'playGame',
            args: [choice, randomNumber],
            value,
        })
    }

    const revealGame = (gameId, userRandomNumber, providerRevelation) => {
        return writeContract({
            address: CONTRACT_ADDRESS,
            abi: ROCK_PAPER_SCISSORS_ABI,
            functionName: 'revealGame',
            args: [gameId, userRandomNumber, providerRevelation],
        })
    }

    return {
        playGame,
        revealGame,
        isPending,
        isConfirming,
        isSuccess,
        hash,
    }
}

export const useGameStats = () => {
    return useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ROCK_PAPER_SCISSORS_ABI,
        functionName: 'getStats',
    })
}

export const usePlayerGames = (address) => {
    return useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ROCK_PAPER_SCISSORS_ABI,
        functionName: 'getPlayerGames',
        args: [address],
        enabled: !!address,
    })
}

export const useGame = (gameId) => {
    return useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ROCK_PAPER_SCISSORS_ABI,
        functionName: 'getGame',
        args: [gameId],
        enabled: !!gameId,
    })
}

export const useEntropyFee = () => {
    return useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ROCK_PAPER_SCISSORS_ABI,
        functionName: 'getEntropyFee',
    })
}
