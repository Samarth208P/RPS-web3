export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || ''
export const PYTH_ENTROPY_ADDRESS = import.meta.env.VITE_PYTH_ENTROPY_ADDRESS || '0x41c9e39574f40ad34c79f1c99b66a45efb830d4c'
export const ENTROPY_PROVIDER = import.meta.env.VITE_ENTROPY_PROVIDER || ''

// Contract ABI
export const ROCK_PAPER_SCISSORS_ABI = [
    {
        "type": "constructor",
        "inputs": [
            { "name": "_entropyAddress", "type": "address", "internalType": "address" },
            { "name": "_entropyProvider", "type": "address", "internalType": "address" },
            { "name": "_drawsRefund", "type": "bool", "internalType": "bool" }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "playGame",
        "inputs": [
            { "name": "_choice", "type": "uint8", "internalType": "enum RockPaperScissors.Choice" },
            { "name": "_userRandomNumber", "type": "bytes32", "internalType": "bytes32" }
        ],
        "outputs": [{ "name": "gameId", "type": "uint256", "internalType": "uint256" }],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "revealGame",
        "inputs": [
            { "name": "_gameId", "type": "uint256", "internalType": "uint256" },
            { "name": "_userRandomNumber", "type": "bytes32", "internalType": "bytes32" },
            { "name": "_providerRevelation", "type": "bytes32", "internalType": "bytes32" }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "getGame",
        "inputs": [{ "name": "_gameId", "type": "uint256", "internalType": "uint256" }],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct RockPaperScissors.Game",
                "components": [
                    { "name": "player", "type": "address", "internalType": "address" },
                    { "name": "betAmount", "type": "uint256", "internalType": "uint256" },
                    { "name": "playerChoice", "type": "uint8", "internalType": "enum RockPaperScissors.Choice" },
                    { "name": "houseChoice", "type": "uint8", "internalType": "enum RockPaperScissors.Choice" },
                    { "name": "result", "type": "uint8", "internalType": "enum RockPaperScissors.GameResult" },
                    { "name": "entropySequenceNumber", "type": "uint64", "internalType": "uint64" },
                    { "name": "randomNumber", "type": "bytes32", "internalType": "bytes32" },
                    { "name": "timestamp", "type": "uint256", "internalType": "uint256" },
                    { "name": "payout", "type": "uint256", "internalType": "uint256" },
                    { "name": "revealed", "type": "bool", "internalType": "bool" }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getStats",
        "inputs": [],
        "outputs": [
            { "name": "totalGames", "type": "uint256", "internalType": "uint256" },
            { "name": "wins", "type": "uint256", "internalType": "uint256" },
            { "name": "losses", "type": "uint256", "internalType": "uint256" },
            { "name": "draws", "type": "uint256", "internalType": "uint256" },
            { "name": "houseBalance", "type": "uint256", "internalType": "uint256" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getEntropyFee",
        "inputs": [],
        "outputs": [{ "name": "", "type": "uint128", "internalType": "uint128" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getPlayerGames",
        "inputs": [{ "name": "_player", "type": "address", "internalType": "address" }],
        "outputs": [{ "name": "", "type": "uint256[]", "internalType": "uint256[]" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "games",
        "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
        "outputs": [
            { "name": "player", "type": "address", "internalType": "address" },
            { "name": "betAmount", "type": "uint256", "internalType": "uint256" },
            { "name": "playerChoice", "type": "uint8", "internalType": "enum RockPaperScissors.Choice" },
            { "name": "houseChoice", "type": "uint8", "internalType": "enum RockPaperScissors.Choice" },
            { "name": "result", "type": "uint8", "internalType": "enum RockPaperScissors.GameResult" },
            { "name": "entropySequenceNumber", "type": "uint64", "internalType": "uint64" },
            { "name": "randomNumber", "type": "bytes32", "internalType": "bytes32" },
            { "name": "timestamp", "type": "uint256", "internalType": "uint256" },
            { "name": "payout", "type": "uint256", "internalType": "uint256" },
            { "name": "revealed", "type": "bool", "internalType": "bool" }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "choiceToString",
        "inputs": [{ "name": "_choice", "type": "uint8", "internalType": "enum RockPaperScissors.Choice" }],
        "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
        "stateMutability": "pure"
    },
    {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "drawsRefund",
        "inputs": [],
        "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
        "stateMutability": "view"
    },
    {
        "type": "event",
        "name": "GameCreated",
        "inputs": [
            { "name": "gameId", "type": "uint256", "indexed": true, "internalType": "uint256" },
            { "name": "player", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "betAmount", "type": "uint256", "indexed": false, "internalType": "uint256" },
            { "name": "playerChoice", "type": "uint8", "indexed": false, "internalType": "enum RockPaperScissors.Choice" },
            { "name": "entropySequenceNumber", "type": "uint64", "indexed": false, "internalType": "uint64" }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "GameRevealed",
        "inputs": [
            { "name": "gameId", "type": "uint256", "indexed": true, "internalType": "uint256" },
            { "name": "player", "type": "address", "indexed": true, "internalType": "address" },
            { "name": "playerChoice", "type": "uint8", "indexed": false, "internalType": "enum RockPaperScissors.Choice" },
            { "name": "houseChoice", "type": "uint8", "indexed": false, "internalType": "enum RockPaperScissors.Choice" },
            { "name": "result", "type": "uint8", "indexed": false, "internalType": "enum RockPaperScissors.GameResult" },
            { "name": "payout", "type": "uint256", "indexed": false, "internalType": "uint256" },
            { "name": "randomNumber", "type": "bytes32", "indexed": false, "internalType": "bytes32" }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "InvalidBetAmount",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidChoice",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InsufficientHouseBalance",
        "inputs": []
    },
    {
        "type": "error",
        "name": "GameAlreadyRevealed",
        "inputs": []
    },
    {
        "type": "error",
        "name": "TransferFailed",
        "inputs": []
    }
]

// Game constants
export const CHOICES = {
    NONE: 0,
    ROCK: 1,
    PAPER: 2,
    SCISSORS: 3,
}

export const CHOICE_NAMES = {
    0: 'None',
    1: 'Rock',
    2: 'Paper',
    3: 'Scissors',
}

export const RESULT_NAMES = {
    0: 'Pending',
    1: 'Win',
    2: 'Lose',
    3: 'Draw',
}

export const MIN_BET = '0.001' // ETH
export const MAX_BET = '1' // ETH
