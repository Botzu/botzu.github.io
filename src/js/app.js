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
      return App.checkUser();
    });
    $.getJSON('BlockchatMessenger.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var BlockchatMessengerArtifact = data;
      App.contracts.BlockchatMessenger = TruffleContract(BlockchatMessengerArtifact);

      // set the provider for contract
      App.contracts.BlockchatMessenger.setProvider(App.web3Provider);
      //return App.checkMessages();
    });
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.sendmsg', App.handleMessage);
    $(document).on('click', '.regUser', App.handleNickname);
  },

  checkMessages: async function() {
    var messageInstance;
    var account;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      account = accounts[0];

      App.contracts.BlockchatMessenger.deployed().then(function(instance) {
        messageInstance = instance;
        receiverAccount = "0x5516d794F2303Ad9A1B683A8ec91Ee1ebC120537";
        //check messages here
        
        console.log(results);
      }).then(function(result) {

      }).catch(function(err) {

      });
    });
  },

  checkUser: async function() {
    var blockchatInstance;
    var account;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      account = accounts[0];

      App.contracts.BlockchatBlockchain.deployed().then(function(instance) {
        blockchatInstance = instance;
        return blockchatInstance._returnUser.call({from: account});
      }).then(function(addressToName) {
          $('#welcome-back').html("Welcome back, "+addressToName);
      }).catch(function(err) {
        //console.log(err.message);
          $('#content-container').addClass('block-content');
          var tmpString = "";
          tmpString += "<div class=\"modal-content\">";
          tmpString += "<div class=\"modal-header\">";
          tmpString += "<h2>Please create an account to continue</h2>";
          tmpString += "</div>";
          tmpString += "<hr />";
          tmpString += "&nbsp;This project requires a metamask account to access its contents."
          tmpString += "<br />"
          tmpString += "&nbsp;Please login in with your metamask account and then register below to begin."     
          tmpString += "<br /> <hr>";   
          tmpString += "<div class=\"modal-body\">";
          tmpString += "Please provide a username to start chatting.";
          tmpString += "<br /><br />";
          tmpString += "</div>";
          tmpString += "<div class=\"modal-footer\">";
          tmpString += "<label for=\"name\">Name (5 to 15 characters):</label>";
          tmpString += "<input type=\"text\" id=\"userName\" name=\"name\" required minlength=\"5\" maxlength=\"15\" size=\"12\">";
          tmpString += "<button type=\"button\" class=\"modal-btn regUser\">Register Name</button>";
          tmpString += "</div>";
          tmpString += "</div>";
          var handle = document.getElementById('myModal');
          handle.innerHTML = tmpString;
          $('#myModal').css("display","block");
        });
    });
  },

  returnMessageArray: async function(instance, receiver) {
    //var returnMsgArray = await instance.getMessagesbySender.call();
    console.log(returnMsgArray);
  },

  returnMessage: async function(instance, index) {
    var returnMessage = await instance.getMessageByIndex.call(index);
    console.log(returnMessage);
  },

  handleCreateUser: async function(instance, account, nickname) {
    var Blockname = await instance._createUser(nickname, {from: account, gas: 1000000, gasPrice: web3.toWei(1, 'gwei')});
    console.log(Blockname);
  },

  getMessages: async function(instance, receiver, account) {
    const messages = await instance.getMessageArray.call(receiver, {from: account});
    //console.log(messages);
    var indexArray = [];
    var tStampArray = [];
    var senderAddr = [];
    var i = 0;
    messages.forEach(function(data1,data2,data3){
      switch(i) {
        case 0:
          senderAddr = data3[0];
          break;
        case 1:
          tStampArray = data3[1];
          break;
        case 2:
          indexArray = data3[2];
          break;
        default:
      }
      i++;
    });
    for(let x = 0; x < indexArray.length; x++)
    {
      App.returnMessage(instance,indexArray[x].c[0]);
    }
    /*
    indexArray.forEach(function(data) {
      console.log(data[0]);
      App.returnMessage(instance,data[0]);
    });
    */
  },

  handleCreateMessage: async function(instance, receiver, message, account) {
    const tempTime = Date.now();
    console.log("Sender is  "+account+" the receiver is  "+receiver+" and the message is \n "+message);
    var newMessage = await instance.createMessage(receiver, message, tempTime, {from: account, gas: 1000000, gasPrice: web3.toWei(1, 'gwei')});
  },

  handleTimeStamp: function(event) {
   event.preventDefault();
    // grab the message from the text area to send
    var messageInstance;
    var account;
    // make sure that you are logged in before you try to send
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      // this is the wallet address
      account = accounts[0];
      //testing if its sending all the correct information
      App.contracts.BlockchatMessenger.deployed().then(function(instance) {
        messageInstance = instance;

        // Execute blockchat transaction example as transaction
        //
        //return App.returnMessage(blockchatInstance, account);
        return App.getMsgTimestamp(messageInstance);
      }).then(function(result) {
        //console.log(result);
        //return App.returnMessage(blockchatInstance, account);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleNickname: function(event) {
    event.preventDefault();
    // grab the message from the text area to send
    var userName = $('#userName').val();
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
        //
        //return App.returnMessage(blockchatInstance, account);
        return App.handleCreateUser(blockchatInstance, account, userName);
      }).then(function(result) {
        //console.log(result);
        console.log("account successfully created");
        $('#myModal').css("display","none");
        $('#content-container').removeClass('block-content');
        $('#welcome-back').html("Welcome back, "+userName);
        //return App.returnMessage(blockchatInstance, account);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleMessage: function(event) {
    event.preventDefault();
    // grab the message from the text area to send
    var messageText = $('.msg-text-area').val();
    var blockchatInstance;
    var account;
    var receiverAccount;
    // make sure that you are logged in before you try to send
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      // this is the wallet address
      account = accounts[0];
      receiverAccount = "0x5516d794F2303Ad9A1B683A8ec91Ee1ebC120537";
      //testing if its sending all the correct information
      App.contracts.BlockchatMessenger.deployed().then(function(instance) {
        blockmessageInstance = instance;
        //var index = 0;
        // Execute blockchat transaction example as transaction
        //return App.returnMessage(blockmessageInstance, index);
        //return App.handleCreateMessage(blockmessageInstance, receiverAccount, messageText, account);
        return App.getMessages(blockmessageInstance, receiverAccount, account);
      }).then(function(result) {
        //console.log(result);
        console.log("Message successfully received");
        //return App.returnMessage(blockchatInstance, account);
      }).catch(function(err) {
        console.log(err.message);
      });

      //console.log("current sender is "+account+" and the current message to send is "+messageText);
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
