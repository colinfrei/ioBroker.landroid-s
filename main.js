
/* jshint -W097 */// jshint strict:false
/*jslint node: true */
"use strict";

// you have to require the utils module and call adapter function
var utils =    require(__dirname + '/lib/utils'); // Get common adapter utils
var adapter = utils.adapter('landroid-s');

var LandroidCloud  = require(__dirname + '/lib/landroid-cloud');

var landroidS  = require(__dirname + '/responses/landroid-s.json');
// var request = require('request'); // https://github.com/request/request

var ip, pin, data, getOptions, error, state;

var firstSet= true;

data=landroidS;

var landroid;
// is called when adapter shuts down - callback has to be called under any circumstances!
adapter.on('unload', function (callback) {
    try {
        adapter.log.info('cleaned everything up...');
        callback();
    } catch (e) {
        callback();
    }
});
// is called if a subscribed object changes
adapter.on('objectChange', function (id, obj) {
    // Warning, obj can be null if it was deleted

    //adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
    if (!state || state.ack) return;


    // output to parser



});

// is called if a subscribed state changes
adapter.on('stateChange', function (id, state) {
    // Warning, state can be null if it was deleted
    //if(!(obj.from === ("system.adapter."+ adapter.namespace))){
    //  adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(obj));
    //}
    //adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));
//adapter.log.info('stateChange ' +obj.from );

    // you can use the ack flag to detect if it is status (true) or command (false)
    if (state && !state.ack) {
      var command = id.split('.').pop();

      adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));
      if (command=="state") {
        if(state.val === true){
          startMower();
        }
        else{
          stopMower();
        }

      }
    }
});

// Some message was sent to adapter instance over message box. Used by email, pushover, text2speech, ...
adapter.on('message', function (obj) {
    if (typeof obj == 'object' && obj.message) {
        if (obj.command == 'send') {
            // e.g. send email or pushover or whatever
            console.log('send command');

            // Send response in callback if required
            if (obj.callback) adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
        }
    }
});

function startMower() {
    if(state ===1 && error ==0){
      landroid.sendMessage('{"cmd":1}');//start code for mower
      adapter.log.info("Start Landroid");
    }
    else{
      adapter.log.warn("Can not start mover because he is not at home or there is an Error please take a look at the mover");
      adapter.setState("mower.state",  {val: false, ack: true});
    }
}
function stopMower() {
    if(state ===7 && error ==0){
      landroid.sendMessage('{"cmd":3}');//"Back to home" code for mower
      adapter.log.info("Landroid going back home");
    }
    else{
      adapter.log.warn("Can not stop mover because he did not mow or theres an error");
      adapter.setState("mower.state", {val: true, ack: true});
    }
}

function procedeLandroidS(){
  var Button;
  if(true) {
    adapter.deleteState("landroid-s.0","mower","start");
    adapter.deleteState("landroid-s.0","mower","stop");
    adapter.setObjectNotExists('mower.state', {
        type: 'state',
        common: {
            name: "Start/Stop",
            type: "boolean",
            role: "state",
            read: true,
            write: true,
            desc: "Start and stop the mover",
            smartName: "Rasenmäher"
        },
        native: {}
    });

  }

    adapter.setObjectNotExists('mower.totalTime', {
        type: 'state',
        common: {
            name: "Total mower time",
            type: "number",
            role: "value.interval",
            unit: "h",
            read: true,
            write: false,
            desc: "Total time the mower has been mowing in hours"
        },
        native: {}
    });
    adapter.setObjectNotExists('mower.totalDistance', {
    type: 'state',
    common: {
        name: "Total mower distance",
        type: "number",
        role: "value.interval",
        unit: "km",
        read: true,
        write: false,
        desc: "Total distance the mower has been mowing in hours"
    },
    native: {}
});
adapter.setObjectNotExists('mower.totalBladeTime', {
type: 'state',
common: {
    name: "Runtime of the blades",
    type: "number",
    role: "value.interval",
    unit: "h",
    read: true,
    write: false,
    desc: "Total distance the mower has been mowing in hours"
},
native: {}
});
adapter.setObjectNotExists('mower.batteryCharging', {
    type: 'state',
    common: {
        name: "Battery charger state",
        type: "boolean",
        role: 'indicator',
        read: true,
        write: false,
        desc: "Battery charger state",
        default: false
    },
    native: {}
});
adapter.setObjectNotExists('mower.batteryVoltage', {
type: 'state',
common: {
    name: "Battery voltage",
    type: "number",
    role: "value.interval",
    unit: "V",
    read: true,
    write: false,
    desc: "Voltage of movers battery"
},
native: {}
});
adapter.setObjectNotExists('mower.batteryTemterature', {
type: 'state',
common: {
    name: "Battery temperature",
    type: "number",
    role: "value.interval",
    unit: "°C",
    read: true,
    write: false,
    desc: "Temperature of movers battery"
},
native: {}
});
adapter.setObjectNotExists('mower.batteryTemterature', {
type: 'state',
common: {
    name: "Battery temperature",
    type: "number",
    role: "value.interval",
    unit: "°C",
    read: true,
    write: false,
    desc: "Temperature of movers battery"
},
native: {}
});
adapter.setObjectNotExists('mower.sentest', {
type: 'state',
common: {
    name: "Battery temperature",
    type: "sting",
    read: true,
    write: true,
    desc: "testtosend"
},
native: {}
});
adapter.setObjectNotExists('mower.error', {
type: 'state',
common: {
    name: "Error code",
    type: "number",
    read: true,
    write: false,
    desc: "Error code",
    states:{
      0: "No error",
      1: "Trapped",
      2: "Lifted",
      3: "Wire missing",
      4: "Outside wire",
      5: "Raining",
      6: "Close door to mow",
      7: "Close door to go home",
      8: "Blade motor blocked",
      9: "Wheel motor blocked",
      10: "Trapped timeout",  // Not sure what this is
      11: "Upside down",
      12: "Battery low",
      13: "Reverse wire",
      14: "Charge error",
      15: "Timeout finding home"  // Not sure what this is
    }
},
native: {}
});
adapter.setObjectNotExists('mower.status', {
type: 'state',
common: {
    name: "Landroid status",
    type: "number",
    read: true,
    write: false,
    desc: "Current status of lawn mower",
    states:{
      0: "Idle",
      1: "Home",
      2: "Start sequence",
      3: "Leaving home",
      4: "Follow wire",
      5: "Searching home",
      6: "Searching wire",
      7: "Mowing",
      8: "Lifted",
      9: "Trapped",
      10: "Blade blocked",  // Not sure what this is
      11: "Debug",
      12: "Remote control"
    }
},
native: {}
});




firstSet = false;

  //  adapter.setState("mower.totalTime", {val: data.ore_movimento * 0.1, ack: true});
}


