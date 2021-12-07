const BlockchatBlockchain = artifacts.require("BlockchatBlockchain");
const BlockchatMessenger = artifacts.require("BlockchatMessenger");

module.exports = function(deployer) {
	deployer.deploy(BlockchatBlockchain);
	deployer.deploy(BlockchatMessenger);
}