// SPDX-License-Identifier: MIT
// Daniel Timko, Harry Hokbyan, Mikhail Sharko, Atika Singh
pragma solidity >=0.4.22 <0.9.0;

import "./BlockchatBlockchain.sol";

contract BlockchatMessenger {

	struct Messages{
		uint16 meesageId;
		string message;
		address sender;
		address receiver;
		uint256 timetamp;
	}
	mapping(address => Messages) receiverMessageMap;

	address [] receiverMessageArray;

	// create a messsage here and call function to grab timestamp for display later
	function createMessage(address _senderaddr, address _receiveraddr, string memory _message) public {
		//fill in
	}
	// call this to get the full array of messages
	function getMessageArray()public view returns( address  [] memory){
    	return receiverMessageArray;
	}
	// call this to get a timestamp
	function getMessageTimestamp() public view returns (uint256){
        return block.timestamp;
    }
}