function evaluateResponse() {
    adapter.setState("lastsync", {val: new Date().toISOString(), ack: true});
    adapter.setState("firmware", {val: data.dat.fw, ack: true});

    //evaluateCalendar(data.ora_on, data.min_on, data.ore_funz);

    adapter.setState("mower.waitRain", {val: data.cfg.rd, ack: true});
    adapter.setState("mower.batteryState", {val: data.dat.bt.p, ack: true});
    adapter.setState("mower.areasUse", {val: (data.cfg.mz[0]+data.cfg.mz[1]+data.cfg.mz[2]+data.cfg.mz[3]), ack: true});
    //adapter.setState("mower.status", {val: data.state || getStatus(data.settaggi, data.allarmi), ack: true});

    setStates();
}

function setStates(){
//landroid S

adapter.setState("mower.totalTime", {val: (data.dat.st && data.dat.st.wt ? Math.round(data.dat.st.wt/6) / 10 : null), ack: true});
adapter.setState("mower.totalDistance", {val: (data.dat.st && data.dat.st.d ? Math.round(data.dat.st.d/100) / 10 : null), ack: true});
adapter.setState("mower.totalBladeTime", {val: (data.dat.st && data.dat.st.b ? Math.round(data.dat.st.b/6) / 10 : null), ack: true});

adapter.setState("mower.batteryCharging", {val: (data.dat.bt && data.dat.bt.c ? true : false), ack: true});
adapter.setState("mower.batteryVoltage", {val: (data.dat.bt && data.dat.bt.v  ? data.dat.bt.v  : null), ack: true});
adapter.setState("mower.batteryTemterature", {val: (data.dat.bt && data.dat.bt.t  ? data.dat.bt.t : null), ack: true});
adapter.setState("mower.error", {val: (data.dat && data.dat.le  ? data.dat.le : 0), ack: true});
error = (data.dat && data.dat.le  ? data.dat.le : 0);
adapter.setState("mower.status", {val: (data.dat && data.dat.ls  ? data.dat.ls : 0), ack: true});
state = (data.dat && data.dat.ls  ? data.dat.ls : 0);
}


// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', function () {
    main();
});

var updateListener = function (status) {
if(status) { // We got some data from the Landroid
data= status;
//adapter.log.info('config tedfghst1: '+ JSON.stringify(status));

evaluateResponse();
}
else {
//homeAssistant.setState("Error getting update!");
adapter.log.error("Error getting update!");
}
};


function main() {
    // The adapters config (in the instance object everything under the attribute "native") is accessible via
    // adapter.config:
 landroid = new LandroidCloud(adapter);
    if (firstSet)procedeLandroidS();


    adapter.log.debug('mail adress: ' + adapter.config.email);
    adapter.log.debug('password were set to: ' + adapter.config.pwd);
    adapter.log.debug('MAC adress set to: ' + adapter.config.mac);

    //adapter.log.info('config test1: ' + adapter.config.test1);
    //adapter.log.info('config test1: ' + adapter.config.test2);

landroid.init(updateListener);
//landi(adapter.config);
    adapter.log.info('config test1: ' + landroid.uuid);
    adapter.log.info('config test2: ' + landroid.email);
//    landroid.sendMessage("updateListener");
evaluateResponse();

adapter.subscribeStates('*');
}