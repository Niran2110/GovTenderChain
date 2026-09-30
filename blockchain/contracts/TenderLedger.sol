// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TenderLedger {
    
    // Define the structure of a record
    struct AwardRecord {
        string tenderId;
        string contractorName;
        uint256 bidAmount;
        uint256 timestamp;
    }

    // A list to store all records
    AwardRecord[] public awards;

    // Event to broadcast to the network
    event TenderAwarded(string tenderId, string contractorName, uint256 bidAmount, uint256 timestamp);

    // Function to record a winner (Only the backend calls this)
    function recordWinner(string memory _tenderId, string memory _contractorName, uint256 _bidAmount) public {
        awards.push(AwardRecord({
            tenderId: _tenderId,
            contractorName: _contractorName,
            bidAmount: _bidAmount,
            timestamp: block.timestamp
        }));

        emit TenderAwarded(_tenderId, _contractorName, _bidAmount, block.timestamp);
    }

    // Helper to see how many awards exist
    function getAwardCount() public view returns (uint256) {
        return awards.length;
    }
}