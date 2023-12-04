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
    uint sumRate;
    uint price;
    bool status; // true = available to random, false = out of service
    address owner; // company address
}

enum Role { User, Company, Admin }

struct Account {
    // address account;
    Role role;
    bytes32[] unredeemedItemIDs;
    bytes32[] redeemedItemIDs;
    bytes32[] proposeTradeIDs;
    bytes32[] requestedTradeIDs;
    bytes32[] packageIDs; // own package if role is company, otherwise empty
    uint256 tokenBalance;
}

struct Trade {
    bytes32 proposeItemID; // requestor offer 
    bytes32 requestItemID;
    address requestTo;
    address proposeBy; // key of tradeOffers
    bool isApprovedByRequestee;
}

contract State is Ownable {

    mapping(bytes32 => Item) public items;
    mapping(bytes32 => Package) public packages;
    mapping(address => Account) public accounts;
    mapping(bytes32 => Trade) public trades;

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
    event UserItemRemoved(address indexed userAddress, bytes32 itemID);
    event UserItemRedeemed(address indexed userAddress, bytes32 itemID);
    event AccountTokenUpdated(address indexed accountAddress, uint256 newBalance);
    event TradeSuccessful(address indexed proposeBy, address indexed requestTo, bytes32 proposeItemID, bytes32 requestItemID);
    event PullGachaSuccessful(bytes32 indexed _packageID, bytes32 droppedItemId, address indexed _userAddress);

    // Getter for Item by itemID
    function getItem(bytes32 _itemID) public view returns (Item memory) {
        return items[_itemID];
    }

    function createItem(address _companyAddress, bytes32 _itemID, string memory _itemName, uint _itemRate) public onlyOwner isCompany(_companyAddress){
        // Check if the item already exists
        require(items[_itemID].owner == address(0), "ItemID has been used");
        items[_itemID] = Item({
            itemID: _itemID,
            itemName: _itemName, 
            itemRate: _itemRate,
            owner: _companyAddress
        });
        emit ItemCreated(_itemID, _itemName, _itemRate, _companyAddress);
    }

    function updateItem(address _companyAddress, bytes32 _itemID, string memory _itemName, uint _itemRate) public onlyOwner isItemOwner(_companyAddress,_itemID){
        items[_itemID].itemName = _itemName;
        items[_itemID].itemRate = _itemRate;
        emit ItemUpdated(_itemID, _itemName, _itemRate);
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

    function createPackage(address _companyAddress, bytes32 _packageID, string memory _packageName, uint _price, bool _status) public onlyOwner isCompany(_companyAddress){
        // Check if the package already exists
        require(packages[_packageID].owner == address(0), "PackageID has been used");
        // Package does not exist, create a new one
        packages[_packageID] = Package({
            packageID: _packageID,
            packageName: _packageName,
            itemIDs: new bytes32[](0),
            sumRate: 0,
            price: _price,
            status: _status,
            owner: _companyAddress
        });
        accounts[_companyAddress].packageIDs.push(_packageID);
        emit PackageCreated(_packageID, _packageName, _price, _status, _companyAddress);
    }

    function updatePackage(address _companyAddress, bytes32 _packageID, string memory _packageName, uint _price, bool _status) public onlyOwner isPackageOwner(_companyAddress, _packageID){
        packages[_packageID].packageName = _packageName;
        packages[_packageID].price = _price;
        packages[_packageID].status = _status;
        emit PackageUpdated(_packageID, _packageName, _price, _status);
    }

    function addItemToPackage(address _companyAddress, bytes32 _itemID, bytes32 _packageID) public onlyOwner isPackageOwner(_companyAddress, _packageID) isItemOwner(_companyAddress, _itemID){
        packages[_packageID].itemIDs.push(_itemID);
        packages[_packageID].sumRate += items[_itemID].itemRate;
        emit ItemAddedToPackage(_packageID, _itemID);
    }

    // Using loop since in practical, each package would not have too large item list. Assuming 10-15 is the most possible number. 
    // Using storage to save the index would be less efficient.
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

    function registerAccount(address _address, Role _role) public onlyOwner(){
        accounts[_address] = Account({
            role : _role, // 0 = User, 1 = Company, 2 = Admin
            unredeemedItemIDs: new bytes32[](0),
            redeemedItemIDs: new bytes32[](0),
            proposeTradeIDs: new bytes32[](0),
            requestedTradeIDs: new bytes32[](0),
            packageIDs: new bytes32[](0),
            tokenBalance: 0
        });
        emit AccountCreated( _address, accounts[_address].role, accounts[_address].tokenBalance);
    }

    function increaseAccountToken(address _address, uint256 _amount) public onlyOwner() returns(uint256){
        accounts[_address].tokenBalance += _amount;
        emit AccountTokenUpdated(_address, accounts[_address].tokenBalance);
        return accounts[_address].tokenBalance;
    }

    function decreaseAccountToken(address _address, uint256 _amount) public onlyOwner() returns(uint256){
        accounts[_address].tokenBalance -= _amount;
        emit AccountTokenUpdated(_address, accounts[_address].tokenBalance);
        return accounts[_address].tokenBalance;
    }

    function addUserItem(address _userAddress, bytes32 _itemID) internal onlyOwner{
        accounts[_userAddress].unredeemedItemIDs.push(_itemID);
        emit UserItemAdded(_userAddress, _itemID);
    }

    function removeUserItem(address _userAddress, bytes32 _itemID) internal onlyOwner{
        uint length = accounts[_userAddress].unredeemedItemIDs.length;
        for (uint i = 0; i < length; i++) {
            if(_itemID == accounts[_userAddress].unredeemedItemIDs[i]){
                accounts[_userAddress].unredeemedItemIDs[i] = accounts[_userAddress].unredeemedItemIDs[length-1];
                accounts[_userAddress].unredeemedItemIDs.pop();
                break;
            }
        emit UserItemRemoved(_userAddress, _itemID);
        }
    }

    function redeemUserItem(address _userAddress, bytes32 _itemID) public onlyOwner{
        uint length = accounts[_userAddress].unredeemedItemIDs.length;
        for (uint i = 0; i < length; i++) {
            if(_itemID == accounts[_userAddress].unredeemedItemIDs[i]){
                accounts[_userAddress].redeemedItemIDs.push(accounts[_userAddress].unredeemedItemIDs[i]);
                accounts[_userAddress].unredeemedItemIDs[i] = accounts[_userAddress].unredeemedItemIDs[length-1];
                accounts[_userAddress].unredeemedItemIDs.pop();
                break;
            }
        }
        emit UserItemRedeemed(_userAddress, _itemID);
    }
    
    function isTradable(address _userAddress, bytes32 _itemID) internal view returns(bool){
        uint length = accounts[_userAddress].unredeemedItemIDs.length;
        for (uint i = 0; i < length; i++) {
            if(_itemID == accounts[_userAddress].unredeemedItemIDs[i]){
                return true;
            }
        }
        return false;
    }

    function getTrade(bytes32 _tradeID) public view returns (Trade memory) {
        return trades[_tradeID];
    }

    // Function to propose a trade
    function proposeTrade(bytes32 _tradeID, address _proposerAddress, address _requestTo, bytes32 _proposeItemID, bytes32 _requestItemID) public onlyOwner(){
        require(isTradable(_proposerAddress, _proposeItemID), "Proposer does not own the propose item");
        require(isTradable(_requestTo, _requestItemID), "Requestee does not own the propose item");
        trades[_tradeID] = Trade({
            proposeItemID: _proposeItemID, 
            requestItemID: _requestItemID, 
            requestTo: _requestTo, 
            proposeBy: _proposerAddress, 
            isApprovedByRequestee: false});
        accounts[_proposerAddress].proposeTradeIDs.push(_tradeID);
        accounts[_requestTo].requestedTradeIDs.push(_tradeID);
    }

    // Function to accept a propose trade
    function acceptPropose(address _userAddress, bytes32 _tradeID) public onlyOwner(){
        Trade memory trade = trades[_tradeID];
        require(trade.requestTo == _userAddress, "This trade is not requested to you.");
        require(trade.isApprovedByRequestee == false, "This trade is completed.");
        require(isTradable(trade.proposeBy, trade.proposeItemID), "Proposer does not own the propose item");
        require(isTradable(trade.requestTo, trade.requestItemID), "Requestee does not own the request item");
        // Approve the trade
        trades[_tradeID].isApprovedByRequestee = true;
        // Execute trade
        removeUserItem(trade.proposeBy, trade.proposeItemID);
        removeUserItem(trade.requestTo, trade.requestItemID);
        addUserItem(trade.proposeBy, trade.requestItemID);
        addUserItem(trade.requestTo, trade.proposeItemID);
        emit TradeSuccessful(trade.proposeBy, trade.requestTo, trade.proposeItemID, trade.requestItemID);
    }
    
    // Simple random number generator
    function random(uint maxRange) internal view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % maxRange;
    }
    
    // Gacha pull function
    function pullGacha(bytes32 _packageID, address _userAddress) public onlyOwner(){
        // get package
        Package memory package = getPackage(_packageID);
        require(package.status,"This package is out of service");
        bytes32[] memory itemIDs = package.itemIDs;
        // random item
        uint randomNumber = random(package.sumRate);
        uint cumulativeRate = 0;
        bytes32 droppedItemId;
        for (uint i = 0; i < itemIDs.length; i++) {
            cumulativeRate += getItem(itemIDs[i]).itemRate;
            if (randomNumber < cumulativeRate) {
                droppedItemId = itemIDs[i];
                break;
            }
        }
        addUserItem(_userAddress, droppedItemId);
        emit PullGachaSuccessful(_packageID, droppedItemId, _userAddress);
    }
}