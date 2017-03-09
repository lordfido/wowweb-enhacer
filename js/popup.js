var selectedRegion, selectedCountry, selectedLanguage;

// Save selected options
var save_options = function() {
    var useEquippedItemLevel = document.getElementById('useEquippedItemLevel').checked;
    var showWeeklyModifiersInfo = document.getElementById('showWeeklyModifiersInfo').checked;
    var markPvELeaderboardsForeignCharacters = document.getElementById('markPvELeaderboardsForeignCharacters').checked;
    var markPvELeaderboardsFactionGroups = document.getElementById('markPvELeaderboardsFactionGroups').checked;
    var updatePvELeaderboardsFactionGroupsBackground = document.getElementById('updatePvELeaderboardsFactionGroupsBackground').checked;
    var hidePvELeaderboardsForeignGroups = document.getElementById('hidePvELeaderboardsForeignGroups').checked;
    var showShopOffersFirst = document.getElementById('showShopOffersFirst').checked;
    var betaFeaturesEnabled = document.getElementById('betaFeaturesEnabled').checked;
    var showPvELeaderboardsGuild = betaFeaturesEnabled ? document.getElementById('showPvELeaderboardsGuild').checked : false;

    chrome.storage.sync.set({
        useEquippedItemLevel: useEquippedItemLevel,
        showWeeklyModifiersInfo: showWeeklyModifiersInfo,
        markPvELeaderboardsForeignCharacters: markPvELeaderboardsForeignCharacters,
        markPvELeaderboardsFactionGroups: markPvELeaderboardsFactionGroups,
        updatePvELeaderboardsFactionGroupsBackground: updatePvELeaderboardsFactionGroupsBackground,
        hidePvELeaderboardsForeignGroups: hidePvELeaderboardsForeignGroups,
        showShopOffersFirst: showShopOffersFirst,
        betaFeaturesEnabled: betaFeaturesEnabled,
        betaFeatures: {
            showPvELeaderboardsGuild: showPvELeaderboardsGuild,
        }
    
    // Callback function, do anything after saving options
    }, function() {
        console.log(`Options have been saved, and beta features are ${!betaFeaturesEnabled ? 'not ' : ''}enabled`);
        toggleBetaFeatures(betaFeaturesEnabled);
    });
};

// Save options and close languages dropdown
var saveLanguageOptions = function(event) {
    event.preventDefault();
    chrome.storage.sync.set({
        selectedRegion: selectedRegion,
        selectedCountry: selectedCountry,
        selectedLanguage: selectedLanguage,
    
    // Callback function, do anything after saving options
    }, function() {
        console.log('Language Options have been saved.');
        updateLanguageDropdownLabel(selectedRegion, selectedLanguage);
        toggleLanguageDropdown(event);
        document.getElementById('change-language').disabled = false;
        document.getElementById('change-language').classList.remove('disabled');
    });
};

