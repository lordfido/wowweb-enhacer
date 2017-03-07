
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
        userRegion: 'us',
        userLanguage: 'en',

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
        setLanguage(options.userRegion, options.userLanguage);
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

// Mark checkbox as active
var setAsActive = function(elem) {
    elem.classList.add('Talent--selectedGutter');
    elem.classList.add('is-selected');
};

// Mark checkbox as inactive
var setAsInactive = function(elem) {
    elem.classList.remove('Talent--selectedGutter');
    elem.classList.remove('is-selected');
};

// Toggle Region-Language's dropdown
var languageDropdown = document.getElementById('region-language-dropdown');
var toggleLanguageDropdown = function(event) {
    if (/open/.test(languageDropdown.parentElement.className)) {
        languageDropdown.parentElement.classList.remove('open');
    } else {
        languageDropdown.parentElement.classList.add('open');
    }
};

// Set Region-Language's dropdown label
var setLanguage = function(region, language) {
    // Update dropdown label
    var selectedRegion = regions[region];
    var selectedCountry = languages[region][language];
    var textToDisplay = `${selectedRegion} - ${selectedCountry}`;
    document.getElementById('region-language-label').innerText = textToDisplay;

    // Mark dropdown elements as active
    var regionsElem = document.getElementById('regions').childNodes;
    
    // Loop through regions
    for (var x in regionsElem) {
        var reg = regionsElem[x];

        if (reg.localName === 'li') {
            // Check for selected region
            if (reg.firstChild.dataset.region === region) {
                // Add highlight classes
                reg.classList.add('active');
                reg.classList.add('current');
            } else {
                // Remove highlight classes
                reg.classList.remove('active');
                reg.classList.remove('current');
            }
        }
    }

    var languageRegions = document.getElementById('languages').childNodes;
    for (var x in languageRegions) {
        var reg = languageRegions[x];
        
        // Loop through available regions
        if (reg.localName === 'div') {

            // If selected region, mark as active
            if (reg.dataset.region === region) {
                reg.classList.add('active');
            } else {
                reg.classList.remove('active');
            }
            
            // Loop through available languages
            var langs = reg.childNodes;
            for (var y in langs) {
                var lang = langs[y];
                if (lang.localName === 'li') {
                    if (lang.firstChild.dataset.region === region && lang.firstChild.dataset.language === language) {
                        // Add highlight classes
                        lang.classList.add('active');
                        lang.classList.add('current');
                    } else {
                        // Remove highlight classes
                        lang.classList.remove('active');
                        lang.classList.remove('current');
                    }
                }
            }
        }
    }
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

// Open languages dropdown
languageDropdown.addEventListener('click', toggleLanguageDropdown);