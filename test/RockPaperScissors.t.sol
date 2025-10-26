// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/RockPaperScissors.sol";

contract MockEntropyV2 {
    uint64 private sequenceNumber = 1;
    address public defaultProvider = address(this);
    uint128 public fee = uint128(0.0001 ether);

    function requestV2() external payable returns (uint64) {
        return sequenceNumber++;
    }

    function requestV2(uint32) external payable returns (uint64) {
        return sequenceNumber++;
    }

    function requestV2(address, uint32) external payable returns (uint64) {
        return sequenceNumber++;
    }

    function requestV2(address, bytes32, uint32) external payable returns (uint64) {
        return sequenceNumber++;
    }

    function getProviderInfoV2(address) external pure returns (bytes memory info) {
        return abi.encodePacked(uint8(1));
    }

    function getDefaultProvider() external view returns (address provider) {
        return defaultProvider;
    }

    function getRequestV2(address, uint64) external pure returns (bytes memory req) {
        return abi.encodePacked(uint8(1));
    }

    function getFeeV2() external view returns (uint128) {
        return fee;
    }

    function getFeeV2(uint32) external view returns (uint128) {
        return fee;
    }

    function getFeeV2(address, uint32) external view returns (uint128) {
        return fee;
    }
}

contract RockPaperScissorsTest is Test {
    RockPaperScissors public game;
    MockEntropyV2 public mockEntropy;
    address public player = address(0x1);

    function setUp() public {
        mockEntropy = new MockEntropyV2();
        game = new RockPaperScissors(address(mockEntropy), address(mockEntropy), true);

        vm.deal(address(this), 10 ether);
        game.fundHouse{value: 1 ether}();
        vm.deal(player, 1 ether);
    }

    function testInvalidChoiceReverts() public {
        vm.startPrank(player);
        vm.expectRevert();
        game.playGame{value: 0.011 ether}(RockPaperScissors.Choice.NONE, bytes32(uint256(12345)));
        vm.stopPrank();
    }

    function testInvalidBetTooSmallReverts() public {
        vm.startPrank(player);
        vm.expectRevert();
        game.playGame{value: 0.0001 ether}(RockPaperScissors.Choice.ROCK, bytes32(uint256(12345)));
        vm.stopPrank();
    }

    function testOwnerCanUpdateGasLimitAndProvider() public view {
        assertEq(address(game.entropy()), address(mockEntropy));
    }

    receive() external payable {}
}
