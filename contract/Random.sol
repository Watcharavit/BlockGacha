// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "./ItemTrading.sol";

contract GachaGame is ItemTrading {

    struct GachaItem {
        bytes32 itemID;
        string name;
        uint rate;  // Drop rate per million
        uint actualDrops; // Actual number of times the item has been dropped
    }

    GachaItem[] public gachaItems;
    uint public totalPulls; // Total number of gacha pulls
    
    constructor() {
        // Predefined gacha items added in the constructor
        _addGachaItem("itemID1", "Sword of Destiny", 300000);
        _addGachaItem("itemID2", "Mystic Wand", 500000);
        _addGachaItem("itemID3", "Healing Potion", 200000);
    }

    function _addGachaItem(bytes32 _itemID, string memory _name, uint _rate) internal {
        gachaItems.push(GachaItem(_itemID, _name, _rate, 0));
    }

    function random(uint maxRange) internal view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % maxRange;
    }

    function gachaPull() public {
        totalPulls++;
        bytes32 forcedItemID = checkForcedDrop();
        if (forcedItemID != bytes32(0)) {
            forceDropItem(forcedItemID);
            return;
        }

        uint availableRate = calculateAvailableRate();
        uint randomNumber = random(availableRate);
        uint cumulativeRate = 0;

        for (uint i = 0; i < gachaItems.length; i++) {
            if (!isDropRateTooHigh(gachaItems[i])) {
                cumulativeRate += gachaItems[i].rate;
                if (randomNumber < cumulativeRate) {
                    dropItem(i);
                    break;
                }
            }
        }
    }

    function checkForcedDrop() internal view returns (bytes32) {
        for (uint i = 0; i < gachaItems.length; i++) {
            if (isDropRateTooLow(gachaItems[i])) {
                return gachaItems[i].itemID;
            }
        }
        return bytes32(0);
    }

    function isDropRateTooLow(GachaItem storage item) internal view returns (bool) {
        uint expectedDrops = (totalPulls * item.rate) / 1000000;
        return item.actualDrops < (expectedDrops * 95 / 100); // 5% less than expected
    }

    function isDropRateTooHigh(GachaItem storage item) internal view returns (bool) {
        uint expectedDrops = (totalPulls * item.rate) / 1000000;
        return item.actualDrops > (expectedDrops * 105 / 100); // 5% more than expected
    }

    function forceDropItem(bytes32 itemID) internal {
        for (uint i = 0; i < gachaItems.length; i++) {
            if (gachaItems[i].itemID == itemID) {
                dropItem(i);
                return;
            }
        }
    }

    function dropItem(uint index) internal {
        GachaItem storage item = gachaItems[index];
        item.actualDrops++;
        addItem(item.itemID, item.name, item.rate);
    }

    function calculateAvailableRate() internal view returns (uint) {
        uint availableRate = 0;
        for (uint i = 0; i < gachaItems.length; i++) {
            if (!isDropRateTooHigh(gachaItems[i])) {
                availableRate += gachaItems[i].rate;
            }
        }
        return availableRate;
    }
}
