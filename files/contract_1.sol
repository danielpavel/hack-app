pragma solidity ^0.8.0;

contract BasicContract {

    uint256 public a;
    uint256 public b = 5;

    function incrementA() external {
        a++;
    }

    function decrementA() external {
        a--;
    }

    function testWithReturn(uint256 param) external pure returns (uint256) {
        return param + 1;
    }

    function computeStateVars() external view returns (uint256) {
        return a + b;
    }
}
