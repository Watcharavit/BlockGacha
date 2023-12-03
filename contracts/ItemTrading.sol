// SPDX-License-Identifier: Non-License
pragma solidity ^0.8.15;

contract ItemTrading {

    struct Item {
        bytes32 itemID;
        string name;
        uint rate;
        uint receiveDate;
    }

    struct Account {
        bytes32 userID;
        address userAddress;
        Item[] items;
    }

    // For efficiency search
    struct ItemLocation {
        address owner;
        uint index;
    }

    // This struct represents a trade offer
    struct Trade {
        bytes32 offerItemID; // requestor offer 
        bytes32 requestItemID;
        address requestTo;
        address offerBy;
        bool isApprovedByRequested;
    }

    // Mapping owner address to Account
    mapping(address => Account) public accounts;

    // Mapping itemID to itemLocation(owner address, item idex in owner.item)
    mapping(bytes32 => ItemLocation) public itemLocation;
    
    // Mapping requested address to trade array
    mapping(address => Trade[]) public tradeOffers;

    modifier hasItem(bytes32 _itemID) {
        require(itemLocation[_itemID].owner == msg.sender, "Caller does not own the offer item");
        _;
    }

    function getItem(bytes32 _itemID) public view returns (Item memory) {
        return accounts[itemLocation[_itemID].owner].items[itemLocation[_itemID].index];
    }

    function getAccount() public view returns (Account memory) {
        return accounts[msg.sender];
    }

    function getTradeOffers() public view returns (Trade[] memory) {
        return tradeOffers[msg.sender];
    }

    // add item stub
    function addItem(bytes32 _itemID, string memory _name, uint _rate) public {
        // Create the item
        Item memory newItem = Item(_itemID, _name, _rate, block.timestamp);

        // Add item to the sender's account
        accounts[msg.sender].items.push(newItem);

        // Update itemLocation mapping
        uint index = accounts[msg.sender].items.length - 1;
        itemLocation[_itemID] = ItemLocation(msg.sender, index);
    }

    // Event to notify when a trade is successful
    event TradeSuccessful(address indexed _offerBy, address indexed _requestTo, bytes32 _offerItemID, bytes32 _requestItemID);

    // Function to execute trade, is called by requested person so check if requested actually have the request item
    function swapItem(bytes32 _offerItemID, bytes32 _requestItemID) internal hasItem(_requestItemID){
        // Get locations of the items
        ItemLocation memory offerItemLocation = itemLocation[_offerItemID];
        ItemLocation memory requestItemLocation = itemLocation[_requestItemID];

        // Get the items
        Item storage offerItem = accounts[offerItemLocation.owner].items[offerItemLocation.index];
        Item storage requestItem = accounts[requestItemLocation.owner].items[requestItemLocation.index];
        
        // Swap logic
        // accounts[offerItemLocation.owner].items[offerItemLocation.index] = Item(requestItem.itemID,requestItem.name,requestItem.rate,block.timestamp);
        // accounts[requestItemLocation.owner].items[requestItemLocation.index] = Item(offerItem.itemID,offerItem.name,offerItem.rate,block.timestamp);
        (offerItem, requestItem) = (requestItem, offerItem);

        // Update the itemLocation mapping
        itemLocation[_offerItemID] = ItemLocation(requestItemLocation.owner, requestItemLocation.index);
        itemLocation[_requestItemID] = ItemLocation(offerItemLocation.owner, offerItemLocation.index);

        // Emit the trade success event
        emit TradeSuccessful(offerItemLocation.owner, requestItemLocation.owner, offerItem.itemID, requestItem.itemID);
    }

    // need to Add teadeOffer for offerer also
    // Function to propose a trade
    function proposeTrade(bytes32 _offerItemID, bytes32 _requestItemID, address _requestTo) public hasItem(_offerItemID){
        tradeOffers[_requestTo].push(Trade(_offerItemID, _requestItemID, _requestTo, msg.sender, false));
    }

    // Function to accept a propose trade
    function acceptPropose(uint _tradeIndex) public {
        Trade memory trade = tradeOffers[msg.sender][_tradeIndex];
        require(trade.requestTo == msg.sender, "This trade is not requested to you.");

        // Approve the trade
        tradeOffers[msg.sender][_tradeIndex].isApprovedByRequested = true;

        swapItem(trade.offerItemID, trade.requestItemID);
    }

}
