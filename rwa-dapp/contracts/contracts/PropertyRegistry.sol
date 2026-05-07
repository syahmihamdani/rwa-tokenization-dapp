// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/*
    Smart contract ini digunakan untuk menyimpan dan mengelola data properti
    pada blockchain.

    Setiap properti memiliki informasi lokasi, valuasi, dan dokumen legal
    yang disimpan menggunakan IPFS CID. Hanya owner contract yang dapat
    mendaftarkan properti baru maupun memperbarui dokumen legal properti.
*/

import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyRegistry is Ownable {

    // Struktur data properti
    struct Property {
        string location;
        string valuation;
        string legalDocumentCID;
        bool isRegistered;
    }

    // Mapping ID properti ke data properti
    mapping(uint256 => Property) public properties;

    // ID properti berikutnya
    uint256 public nextPropertyId = 1;

    // Event saat properti berhasil didaftarkan
    event PropertyRegistered(
        uint256 indexed propertyId,
        string location,
        string valuation
    );

    // Event saat dokumen legal diperbarui
    event DocumentUpdated(
        uint256 indexed propertyId,
        string newLegalDocumentCID
    );

    constructor() Ownable(msg.sender) {}

    // Mendaftarkan properti baru
    function registerProperty(
        string memory _location,
        string memory _valuation,
        string memory _documentCID
    ) external onlyOwner {

        properties[nextPropertyId] = Property({
            location: _location,
            valuation: _valuation,
            legalDocumentCID: _documentCID,
            isRegistered: true
        });

        emit PropertyRegistered(
            nextPropertyId,
            _location,
            _valuation
        );

        nextPropertyId++;
    }

    // Memperbarui dokumen legal properti
    function updateDocumentCID(
        uint256 propertyId,
        string memory _newDocumentCID
    ) external onlyOwner {

        require(
            properties[propertyId].isRegistered,
            "Property not found"
        );

        properties[propertyId].legalDocumentCID = _newDocumentCID;

        emit DocumentUpdated(
            propertyId,
            _newDocumentCID
        );
    }
}