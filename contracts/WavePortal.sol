// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import 'hardhat/console.sol';

contract WavePortal {
  uint256 totalWaves;
  
  uint256 private waitTime = 10 seconds;
  uint256 private seed;
  uint8 private chanceOfWinning = 25; // 25% chance of winning
  uint8 private maxWins = 3;
  
  event NewWave(address indexed from, uint256 timestamp, string message, bool winner);
  
  struct Wave {
    address waver;
    string message;
    uint256 timestamp;
    bool winner;
  }
  
  struct Winner {
    uint256 timesWon;
    uint256 lastWin;
  }
  
  mapping(address => Winner) public Winners;
  
  Wave[] waves;

  constructor() payable{
    console.log('Yo I\'m a contract and I\'m getting smarter and smarter!');
    seed = (block.timestamp + block.difficulty) % 100;
  }
  
  function wave(string memory _message) public returns (string memory) { 
    // uint256 prizeAmount = 0.0001 ether;
    uint256 prizeAmount = ((block.timestamp + block.difficulty) % 0.0001 ether);
    
    bool isWinner = false;
    
    require(Winners[msg.sender].lastWin + waitTime < block.timestamp, "You need to allow cooldown peroid to pass before waving again!");
      
    seed = (block.difficulty + block.timestamp + seed) % 100;
    console.log("Random seed #: %d", seed);
    
    require(prizeAmount <= address(this).balance, "[-] Whoops, trying to withdraw more ether than the contract has access to!");
    
    totalWaves += 1;
    console.log("%s has waved with message: %s", msg.sender, _message);
    
    if (seed <= chanceOfWinning){
      // require(Winners[msg.sender].timesWon < maxWins, "You have won the max amount of times!");
      if (Winners[msg.sender].timesWon < maxWins) {
        console.log(" - D%s won %d Ether!", msg.sender, prizeAmount);
        isWinner = true;
        
        (bool success, ) = (msg.sender).call{value: prizeAmount}("");
        require(success, "[-] Failed to withdraw money from contract!");
        Winners[msg.sender].timesWon += 1;
        Winners[msg.sender].lastWin = block.timestamp;    
        
        emit NewWave(msg.sender, block.timestamp, _message, isWinner);

        waves.push(Wave(msg.sender, _message, block.timestamp, isWinner));
        
        return 'Winner';
      
      }else {
        console.log("%s has won the max amount (%d) of times", msg.sender, maxWins);
      }
    }

    waves.push(Wave(msg.sender, _message, block.timestamp, isWinner));
    
    emit NewWave(msg.sender, block.timestamp, _message, isWinner);
    
    return 'Loser';
    
  }
  
  function getTotalWaves() public view returns (uint256) {
    console.log("We have %d total waves!", totalWaves);
    return totalWaves;
  }
  
  function getWavers() public view returns (Wave[] memory) {
    return waves;
  }
}