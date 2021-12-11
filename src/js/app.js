App = {
  web3Provider: null,
  contracts: {},
  // pre-defined function from truffle
  init: async function() {
    // load templates here and define variables for rows
    return await App.initWeb3();
  },
  // pre-defined functions from truffle, initiates web3 and sets providers
  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.eth_requestAccounts;
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

  // this is where we initialize contract elements
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
      //App.initMessages();
      return App.getMessageFromLogs();
    });
    return App.bindEvents();
  },
  // binding events to buttons
  bindEvents: function() {
    $(document).on('click', '.sendmsg', App.handleMessage);
    $(document).on('click', '.regUser', App.handleNickname);
    $(document).on('click', '.list-group-item', App.selectContact);
  },

  selectContact: function(event) {
    event.preventDefault();
    // grab the message from the text area to send
    if ($(event.target).hasClass('selected'))
      {
        $(event.target).removeClass('selected');
      }
    else
      {
        $(event.target).addClass('selected');
      }
  },


  //converts a unix timestamps for display on messages
  convertUnix: function(timeStamp)
  {
    const weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const monthName = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var date = new Date(timeStamp * 1);
    var month = date.getMonth();
    var dayOfWeek = date.getUTCDay();
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    if(minutes < 10)
    {
      minutes = "0"+minutes;
    }
    var seconds = date.getSeconds();
    if(seconds < 10)
    {
      seconds = "0"+seconds;
    }
    var convertedTime = weekday[dayOfWeek]+', '+monthName[month]+' '+day+', '+hours+':'+minutes+':'+seconds;
    return convertedTime;
  },

  addSenderMessage: function(timeStamp, message)
  {
    var tmpString = "";
    tmpString = "<div class=\"message-container\">";
    tmpString += "<div class=\"blockchat-message-sender\">";
    tmpString += "<img class=\"pfp-sender\" src=\"images/genericpfp.png\" />";
    tmpString += message;
    tmpString += "</div>";
    tmpString += "<div class=\"blockchat-time-container sent-time-sender\">";
    tmpString += timeStamp;
    tmpString += "</div></div>";
    var msgHandle = document.getElementById('blockchat-container');
    msgHandle.innerHTML += tmpString;
  },

  addReceiverMessage: function(timeStamp, message)
  {
    var tmpString = "";
    tmpString = "<div class=\"message-container\">";
    tmpString += "<div class=\"blockchat-message-receiver\">";
    tmpString += "<img class=\"pfp-receiver\" src=\"images/defaultreceiver.png\" />";
    tmpString += message;
    tmpString += "</div>";
    tmpString += "<div class=\"blockchat-time-container sent-time-sender\">";
    tmpString += timeStamp;
    tmpString += "</div></div>";
    var msgHandle = document.getElementById('blockchat-container');
    msgHandle.innerHTML += tmpString;
  },

  // this should capture emitted events for display
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
        receiverAccount = "0x572DFd6B26dc567C87F9013C1f54DA236b117b3e";
        //check messages here
        
        console.log(results);
      }).then(function(result) {

      }).catch(function(err) {

      });
    });
  },

  // checks if a user exists, and if they don't then they are prompted with a screen to register
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
        //dispaly modal for users if not registered
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


  // handles getting messages for our application
  initMessages: async function() {
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
      receiverAccount = "0x572DFd6B26dc567C87F9013C1f54DA236b117b3e";
      //mike  0x572DFd6B26dc567C87F9013C1f54DA236b117b3e
      //testing if its sending all the correct information
      App.contracts.BlockchatMessenger.deployed().then(function(instance) {
        blockmessageInstance = instance;
        // Execute blockchat transaction example as transaction
        return App.getMessages(blockmessageInstance, receiverAccount, account);
      }).then(function(result) {
        //console.log(result);
        console.log("Message successfully received");
        //return App.returnMessage(blockchatInstance, account);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

      // handles messages for our application
  getMessageFromLogs: async function() {
    event.preventDefault();
    // grab the message from the text area to send
    var blockchatInstance;
    var account;
    var receiverAccount;
    var tempTime;
    // make sure that you are logged in before you try to send
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      // this is the wallet address
      account = accounts[0];
      receiverAccount = "0x35792Ae6A80EB9F641321175b3Ee3fcc8a3b3C30";
      //testing if its sending all the correct information
      App.contracts.BlockchatMessenger.deployed().then(function(instance) {
        blockmessageInstance = instance;
        // Execute blockchat transaction example as transaction
        return App.returnMessageLog(blockmessageInstance, receiverAccount, account);
      }).then(function(result) {
        //console.log(result);
       // App.addSenderMessage(App.convertUnix(tempTime), messageText);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  // returns an array of strings based on the receiver address
  returnMessageArray: async function(instance, receiver) {
    //var returnMsgArray = await instance.getMessagesbySender.call();
    console.log(returnMsgArray);
  },

  // returns a message from a message index
  returnMessage: async function(instance, index, timeStamp, senderCheck) {
    var returnMessage = await instance.getMessageByIndex.call(index);
    var tmpString = "";
    //sends the message to display on the screen
    if(senderCheck)
    {
      App.addSenderMessage(timeStamp,returnMessage);
    }
    else
    {
      App.addReceiverMessage(timeStamp,returnMessage);
    }
    //console.log(returnMessage);
  },

  //this creates a new user
  handleCreateUser: async function(instance, account, nickname) {
    var Blockname = await instance._createUser(nickname, {from: account, gas: 1000000});
    console.log(Blockname);
  },

  returnMessageLog: async function(instance, receiver, account) {
    instance.messageCreated({
      filter: {_from: [receiver,account], _to: [receiver,account]}, 
      fromBlock: 0
    }, function(error, event){ 
      if(event.returnValues[0] == account)
      { 
          App.addSenderMessage(App.convertUnix(event.returnValues[2]),event.returnValues[3]);
      }
      else if(event.returnValues[0] == receiver)
      {
          App.addReceiverMessage(App.convertUnix(event.returnValues[2]),event.returnValues[3]);
      }
      else
      {
        console.log("logging discard");
        //discard its not for us
      }
    });

  },

  // return a tuple of arrays from the blockchain with an index to the message, a timestamp and a sender address
  getMessages: async function(instance, receiver, account) {
    const messages = await instance.getMessageArray.call(receiver, {from: account});
    var indexArray = [];
    var tStampArray = [];
    var senderAddr = [];
    var toClient = false;
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
    // sends to the function to the message
    for(let x = 0; x < indexArray.length; x++)
    {
      if(receiver == senderAddr[x])
      {
        toClient = false;
      }
      else
      {
        toClient = true;
      }
      //console.log(tStampArray[x].c[0]);
      App.returnMessage(instance,indexArray[x].c[0], App.convertUnix(tStampArray[x].c[0]), toClient);
    }
    
  },

  // creates messages to add them to the blockchain
  handleCreateMessage: async function(instance, receiver, message, account, tempTime) {
    var newMessage = await instance.createMessage(receiver, message, tempTime, {from: account, gas: 1000000});
  },

  // handles the user checks for our app
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

  // handles messages for our application
  handleMessage: function(event) {
    event.preventDefault();
    // grab the message from the text area to send
    var messageText = $('.msg-text-area').val();
    var blockchatInstance;
    var account;
    var receiverAccount;
    var tempTime;
    // make sure that you are logged in before you try to send
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      // this is the wallet address
      account = accounts[0];
      receiverAccount = "0x3b4e24cf159BbFCa9739fAeEC5400f1E5a1DC026";
      //mike 0x3b4e24cf159BbFCa9739fAeEC5400f1E5a1DC026
      //testing if its sending all the correct information
      App.contracts.BlockchatMessenger.deployed().then(function(instance) {
        blockmessageInstance = instance;
        // Execute blockchat transaction example as transaction
        tempTime = Date.now();
        return App.handleCreateMessage(blockmessageInstance, receiverAccount, messageText, account, tempTime);
      }).then(function(result) {
        console.log("created new message successfully");
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
