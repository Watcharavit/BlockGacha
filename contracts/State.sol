// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;
import "./ownable.sol";

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

struct Account {
    // address account;
    Role role;
    bytes32[] unredeemedItems;
    bytes32[] redeemedItems;
    bytes32[] packageIDs; // own package if role is company, otherwise empty
    uint256 tokenBalance;
}

contract State is Ownable {

    mapping(bytes32 => Item) public items;
    mapping(bytes32 => Package) public packages;
    mapping(address => Account) public accounts;

    modifier isCompany(address _companyAddress) {
        require(accounts[_companyAddress].role == Role.Company, "This account is not company");
        _;
    }

    modifier isUser(address _userAddress) {
        require(accounts[_userAddress].role == Role.User, "This account is not user");
        _;
    }
    
    modifier isItemOwner(address _companyAddress, bytes32 _itemID) {
        require(items[_itemID].owner == _companyAddress, "Company does not own this item");
        _;
    }

    modifier isPackageOwner(address _companyAddress, bytes32 _packageID) {
        require(packages[_packageID].owner == _companyAddress, "Company does not own this package");
        _;
    }
    
    constructor(){

    }

    event ItemCreated(bytes32 indexed itemID, string itemName, uint itemRate, address owner);
    event ItemUpdated(bytes32 indexed itemID, string itemName, uint itemRate);
    event PackageCreated(bytes32 indexed packageID, string packageName, uint price, bool status, address owner);
    event PackageUpdated(bytes32 indexed packageID, string packageName, uint price, bool status);
    event ItemAddedToPackage(bytes32 indexed packageID, bytes32 indexed itemID);
    event ItemRemovedFromPackage(bytes32 indexed packageID, bytes32 indexed itemID);
    event AccountCreated(address accountAddress, Role role, uint256 tokenBalance);
    event UserItemAdded(address indexed userAddress, bytes32 itemID);
    event UserItemRedeemed(address indexed userAddress, bytes32 itemID);
    event AccountTokenUpdated(address indexed accountAddress, uint256 newBalance);

    // Getter for Item by itemID
    function getItem(bytes32 _itemID) public view returns (Item memory) {
        return items[_itemID];
    }

    // Create & Update for Item 
    function setItem(address _companyAddress, bytes32 _itemID, string memory _itemName, uint _itemRate) public onlyOwner isCompany(_companyAddress){
        // Check if the item already exists
        if (items[_itemID].owner != address(0)) {
            // Item exists, check if the account is the owner
            require(items[_itemID].owner == _companyAddress, "Company does not own this item");
            // Update the item
            items[_itemID].itemName = _itemName;
            items[_itemID].itemRate = _itemRate;
            emit ItemUpdated(_itemID, _itemName, _itemRate);
        } else { 
            // Item does not exist, create a new one
            items[_itemID] = Item({
                itemID: _itemID,
                itemName: _itemName, 
                itemRate: _itemRate,
                owner: _companyAddress
            });
            emit ItemCreated(_itemID, _itemName, _itemRate, _companyAddress);
        }
    }

    // Get Package by packageID
    function getPackage(bytes32 _packageID) public view returns (Package memory) {
        return packages[_packageID];
    }

    // NO NEED TO GET ALL SINCE WE WANT USER TO SELECT COMPANY BEFORE SELECT PACKAGE, THIS FUNCTION IS FOR FUTURE CHANGE
    // Get all Package
    /*
    function getAllPackages() public view returns (Package[] memory) {
        uint count = 0;
        // First, count the number of packages
        for (uint i = 0; i < packageIDs.length; i++) {
            if (packages[packageIDs[i]].owner != address(0)) {
                count++;
            }
        }

        // Then, populate the array with package data
        Package[] memory allPackages = new Package[](count);
        uint index = 0;
        for (uint i = 0; i < packageIDs.length; i++) {
            if (packages[packageIDs[i]].owner != address(0)) {
                allPackages[index] = packages[packageIDs[i]];
                index++;
            }
        }

        return allPackages;
    }
    */

    function getCompanyPackages(address _companyAddress) public isCompany(_companyAddress) view returns (bytes32[] memory) {
        return accounts[_companyAddress].packageIDs;
    }

    // Create & Update for Package 
    function setPackage(address _companyAddress, bytes32 _packageID, string memory _packageName, uint _price, bool _status) public onlyOwner isCompany(_companyAddress){
        // Check if the package already exists
        if (packages[_packageID].owner != address(0)) {
            // Package exists, check if the account is the owner
            require(packages[_packageID].owner == _companyAddress, "Company does not own this package");
            // Update the package
            packages[_packageID].packageName = _packageName;
            packages[_packageID].price = _price;
            packages[_packageID].status = _status;
            emit PackageUpdated(_packageID, _packageName, _price, _status);
        } else {
            // Package does not exist, create a new one
            packages[_packageID] = Package({
                packageID: _packageID,
                packageName: _packageName,
                itemIDs: new bytes32[](0),
                price: _price,
                status: _status,
                owner: _companyAddress
            });
            accounts[_companyAddress].packageIDs.push(_packageID);
            emit PackageCreated(_packageID, _packageName, _price, _status, _companyAddress);
        }
    }

    function addItemToPackage(address _companyAddress, bytes32 _itemID, bytes32 _packageID) public onlyOwner isPackageOwner(_companyAddress, _packageID) isItemOwner(_companyAddress, _itemID){
        packages[_packageID].itemIDs.push(_itemID);
        emit ItemAddedToPackage(_packageID, _itemID);
    }

    function removeItemFromPackage(address _companyAddress, bytes32 _itemID, bytes32 _packageID) public onlyOwner isPackageOwner(_companyAddress, _packageID) isItemOwner(_companyAddress, _itemID){       
        uint length = packages[_packageID].itemIDs.length;
        for (uint i = 0; i < length; i++) {
            if(_itemID == packages[_packageID].itemIDs[i]){
                packages[_packageID].itemIDs[i] = packages[_packageID].itemIDs[length - 1];
                packages[_packageID].itemIDs.pop();
                break;
            }
        }
        emit ItemRemovedFromPackage(_packageID, _itemID);
    }

    // Get account
    function getAccount(address _address) public view returns (Account memory){
        return accounts[_address];
    }

//get all Item of one user
/*
    function getAllUserItems(address _userAddress) public isUser(_userAddress){
        uint length = accounts[_userAddress].userItems.length;
        for (uint i = 0; i < length; i++) {
            if(_itemID == accounts[_userAddress].userItems[i].itemID){
                accounts[_userAddress].userItems[i].status = true;
                break;
            }
        }
    }
*/

    function initAccount(address _address, Role _role) public onlyOwner(){
        accounts[_address] = Account({
            role : _role, // 0 = User, 1 = Company, 2 = Admin
            unredeemedItems: new bytes32[](0),
            redeemedItems: new bytes32[](0),
            packageIDs: new bytes32[](0),
            tokenBalance: 0
        });
        emit AccountCreated( _address, accounts[_address].role, accounts[_address].tokenBalance);
    }

    function increaseAccountToken(address _address, uint256 _amount) public onlyOwner(){
        accounts[_address].tokenBalance += _amount;
        emit AccountTokenUpdated(_address, accounts[_address].tokenBalance);
    }

    function decreaseAccountToken(address _address, uint256 _amount) public onlyOwner(){
        accounts[_address].tokenBalance -= _amount;
        emit AccountTokenUpdated(_address, accounts[_address].tokenBalance);
    }

    function addUserItem(address _userAddress, bytes32 _itemID) public onlyOwner{
        accounts[_userAddress].unredeemedItems.push(_itemID);
        emit UserItemAdded(_userAddress, _itemID);
    }

    function redeemUserItem(address _userAddress, bytes32 _itemID) public onlyOwner{
        uint length = accounts[_userAddress].unredeemedItems.length;
        for (uint i = 0; i < length; i++) {
            if(_itemID == accounts[_userAddress].unredeemedItems[i]){
                accounts[_userAddress].redeemedItems.push(accounts[_userAddress].unredeemedItems[i]);
                accounts[_userAddress].unredeemedItems[i] = accounts[_userAddress].unredeemedItems[length-1];
                accounts[_userAddress].unredeemedItems.pop();
                break;
            }
        }
        emit UserItemRedeemed(_userAddress, _itemID);
    }
    
}