// SPDX-License-Identifier: MIT
// Daniel Timko, Harry Hokbyan, Mikhail Sharko, Atika Singh
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

import "./BlockchatBlockchain.sol";

contract BlockchatMessenger {

	struct Messages{
		uint meesageId;
		string message;
		address sender;
		address receiver;
		uint256 tstamp;
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
	function getMessageArray(address _receiveraddr) public view returns(string[] memory, address[] memory, uint[] memory) {
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

        string[] memory msgContent = new string[](messageCount);
        address[] memory rAddr = new address[](messageCount);
        uint256[] memory timeStamp = new uint256[](messageCount);

    	uint256 j;

    	for (uint i = 0; i < blockmessages.length; i++) {
            if((blockmessages[i].sender == msg.sender) && (blockmessages[i].receiver == _receiveraddr))
            {
            	msgContent[j] = blockmessages[i].message;
            	rAddr[j] = blockmessages[i].sender;
            	timeStamp[j] = blockmessages[i].tstamp;
            	j++;
            }
            else if ((blockmessages[i].sender == _receiveraddr) && (blockmessages[i].receiver == msg.sender))
            {
            	msgContent[j] = blockmessages[i].message;
            	rAddr[j] = blockmessages[i].sender;
            	timeStamp[j] = blockmessages[i].tstamp;
            	j++;
            }
        }

    	return (msgContent,rAddr,timeStamp); 
	}

	function getMessageByIndex(uint _index) public view returns(string memory) {
		return blockmessages[_index].message;
	}
	// call this to get a timestamp of current block
	function getMessageTimestamp() public view returns (uint256){
        return block.timestamp;
    }
}