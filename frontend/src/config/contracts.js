// Contract addresses from environment
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS
export const PYTH_ENTROPY_ADDRESS = import.meta.env.VITE_PYTH_ENTROPY_ADDRESS
export const ENTROPY_PROVIDER = import.meta.env.VITE_ENTROPY_PROVIDER

// Game choices (matching contract enum)
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

// Updated bet limits (Phase 1)
export const MIN_BET = '0.0001' // ETH
export const MAX_BET = '100' // ETH

// Updated ABI with Phase 1 features
export const ROCK_PAPER_SCISSORS_ABI = [
    // Read functions
    {
        inputs: [{ name: '_gameId', type: 'uint256' }],
        name: 'getGame',
        outputs: [
            {
                components: [
                    { name: 'player', type: 'address' },
                    { name: 'betAmount', type: 'uint256' },
                    { name: 'playerChoice', type: 'uint8' },
                    { name: 'houseChoice', type: 'uint8' },
                    { name: 'result', type: 'uint8' },
                    { name: 'entropySequenceNumber', type: 'uint64' },
                    { name: 'randomNumber', type: 'bytes32' },
                    { name: 'timestamp', type: 'uint256' },
                    { name: 'payout', type: 'uint256' },
                    { name: 'revealed', type: 'bool' },
                ],
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: '_player', type: 'address' }],
        name: 'getPlayerGames',
        outputs: [{ name: '', type: 'uint256[]' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getStats',
        outputs: [
            { name: 'totalGames', type: 'uint256' },
            { name: 'wins', type: 'uint256' },
            { name: 'losses', type: 'uint256' },
            { name: 'draws', type: 'uint256' },
            { name: 'houseBalance', type: 'uint256' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getEntropyFee',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    // Phase 1: Username functions
    {
        inputs: [{ name: '', type: 'address' }],
        name: 'usernames',
        outputs: [{ name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: '_username', type: 'string' }],
        name: 'isUsernameTaken',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: '_username', type: 'string' }],
        name: 'setUsername',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    // Phase 1: Welcome bonus functions
    {
        inputs: [{ name: '', type: 'address' }],
        name: 'hasClaimedWelcomeBonus',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'welcomeBonusAmount',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'welcomeBonusEnabled',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'claimWelcomeBonus',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    // Phase 1: Dynamic bet limits
    {
        inputs: [],
        name: 'minBet',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'maxBet',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    // Write functions
    {
        inputs: [
            { name: '_choice', type: 'uint8' },
            { name: '_userRandomness', type: 'bytes32' },
        ],
        name: 'playGame',
        outputs: [{ name: 'gameId', type: 'uint256' }],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'withdrawPayout',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: '', type: 'address' }],
        name: 'pendingPayouts',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    // Events
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'gameId', type: 'uint256' },
            { indexed: true, name: 'player', type: 'address' },
            { indexed: false, name: 'betAmount', type: 'uint256' },
            { indexed: false, name: 'playerChoice', type: 'uint8' },
            { indexed: false, name: 'entropySequenceNumber', type: 'uint64' },
        ],
        name: 'GameCreated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'gameId', type: 'uint256' },
            { indexed: true, name: 'player', type: 'address' },
            { indexed: false, name: 'playerChoice', type: 'uint8' },
            { indexed: false, name: 'houseChoice', type: 'uint8' },
            { indexed: false, name: 'result', type: 'uint8' },
            { indexed: false, name: 'payout', type: 'uint256' },
        ],
        name: 'GameRevealed',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'user', type: 'address' },
            { indexed: false, name: 'username', type: 'string' },
        ],
        name: 'UsernameSet',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'user', type: 'address' },
            { indexed: false, name: 'amount', type: 'uint256' },
        ],
        name: 'WelcomeBonusClaimed',
        type: 'event',
    },
]
