
var save_options = function() {
	// var markPvELeaderboardsForeignCharacters = document.getElementById('markPvELeaderboardsForeignCharacters').value;
    var markPvELeaderboardsForeignCharacters = document.getElementById('markPvELeaderboardsForeignCharacters').checked;

	// var markPvELeaderboardsFactionGroups = document.getElementById('markPvELeaderboardsFactionGroups').value;
    var markPvELeaderboardsFactionGroups = document.getElementById('markPvELeaderboardsFactionGroups').checked;

	// var updatePvELeaderboardsFactionGroupsBackground = document.getElementById('updatePvELeaderboardsFactionGroupsBackground').value;
    var updatePvELeaderboardsFactionGroupsBackground = document.getElementById('updatePvELeaderboardsFactionGroupsBackground').checked;

	// var hidePvELeaderboardsForeignGroups = document.getElementById('hidePvELeaderboardsForeignGroups').value;
    var hidePvELeaderboardsForeignGroups = document.getElementById('hidePvELeaderboardsForeignGroups').checked;

	// var showPvELeaderboardsGuild = document.getElementById('showPvELeaderboardsGuild').value;
    var showPvELeaderboardsGuild = document.getElementById('showPvELeaderboardsGuild').checked;


    chrome.storage.sync.set({
        markPvELeaderboardsForeignCharacters: markPvELeaderboardsForeignCharacters,
        markPvELeaderboardsFactionGroups: markPvELeaderboardsFactionGroups,
        updatePvELeaderboardsFactionGroupsBackground: updatePvELeaderboardsFactionGroupsBackground,
        hidePvELeaderboardsForeignGroups: hidePvELeaderboardsForeignGroups,
        showPvELeaderboardsGuild: showPvELeaderboardsGuild,
    
    // Callback function, do anything after saving options
    }, function() {

    });
};

// Get options from chrome settings
var load_options = function() {
    chrome.storage.sync.get({
        markPvELeaderboardsForeignCharacters: true,
        markPvELeaderboardsFactionGroups: true,
        updatePvELeaderboardsFactionGroupsBackground: true,
        hidePvELeaderboardsForeignGroups: true,
        showPvELeaderboardsGuild: false,

    // Callback function, do anything after loading options
    }, function(options) {
        // document.getElementById('markPvELeaderboardsForeignCharacters').value = options.markPvELeaderboardsForeignCharacters;
        document.getElementById('markPvELeaderboardsForeignCharacters').checked = options.markPvELeaderboardsForeignCharacters;

        // document.getElementById('markPvELeaderboardsFactionGroups').value = options.markPvELeaderboardsFactionGroups;
        document.getElementById('markPvELeaderboardsFactionGroups').checked = options.markPvELeaderboardsFactionGroups;

        // document.getElementById('updatePvELeaderboardsFactionGroupsBackground').value = options.updatePvELeaderboardsFactionGroupsBackground;
        document.getElementById('updatePvELeaderboardsFactionGroupsBackground').checked = options.updatePvELeaderboardsFactionGroupsBackground;

        // document.getElementById('hidePvELeaderboardsForeignGroups').value = options.hidePvELeaderboardsForeignGroups;
        document.getElementById('hidePvELeaderboardsForeignGroups').checked = options.hidePvELeaderboardsForeignGroups;

        // document.getElementById('showPvELeaderboardsGuild').value = options.showPvELeaderboardsGuild;
        document.getElementById('showPvELeaderboardsGuild').checked = options.showPvELeaderboardsGuild;
    });
}

document.addEventListener('DOMContentLoaded', load_options);