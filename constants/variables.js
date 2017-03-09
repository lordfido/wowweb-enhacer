/* URLs */
var githubUrl = 'https://www.github.com/lordfido/wowweb-enhacer';
var wowUrl = 'https://worldofwarcraft.com/{{language}}-{{country}}/';
var battleNetUrl = 'https://{{region}}.battle.net';
var accountUrl = 'https://{{region}}.battle.net/account/management/wow/dashboard.html';
var armoryUrl = 'http://{{region}}.battle.net/wow/{{language}}/character/{{realm}}/{{character}}/simple';
var weeklyInstanceModifiersUrl = 'http://{{language}}.wowhead.com/affixes';
var pveLeaderboardsUrl = 'https://worldofwarcraft.com/{{language}}-{{country}}/game/pve/leaderboards/{{realm}}/{{instance}}';
var shopUrl = 'https://{{region}}.battle.net/shop/{{language}}/product/game/wow';

/* Defaults */
var defaultRealm = 'aegwynn';
var defaultInstance = 'vault-of-the-wardens';
var useEquippedItemLevel = true;							// Use equipped item level instead of average
var showWeeklyModifiersInfo = true; 						// Use a mousehover to display more info about weekly modifiers
var markPvELeaderboardsForeignCharacters = true;			// Use custom styles for foreign charachters
var markPvELeaderboardsFactionGroups = true;				// Place an icon to show group's factions
var updatePvELeaderboardsFactionGroupsBackground = true;	// Change table background with its faction's color
var hidePvELeaderboardsForeignGroups = true;				// Hide groups with too many foreigners
var showShopOffersFirst = true;								// Show all offers available at the top of the shop
var selectedRegion = 'us';
var selectedCountry = 'us';
var selectedLanguage = 'en';
var suscriptionEnd = false;
var suscriptionEndLastUpdate = false;
var betaFeatures = {};
betaFeatures.showPvELeaderboardsGuild = false;				// Show the guild name of each group

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


/* Faction colors */
var allianceColor = 'rgba(0, 40, 84, 0.4)';
var allianceIcon = `<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 64 64"
    class="Icon-svg">
        <use xlink:href="/static/components/Icon/Icon-c8faedc6ad.svg#alliance"></use>
    </svg>`;
var hordeColor = 'rgba(133, 0, 0, 0.2)';
var hordeIcon = `<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 64 64"
    class="Icon-svg">
        <use xlink:href="/static/components/Icon/Icon-c8faedc6ad.svg#horde"></use>
    </svg>`;
var tableBgColor = '#211510';