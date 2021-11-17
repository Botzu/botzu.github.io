// SPDX-License-Identifier: MIT
// Daniel Timko, Harry Hokbyan, Mikhail Sharko, Atika Singh
pragma solidity 0.8.9;

contract BlockchatBlockchain {

	event NewUser(uint userId, string name);

	struct User {
		string name;
	}

	User[] public blockchatters;
	mapping (address => string) public addressToName;
	mapping (uint => address) public userToAddress;
	mapping (address => uint) usersCount;

	function _returnUser() public view returns(string memory) {
		require(usersCount[msg.sender] == 0);
		return addressToName[msg.sender];
	}

	function _createUser(string memory _name) public {
		// check if user exists
		require(usersCount[msg.sender] == 0);
		blockchatters.push(User(_name));
		uint id = blockchatters.length - 1;
		userToAddress[id] = msg.sender;
		usersCount[msg.sender]++;
		addressToName[msg.sender] = _name;
		//emit NewUser(id,_name);

		//mike changes

		//dan changes

		//dfgdfgdfgdf
	}
}