// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyRegistry is Ownable {
    struct Property {
        string location;
        string valuation; // Can be a string like "$1,500,000"
        string legalDocumentCID; // IPFS CID for legal docs
        bool isRegistered;
    }

    mapping(uint256 => Property) public properties;
    uint256 public nextPropertyId = 1;

    // Events
    event PropertyRegistered(uint256 indexed propertyId, string location, string valuation);
    event DocumentUpdated(uint256 indexed propertyId, string newLegalDocumentCID);

    constructor() Ownable(msg.sender) {}

    function registerProperty(string memory _location, string memory _valuation, string memory _documentCID) external onlyOwner {
        properties[nextPropertyId] = Property({
            location: _location,
            valuation: _valuation,
            legalDocumentCID: _documentCID,
            isRegistered: true
        });

        emit PropertyRegistered(nextPropertyId, _location, _valuation);
        nextPropertyId++;
    }

    function updateDocumentCID(uint256 propertyId, string memory _newDocumentCID) external onlyOwner {
        require(properties[propertyId].isRegistered, "Property not found");
        properties[propertyId].legalDocumentCID = _newDocumentCID;
        emit DocumentUpdated(propertyId, _newDocumentCID);
    }
}
