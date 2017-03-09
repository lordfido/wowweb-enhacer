// Replace variables on given URL
var parseUrl = function(url, opts) {
    return url
        .replace('{{language}}', opts.selectedLanguage ? opts.selectedLanguage : '')
        .replace('{{country}}', opts.selectedCountry ? opts.selectedCountry : '')
        .replace('{{region}}', opts.selectedRegion ? opts.selectedRegion : '')
        .replace('{{realm}}', defaultRealm ? defaultRealm : '')
        .replace('{{instance}}', defaultInstance ? defaultInstance : '')
        .replace('{{character}}', opts.selectedCharacter ? opts.selectedCharacter : '');
};

// Transform a string into a pattern
var getPatternFromUrl = function(url) {
    var pattern = url
        .replace('https', '')
        .replace('http', '')
        .replace('{{language}}', '(.*)')
        .replace('{{country}}', '(.*)')
        .replace('{{region}}', '(.*)')
        .replace('{{realm}}', '(.*)')
        .replace('{{instance}}', '(.*)')
        .replace('{{character}}', '(.*)');

    return new RegExp(`https?${pattern}`);
};

// Get imageName from a div's background-image
var getPictureNameFromDiv = function(element) {
        var imageName;
        
        if (element.style && element.style.backgroundImage) {
            var bg = element.style.backgroundImage;
            var startPosition = bg.lastIndexOf('/') + 1;
            var endPosition = bg.lastIndexOf('.');
            
            imageName = bg.substr(startPosition, (endPosition - startPosition));
        }

        return imageName || undefined;
};

// Send reports through browser's console
var debugging = true;
var debug = function(params) {
    if (debugging) {
        console.log('[WoW Web Enhacer]:', params);
    }
};