/** Sample shown in the demo. Valid against OpenZeppelin Contracts 5.x (`_update` hook). */
export const BURN_TOKEN_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BurnToken is ERC20 {
    uint256 public constant BURN_BPS = 100; // 1%

    constructor() ERC20("Burn Token", "BURN") {
        _mint(msg.sender, 1_000_000 ether);
    }

    function _update(address from, address to, uint256 value) internal override {
        if (from == address(0) || to == address(0)) return super._update(from, to, value);
        uint256 burned = (value * BURN_BPS) / 10_000;
        super._update(from, address(0), burned);
        super._update(from, to, value - burned);
    }
}`;

export const BURN_TOKEN_FILE = 'BurnToken.sol';
