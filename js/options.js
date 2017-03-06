
// Save selected options
var save_options = function() {
    var useEquippedItemLevel = document.getElementById('useEquippedItemLevel').checked;
    var markPvELeaderboardsForeignCharacters = document.getElementById('markPvELeaderboardsForeignCharacters').checked;
    var markPvELeaderboardsFactionGroups = document.getElementById('markPvELeaderboardsFactionGroups').checked;
    var updatePvELeaderboardsFactionGroupsBackground = document.getElementById('updatePvELeaderboardsFactionGroupsBackground').checked;
    var hidePvELeaderboardsForeignGroups = document.getElementById('hidePvELeaderboardsForeignGroups').checked;
    var showPvELeaderboardsGuild = document.getElementById('showPvELeaderboardsGuild').checked;


    chrome.storage.sync.set({
        useEquippedItemLevel: useEquippedItemLevel,
        markPvELeaderboardsForeignCharacters: markPvELeaderboardsForeignCharacters,
        markPvELeaderboardsFactionGroups: markPvELeaderboardsFactionGroups,
        updatePvELeaderboardsFactionGroupsBackground: updatePvELeaderboardsFactionGroupsBackground,
        hidePvELeaderboardsForeignGroups: hidePvELeaderboardsForeignGroups,
        showPvELeaderboardsGuild: showPvELeaderboardsGuild,
    
    // Callback function, do anything after saving options
    }, function() {
        console.log('Options have been saved');
    });
};

// Get options from chrome settings
var load_options = function() {
    chrome.storage.sync.get({
        useEquippedItemLevel: true,
        markPvELeaderboardsForeignCharacters: true,
        markPvELeaderboardsFactionGroups: true,
        updatePvELeaderboardsFactionGroupsBackground: true,
        hidePvELeaderboardsForeignGroups: true,
        showPvELeaderboardsGuild: false,

    // Callback function, do anything after loading options
    }, function(options) {
        document.getElementById('useEquippedItemLevel').checked = options.useEquippedItemLevel;
        if (options.useEquippedItemLevel) {
            setAsActive(document.getElementById('useEquippedItemLevel').parentElement.parentElement.parentElement);
        }
        document.getElementById('markPvELeaderboardsForeignCharacters').checked = options.markPvELeaderboardsForeignCharacters;
        if (options.markPvELeaderboardsForeignCharacters) {
            setAsActive(document.getElementById('markPvELeaderboardsForeignCharacters').parentElement.parentElement.parentElement);
        }
        document.getElementById('markPvELeaderboardsFactionGroups').checked = options.markPvELeaderboardsFactionGroups;
        if (options.markPvELeaderboardsFactionGroups) {
            setAsActive(document.getElementById('markPvELeaderboardsFactionGroups').parentElement.parentElement.parentElement);
        }
        document.getElementById('updatePvELeaderboardsFactionGroupsBackground').checked = options.updatePvELeaderboardsFactionGroupsBackground;
        if (options.updatePvELeaderboardsFactionGroupsBackground) {
            setAsActive(document.getElementById('updatePvELeaderboardsFactionGroupsBackground').parentElement.parentElement.parentElement);
        }
        document.getElementById('hidePvELeaderboardsForeignGroups').checked = options.hidePvELeaderboardsForeignGroups;
        if (options.hidePvELeaderboardsForeignGroups) {
            setAsActive(document.getElementById('hidePvELeaderboardsForeignGroups').parentElement.parentElement.parentElement);
        }
        document.getElementById('showPvELeaderboardsGuild').checked = options.showPvELeaderboardsGuild;
        if (options.showPvELeaderboardsGuild) {
            setAsActive(document.getElementById('showPvELeaderboardsGuild').parentElement.parentElement.parentElement);
        }
    });
};

// Change checkbox styles
var updateCheckbox = function(event) {
    var elem = event.target;
    if (elem.checked) {
        setAsActive(elem.parentElement.parentElement.parentElement);
    } else {
        setAsInactive(elem.parentElement.parentElement.parentElement);
    }

    save_options();
};

var setAsActive = function(elem) {
    elem.classList.add('Talent--selectedGutter');
    elem.classList.add('is-selected');
};

var setAsInactive = function(elem) {
    elem.classList.remove('Talent--selectedGutter');
    elem.classList.remove('is-selected');
};

// On load, restore saved settings
document.addEventListener('DOMContentLoaded', load_options);

// Apply event listeners to all checkboxes
var checkboxes = document.getElementsByClassName('Talent-checkboxInput');
for (var x in checkboxes) {
    var check = checkboxes[x];
    if (check.className) {
        check.addEventListener('change', updateCheckbox, true);
    }
}