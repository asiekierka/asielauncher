var _ = require('underscore')
  , fs = require('fs')
  , request = require('request')
  , util = require('./util.js');

var interval = null;

var bannedUUIDs = [ // Those are UUIDs I accidentally distributed to people.
	"2edaba4e-77ee-48cd-a65e-5b7869446fc5", // rc2
	"0c645216-de7c-4bed-944b-71eec036bfbe" // beta7
];

exports.close = function() {
	if(interval != null) clearInterval(interval);
}

exports.create = function(config, serverInfo) {
	var heartbeat = {};

	// Generate unique heartbeat UUID
	if(!config.heartbeat.uuid || _.contains(bannedUUIDs, config.heartbeat.uuid)) {
		config.heartbeat.uuid = uuid.v4();
	}	

	function generateHeartbeat() {
		return {
			heartbeatVersion: 3,
			uuid: config.heartbeat.uuid,
			url: config.launcher.serverUrl,
			launcher: config.launcher
		};
	}

	function sendHeartbeat(data, prefix, cb) {
		prefix = prefix || "";
		cb = cb || function(){};
		util.say("debug", "Sending heartbeat "+prefix);
		//util.say("debug", JSON.stringify(data));
		data.time = util.unix(new Date());
		request.post(config.heartbeat.url + prefix, {"form": data}, cb);
	}

	function runHeartbeat() {
		var initialHeartbeat = { // Contains the "heavyweight" data (mods, etc)
			version: JSON.parse(fs.readFileSync("./AsieLauncher/internal/info.json")),
			servers: _.map(serverInfo, function(serverCfg) {
				var server = _.pick(serverCfg, ["id", "ip", "name", "description", "owner", "website", "properties", "mods", "plugins"]);
				var properties = server.properties;
				server.onlineMode = _(properties).contains("online-mode") ? properties["online-mode"] : (server.onlineMode || config.launcher.onlineMode);
				server.whiteList = _(properties).contains("white-list") ? properties["white-list"] : (server.whiteList || false);
				return server;
			}),
			time: util.unix(new Date())
		};
		initialHeartbeat = _.extend(initialHeartbeat, generateHeartbeat());
		var hbFunc = function() {
			sendHeartbeat(generateHeartbeat(config));
		}
		sendHeartbeat(initialHeartbeat, "/init", function(){
                        // To avoid serverlist overload, heartbeat interval 
                        // set to a random number between 60 and 180 seconds 
                        var randomDelay = Math.floor(Math.random()*(180-60)+60);
			var interval = setInterval(hbFunc, randomDelay*1000);
			hbFunc();
		});
	}

	runHeartbeat();
}

