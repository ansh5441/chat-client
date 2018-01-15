// var BOSH_SERVICE = 'http://bosh.metajack.im:5280/xmpp-httpbind';
var BOSH_SERVICE = 'http://13.127.148.112:5280/http-bind/';


var connection = null;


function log(msg, data) {
    var tr = document.createElement('tr');
    var th = document.createElement('th');
    th.setAttribute("style", "text-align: left; vertical-align: top;");
    var td;

    th.appendChild(document.createTextNode(msg));
    tr.appendChild(th);

    if (data) {
        td = document.createElement('td');
        pre = document.createElement('code');
        pre.setAttribute("style", "white-space: pre-wrap;");
        td.appendChild(pre);
        pre.appendChild(document.createTextNode(vkbeautify.xml(data)));
        tr.appendChild(td);
    } else {
        th.setAttribute('colspan', '2');
    }

    $('#log').append(tr);
}

function rawInput(data) {
    log('RECV', data);
}

function rawOutput(data) {
    log('SENT', data);
}

function onConnect(status) {
    if (status == Strophe.Status.CONNECTING) {
        log('Strophe is connecting.');
    } else if (status == Strophe.Status.CONNFAIL) {
        log('Strophe failed to connect.');
        $('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.DISCONNECTING) {
        log('Strophe is disconnecting.');
    } else if (status == Strophe.Status.DISCONNECTED) {
        log('Strophe is disconnected.');
        $('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.CONNECTED) {
        log('Strophe is connected.');
        // createRoom();
        // connection.disconnect();
        mucListRooms()
    }
}

$(document).ready(function () {
    $('#connect').bind('click', function () {
        var button = $('#connect').get(0);
        if (button.value == 'connect') {
            button.value = 'disconnect';
            connection = new Strophe.Connection(BOSH_SERVICE);
            connection.rawInput = rawInput;
            connection.rawOutput = rawOutput;
            connection.connect('test1@localhost',
                '1234',
                onConnect);
            // connection.connect($('#jid').get(0).value,
            //     $('#pass').get(0).value,
            //     onConnect);
        } else {
            button.value = 'connect';
            connection.disconnect();
        }
    });

    // sendGroupMsg();
});
//
// conn = new Strophe.Connection(BOSH_SERVICE);
// conn.connect('test1@localhost', '1234', createRoom);

function createRoom() {
    console.log('creating room');
    var roomJid = 'testRoom@conference.localhost';
    var userJid = 'test1@localhost';
    var userName = 'test1';
    //send presence first for creating room
    var d = $pres({'from': userJid, 'to': roomJid + '/' + userName});
    connection.send(d.tree());


    iq = $iq({
        to: roomJid,
        type: 'set'
    }).c("query", {
        xmlns: Strophe.NS.MUC_OWNER
    });
    iq.c("x", {
        xmlns: "jabber:x:data",
        type: "submit"
    });

    //send configuration you want
    iq.c('field', {'var': 'FORM_TYPE'}).c('value').t('http://jabber.org/protocol/muc#roomconfig').up().up();
    iq.c('field', {'var': 'muc#roomconfig_publicroom'}).c('value').t('1').up().up();

    connection.sendIQ(iq.tree(), function () {
        console.log('success');
    }, function (err) {
        console.log('error', err);
    });
}

function sendGroupMsg() {
    // var room_name = $('#room').val() + '@conference.localhost';
    // var msg = $('#msg').val();
    var room_name = 'testRoom@conference.localhost';
    var msg = 'dsdsdsdsds';


    Chat.init();
    Chat.sendMessage(room_name, msg, "groupchat");
}


var Chat = {
    connection: new Strophe.Connection(BOSH_SERVICE),
    init: function () {
        this.connection.rawInput = rawInput;
        this.connection.rawOutput = rawOutput;
        this.connection.connect('test1@localhost', '1234');
    },
    sendMessage: function (messgeTo, message, type) {
        var messagetype = (type) ? type : 'chat';
        var reply;
        if (messagetype === 'groupchat') {
            reply = $msg({
                to: messgeTo,
                from: Chat.connection.jid,
                type: messagetype,
                id: Chat.connection.getUniqueId()
            }).c("body", {xmlns: Strophe.NS.CLIENT}).t(message);
        }
        else {
            reply = $msg({
                to: messgeTo,
                from: Chat.connection.jid,
                type: messagetype
            }).c("body").t(message);
        }
        Chat.connection.send(reply.tree());
        Chat.log('I sent ' + messgeTo + ': ' + message, reply.tree());
    },


    log: function (msg, data) {
        var tr = document.createElement('tr');
        var th = document.createElement('th');
        th.setAttribute("style", "text-align: left; vertical-align: top;");
        var td;

        th.appendChild(document.createTextNode(msg));
        tr.appendChild(th);

        if (data) {
            td = document.createElement('td');
            pre = document.createElement('code');
            pre.setAttribute("style", "white-space: pre-wrap;");
            td.appendChild(pre);
            pre.appendChild(document.createTextNode(vkbeautify.xml(data)));
            tr.appendChild(td);
        } else {
            th.setAttribute('colspan', '2');
        }

        $('#log').append(tr);
    }

};

mucListRooms = function () {
    // connection.muc.listRooms('localhost');
    console.log('list rooms');

    connection.disco.info('test1@localhost');

    connection.muc.listRooms(
        Strophe.getDomainFromJid('test1@localhost'),
        function (status) {
            Chat.log("List of Chat Rooms", status);
        },
        function (status) {
            Chat.log("Error getting Chat Rooms", status);
        }
    );
};

