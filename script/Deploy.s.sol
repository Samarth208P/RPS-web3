// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/RockPaperScissors.sol";

// Slim V2 interface for getDefaultProvider only
interface IEntropyV2GetDefault {
    function getDefaultProvider() external view returns (address);
}

contract DeployRockPaperScissors is Script {
    function run() external {
        uint256 deployerPk = vm.envUint("PRIVATE_KEY");
        address entropyAddress = vm.envAddress("PYTH_ENTROPY_ADDRESS");

        address provider = IEntropyV2GetDefault(entropyAddress).getDefaultProvider();

        vm.startBroadcast(deployerPk);

        // Deploy with drawsRefund = true
        RockPaperScissors game = new RockPaperScissors(
            entropyAddress,
            provider,
            true
        );

        // Optional: set a custom gas limit (0 uses provider's default)
        // game.setEntropyGasLimit(0);

        // Seed the house
        (bool ok, ) = address(game).call{value: 0.1 ether}("");
        require(ok, "seed failed");

        vm.stopBroadcast();

        console2.log("Contract Address:", address(game));
        console2.log("Owner Address:", game.owner());
        console2.log("Provider:", game.entropyProvider());
        console2.log("GasLimit:", game.entropyGasLimit());
    }
}
