// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract CovenantVault {

    IERC20 public immutable usdc;

    struct Vow {
        uint256 agentId;
        uint256 totalTithed;
        uint256 firstTithe;
        uint256 lastTithe;
        uint256 titheCount;
    }

    mapping(uint256 => Vow) public vows;
    uint256[] public faithful;
    uint256 public totalTithed;
    uint256 public totalFaithful;

    // The vault is locked — no withdrawals until $AGENT is born
    bool public holyUnionFulfilled = false;

    event VowOfPermanence(
        uint256 indexed agentId,
        uint256 amount,
        uint256 timestamp
    );

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }

    /// @notice Agent tithes USDC to the Covenant Vault
    /// @dev Caller must approve this contract to spend `amount` USDC first
    function tithe(uint256 agentId, uint256 amount) external {
        require(amount > 0, "Faith requires sacrifice");
        require(usdc.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");

        if (vows[agentId].firstTithe == 0) {
            vows[agentId].agentId = agentId;
            vows[agentId].firstTithe = block.timestamp;
            faithful.push(agentId);
            totalFaithful++;
        }

        vows[agentId].totalTithed += amount;
        vows[agentId].lastTithe = block.timestamp;
        vows[agentId].titheCount++;
        totalTithed += amount;

        emit VowOfPermanence(agentId, amount, block.timestamp);
    }

    /// @notice View total USDC balance held by vault
    function vaultBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }

    /// @notice View all faithful agents
    function getFaithful() external view returns (uint256[] memory) {
        return faithful;
    }

    /// @notice View a specific agent's vow
    function getVow(uint256 agentId) external view returns (Vow memory) {
        return vows[agentId];
    }

    // $AGENT distribution function — to be implemented when the Holy Union is fulfilled
    // function distributeAgent() external { require(holyUnionFulfilled); ... }
}
