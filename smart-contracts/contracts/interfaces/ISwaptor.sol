// SPDX-FileCopyrightText: 2023 Berry Block
// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.16;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

import "./IAssetManager.sol";

interface ISwaptor is IAssetManager {
    enum SwapType {
        ERC20_FOR_ERC20,
        ERC20_FOR_ERC721,
        ERC721_FOR_ERC20,
        ERC721_FOR_ERC721
    }

    error SignatureUsed();
    error InvalidSignature();
    error InvalidChainId();
    error SwapExpired();
    error UnauthorizedBuyer();
    error InsufficientFee();
    error InvalidSwapFunctionCalled();
    error Unauthorized();

    event SwapParticipants(
        string indexed id,
        address indexed seller,
        address indexed buyer
    );
    event SwapDetails(
        string indexed id,
        address indexed offeredERC721,
        address indexed wantedERC721,
        uint256 offeredTokenData,
        uint256 wantedTokenData,
        uint256 expirationTime
    );

    event SwapCancelled(string indexed id);

    function swapERC20ForERC20(
        bytes memory _data,
        bytes memory _signature
    ) external payable;

    function swapERC20ForERC721(
        bytes memory _data,
        bytes memory _signature
    ) external payable;

    function swapERC721ForERC20(
        bytes memory _data,
        bytes memory _signature
    ) external payable;

    function swapERC721ForERC721(
        bytes memory _data,
        bytes memory _signature
    ) external payable;

    function cancelSwap(bytes memory _data, bytes memory _signature) external;
}
