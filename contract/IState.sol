// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

struct Item { 
    bytes32 itemID;
    string itemName;
    uint itemRate;
    address owner; // company address
}

struct Package { 
    bytes32 packageID;
    string packageName;
    bytes32[] itemIDs;
    uint price;
    bool status; // true = available to random, false = out of service
    address owner; // company address
}

enum Role { User, Company, Admin }

struct UserItem {
    bytes32 itemID; // similar item has the same ID -> different user can have smae item which is same item ID
    bool status; // T = redeemed , F = unredeemed
}

struct Account {
    Role role;
    UserItem[] userItems; // empty if role is company
    bytes32[] packageIDs; // own package if role is company, otherwise empty
    uint256 tokenBalance;
}

interface IState {
    function getItem(bytes32 _itemID) external view returns (Item memory);
    // function setItem(address _companyAddress, bytes32 _itemID, string calldata _itemName, uint _itemRate) external;
    function getPackage(bytes32 _packageID) external view returns (Package memory);
    function getCompanyPackages(address _companyAddress) external view returns (bytes32[] memory);
    // function setPackage(address _companyAddress, bytes32 _packageID, string calldata _packageName, uint _price, bool _status) external;
    function addItemToPackage(address _companyAddress, bytes32 _itemId, bytes32 _packageID) external;
    function removeItemFromPackage(address _companyAddress, bytes32 _itemID, bytes32 _packageID) external;
    // function increaseAccountToken(address _address, uint256 _amount) external;
    // function decreaseAccountToken(address _address, uint256 _amount) external;
    function addUserItem(address _userAddress, bytes32 _itemID) external;
    function redeemUserItem(address _userAddress, bytes32 _itemID) external;
}