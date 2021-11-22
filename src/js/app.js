App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // load templates here and define variables for rows
    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('BlockchatBlockchain.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var BlockchatBlockchainArtifact = data;
      App.contracts.BlockchatBlockchain = TruffleContract(BlockchatBlockchainArtifact);

      // set the provider for contract
      App.contracts.BlockchatBlockchain.setProvider(App.web3Provider);
    });
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.sendmsg', App.handleMessage);
    // $(document).on('click', '.nickname', App.handleNickname);
  },

  returnMessage: async function(instance, account) {
    var returnName = await instance._returnUser.call({from: account});
    if(returnName === "Daniel")
      {
        console.log("Did I do it:" + returnName);
      }
    else
      {
        console.log("something went wrong");
      }
  },

  handleCreateUser: async function(instance, account) {
    var Blockname = await instance._createUser("Daniel", {from: account, gas: 1000000, gasPrice: web3.toWei(2, 'gwei')});
    console.log(Blockname);
  },

  handleMessage: function(event) {
    event.preventDefault();
    // grab the message from the text area to send
    var messageText = $('.msg-text-area').val();
    var blockchatInstance;
    var account;
    // make sure that you are logged in before you try to send
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      // this is the wallet address
      account = accounts[0];
      //testing if its sending all the correct information
      App.contracts.BlockchatBlockchain.deployed().then(function(instance) {
        blockchatInstance = instance;

        // Execute blockchat transaction example as transaction
        return App.returnMessage(blockchatInstance, account);
      }).then(function(result) {
        console.log(result);
        //return App.returnMessage(blockchatInstance, account);
      }).catch(function(err) {
        console.log(err.message);
      });

      console.log("current sender is "+account+" and the current message to send is "+messageText);
    });
  },

  loadloginpage: function() {
    // get user address and nickname before entering main page of site

  },

  checkLogin: function() {
    // when the user enters the DApp check if they are logged into metamask and if a nickname is set

  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
