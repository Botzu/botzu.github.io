// SPDX-License-Identifier: MIT
// Daniel Timko, Harry Hokbyan, Mikhail Sharko, Atika Singh
pragma solidity ^0.8.4;

contract BlockchatBlockchain {
	
	event NewUser(address indexed userAddress, string name);

	struct User {
		address userAddress;
		string name;
	}

	User[] public blockchatters;
	mapping (address => string) public addressToName;
	mapping (string => address) public userToAddress;
	mapping (address => uint) usersCount;

	function _returnUser() public view returns(string memory) {
		require(usersCount[msg.sender] > 0);
		return addressToName[msg.sender];
	}

	function _getUserByAddress(address _address) public view returns(string memory) {
		require(usersCount[_address] > 0);
		return addressToName[_address];
	}

	function _returnAddressByName(string memory _name) public view returns(address) {
		return userToAddress[_name];
	}

	function _requireUnique(string memory _name) public view returns(bool check)
	{
		for (uint8 i = 0; i < blockchatters.length; i++) {
            if(keccak256(abi.encodePacked(blockchatters[i].name)) == keccak256(abi.encodePacked(_name)))
            {
            	return false;
            }
        }
        return true;
	}

	function _createUser(string memory _name) public {
		// check if user exists
		require(_requireUnique(_name) == true);
		require(usersCount[msg.sender] == 0);
		blockchatters.push(User(msg.sender, _name));
		usersCount[msg.sender]++;
		userToAddress[_name] = msg.sender;
		addressToName[msg.sender] = _name;
		emit NewUser(msg.sender, _name);
	}
}