// Get options from chrome settings
var load_options = function() {
    chrome.storage.sync.get({
        useEquippedItemLevel: true,
        showWeeklyModifiersInfo: true,
        markPvELeaderboardsForeignCharacters: true,
        markPvELeaderboardsFactionGroups: true,
        updatePvELeaderboardsFactionGroupsBackground: true,
        hidePvELeaderboardsForeignGroups: true,
        showShopOffersFirst: true,
        selectedRegion: 'us',
        selectedCountry: 'us',
        selectedLanguage: 'en',
        suscriptionEnd: false,
        suscriptionEndLastUpdate: false,
        betaFeaturesEnabled: false,
        betaFeatures: {}

    // Callback function, do anything after loading options
    }, function(options) {
        document.getElementById('useEquippedItemLevel').checked = options.useEquippedItemLevel;
        if (options.useEquippedItemLevel) {
            setAsActive(document.getElementById('useEquippedItemLevel').parentElement.parentElement.parentElement);
        }
        document.getElementById('showWeeklyModifiersInfo').checked = options.showWeeklyModifiersInfo;
        if (options.showWeeklyModifiersInfo) {
            setAsActive(document.getElementById('showWeeklyModifiersInfo').parentElement.parentElement.parentElement);
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
        document.getElementById('showShopOffersFirst').checked = options.showShopOffersFirst;
        if (options.showShopOffersFirst) {
            setAsActive(document.getElementById('showShopOffersFirst').parentElement.parentElement.parentElement);
        }
        document.getElementById('betaFeaturesEnabled').checked = options.betaFeaturesEnabled;
        if (options.betaFeaturesEnabled) {
            setAsActive(document.getElementById('betaFeaturesEnabled').parentElement.parentElement.parentElement);
        }
        document.getElementById('showPvELeaderboardsGuild').checked = options.betaFeaturesEnabled && options.betaFeatures.showPvELeaderboardsGuild;
        if (options.betaFeatures.showPvELeaderboardsGuild) {
            setAsActive(document.getElementById('showPvELeaderboardsGuild').parentElement.parentElement.parentElement);
        }
        showRemainingTime(options.suscriptionEnd, options.suscriptionEndLastUpdate);
        setInitialLanguage(options.selectedRegion, options.selectedLanguage);
        toggleBetaFeatures(options.betaFeaturesEnabled);
    });
};

// Change checkbox styles
var updateCheckbox = function(event) {
    console.log('Checkbox');
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

// Load last options saved
var discardLanguageChanges = function() {
    chrome.storage.sync.get({
        selectedRegion: 'us',
        selectedLanguage: 'en',

    // Callback function, do anything after loading options
    }, function(options) {
        setInitialLanguage(options.selectedRegion, options.selectedLanguage);
    });
};

// Toggle Region-Language's dropdown
var languageDropdown = document.getElementById('region-language-dropdown');
var toggleLanguageDropdown = function(event, forceClose) {
    if (event.target.localName !== 'input') {
        event.preventDefault();
    }

    if (/open/.test(languageDropdown.parentElement.className) || forceClose) {
        languageDropdown.parentElement.classList.remove('open');
    } else {
        languageDropdown.parentElement.classList.add('open');
    }

    if (forceClose) {
        discardLanguageChanges();
    }
};

// Update dropdown label
var updateLanguageDropdownLabel = function(region, language) {
    var selectedRegion = regions[region];
    var selectedCountry = languages[region][language];
    var textToDisplay = `${selectedRegion} - ${selectedCountry}`;
    document.getElementById('region-language-label').innerText = textToDisplay;
};

// Show available languages for a region
var updateLanguageList = function(region) {
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
        }
    }
};

// Mark as active selected region
var setRegion = function(region) {
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

                // Update language list
                selectedRegion = region;
                selectedLanguage = false;
                updateLanguageList(region);
            } else {
                // Remove highlight classes
                reg.classList.remove('active');
                reg.classList.remove('current');
            }
        }
    }
};

