// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "./Random.sol";

contract TestRandom is GachaGame {

    function roll1000() public {
        rollMany(1000);
    }

    function rollMany(uint times) public {
        for (uint i = 0; i < times; i++) gachaPull();
    }

    function getItemsName() public view returns (string[] memory) {
        Account memory account = getAccount();
        string[] memory itemNames = new string[](account.items.length);

        for (uint i = 0; i < account.items.length; i++) 
            itemNames[i] = account.items[i].name;

        return itemNames;
    }

    function getItemsStatistic() public view returns (string[] memory, uint[] memory, uint[] memory) {
        string[] memory names = getItemsName();
        uint[] memory counts = new uint[](names.length);
        uint uniqueCount = 0;
        uint totalItems = names.length;

        for (uint i = 0; i < totalItems; i++) {
            bool exists = false;
            for (uint j = 0; j < uniqueCount; j++) {
                if (keccak256(bytes(names[i])) == keccak256(bytes(names[j]))) {
                    counts[j]++;
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                names[uniqueCount] = names[i];
                counts[uniqueCount]++;
                uniqueCount++;
            }
        }

        string[] memory uniqueNames = new string[](uniqueCount);
        uint[] memory uniqueCounts = new uint[](uniqueCount);
        uint[] memory percentages = new uint[](uniqueCount);
        for (uint i = 0; i < uniqueCount; i++) {
            uniqueNames[i] = names[i];
            uniqueCounts[i] = counts[i];
            percentages[i] = (counts[i] * 100) / totalItems; // Calculate percentage
        }

        return (uniqueNames, uniqueCounts, percentages);
    }

}