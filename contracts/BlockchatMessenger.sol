// SPDX-License-Identifier: MIT
// Daniel Timko, Harry Hokbyan, Mikhail Sharko, Atika Singh
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

import "./BlockchatBlockchain.sol";

contract BlockchatMessenger {

	event messageCreated(address indexed _from, address indexed _to, uint _timeStamp, string _message);

	struct Message{
		uint meesageId;
		string message;
		address sender;
		address receiver;
		uint256 tstamp;
	}

	Message[] public blockmessages;
	address[] receiverMessageArray;

	// create a messsage here and call function to grab timestamp for display later
	function createMessage(address _receiveraddr, string memory _message, uint256 timeNow) public {
		//fill in
		uint id = blockmessages.length;
		blockmessages.push(Message(id, _message, msg.sender, _receiveraddr, timeNow));
		emit messageCreated(msg.sender, _receiveraddr, timeNow, _message);
	}
	// call this to get the full array of messages
	function getMessageArray(address _receiveraddr) public view returns(address[] memory, uint[] memory, uint8[] memory) {
        uint256 messageCount;

        for (uint i = 0; i < blockmessages.length; i++) {
            if((blockmessages[i].sender == msg.sender) && (blockmessages[i].receiver == _receiveraddr))
            {
            	messageCount++;
            }
            else if ((blockmessages[i].sender == _receiveraddr) && (blockmessages[i].receiver == msg.sender))
            {
            	messageCount++;
            }
        }

        address[] memory rAddr = new address[](messageCount);
        uint256[] memory timeStamp = new uint256[](messageCount);
        uint8[] memory indexes = new uint8[](messageCount);

    	uint j;

    	for (uint8 i = 0; i < blockmessages.length; i++) {
            if((blockmessages[i].sender == msg.sender) && (blockmessages[i].receiver == _receiveraddr))
            {
            	rAddr[j] = blockmessages[i].sender;
            	timeStamp[j] = blockmessages[i].tstamp;
            	indexes[j] = i;
            	j++;
            }
            else if ((blockmessages[i].sender == _receiveraddr) && (blockmessages[i].receiver == msg.sender))
            {
            	rAddr[j] = blockmessages[i].sender;
            	timeStamp[j] = blockmessages[i].tstamp;
            	indexes[j] = i;
            	j++;
            }
        }

    	return (rAddr,timeStamp,indexes); 
	}

	function getMessagesbySender() public view returns(string[] memory) {
        uint256 messageCount;

        for (uint i = 0; i < blockmessages.length; i++) {
            if(blockmessages[i].sender == msg.sender)
            {
            	messageCount++;
            }
        }

        string[] memory senderMessages = new string[](messageCount);
    	uint j = 0;

    	for (uint i = 1; i < blockmessages.length; i++) {
            if(blockmessages[i].sender == msg.sender)
            {
            	senderMessages[j] = blockmessages[i].message;
            	j++;
            }
        }
    	return senderMessages; 
	}

	function getMessageByIndex(uint _index) public view returns(string memory) {
		return blockmessages[_index].message;
	}
	// call this to get a timestamp of current block
	function getMessageTimestamp() public view returns (uint256){
        return block.timestamp;
    }
}