// Mark as active selected language
var setLanguage = function(region, language) {
    var languageRegions = document.getElementById('languages').childNodes;
    for (var x in languageRegions) {
        var reg = languageRegions[x];
        
        // Loop through available regions
        if (reg.localName === 'div') {
            // Loop through available languages
            var langs = reg.childNodes;
            for (var y in langs) {
                var lang = langs[y];
                if (lang.localName === 'li') {
                    if (lang.firstChild.dataset.region === region && lang.firstChild.dataset.language === language) {
                        // Add highlight classes
                        lang.classList.add('active');
                        lang.classList.add('current');
                        selectedLanguage = language;
                        selectedCountry = lang.firstChild.dataset.country;
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

// Set Region-Language's dropdown label
var setInitialLanguage = function(region, language) {
    updateLanguageDropdownLabel(region, language);

    // Mark dropdown elements as active
    setRegion(region);
    setLanguage(region, language);
};

// Show/Hide beta features
var toggleBetaFeatures = function(enabled) {
    var features = document.getElementsByClassName('BetaFeature');
    for (var x in features) {
        var feature = features[x];
        if (feature.classList) {
            if (enabled) {
                feature.classList.remove('hidden');
            } else {
                feature.classList.add('hidden');
            }
        }
    }
}

// Returns a formatted string, that is the difference between 2 dates
var getRemainingTime = function(date) {
    var end = date;
    var start = new Date().getTime();

    // Get remaining time
    var remaining = end - start;

    // Calc values
    var years = parseInt(remaining / 1000 / 60 / 60 / 24 / 30 / 12);
    var months = parseInt(remaining / 1000 / 60 / 60 / 24 / 30) - (years * 12);
    var days = parseInt(remaining / 1000 / 60 / 60 / 24) - (years * 12 * 30) - (months * 30);
    var hours = parseInt(remaining / 1000 / 60 / 60) - (years * 12 * 30 * 24) - (months * 30 * 24) - (days * 24);
    var mins = parseInt(remaining / 1000 / 60) - (years * 12 * 30 * 24 * 60) - (months * 30 * 24 * 60) - (days * 24 * 60) - (hours * 60);

    // Build the array
    var timming = [];
    if (years) timming.push(`${years} years`);
    if (months) timming.push(`${months} months`);
    if (days) timming.push(`${days} days`);
    if (hours) timming.push(`${hours} hours`);
    if (mins) timming.push(`${mins} mins`);

    // Return formatted string
    return timming.join(', ');
};

// Get a date timestamp and return a formated date string
var formatDate = function(date) {
    var dateObj = new Date(date);

    var year = dateObj.getFullYear();
    var month = dateObj.getMonth();
    var day = dateObj.getDate();
    var hour = dateObj.getHours();
    var min = dateObj.getMinutes();
    
    return `${day}/${months[month]}/${year} (${hour}:${min})`;
};

// Show remaining time on extension
var showRemainingTime = function(suscriptionEnd, suscriptionEndLastUpdate) {
    if (suscriptionEnd && suscriptionEndLastUpdate) {
        var remainingTime = getRemainingTime(suscriptionEnd);
        var lastUpdate = formatDate(suscriptionEndLastUpdate);

        document.getElementById('remaining-time').innerText = remainingTime;
        document.getElementById('last-remaining-time').innerText = lastUpdate;
        document.getElementById('remaining-time-wrapper').classList.remove('hidden');
        document.getElementById('remaining-time-divider').classList.remove('hidden');
    }
}

// Change user's region
var handleRegionClick = function(event) {
    event.preventDefault();
    var region = event.target && event.target.dataset && event.target.dataset.region;
    if (region) {
        setRegion(region);
        document.getElementById('change-language').disabled = true;
        document.getElementById('change-language').classList.add('disabled');
    }
};

// Change user's language
var handleLanguageClick = function(event) {
    event.preventDefault();
    var region = event.target && event.target.dataset && event.target.dataset.region;
    var language = event.target && event.target.dataset && event.target.dataset.language;
    if (region && language) {
        setLanguage(region, language);
        document.getElementById('change-language').disabled = false;
        document.getElementById('change-language').classList.remove('disabled');
    }
};

// Open new websites
var openAccount = function(event) {
    event.preventDefault();
    window.open(parseUrl(accountUrl, {
        selectedLanguage: selectedLanguage,
        selectedCountry: selectedCountry,
        selectedRegion: selectedRegion,
    }));
};

var openPvELeaderboards = function(event) {
    event.preventDefault();
    window.open(parseUrl(pveLeaderboardsUrl, {
        selectedLanguage: selectedLanguage,
        selectedCountry: selectedCountry,
        selectedRegion: selectedRegion,
    }));
};

var openShop = function(event) {
    event.preventDefault();
    window.open(parseUrl(shopUrl, {
        selectedLanguage: selectedLanguage,
        selectedCountry: selectedCountry,
        selectedRegion: selectedRegion,
    }));
};

var openGithub = function(event) {
    event.preventDefault();
    window.open(githubUrl);
};

// On load, restore saved settings
document.addEventListener('DOMContentLoaded', load_options);

// General click
document.addEventListener('click', function(event) {
    console.log('Anywhere');
    if (!event.defaultPrevented) {
        toggleLanguageDropdown(event, true);
    }
});

// Open account on a new window
document.getElementById('account-link').addEventListener('click', openAccount, true);

// Open pve leaderboards on a new window
document.getElementById('pve-leaderboard-link').addEventListener('click', openPvELeaderboards, true);

// Open pve shop on a new window
document.getElementById('shop-link').addEventListener('click', openShop, true);

// Open pve github on a new window
document.getElementById('github-link').addEventListener('click', openGithub, true);

// Apply event listeners to all checkboxes
var checkboxes = document.getElementsByClassName('Talent-checkboxInput');
for (var x in checkboxes) {
    var check = checkboxes[x];
    if (check.className) {
        check.addEventListener('change', updateCheckbox, true);
    }
}

// Toggle languages dropdown
languageDropdown.addEventListener('click', toggleLanguageDropdown, true);

// Select a region
var regionSelector = document.getElementById('regions').getElementsByTagName('a');
for (var x in regionSelector) {
    var region = regionSelector[x];
    if (region.className) {
        region.addEventListener('click', handleRegionClick, true);
    }
}

// Select a country and language
var languageSelector = document.getElementById('languages').getElementsByTagName('a');
for (var x in languageSelector) {
    var language = languageSelector[x];
    if (language.className) {
        language.addEventListener('click', handleLanguageClick, true);
    }
}

// Save language changes
var changeLangButton = document.getElementById('change-language');
changeLangButton.addEventListener('click', saveLanguageOptions);
