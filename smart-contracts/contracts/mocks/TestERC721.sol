// SPDX-FileCopyrightText: 2023 Berry Block
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestERC721 is ERC721 {
    constructor() ERC721("TestERC721", "TestERC721") {}

    function mint(address _receiver, uint256[] calldata _ids) external {
        for (uint256 i = 0; i < _ids.length; i++) {
            _mint(_receiver, _ids[i]);
        }
    }
}
