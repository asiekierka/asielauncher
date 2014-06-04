var VERSION = "0.4.5";

// Initialize libraries (quite a lot of them, too!)
var _ = require('underscore')
        , fs = require('fs')
        , util = require('./util.js')
        , path = require('path')
        , argv = require('optimist').argv
        , fileParser = require('./fileParser.js')
        , configHandler = null
        , heartbeat = require('./also-heartbeat.js')
        , nem = require('./nem.js');

var DEBUG = argv.d || argv.debug || false;

util.setDebug(DEBUG);

var loadServer = function(config, server) {
    var cwd = process.cwd();
    var files = require("./also-files.js");
    var location = server.location;
    files.initialize(config);

    process.chdir(path.resolve(location));

    util.say("info", "Gathering server information [server " + location + "]");

    var serverInfo = _.clone(server);

    util.say("info", "- server properties");
    serverInfo.properties = fileParser.getServerProperties("./server.properties");
    util.say("info", "- mods");
    serverInfo.mods = fileParser.getModList(files, ["mods", "coremods", "lib", "jarPatches"]);
    util.say("info", "- plugins");
    serverInfo.plugins = fileParser.getPluginList(files, ["./plugins"]);
    util.say("info", "Writing information to JSON files...");
    fs.writeFileSync("./modList.json", JSON.stringify(serverInfo.mods, null, 4));
    fs.writeFileSync("./pluginList.json", JSON.stringify(serverInfo.plugins, null, 4));

    // Writing server info to http accessible location for the serverlist to access
    util.say("info", "Creating JSON file for serverlist");
    fs.writeFileSync("./AsieLauncher/htdocs/serverInfo.json", JSON.stringify(serverInfo, null, 4));

    process.chdir(cwd);
    return serverInfo;
}

exports.run = function(cwd) {
    process.chdir(cwd);

    util.say("info", "Started AsieLauncher server " + VERSION);

    // Load configuration
    configHandler = require("./config.js");
    var config = configHandler.get();

    var serverInfo = [];
    _.each(config.serverList, function(server) {
        serverInfo.push(loadServer(config, server));
    });

    var fileServer = require('./also-fileserver.js');
    util.say("info", "Starting FileServer");
    fileServer.run(config, serverInfo[0]);

    if (config.heartbeat.enabled) {
        util.say("info", "Starting HeartbeatServer");
        heartbeat.create(config, serverInfo);
    }

    util.say("info", "Saving updated configuration");
    configHandler.set(config);

    util.say("info", "Starting prompt");
    var prompt = require('./prompt.js');
    prompt.init(config, serverInfo[0], heartbeat, fileServer);
}
