App = {
  web3Provider: null,
  contracts: {},
  contacts: [],
  Users: [],
  currentBlock: 0,
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
    App.currentBlock = await web3.eth.getBlockNumber();
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
      return App.getMessageFromLogs();
    });
    return App.bindEvents();
  },
  // binding events to buttons
  bindEvents: function() {
    $(document).on('click', '.sendmsg', App.handleMessage);
    $(document).on('click', '.regUser', App.handleNickname);
    $(document).on('click', '.contact-group-item', App.selectContact);
    $(document).on('click', '.add-button', App.addContact);
    $(document).on('click', '.emoji-icons', App.insertEmoji);
    $(document).on('click', '#emoji', App.emojiToggle);
    $(document).on('click', '.contactItem', App.setContactItem)
  },

  setContactItem: function(event) {
    event.preventDefault();
    var cName = $('#Search');
    cName.val($(event.target).attr('name'));
  },

  addContact: function(event) {
    event.preventDefault();
    var cName = $('#Search').val();
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

         return blockchatInstance._returnAddressByName.call(cName, {from: account});
      }).then(function(result) {
        if(account == result)
        {
          // its us so no need to add
        }
        else
        {
          App.handleContact(result,cName);
        }
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleContact: function(result, cName)
  {
    if(result != "0x0000000000000000000000000000000000000000")
    { 
        var duplicate = false;
        var contactHandle = $('#contact-list-group');
        contactHandle.children().each(function () {
        if ($(this).attr('id') == result)
        {
          duplicate = true;
        }
        });
        var tmpString = "<li id = \""+result+"\" name = \""+cName+"\" class=\"list-group-item contact-group-item\">";
        tmpString += cName
        tmpString += "</li>";
        if(!duplicate)
        {
          contactHandle.append(tmpString);
        }
    }      
  },

  selectContact: function(event) {
    event.preventDefault();
    // grab the message from the text area to send
    var eventParent = $(event.target).parent();
    if($(event.target).hasClass('selected'))
    {
      // do nothing alread selected
    }
    else
    {
      eventParent.children().each(function () {
        if ($(this).hasClass('selected'))
        {
          $(this).removeClass('selected');
        }
      });
      $(event.target).addClass('selected');
      return App.checkMessages($(event.target).attr('id'));
    }
  },

  getSelectedContact: function()
  {
    var selected = "";
    var contactHandle = $('#contact-list-group');
    contactHandle.children().each(function () {
      if ($(this).hasClass('selected'))
      {
       selected = $(this).attr('id');
      }
    });
    
    return selected;
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

  addSenderMessage: function(timeStamp, message, name)
  {
    var tmpString = "";
    tmpString = "<div class=\"message-container\">";
    tmpString += "<div class=\"blockchat-message-sender\">";
    tmpString += "<img class=\"pfp-sender\" src=\"images/genericpfp.png\" />";
    tmpString += message;
    tmpString += "</div>";
    tmpString += "<div class=\"blockchat-name-container\">";
    tmpString += name;
    tmpString += "</div>";
    tmpString += "<div class=\"blockchat-time-container sent-time-sender\">";
    tmpString += timeStamp;
    tmpString += "</div></div>";
    var msgHandle = document.getElementById('blockchat-container');
    msgHandle.innerHTML += tmpString;
  },

  addReceiverMessage: function(timeStamp, message, name)
  {
    var tmpString = "";
    tmpString = "<div class=\"message-container\">";
    tmpString += "<div class=\"blockchat-message-receiver\">";
    tmpString += "<img class=\"pfp-receiver\" src=\"images/defaultreceiver.png\" />";
    tmpString += message;
    tmpString += "</div>";
    tmpString += "<div class=\"blockchat-name-container-receiver \">";
    tmpString += name;
    tmpString += "</div>";
    tmpString += "<div class=\"blockchat-time-container sent-time-receiver\">";
    tmpString += timeStamp;
    tmpString += "</div></div>";
    var msgHandle = document.getElementById('blockchat-container');
    msgHandle.innerHTML += tmpString;
  },

  // this should capture emitted events for display
  checkMessages: async function(id) {
    var messageInstance;
    var account;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      account = accounts[0];

      App.contracts.BlockchatMessenger.deployed().then(function(instance) {
        messageInstance = instance;
        var msgHandle = document.getElementById('blockchat-container');
        msgHandle.innerHTML = "";
        receiverAccount = id;
        //check messages here
        App.returnMessageLog(blockmessageInstance, receiverAccount, account);
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
        return blockchatInstance._getUserByAddress.call(account);
      }).then(function(addressToName) {
          $('#welcome-back').html("Welcome back, "+addressToName);
          return App.fillUserArray(blockchatInstance, account);
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
          handle.innerHTML += tmpString;
          $('#myModal').css("display","block");
        });
    });
  },

  // handles grabbing messages from logs for our application
  getMessageFromLogs: async function() {
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
      //default receiver account
      receiverAccount = "0x0000000000000000000000000000000000000000";
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
  fillUserArray: async function(instance, account) {
    instance.NewUser({
      fromBlock: 0
    }, function(error, event) { 
      App.Users.push(event);
      if(account != event.returnValues[0])
      {
        var userSearchHandle = document.getElementById('search-dropdown');
        userSearchHandle.innerHTML += "<a href=\"#\" class=\"contactItem\" name = \""+event.returnValues[1]+"\" id = \""+event.returnValues[0]+"\">"+event.returnValues[1]+"</a>";
        App.updateContacts(event.returnValues[0],event.returnValues[1]);
      }
      // need function to rename if no available
    });
  },

  // in the off chance that a message comes in for someone that isn't added yet
  updateContacts: function(address, name)
  {
    var contactHandle = $('#contact-list-group');
    contactHandle.children().each(function () {
      if ($(this).attr('id') == address)
        {
          $(this).attr('name',name);
          $(this).html(name);
        }
      });
  },

  //this creates a new user
  handleCreateUser: async function(instance, account, nickname) {
    var Blockname = await instance._createUser(nickname, {from: account, gas: 1000000});
    console.log(Blockname);
  },

  returnMessageLog: async function(instance, receiver, account) {
    instance.messageCreated({
      //filter: {_from: [receiver,account], _to: [receiver,account]}, 
      fromBlock: 0,
      topics: account
    }, function(error, event){ 
      console.log(App.currentBlock); 
      receiver = App.getSelectedContact();
      if(event.returnValues[0] == account)
      { 
        var contactCheck = false;
        for (contact of App.contacts) {
           if(contact == event.returnValues[1])
           {
              contactCheck = true;
           }
        }
        if(!contactCheck)
        {
          App.contacts.push(event.returnValues[1]);
          App.handleContact(event.returnValues[1], App.returnUserName(event.returnValues[1]));
        }
        if (event.returnValues[1] == receiver)
        {
          var name = App.returnUserName(event.returnValues[0]);
          App.addSenderMessage(App.convertUnix(event.returnValues[2]),event.returnValues[3], name);
        }
        else
        {
          //drop it
        }
      }
      else if(event.returnValues[1] == account)
      {
        receiver = App.getSelectedContact();
        var contactCheck = false;
        for (contact of App.contacts) {
           if(contact == event.returnValues[0])
           {
              contactCheck = true;
           }
        }
        if(!contactCheck)
        {
          App.contacts.push(event.returnValues[0]);
          App.handleContact(event.returnValues[0], App.returnUserName(event.returnValues[0]));
        }
        if ((receiver == "0x0000000000000000000000000000000000000000") || (event.returnValues[0] == receiver))
        {
          var name = App.returnUserName(event.returnValues[0]);
          App.addReceiverMessage(App.convertUnix(event.returnValues[2]),event.returnValues[3], name);
        }
        else
        {
          //drop it
        }
      }
      else
      {
        // this should never happen 
      }
    });

  },

  returnUserName: function(address)
  {
    for (user of App.Users) {
      if(user.returnValues[0] == address)
      {
        return user.returnValues[1];
      }
    }
    return "";

  },

  // creates messages to add them to the blockchain
  handleCreateMessage: async function(instance, receiver, message, account, tempTime) {
    var newMessage = await instance.createMessage(receiver, message, tempTime, {from: account, gas: 1000000});
  },

  // handles creating a new account
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
        return App.fillUserArray(blockchatInstance, account);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  emojiToggle: function(event) {  
    event.preventDefault();
    $(".my_emoji").toggle();
  },

  insertEmoji: function(event){
    event.preventDefault();
    document.getElementById("emj").value += event.target.textContent;
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
      receiverAccount = App.getSelectedContact();
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