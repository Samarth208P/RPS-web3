// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";

// Minimal V2 interface for Entropy
interface IEntropyV2 {
    function requestV2() external payable returns (uint64);
    function requestV2(uint32 gasLimit) external payable returns (uint64);
    function requestV2(address provider, uint32 gasLimit) external payable returns (uint64);
    function requestV2(address provider, bytes32 userRandomNumber, uint32 gasLimit) external payable returns (uint64);

    function getProviderInfoV2(address provider) external view returns (bytes memory info);
    function getDefaultProvider() external view returns (address provider);
    function getRequestV2(address provider, uint64 sequenceNumber) external view returns (bytes memory req);

    function getFeeV2() external view returns (uint128 feeAmount);
    function getFeeV2(uint32 gasLimit) external view returns (uint128 feeAmount);
    function getFeeV2(address provider, uint32 gasLimit) external view returns (uint128 feeAmount);
}

/**
 * @title RockPaperScissors
 * @notice Provably fair Rock Paper Scissors game using Pyth Entropy V2
 * @dev Includes username system, welcome bonus, and dynamic bet limits
 */
contract RockPaperScissors is IEntropyConsumer, Ownable, ReentrancyGuard {
    // ============ Enums ============
    enum Choice { NONE, ROCK, PAPER, SCISSORS }
    enum GameResult { PENDING, WIN, LOSE, DRAW }

    // ============ Structs ============
    struct Game {
        address player;
        uint256 betAmount;
        Choice playerChoice;
        Choice houseChoice;
        GameResult result;
        uint64 entropySequenceNumber;
        bytes32 randomNumber;
        uint256 timestamp;
        uint256 payout;
        bool revealed;
    }

    // ============ State Variables ============
    IEntropyV2 public entropy;
    address public entropyProvider;
    uint32 public entropyGasLimit; // 0 => provider default if supported

    // Dynamic bet limits (Phase 1 feature)
    uint256 public minBet = 0.0001 ether;
    uint256 public maxBet = 100 ether;

    uint256 public constant HOUSE_EDGE = 5; // percent
    bool public drawsRefund;

    // Game tracking
    uint256 public gameCounter;
    uint256 public totalGamesPlayed;
    uint256 public totalWins;
    uint256 public totalLosses;
    uint256 public totalDraws;
    uint256 public totalVolume;
    uint256 public totalPlayersCount;

    // Username system (Phase 1 feature)
    mapping(address => string) public usernames;
    mapping(bytes32 => address) private usernameHashes;

    // Welcome bonus system (Phase 1 feature)
    uint256 public welcomeBonusAmount = 0.001 ether;
    mapping(address => bool) public hasClaimedWelcomeBonus;
    bool public welcomeBonusEnabled = true;

    // Game mappings
    mapping(uint256 => Game) public games;
    mapping(uint64 => uint256) public entropySequenceToGameId;
    mapping(address => uint256[]) public playerGames;
    mapping(address => uint256) public pendingPayouts;
    mapping(address => bool) private hasPlayed;

    // ============ Events ============
    event GameCreated(uint256 indexed gameId, address indexed player, uint256 betAmount, Choice playerChoice, uint64 entropySequenceNumber);
    event GameRevealed(uint256 indexed gameId, address indexed player, Choice playerChoice, Choice houseChoice, GameResult result, uint256 payout);
    event HouseFunded(address indexed funder, uint256 amount);
    event HouseWithdrawn(address indexed owner, uint256 amount);
    event ProviderUpdated(address indexed provider);
    event GasLimitUpdated(uint32 gasLimit);
    event PayoutAccrued(address indexed player, uint256 amount);
    event UsernameSet(address indexed user, string username);
    event WelcomeBonusClaimed(address indexed user, uint256 amount);
    event BetLimitsUpdated(uint256 newMinBet, uint256 newMaxBet);
    event WelcomeBonusUpdated(uint256 newAmount, bool enabled);

    // ============ Errors ============
    error InvalidBetAmount();
    error InvalidChoice();
    error InsufficientHouseBalance();
    error TransferFailed();
    error UsernameTooShort();
    error UsernameTooLong();
    error UsernameAlreadyTaken();
    error WelcomeBonusAlreadyClaimed();
    error WelcomeBonusDisabled();
    error InsufficientBonusFunds();
    error InvalidBetLimits();

    // ============ Constructor ============
    constructor(
        address entropyAddress,
        address _entropyProvider,
        bool _drawsRefund
    ) Ownable(msg.sender) {
        entropy = IEntropyV2(entropyAddress);
        entropyProvider = _entropyProvider != address(0) ? _entropyProvider : entropy.getDefaultProvider();
        entropyGasLimit = 0; // use provider default unless owner updates
        drawsRefund = _drawsRefund;
    }

    // ============ IEntropyConsumer Implementation ============
    function getEntropy() internal view override returns (address) {
        return address(entropy);
    }

    // ============ Username Functions (Phase 1) ============
    function setUsername(string calldata _username) external {
        uint256 len = bytes(_username).length;
        if (len < 3) revert UsernameTooShort();
        if (len > 15) revert UsernameTooLong();

        bytes32 hash = keccak256(bytes(_username));
        address existingOwner = usernameHashes[hash];

        // Allow updating own username
        if (existingOwner != address(0) && existingOwner != msg.sender) {
            revert UsernameAlreadyTaken();
        }

        // Clear old username hash if updating
        if (bytes(usernames[msg.sender]).length > 0) {
            bytes32 oldHash = keccak256(bytes(usernames[msg.sender]));
            delete usernameHashes[oldHash];
        }

        usernameHashes[hash] = msg.sender;
        usernames[msg.sender] = _username;

        emit UsernameSet(msg.sender, _username);
    }

    function isUsernameTaken(string calldata _username) external view returns (bool) {
        bytes32 hash = keccak256(bytes(_username));
        return usernameHashes[hash] != address(0);
    }

    // ============ Welcome Bonus Functions (Phase 1) ============
    function claimWelcomeBonus() external nonReentrant {
        if (!welcomeBonusEnabled) revert WelcomeBonusDisabled();
        if (hasClaimedWelcomeBonus[msg.sender]) revert WelcomeBonusAlreadyClaimed();
        if (address(this).balance < welcomeBonusAmount) revert InsufficientBonusFunds();

        hasClaimedWelcomeBonus[msg.sender] = true;

        (bool success, ) = msg.sender.call{value: welcomeBonusAmount}("");
        if (!success) revert TransferFailed();

        emit WelcomeBonusClaimed(msg.sender, welcomeBonusAmount);
    }

    // ============ Owner Functions ============
    function setBetLimits(uint256 _minBet, uint256 _maxBet) external onlyOwner {
        if (_minBet == 0 || _minBet >= _maxBet) revert InvalidBetLimits();
        minBet = _minBet;
        maxBet = _maxBet;
        emit BetLimitsUpdated(_minBet, _maxBet);
    }

    function setWelcomeBonus(uint256 _amount, bool _enabled) external onlyOwner {
        welcomeBonusAmount = _amount;
        welcomeBonusEnabled = _enabled;
        emit WelcomeBonusUpdated(_amount, _enabled);
    }

    function setEntropyProvider(address _provider) external onlyOwner {
        require(_provider != address(0), "provider=0");
        entropyProvider = _provider;
        emit ProviderUpdated(_provider);
    }

    function setEntropyGasLimit(uint32 _gasLimit) external onlyOwner {
        entropyGasLimit = _gasLimit;
        emit GasLimitUpdated(_gasLimit);
    }

    function setDrawsRefund(bool _drawsRefund) external onlyOwner {
        drawsRefund = _drawsRefund;
    }

    // ============ Core Game Function ============
    function playGame(Choice _choice, bytes32 _userRandomness)
    external
    payable
    nonReentrant
    returns (uint256 gameId)
    {
        if (_choice == Choice.NONE || uint8(_choice) > 3) revert InvalidChoice();

        // Query latest on-chain fee for current provider/gasLimit
        uint256 entropyFee = uint256(entropy.getFeeV2(entropyProvider, entropyGasLimit));

        // Ensure fee is covered to avoid underflow
        if (msg.value < entropyFee) revert InvalidBetAmount();

        // Value must cover bet + provider fee; bet is the remainder staying in this contract
        uint256 betAmount = msg.value - entropyFee;
        if (betAmount < minBet || betAmount > maxBet) revert InvalidBetAmount();

        // Ensure house can cover worst-case payout after forwarding the fee
        uint256 maxPayout = betAmount + ((betAmount * (100 - HOUSE_EDGE)) / 100);
        uint256 availableAfterFee = address(this).balance - entropyFee;
        if (availableAfterFee < maxPayout) revert InsufficientHouseBalance();

        gameId = ++gameCounter;

        // Send the exact fee with the randomness request
        uint64 sequenceNumber = entropy.requestV2{value: entropyFee}(
            entropyProvider,
            _userRandomness,
            entropyGasLimit
        );

        games[gameId] = Game({
            player: msg.sender,
            betAmount: betAmount,
            playerChoice: _choice,
            houseChoice: Choice.NONE,
            result: GameResult.PENDING,
            entropySequenceNumber: sequenceNumber,
            randomNumber: bytes32(0),
            timestamp: block.timestamp,
            payout: 0,
            revealed: false
        });

        entropySequenceToGameId[sequenceNumber] = gameId;
        playerGames[msg.sender].push(gameId);

        // Track new players
        if (!hasPlayed[msg.sender]) {
            hasPlayed[msg.sender] = true;
            totalPlayersCount++;
        }

        emit GameCreated(gameId, msg.sender, betAmount, _choice, sequenceNumber);
        return gameId;
    }

    // ============ Entropy Callback (MUST NEVER REVERT) ============
    function entropyCallback(
        uint64 sequenceNumber,
        address, // provider
        bytes32 randomNumber
    ) internal override {
        uint256 gameId = entropySequenceToGameId[sequenceNumber];
        Game storage game = games[gameId];

        // Ignore unknown or already-processed callbacks; must not revert
        if (game.player == address(0) || game.revealed) {
            return;
        }

        game.randomNumber = randomNumber;
        game.revealed = true;

        // House choice from random (1..3)
        uint256 randomValue = uint256(randomNumber) % 3 + 1;
        game.houseChoice = Choice(randomValue);

        // Determine result and payout
        game.result = determineWinner(game.playerChoice, game.houseChoice);
        uint256 payout = calculatePayout(game.betAmount, game.result);
        game.payout = payout;

        // Update stats
        totalGamesPlayed++;
        totalVolume += game.betAmount;
        if (game.result == GameResult.WIN) totalWins++;
        else if (game.result == GameResult.LOSE) totalLosses++;
        else totalDraws++;

        // Non-reverting payout path
        if (payout > 0) {
            (bool success, ) = game.player.call{value: payout}("");
            if (!success) {
                pendingPayouts[game.player] += payout;
                emit PayoutAccrued(game.player, payout);
            }
        }

        emit GameRevealed(gameId, game.player, game.playerChoice, game.houseChoice, game.result, payout);
    }

    // ============ Internal Helper Functions ============
    function determineWinner(Choice player, Choice house) internal pure returns (GameResult) {
        if (player == house) return GameResult.DRAW;
        if (
            (player == Choice.ROCK && house == Choice.SCISSORS) ||
            (player == Choice.PAPER && house == Choice.ROCK) ||
            (player == Choice.SCISSORS && house == Choice.PAPER)
        ) {
            return GameResult.WIN;
        }
        return GameResult.LOSE;
    }

    function calculatePayout(uint256 betAmount, GameResult result) internal view returns (uint256) {
        if (result == GameResult.WIN) {
            return betAmount + ((betAmount * (100 - HOUSE_EDGE)) / 100);
        } else if (result == GameResult.DRAW && drawsRefund) {
            return betAmount;
        }
        return 0;
    }

    // ============ View Functions ============
    function getGame(uint256 _gameId) external view returns (Game memory) {
        return games[_gameId];
    }

    function getPlayerGames(address _player) external view returns (uint256[] memory) {
        return playerGames[_player];
    }

    function getStats() external view returns (
        uint256 totalGames,
        uint256 wins,
        uint256 losses,
        uint256 draws,
        uint256 houseBalance
    ) {
        return (totalGamesPlayed, totalWins, totalLosses, totalDraws, address(this).balance);
    }

    function getEntropyFee() external view returns (uint256) {
        return uint256(entropy.getFeeV2(entropyProvider, entropyGasLimit));
    }

    // ============ Treasury Functions ============
    function fundHouse() external payable {
        emit HouseFunded(msg.sender, msg.value);
    }

    function withdrawHouse(uint256 _amount) external onlyOwner nonReentrant {
        if (_amount > address(this).balance) revert InsufficientHouseBalance();
        (bool success, ) = owner().call{value: _amount}("");
        if (!success) revert TransferFailed();
        emit HouseWithdrawn(owner(), _amount);
    }

    function withdrawPayout() external nonReentrant {
        uint256 amount = pendingPayouts[msg.sender];
        if (amount == 0) return;
        pendingPayouts[msg.sender] = 0;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "withdraw failed");
    }

    receive() external payable {
        emit HouseFunded(msg.sender, msg.value);
    }
}
