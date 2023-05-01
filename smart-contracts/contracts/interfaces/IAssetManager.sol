// SPDX-FileCopyrightText: 2023 Berry Block
// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.16;

interface IAssetManager {
    enum AssetType {
        ERC20,
        ERC721,
        ERC1155
    }

    struct Asset {
        AssetType assetType;
        address assetAddress;
        uint256 assetId;
        uint256 assetAmount;
    }
}
