// SPDX-License-Identifier: MIT
// Daniel Timko, Harry Hokbyan, Mikhail Sharko, Atika Singh
pragma solidity >=0.4.22 <0.9.0;

import "./BlockchatBlockchain.sol";

contract BlockchatMessenger {

	struct Messages{
		uint meesageId;
		string message;
		address sender;
		address receiver;
		uint256 timetamp;
	}

	Messages[] public blockmessages;
	address [] receiverMessageArray;

	// create a messsage here and call function to grab timestamp for display later
	function createMessage(address _receiveraddr, string memory _message, uint256 timeNow) public {
		//fill in
		uint id = blockmessages.length;
		blockmessages.push(Messages(id, _message, msg.sender, _receiveraddr, timeNow));
	}
	// call this to get the full array of messages
	function getMessageArray()public view returns( address  [] memory){
    	return receiverMessageArray;
	}
	// call this to get a timestamp of current block
	function getMessageTimestamp() public view returns (uint256){
        return block.timestamp;
    }
}