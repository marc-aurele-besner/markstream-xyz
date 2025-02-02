// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import { Script, console } from "forge-std/Script.sol";
import { MarkStreamLabel } from "../src/MarkStreamLabel.sol";

contract MarkStreamScript is Script {
    MarkStreamLabel public markStreamLabel;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        markStreamLabel = new MarkStreamLabel();
        console.log("MarkStreamLabel deployed to:", address(markStreamLabel));

        vm.stopBroadcast();
    }
}
