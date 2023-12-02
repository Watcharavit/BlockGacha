// SPDX-License-Identifier: GPL-3.0
        
pragma solidity >=0.4.22 <0.9.0;

// This import is automatically injected by Remix
import "remix_tests.sol"; 

// This import is required to use custom transaction context
// Although it may fail compilation in 'Solidity Compiler' plugin
// But it will work fine in 'Solidity Unit Testing' plugin
import "remix_accounts.sol";
import "../contracts/State.sol";

// File name has to end with '_test.sol', this file can contain more than one testSuite contracts
contract StateTest {

    State state;
    address userAddress1 = address(0x111);
    address userAddress2 = address(0x112);
    address companyAddress1 = address(0x116);
    address companyAddress2 = address(0x117);
    bytes32 itemID1 = 0x0000000000000000000000000000000000000000000000000000000000000001;
    bytes32 itemID2 = 0x0000000000000000000000000000000000000000000000000000000000000002;
    bytes32 itemID3 = 0x0000000000000000000000000000000000000000000000000000000000000003;
    bytes32 itemID4 = 0x0000000000000000000000000000000000000000000000000000000000000004;
    bytes32 packageID1 = 0x0000000000000000000000000000000000000000000000000000000000000005;
    bytes32 packageID2 = 0x0000000000000000000000000000000000000000000000000000000000000006;

    // This is run before every test function
    function beforeEach() public {
        state = new State();
        state.initAccount(userAddress1, Role.User);
        state.initAccount(userAddress2, Role.User);
        state.initAccount(companyAddress1, Role.Company);
        state.initAccount(companyAddress2, Role.Company);
    }

    // Test for `initAccount`
    function testInitAccount() public {
        address testAddress = address(0x111);
        Role testRole = Role.User;

        state.initAccount(testAddress, testRole);
        // initUserAccount();
        Account memory account = state.getAccount(testAddress);

        Assert.equal(uint(account.role), uint(testRole), "Role should be set correctly");
        Assert.equal(account.tokenBalance, 0, "Token balance should be initialized to 0");
        Assert.equal(account.unredeemedItems.length, 0, "Unredeemed items should be empty");
        Assert.equal(account.redeemedItems.length, 0, "Redeemed items should be empty");
        Assert.equal(account.packageIDs.length, 0, "Package IDs should be empty");
    }

    function testSetItem() public{
        try state.setItem(userAddress1, itemID1, "item1", 1234) {
            // If this line is reached, the test should fail
            Assert.ok(false,"setItem did not revert for a user role as expected");
        } catch Error(string memory reason) {
            // Check the revert reason if applicable
            Assert.equal(reason, "This account is not company", "Failed with unexpected revert reason");
        } catch (bytes memory /* lowLevelData */) {
            // Catch any other reverts that don't provide a reason
            Assert.ok(true, "Reverted as expected, but without a specific error reason");
        }

        try state.setItem(companyAddress1, itemID1, "item1", 1234) {
            Item memory item = state.getItem(itemID1);
            Assert.equal(item.itemID, itemID1, "ItemID is incorrect");
            Assert.equal(item.itemName, "item1", "ItemName is incorrect");
            Assert.equal(item.itemRate, 1234, "ItemRate is incorrect");
            Assert.equal(item.owner, companyAddress1, "Owner is incorrect");
        } catch Error(string memory reason) {
            Assert.ok(false, reason);
        }
    }

}    