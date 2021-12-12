// SPDX-License-Identifier: MIT
// Daniel Timko, Harry Hokbyan, Mikhail Sharko, Atika Singh
pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import "./BlockchatBlockchain.sol";

contract BlockchatContactHelper is BlockchatBlockchain {

	event NewContact(address indexed _userAddress, address _contactAddress, string _name);

	mapping (address => address[]) public userContacts;

	function _checkUniqueContact(address senderAddress) public { 
		bool contactFound = false;

		for (uint8 i = 0; i < userContacts[msg.sender].length; i++) {
            if(userContacts[msg.sender][i] == senderAddress)
            {
            	contactFound = true;
            }
        }
        if(contactFound == false)
        {
        	userContacts[msg.sender].push(senderAddress);
        	emit NewContact(msg.sender, senderAddress, addressToName[senderAddress]);
        }
        contactFound = false;

        for (uint8 i = 0; i < userContacts[senderAddress].length; i++) {
            if(userContacts[senderAddress][i] == msg.sender)
            {
            	contactFound = true;
            }
        }
        if(contactFound == false)
        {
        	userContacts[senderAddress].push(msg.sender);
        	emit NewContact(senderAddress, msg.sender,addressToName[msg.sender]);
        }
	}
}