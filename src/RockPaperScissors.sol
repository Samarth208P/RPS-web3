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
 * @notice Provably fair Rock Paper Scissors game using Pyth Entropy V2 requestV2 API
 */
contract RockPaperScissors is IEntropyConsumer, Ownable, ReentrancyGuard {
    enum Choice { NONE, ROCK, PAPER, SCISSORS }
    enum GameResult { PENDING, WIN, LOSE, DRAW }

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

    IEntropyV2 public entropy;
    address public entropyProvider;
    uint32 public entropyGasLimit; // 0 => provider default if supported

    uint256 public constant HOUSE_EDGE = 5; // percent
    uint256 public constant MIN_BET = 0.001 ether;
    uint256 public constant MAX_BET = 1 ether;

    uint256 public gameCounter;
    uint256 public totalGamesPlayed;
    uint256 public totalWins;
    uint256 public totalLosses;
    uint256 public totalDraws;

    bool public drawsRefund;

    mapping(uint256 => Game) public games;
    mapping(uint64 => uint256) public entropySequenceToGameId;
    mapping(address => uint256[]) public playerGames;

    // Pull-payouts to guarantee non-reverting callback
    mapping(address => uint256) public pendingPayouts;

    event GameCreated(uint256 indexed gameId, address indexed player, uint256 betAmount, Choice playerChoice, uint64 entropySequenceNumber);
    event GameRevealed(uint256 indexed gameId, address indexed player, Choice playerChoice, Choice houseChoice, GameResult result, uint256 payout);
    event HouseFunded(address indexed funder, uint256 amount);
    event HouseWithdrawn(address indexed owner, uint256 amount);
    event ProviderUpdated(address indexed provider);
    event GasLimitUpdated(uint32 gasLimit);
    event PayoutAccrued(address indexed player, uint256 amount);

    error InvalidBetAmount();
    error InvalidChoice();
    error InsufficientHouseBalance();
    error TransferFailed();

    constructor(address entropyAddress, address _entropyProvider, bool _drawsRefund) Ownable(msg.sender) {
        entropy = IEntropyV2(entropyAddress);
        entropyProvider = _entropyProvider != address(0) ? _entropyProvider : entropy.getDefaultProvider();
        entropyGasLimit = 0; // use provider default unless owner updates
        drawsRefund = _drawsRefund;
    }

    // IEntropyConsumer requirement
    function getEntropy() internal view override returns (address) {
        return address(entropy);
    }

    // Admin
    function setEntropyProvider(address _provider) external onlyOwner {
        require(_provider != address(0), "provider=0");
        entropyProvider = _provider;
        emit ProviderUpdated(_provider);
    }

    function setEntropyGasLimit(uint32 _gasLimit) external onlyOwner {
        entropyGasLimit = _gasLimit; // 0 means "use default" if supported by provider
        emit GasLimitUpdated(_gasLimit);
    }

    // Core game
    function playGame(Choice _choice, bytes32 _userRandomness)
    external
    payable
    nonReentrant
    returns (uint256 gameId)
    {
        if (_choice == Choice.NONE || uint8(_choice) > 3) revert InvalidChoice();

        // Query latest on-chain fee for current provider/gasLimit (must match the requestV2 variant)
        uint256 entropyFee = uint256(entropy.getFeeV2(entropyProvider, entropyGasLimit));

        // Ensure fee is covered to avoid underflow
        if (msg.value < entropyFee) revert InvalidBetAmount();

        // Value must cover bet + provider fee; bet is the remainder staying in this contract
        uint256 betAmount = msg.value - entropyFee;
        if (betAmount < MIN_BET || betAmount > MAX_BET) revert InvalidBetAmount();

        // Ensure house can cover worst-case payout after forwarding the fee
        uint256 maxPayout = betAmount + ((betAmount * (100 - HOUSE_EDGE)) / 100); // bet + 95% profit
        // Available after fee is forwarded
        uint256 availableAfterFee = address(this).balance - entropyFee;
        if (availableAfterFee < maxPayout) revert InsufficientHouseBalance();

        gameId = ++gameCounter;

        // Send the exact fee with the randomness request; remainder (bet) stays for payout
        uint64 sequenceNumber = entropy.requestV2{value: entropyFee}(entropyProvider, _userRandomness, entropyGasLimit);

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

        emit GameCreated(gameId, msg.sender, betAmount, _choice, sequenceNumber);
        return gameId;
    }

    // Entropy callback: MUST NEVER REVERT
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

        // Stats
        totalGamesPlayed++;
        if (game.result == GameResult.WIN) totalWins++;
        else if (game.result == GameResult.LOSE) totalLosses++;
        else totalDraws++;

        // Non-reverting payout path: try direct send, otherwise accrue for pull withdrawal
        if (payout > 0) {
            (bool success, ) = game.player.call{value: payout}("");
            if (!success) {
                pendingPayouts[game.player] += payout;
                emit PayoutAccrued(game.player, payout);
                // Do not revert
            }
        }

        emit GameRevealed(gameId, game.player, game.playerChoice, game.houseChoice, game.result, payout);
    }

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

    // Views / helpers for frontend/tests
    function getGame(uint256 _gameId) external view returns (Game memory) {
        return games[_gameId];
    }

    function getPlayerGames(address _player) external view returns (uint256[] memory) {
        return playerGames[_player];
    }

    function getStats() external view returns (uint256 totalGames, uint256 wins, uint256 losses, uint256 draws, uint256 houseBalance) {
        return (totalGamesPlayed, totalWins, totalLosses, totalDraws, address(this).balance);
    }

    function getEntropyFee() external view returns (uint256) {
        return uint256(entropy.getFeeV2(entropyProvider, entropyGasLimit));
    }

    // Treasury
    function fundHouse() external payable {
        emit HouseFunded(msg.sender, msg.value);
    }

    function withdrawHouse(uint256 _amount) external onlyOwner nonReentrant {
        if (_amount > address(this).balance) revert InsufficientHouseBalance();
        (bool success, ) = owner().call{value: _amount}("");
        if (!success) revert TransferFailed();
        emit HouseWithdrawn(owner(), _amount);
    }

    // Player-initiated pull withdrawal for accrued payouts
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
