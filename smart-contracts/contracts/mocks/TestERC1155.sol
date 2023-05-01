// SPDX-FileCopyrightText: 2023 Berry Block
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract TestERC1155 is ERC1155 {
    constructor() ERC1155("https://random.com") {}

    function mint(
        address _receiver,
        uint256[] calldata _ids,
        uint256[] calldata _amounts
    ) external {
        for (uint256 i = 0; i < _ids.length; i++) {
            _mint(_receiver, _ids[i], _amounts[i], "");
        }
    }
}
