pragma solidity 0.8.9;

contract BlockchatBlockchain {

	event NewUser(uint userId, string name);

	struct User {
		string name;
	}

	User[] public blockchatters;

	mapping (uint => address) public userToAddress;
	mapping (address => uint) usersCount;

	function _createUser(string memory _name) internal {
		blockchatters.push(User(_name));
		uint id = blockchatters.length - 1;
		userToAddress[id] = msg.sender;
		usersCount[msg.sender]++;
		emit NewUser(id,_name);
	}
}