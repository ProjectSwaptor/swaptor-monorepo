// SPDX-FileCopyrightText: 2023 Berry Block
// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.16;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "./interfaces/ISwaptor.sol";

contract Swaptor is ISwaptor, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using ECDSAUpgradeable for bytes32;

    AggregatorV3Interface public priceFeed;

    uint256 public feeInUsd;
    uint256 public freeTrialEndTime;

    mapping(bytes => bool) public signatureUsed;

    modifier invalidateSignature(bytes memory _signature) {
        if (signatureUsed[_signature] == true) {
            revert SignatureUsed();
        }
        signatureUsed[_signature] = true;

        _;
    }

    modifier onlyFreeDuringTrialPeriod() {
        if (block.timestamp > freeTrialEndTime) {
            if (_getMsgValueInFiat() < feeInUsd) {
                revert InsufficientFee();
            }
        }

        _;
    }

    /**
     * @notice - Initialize upgradeable smart contract
     * @param _feeInUsd - Fee amount in wei, needs to be set to 10^8 eg. if fee is 5$, then it should be 5*10^8
     * @param _freeTrialEndTime - End time of a trial period without fees
     * @param _priceFeed - Chainlink's price feed address
     */
    function initialize(
        uint256 _feeInUsd,
        uint256 _freeTrialEndTime,
        address _priceFeed
    ) external initializer {
        __Ownable_init();

        feeInUsd = _feeInUsd;
        freeTrialEndTime = _freeTrialEndTime;
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    /**
     * @notice - Swap ERC20 for ERC20
     * @param _data - Data containing swap information
     * @param _signature - Seller's signature of a hashed data
     */
    function swapERC20ForERC20(
        bytes memory _data,
        bytes memory _signature
    )
        external
        payable
        nonReentrant
        invalidateSignature(_signature)
        onlyFreeDuringTrialPeriod
    {
        (
            string memory id,
            SwapType swapType,
            address seller,
            address buyer,
            address offeredERC20,
            uint256 offeredERC20Amount,
            address wantedERC20,
            uint256 wantedERC20Amount,
            uint256 chainId,
            uint256 expirationTime
        ) = _decodeSwapData(_data);

        _verifySignature(_data, _signature, seller);
        _validateSwapParams(chainId, expirationTime, buyer);

        if (swapType != SwapType.ERC20_FOR_ERC20) {
            revert InvalidSwapFunctionCalled();
        }

        IERC20Upgradeable(wantedERC20).transferFrom(
            _msgSender(),
            seller,
            wantedERC20Amount
        );
        IERC20Upgradeable(offeredERC20).transferFrom(
            seller,
            _msgSender(),
            offeredERC20Amount
        );

        emit SwapParticipants(id, seller, _msgSender());
        emit SwapDetails(
            id,
            offeredERC20,
            wantedERC20,
            offeredERC20Amount,
            wantedERC20Amount,
            expirationTime
        );
    }

    /**
     * @notice - Swap ERC20 for ERC721
     * @param _data - Data containing swap information
     * @param _signature - Seller's signature of a hashed data
     */
    function swapERC20ForERC721(
        bytes memory _data,
        bytes memory _signature
    )
        external
        payable
        nonReentrant
        invalidateSignature(_signature)
        onlyFreeDuringTrialPeriod
    {
        (
            string memory id,
            SwapType swapType,
            address seller,
            address buyer,
            address offeredERC20,
            uint256 offeredERC20Amount,
            address wantedERC721,
            uint256 wantedERC721TokenId,
            uint256 chainId,
            uint256 expirationTime
        ) = _decodeSwapData(_data);

        _verifySignature(_data, _signature, seller);
        _validateSwapParams(chainId, expirationTime, buyer);

        if (swapType != SwapType.ERC20_FOR_ERC721) {
            revert InvalidSwapFunctionCalled();
        }

        IERC721Upgradeable(wantedERC721).transferFrom(
            _msgSender(),
            seller,
            wantedERC721TokenId
        );
        IERC20Upgradeable(offeredERC20).transferFrom(
            seller,
            _msgSender(),
            offeredERC20Amount
        );

        emit SwapParticipants(id, seller, _msgSender());
        emit SwapDetails(
            id,
            offeredERC20,
            wantedERC721,
            offeredERC20Amount,
            wantedERC721TokenId,
            expirationTime
        );
    }

    /**
     * @notice - Swap ERC721 for ERC20
     * @param _data - Data containing swap information
     * @param _signature - Seller's signature of a hashed data
     */
    function swapERC721ForERC20(
        bytes memory _data,
        bytes memory _signature
    )
        external
        payable
        nonReentrant
        invalidateSignature(_signature)
        onlyFreeDuringTrialPeriod
    {
        (
            string memory id,
            SwapType swapType,
            address seller,
            address buyer,
            address offeredERC721,
            uint256 offeredERC721TokenId,
            address wantedERC20,
            uint256 wantedERC20Amount,
            uint256 chainId,
            uint256 expirationTime
        ) = _decodeSwapData(_data);

        _verifySignature(_data, _signature, seller);
        _validateSwapParams(chainId, expirationTime, buyer);

        if (swapType != SwapType.ERC721_FOR_ERC20) {
            revert InvalidSwapFunctionCalled();
        }

        IERC20Upgradeable(wantedERC20).transferFrom(
            _msgSender(),
            seller,
            wantedERC20Amount
        );
        IERC721Upgradeable(offeredERC721).transferFrom(
            seller,
            _msgSender(),
            offeredERC721TokenId
        );

        emit SwapParticipants(id, seller, _msgSender());
        emit SwapDetails(
            id,
            offeredERC721,
            wantedERC20,
            offeredERC721TokenId,
            wantedERC20Amount,
            expirationTime
        );
    }

    /**
     * @notice - Swap ERC721 for ERC721
     * @param _data - Data containing swap information
     * @param _signature - Seller's signature of a hashed data
     */
    function swapERC721ForERC721(
        bytes memory _data,
        bytes memory _signature
    )
        external
        payable
        nonReentrant
        invalidateSignature(_signature)
        onlyFreeDuringTrialPeriod
    {
        (
            string memory id,
            SwapType swapType,
            address seller,
            address buyer,
            address offeredERC721,
            uint256 offeredERC721TokenId,
            address wantedERC721,
            uint256 wantedERC721TokenId,
            uint256 chainId,
            uint256 expirationTime
        ) = _decodeSwapData(_data);

        _verifySignature(_data, _signature, seller);
        _validateSwapParams(chainId, expirationTime, buyer);

        if (swapType != SwapType.ERC721_FOR_ERC721) {
            revert InvalidSwapFunctionCalled();
        }

        IERC721Upgradeable(wantedERC721).transferFrom(
            _msgSender(),
            seller,
            wantedERC721TokenId
        );
        IERC721Upgradeable(offeredERC721).transferFrom(
            seller,
            _msgSender(),
            offeredERC721TokenId
        );

        emit SwapParticipants(id, seller, _msgSender());
        emit SwapDetails(
            id,
            offeredERC721,
            wantedERC721,
            offeredERC721TokenId,
            wantedERC721TokenId,
            expirationTime
        );
    }

    /**
     * @notice - Cancel a swap
     * @param _data - Data containing swap information
     * @param _signature - Seller's signature of a hashed data
     */
    function cancelSwap(
        bytes memory _data,
        bytes memory _signature
    ) external nonReentrant invalidateSignature(_signature) {
        (string memory id, , address seller, , , , , , , ) = _decodeSwapData(
            _data
        );

        if (_msgSender() != seller) {
            revert Unauthorized();
        }

        _verifySignature(_data, _signature, seller);

        emit SwapCancelled(id);
    }

    /**
     * @notice - Withdraw collected ethers from fees
     * @param _amount - Amount of ethers to withdraw
     * @param _recipient - Recipient's address
     */
    function withdraw(uint256 _amount, address _recipient) external onlyOwner {
        payable(_recipient).transfer(_amount);
    }

    /**
     * @notice - Set new fee in USD value
     * @param _feeInUsd - Fee amount in wei, needs to be set to 10^8 eg. if fee is 5$, then it should be 5*10^8
     */
    function setFeeInUsd(uint256 _feeInUsd) external onlyOwner {
        feeInUsd = _feeInUsd;
    }

    /**
     * @notice - Set new end time of a trial period without fees
     * @param _freeTrialEndTime - New end time of a trial period without fees
     */
    function setFreeTrialEndTime(uint256 _freeTrialEndTime) external onlyOwner {
        freeTrialEndTime = _freeTrialEndTime;
    }

    /**
     * @notice - Set new Chainlink price feed
     * @param _priceFeed - New Chainlink price feed
     */
    function setPriceFeed(AggregatorV3Interface _priceFeed) external onlyOwner {
        priceFeed = _priceFeed;
    }

    /**
     * @notice - Get msg.value in fiat (USD)
     */
    function _getMsgValueInFiat() private view returns (uint256) {
        (, int price, , , ) = priceFeed.latestRoundData();

        return (msg.value * uint256(price)) / 1 ether;
    }

    /**
     * @notice - Verify if signature is generated by the expected seller
     * @param _data - Data containing swap information
     * @param _signature - Signature of a hashed data
     * @param _expected - Expected seller's address
     */
    function _verifySignature(
        bytes memory _data,
        bytes memory _signature,
        address _expected
    ) private pure {
        address recovered = keccak256(_data).toEthSignedMessageHash().recover(
            _signature
        );

        if (recovered != _expected) {
            revert InvalidSignature();
        }
    }

    /**
     * @notice - Check validity of provided chain ID, expiration time and buyer
     * @param _chainId - Network chain ID
     * @param _expirationTime - Swap expiration time
     * @param _buyer - Buyer's address
     */
    function _validateSwapParams(
        uint256 _chainId,
        uint256 _expirationTime,
        address _buyer
    ) private view {
        if (_chainId != block.chainid) {
            revert InvalidChainId();
        }

        if (block.timestamp > _expirationTime) {
            revert SwapExpired();
        }

        if (_buyer != address(0) && _buyer != _msgSender()) {
            revert UnauthorizedBuyer();
        }
    }

    /**
     * @notice - Decode data with swap information
     * @param _data - Data containing swap information
     */
    function _decodeSwapData(
        bytes memory _data
    )
        private
        pure
        returns (
            string memory,
            SwapType,
            address,
            address,
            address,
            uint256,
            address,
            uint256,
            uint256,
            uint256
        )
    {
        return
            abi.decode(
                _data,
                (
                    string,
                    SwapType,
                    address,
                    address,
                    address,
                    uint256,
                    address,
                    uint256,
                    uint256,
                    uint256
                )
            );
    }
}
