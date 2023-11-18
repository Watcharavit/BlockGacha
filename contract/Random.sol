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
    uint public totalRate; // Total rate of all added items
    uint public totalPulls; // Total number of gacha pulls
    
    address public owner;

    constructor() {
        owner = msg.sender;
        totalRate = 0;
        totalPulls = 0;
        
        // Predefined gacha items added in the constructor
        _addGachaItem("itemID1", "Sword of Destiny", 300000);
        _addGachaItem("itemID2", "Mystic Wand", 500000);
        _addGachaItem("itemID3", "Healing Potion", 200000);
    }

    function _addGachaItem(bytes32 _itemID, string memory _name, uint _rate) internal {
        gachaItems.push(GachaItem(_itemID, _name, _rate, 0));
        totalRate += _rate;
    }

    function random() internal view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % totalRate;
    }

    function gachaPull() public {
        totalPulls++;
        uint randomNumber = random();
        uint cumulativeRate = 0;

        // Check if any item's drop rate is significantly low
        bytes32 forcedItemID = checkForcedDrop();
        if (forcedItemID != bytes32(0)) {
            forceDropItem(forcedItemID);
            return;
        }

        for (uint i = 0; i < gachaItems.length; i++) {
            cumulativeRate += gachaItems[i].rate;
            if (randomNumber < cumulativeRate) {
                dropItem(i);
                break;
            }
        }
    }

    function checkForcedDrop() internal view returns (bytes32) {
        for (uint i = 0; i < gachaItems.length; i++) {
            GachaItem storage item = gachaItems[i];
            if (isDropRateTooLow(item)) {
                return item.itemID;
            }
        }
        return bytes32(0);
    }

    function isDropRateTooLow(GachaItem storage item) internal view returns (bool) {
        uint expectedDrops = (totalPulls * item.rate) / totalRate;
        // Apply simple hypothesis test with a rejecting region of 5%
        return item.actualDrops < (expectedDrops * 95 / 100);
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
}
