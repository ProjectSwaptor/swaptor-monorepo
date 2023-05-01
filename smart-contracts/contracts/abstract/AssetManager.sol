// SPDX-FileCopyrightText: 2023 Berry Block
// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.16;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

import "../interfaces/IAssetManager.sol";

abstract contract AssetManager is
    IAssetManager,
    ERC721HolderUpgradeable,
    ERC1155HolderUpgradeable
{
    using SafeERC20Upgradeable for IERC20Upgradeable;

    uint8 public constant MAX_ASSETS = 7;

    function __AssetManager_init() internal initializer {
        __ERC721Holder_init();
        __ERC1155Holder_init();
    }

    function transferAssets(
        Asset[] memory _assets,
        address _from,
        address _to
    ) internal {
        uint256 assetsLength = _assets.length;

        for (uint256 i = 0; i < assetsLength; ) {
            transferAsset(_assets[i], _from, _to);

            unchecked {
                i++;
            }
        }
    }

    function transferAsset(
        Asset memory _asset,
        address _from,
        address _to
    ) internal {
        if (_asset.assetType == AssetType.ERC1155) {
            transferERC1155(_asset, _from, _to);
        } else if (_asset.assetType == AssetType.ERC20) {
            transferERC20(_asset, _from, _to);
        } else if (_asset.assetType == AssetType.ERC721) {
            transferERC721(_asset, _from, _to);
        }
    }

    function transferAsset(
        Asset memory _asset,
        address _from,
        address _to,
        uint256 _amount
    ) internal {
        if (_asset.assetType == AssetType.ERC1155) {
            transferERC1155(_asset, _from, _to, _amount);
        } else if (_asset.assetType == AssetType.ERC20) {
            transferERC20(_asset, _from, _to, _amount);
        } else if (_asset.assetType == AssetType.ERC721) {
            transferERC721(_asset, _from, _to);
        }
    }

    function transferERC20(
        Asset memory _asset,
        address _from,
        address _to
    ) private {
        if (_from == address(this)) {
            IERC20Upgradeable(_asset.assetAddress).transfer(
                _to,
                _asset.assetAmount
            );
            return;
        }

        IERC20Upgradeable(_asset.assetAddress).safeTransferFrom(
            _from,
            _to,
            _asset.assetAmount
        );
    }

    function transferERC20(
        Asset memory _asset,
        address _from,
        address _to,
        uint256 _amount
    ) private {
        if (_from == address(this)) {
            IERC20Upgradeable(_asset.assetAddress).transfer(_to, _amount);
            return;
        }

        IERC20Upgradeable(_asset.assetAddress).transferFrom(
            _from,
            _to,
            _amount
        );
    }

    function transferERC1155(
        Asset memory _asset,
        address _from,
        address _to
    ) internal {
        IERC1155Upgradeable(_asset.assetAddress).safeTransferFrom(
            _from,
            _to,
            _asset.assetId,
            _asset.assetAmount,
            ""
        );
    }

    function transferERC1155(
        Asset memory _asset,
        address _from,
        address _to,
        uint256 _amount
    ) internal {
        IERC1155Upgradeable(_asset.assetAddress).safeTransferFrom(
            _from,
            _to,
            _asset.assetId,
            _amount,
            ""
        );
    }

    function transferERC721(
        Asset memory _asset,
        address _from,
        address _to
    ) internal {
        IERC721Upgradeable(_asset.assetAddress).safeTransferFrom(
            _from,
            _to,
            _asset.assetId
        );
    }

    function approveAll(Asset[] memory _assets, address _to) internal {
        for (uint8 i = 0; i < _assets.length; ) {
            if (_assets[i].assetType == AssetType.ERC1155) {
                approveERC1155(_assets[i], _to);
            } else if (_assets[i].assetType == AssetType.ERC20) {
                approveERC20(_assets[i], _to);
            } else if (_assets[i].assetType == AssetType.ERC721) {
                approveERC721(_assets[i], _to);
            }

            unchecked {
                i++;
            }
        }
    }

    // Don't forget to disable the approval at the end of tx
    function approveERC1155(Asset memory _asset, address _to) private {
        IERC1155Upgradeable(_asset.assetAddress).setApprovalForAll(_to, true);
    }

    function approveERC721(Asset memory _asset, address _to) private {
        IERC721Upgradeable(_asset.assetAddress).approve(_to, _asset.assetId);
    }

    function approveERC20(Asset memory _asset, address _to) private {
        IERC20Upgradeable(_asset.assetAddress).approve(_to, _asset.assetAmount);
    }
}
