const BlockchatArtifact = artifacts.require('BlockchatBlockchain.sol');

contract('BlockchatArtifact', () => {
	it('Should add my name and then read it back', async () => {
		
		const Blockchat = await BlockchatArtifact.new();
		/*
		await Blockchat.updateData(10);
		const data = await Blockchat.readData();
		assert(data.toString() === '10');
		*/
		await Blockchat._createUser("Daniel");
	    const name = await Blockchat._returnUser();
		assert(name.toString() === "Daniel");
	});
});