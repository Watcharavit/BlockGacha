// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "./ItemTrading.sol";

contract GachaGame is ItemTrading {

    struct GachaItem {
        bytes32 itemID;
        string name;
        uint rate;  // Drop rate per million
    }

    GachaItem[] public gachaItems;
    uint public totalRate; // Total rate of all added items
    
    address public owner;

    constructor() {
        owner = msg.sender;
        totalRate = 0;
        
        // Predefined gacha items added in the constructor
        _addGachaItem("itemID1", "Sword of Destiny", 300000);
        _addGachaItem("itemID2", "Mystic Wand", 500000);
        _addGachaItem("itemID3", "Healing Potion", 200000);
    }

    // Internal function to add new gacha items
    function _addGachaItem(bytes32 _itemID, string memory _name, uint _rate) internal {
        gachaItems.push(GachaItem(_itemID, _name, _rate));
        totalRate += _rate;
    }

    // Simple random number generator
    function random() internal view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % totalRate;
    }

    // Gacha pull function
    function gachaPull() public {
        uint randomNumber = random();
        uint cumulativeRate = 0;

        for (uint i = 0; i < gachaItems.length; i++) {
            cumulativeRate += gachaItems[i].rate;
            if (randomNumber < cumulativeRate) {
                addItem(gachaItems[i].itemID, gachaItems[i].name, gachaItems[i].rate);
                break;
            }
        }
    }
}
