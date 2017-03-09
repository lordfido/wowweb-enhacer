var accountUrl = 'https://{{region}}.battle.net/account/management/wow/dashboard.html';
var wowheadModifiersUrl = 'http://{{language}}.wowhead.com/affixes';
var pveLeaderboardsUrl = 'https://worldofwarcraft.com/{{language}}-{{country}}/game/pve/leaderboards/{{realm}}/{{instance}}';
var shopUrl = 'https://{{region}}.battle.net/shop/{{language}}/product/game/wow';
var githubUrl = 'https://www.github.com/lordfido/wowweb-enhacer';

var defaultRealm = 'aegwynn';
var defaultInstance = 'vault-of-the-wardens';

var regions = {
    us: 'Americas',
    eu: 'Europe',
    kr: 'Korea',
    tw: 'Taiwan',
    cn: 'China',
};

var languages = {
    us: {
        en: 'English (US)',
        es: 'Español (AL)',
        pt: 'Português (AL)',
    },
    eu: {
        de: 'Deutsch',
        en: 'English (EU)',
        es: 'Español (EU)',
        fr: 'Français',
        it: 'Italiano',
        pt: 'Português (EU)',
        ru: 'Русский',
    },
    kr: {
        ko: '한국어',
    },
    tw: {
        zh: '繁體中文',
    },
    cn: {
        ezhn: '简体中文',
    },
};

var months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

// Replace variables on given URL
var parseUrl = function(url, opts) {
    return url
        .replace('{{language}}', opts.selectedLanguage ? opts.selectedLanguage : '' )
        .replace('{{country}}', opts.selectedCountry ? opts.selectedCountry : '' )
        .replace('{{region}}', opts.selectedRegion ? opts.selectedRegion : '' )
        .replace('{{realm}}', defaultRealm ? defaultRealm : '' )
        .replace('{{instance}}', defaultInstance ? defaultInstance : '' );
};

// Transform a string into a pattern
var parsePattern = function(url) {
    var pattern = url
        .replace('{{language}}', '(.*)')
        .replace('{{country}}', '(.*)')
        .replace('{{region}}', '(.*)')
        .replace('{{realm}}', '(.*)')
        .replace('{{instance}}', '(.*)');

    return new RegExp(pattern);
}