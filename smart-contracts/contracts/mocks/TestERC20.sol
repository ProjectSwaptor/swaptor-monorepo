// SPDX-FileCopyrightText: 2023 Berry Block
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestERC20 is ERC20 {
    constructor() ERC20("TestERC20", "TestERC20") {}

    function mint(address _receiver, uint256 _amount) external {
        _mint(_receiver, _amount);
    }
}
