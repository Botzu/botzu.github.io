var BlockchatBlockchain = artifacts.require("BlockchatBlockchain");

module.exports = function(deployer) {
	deployer.deploy(BlockchatBlockchain);
}