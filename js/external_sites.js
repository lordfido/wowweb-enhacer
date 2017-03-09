(function(){
	/*	Init variables	*/
	var enhacedStyles = document.createElement('style');
	enhacedStyles.type = 'text/css';
	var urlToCheck = location.href;
	var wowWebsite = 'worldofwarcraft.com';
	var battleNetWebsite = 'battle.net';
	// URL components
	// First group: Region
	// Second group: Language
	// Third group: selectedRealm
	// Fourth group: Character
	var characterWebsitePattern = /^https?:\/\/(.*)\.battle\.net\/wow\/([a-zA-Z]*)\/character\/([a-zA-Z]*)\/(.*)\/.*$/;
	var guildParameter = /\?guild\=(.*)$/;
	var foreignClassNameModifier = '--foreign';
	var residentClassNameModifier = '--resident';

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

	/* Account */
	// First group: Region
	var accountUrlPattern = /^https?:\/\/(.*)\.battle\.net\/account\/management\/wow\/dashboard.html/;

	/* PvE Leaderboards */
	var pveLeaderboards = 'pve/leaderboards';

	/* Store */
	// URL components
	// First group: Region
	// Second group: Language
	var shopWebsitePattern = /^https?:\/\/(.*)\.battle\.net\/shop\/([a-zA-Z]*)\/product\/game\/wow/;

	/* Config variables */
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
	betaFeatures.showPvELeaderboardsGuild = false;						// Show the guild name of each group

	// Init saved configs
	var initConfigs = function(callback) {

		chrome.storage.sync.get({
			useEquippedItemLevel: true,
			showWeeklyModifiersInfo: true,
			markPvELeaderboardsForeignCharacters: true,
			markPvELeaderboardsFactionGroups: true,
			updatePvELeaderboardsFactionGroupsBackground: true,
			hidePvELeaderboardsForeignGroups: true,
			showPvELeaderboardsGuild: false,
			showShopOffersFirst: true,
			selectedRegion: 'us',
			selectedCountry: 'us',
			selectedLanguage: 'en',
			betaFeaturesEnabled: false,
			betaFeatures: {},

    	// Callback function, do anything after loading options
		}, function(options) {
			useEquippedItemLevel = options.useEquippedItemLevel;
			showWeeklyModifiersInfo: options.showWeeklyModifiersInfo;
			markPvELeaderboardsForeignCharacters = options.markPvELeaderboardsForeignCharacters;
			markPvELeaderboardsFactionGroups = options.markPvELeaderboardsFactionGroups;
			updatePvELeaderboardsFactionGroupsBackground = options.updatePvELeaderboardsFactionGroupsBackground;
			hidePvELeaderboardsForeignGroups = options.hidePvELeaderboardsForeignGroups;
			showShopOffersFirst = options.showShopOffersFirst;
			betaFeatures = options.betaFeatures;
			selectedRegion = options.selectedRegion;
			selectedCountry = options.selectedCountry;
			selectedLanguage = options.selectedLanguage;

			debug('Options loaded');
			callback();
		});
	};

	/* Init functions */
	var init = function() {
		debug('Extension loaded');
		console.log(selectedLanguage);

		if (isWarcraftWebsite(urlToCheck)) {
			debug('Entering on wow website');

			// Verify if we are on Account website
			if (isAccountWebsite(urlToCheck)) {
				updateSuscriptionEnd();
			}

			// Verify if we are on Armory website
			if (isArmoryWebsite(urlToCheck)) {
				debug('Armory website detected!');

				enhanceArmory();
				if (guildParameter.test(urlToCheck)) {
					makeGuildNameAvailable();
				}
			}

			// Verify if we are on PvE Leaderboards Website
			if (isPvELeaderboardsWebsite(urlToCheck)) {
				enhancePvELeaderboards();
			}

			// Verify if we are on Shop website
			if (isWarcraftShopWebsite(urlToCheck)) {
				debug('Shop website detected!');
				enhanceShop();
			}

			// Add enhacedStyles to the DOM
			document.head.appendChild(enhacedStyles);
		}

		if (isWowheadWebsite(urlToCheck)) {
			debug('Entering on wowhead');
			setWeeklyModifiersInfo();
		}
	};

	// Read suscription's end date, and stores it
	var updateSuscriptionEnd = function() {
		// Get date
		var suscriptionEnd = document.querySelector('.section.account-details .account-time span time').getAttribute('datetime');
		var suscriptionEndDate = new Date(suscriptionEnd).getTime();
		
		// Get 'now'
		var lastUpdate = new Date().getTime();

		chrome.storage.sync.set({
			suscriptionEnd: suscriptionEndDate,
			suscriptionEndLastUpdate: lastUpdate,
		}, function() {
			debug('Suscription\'s end has been updated');
		});
	}

	// Apply enhances to armory
	var enhanceArmory = function() {
		debug('Enhacing Armory website');

		if (useEquippedItemLevel) {
			debug ('Updating ilvl to display equipped instead of average');

			// Use equipped ilvl and remove average ilvl
			var updateIlvl = function() {
				var equippedSelector = document.querySelector('#content #profile-wrapper .profile-contents .summary-top .summary-averageilvl .rest .equipped');
				var equipped = equippedSelector.innerText;

				var averageSelector = document.querySelector('#content #profile-wrapper .profile-contents .summary-top .summary-averageilvl #summary-averageilvl-best');
				averageSelector.innerText = equipped;
				equippedSelector.parentElement.innerHTML = 'item level';

			};

			// Waits until ilvl appears
			var checkForItemLevel = function() {
				var ilvl = document.querySelector('#content #profile-wrapper .profile-contents .summary-top .summary-averageilvl');
				// There is ilvl
				if (ilvl) {
					updateIlvl();
				} else {
					setTimeout(function() {
						checkForItemLevel();
					}, 500);
				}
			};

			checkForItemLevel();
		}
	};

	// Apply enhances to leaderboards
	var enhancePvELeaderboards = function() {
		debug('Enhacing PvE Leaderboards website');

		var realmSelector = document.querySelector('.Pane-content .List > .List-item > .SelectMenu.SelectMenu--search')
		if (realmSelector) {
			var selectedRealm = realmSelector.innerText
				.toLowerCase()
				.replace("'", "")
				.replace("\n", "");
		}

		getWeeklyModifiersInfo();

		if (selectedRealm) {
			debug(`Creating rules for ${selectedRealm} realm`);

			enhancePvELeaderboardsCharacters(selectedRealm);
			enhancePvELeaderboardsGroups(selectedRealm);
		}
	};

	// Get imageName from a div's background image
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

	// Set a request for opening wowhead and get weekly affixes info
	var getWeeklyModifiersInfo = function() {
		var wrapper = document.querySelector('.Box .contain-max > .List.Separator.Separator--fade > .List-item > .List--vertical > .List-item > .List.List--guttersMedium');
		
		// In case we can use Chrome tools
		if (wrapper && chrome && chrome.runtime && chrome.runtime.connect) {
			debug('Weekly modifiers have been detected');

			var modifierIcons = wrapper.getElementsByClassName('GameIcon-icon');
			var modifierImages = [];
			for (var x in modifierIcons) {
				if (getPictureNameFromDiv(modifierIcons[x])) {
					modifierImages.push(getPictureNameFromDiv(modifierIcons[x]));
				}
			}

			// Compose the URL
			var url = `${parseUrl(wowheadModifiersUrl, {
				selectedLanguage: selectedLanguage,
			})}?`;

			console.log(url);

			modifierImages.forEach(function(debuff, index) {
				url += `${(index + 1)}=${debuff}&`;
			});

			// Clean URL
			url = url.substr(0, (url.length - 1));

			// Open website with requested debuffs
			window.open(url);
			debug('Chrome runtime, waiting to getWeeklyModifiers');

			// Keeps waiting for weekly debuffs
			var getWeeklyModifiers = chrome.runtime.connect({ name: "getWeeklyModifiers" });
			getWeeklyModifiers.postMessage({ check: 'getWeeklyModifiers' });

			getWeeklyModifiers.onMessage.addListener(function(response){
				debug(`Modifiers have been recieved, ${response}`);
				writeModifiers(modifierIcons, response);
			});
		}
	};

	// Write modifiers descriptions in the DOM
	var writeModifiers = function(icons, modifiers) {
		for (var x in icons) {
			var icon = icons[x];

			if (icon.className) {
				// Set element where we want to place the description
				var list = icon.parentElement
					&& icon.parentElement.parentElement
					&& icon.parentElement.parentElement.parentElement
					&& icon.parentElement.parentElement.parentElement.parentElement
					&& icon.parentElement.parentElement.parentElement.parentElement.parentElement
					&& icon.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;

				// Prepeares description
				if (list) {
					list.parentElement.style.verticalAlign = 'top';
					for (var y in modifiers) {
						var modifier = modifiers[y];
						var imageName = getPictureNameFromDiv(icon);

						if (imageName && imageName === modifier.name) {
							debug(`Placing description for weekly modifier`);
							var description = document.createElement('div');
							description.className = 'List-item';
							description.style.color = 'white';
							description.innerText = modifier.description;

							list.classList.add('List--vertical');
							list.appendChild(description);
							break;
						}
					}
				}
			}
		}
	};

	// When we load a wowhead website, get affixes info, and send it to Chrome Extension
	var setWeeklyModifiersInfo = function() {
		if (showWeeklyModifiersInfo && chrome && chrome.runtime && chrome.runtime.connect) {
			var requestedModifiers = [];

			// Get query params
			var query = location.search;
			query = query.replace('?', '');

			// Create a list with requested modifiers
			var params = query.split('&');
			params.forEach(function(param) {
				var modifier = param.split('=')[1];
				if (modifier) {
					requestedModifiers.push({ name: modifier });
				}
			});

			// Waits until modifiers appear
			var checkForModifiers = function() {
				var table = document.querySelector('#lv-affixes .listview-mode-default');

				// There are modifiers
				if (table) {
					debug('Modifiers have been found');
					var icons = table.getElementsByClassName('iconsmall');

					requestedModifiers.forEach(function(requestedModifier) {
						for (var x in icons) {
							var icon = icons[x];
							if (icon.className) {
								var row = icon.parentElement.parentElement;
		
								var modifier = row.childNodes[0].childNodes[0].childNodes[0];
								if (modifier) {
									var imageName = getPictureNameFromDiv(modifier);
									
									if (imageName === requestedModifier.name) {
										requestedModifier.description = row.childNodes[2].innerText;
										debug(`Weekly modifier has been found, ${requestedModifier.name}: ${requestedModifier.description}`);										
										break;
									}
								}
							}
						}
					});

					// Send data to chrome extension
					debug('Chrome runtime, sending modifiers info');
					var getWeeklyModifiers = chrome.runtime.connect({name: "getWeeklyModifiers"});
					getWeeklyModifiers.postMessage(requestedModifiers);
					window.close();

				} else {
					setTimeout(function() {
						checkForModifiers();
					}, 500);
				}
			}

			checkForModifiers();
		}
	};

	// Apply enhances to charachters
	var enhancePvELeaderboardsCharacters = function(selectedRealm) {
		if (markPvELeaderboardsForeignCharacters) {
			// Increase spaces between group members
			// by replacing `gutter-tiny` class with `gutter-small`
			var listItems = document.getElementsByClassName('List-item gutter-tiny');
			for (var x in listItems) {
				var char = listItems[x];

				// Avoid to modify other elements and 'counter' elements
				if (/vertical/.test(char.className) < 0 && char.className && char.className.replace) {
					char.className = char.className.replace("tiny", "small");
				}
			}

			// Add new class `Character--foraneous` to all members
			var listItems = document.getElementsByClassName('Character');
			for (var x in listItems) {
				var char = listItems[x];

				// Avoid not-foreign characters
				if (isForeignCharacter(char, selectedRealm)) {

					// Avoid 'counter' elements
					if (char.className) {
						char.className = `${char.className} Character${foreignClassNameModifier}`;
					}
				}
			};

			// STYLE: Apply new styles to `.Character--foraneous` elements
			enhacedStyles.innerHTML += `
				.Character${foreignClassNameModifier} {
					opacity: 0.8;
					font-style: italic;
				}

				.Character${foreignClassNameModifier} .Character-name {
					font-size: 1em;
				}
			`;
		}
	};

	// Apply enhances to groups
	var enhancePvELeaderboardsGroups = function(selectedRealm) {
		var table = document.querySelector('.Pane-content .contain-max .Pagination .SortTable .SortTable-body');
		var listItems = table.getElementsByClassName('List');

		// Visit each group
		for (var x in listItems) {
			var group = listItems[x];

			// Avoid 'counter' groups
			if (group.className) {
				var characters = group.getElementsByClassName('Character');

				// Count how many foreigners exist
				var foreignCharacters = 0;
				for(var x in characters) {
					var char = characters[x];

					// Avoid 'counter' charachters
					if (char.className) {
						if (char.className && isForeignCharacter(char, selectedRealm)) {
							foreignCharacters += 1;
						}
					}
				}

				var tableCell = group.parentElement;
				var faction = tableCell.dataset.value;

				// Mark foreign groups
				if (hidePvELeaderboardsForeignGroups && foreignCharacters > 1) {
					tableCell.parentElement.className = `${tableCell.parentElement.className} SortTable${foreignClassNameModifier}`;
				} else {
					tableCell.parentElement.className = `${tableCell.parentElement.className} SortTable${residentClassNameModifier}`;
				}

				// Mark each group's faction
				if (markPvELeaderboardsFactionGroups) {
					// Add faction Logo to the table
					tableCell.innerHTML = `
						<span class="Icon Icon--${faction} Icon--medium">
							${faction === 'alliance' ? allianceIcon : ''}
							${faction === 'horde' ? hordeIcon : ''}
						</span>
						<div style="position: relative; display: inline-block; vertical-align: middle; padding-bottom: 5px;">
							${tableCell.innerHTML}
						</div>
					`;
				}

				// Mark Row with propper faction
				if (updatePvELeaderboardsFactionGroupsBackground) {
					var tableRow = tableCell.parentElement;
					tableRow.className = `${tableRow.className} SortTable--${faction}`;
				}

				// Show group's guilds
				if (betaFeatures.showPvELeaderboardsGuild && foreignCharacters <= 1) {
					var characters = group.getElementsByClassName('Character');
					var firstMember;

					// Look into group's members
					for (var x in characters) {
						var char = characters[x];

						// Avoid 'counter' members
						if (char.className) {
							// If a member is not a foreigner
							if (new RegExp(selectedRealm).test(char.href) > 0) {
								firstMember = char;
								break;
							}
						}
					}

					// Write guild name into the DOM
					var getGuildElement = function(character) {
						var guildElement = `
							<div class="List-item gutter-small GuildLabel">
								<a href="${character.guildUrl}" target="_blank" class="Link Character Character--small Character--onDark">
									<div class="Character-table">
										<div class="Character-details">
											<div class="Character-role"></div>
											<div class="Character-name">${character.guild}</div>
										</div>
									</div>
								</a>
							</div>
						`;

						return guildElement;
					};

					// In case we can use Chrome tools
					if (chrome && chrome.runtime && chrome.runtime.connect) {
						// Open character's profile on a new window
						var guildChecker = window.open(`${firstMember.href}?guild=check`);
						debug('Chrome runtime, waiting to sendGuildName');

						// Get character's name
						var websiteElements = characterWebsitePattern.exec(firstMember.href);
						var characterName = websiteElements[4];

						// Keeps waiting for character's guild
						var getGuildName = chrome.runtime.connect({ name: "getGuildName" });
						getGuildName.postMessage({ check: characterName });

						getGuildName.onMessage.addListener(function(response){
							debug(`Getting ${response.name}'s guild: ${response.guild}`);

							// Loop throug all resident groups
							var listItems = document.getElementsByClassName(`SortTable${residentClassNameModifier}`);
							for (var y in listItems) {
								var group = listItems[y];

								if (group.className) {
									// Loop throug all of their characters
									var characters = group.getElementsByClassName('Character-name');

									for (var z in characters) {
										var char = characters[z];

										if (char.className) {

											// If we find character that we are checking for guild
											if (char.innerHTML.toString() === response.name) {
												debug(`Found ${response.name}'s place on the table. Placing it's guild's link`);
												var guildElement = getGuildElement(response);

												// If guild is not injected, place it
												if (group.getElementsByClassName('Character').length <= 5) {
													group.getElementsByClassName('List')[0].innerHTML += guildElement;
												}
												break;
											}
										}
									}
								}
							}
						});
					}
				}
			}
		}

		// STYLE: Change row's background color, based on their factions
		if (updatePvELeaderboardsFactionGroupsBackground) {
			enhacedStyles.innerHTML += `
				.SortTable--alliance {
					background: ${allianceColor} !important;
				}
				.SortTable--horde {
					background: ${hordeColor} !important;
				}
			`;
		}

		// STYLE: Hide foreign groups
		if (hidePvELeaderboardsForeignGroups) {
			enhacedStyles.innerHTML += `
				.SortTable {
					background: ${tableBgColor};
				}
				.SortTable${foreignClassNameModifier} {
					display: none;
				}
			`;
		}

		// STYLE: Styles for guild labels
		if (betaFeatures.showPvELeaderboardsGuild) {
			enhacedStyles.innerHTML += `
				.GuildLabel {
					padding: 5px;
					border-radius: 6px;
					background: rgba(0, 0, 0, 0.5);
					font-size: 0.8em;
				}

				.GuildLabel .Character-name {
					color: white !important;
					font-size: 0.8em !important;
				}
			`
		}
	};

	// Send guildname to background extension
	var makeGuildNameAvailable = function() {
		debug('Checking for guild name');

		var guildChecker = function() {
			var nameSelector = document.querySelector('#content .content-bot .profile-info .name > a');
			var guildSelector = document.querySelector('#content .content-bot .profile-info .title-guild .guild > a');

			// If guildSelector does not exist, retry it
			if (nameSelector && guildSelector) {
				debug(`New window has loaded, getting name: ${nameSelector.innerText}, and guild: ${guildSelector.innerText}`);

				// If there is no guild param on the URL, place it
				if(chrome && chrome.runtime && chrome.runtime.connect) {
					debug('Chrome runtime, sending guildName');
					var getGuildName = chrome.runtime.connect({name: "getGuildName"});
					getGuildName.postMessage({
						'name': nameSelector.innerText,
						'guild': guildSelector.innerText,
						'guildUrl': guildSelector.href,
					});
					window.close();
				}
			} else {
				setTimeout(function() {
					guildChecker();
				}, 500);
			}
		};
		guildChecker();
	};

	// Apply enhances to shop
	var enhanceShop = function() {
		if (showShopOffersFirst) {
			groupOffersAtTop();
		}
	};

	// Move discounts to top
	var groupOffersAtTop = function() {
		var parsedProducts = [];
		var offers = [];

		// Get all products
		var products = document.getElementsByClassName('product-link');
		for (var x in products) {
			parsedProducts.push(products[x]);
		}

		// Clean offers from normal lists, and store them
		parsedProducts.forEach(function(product) {
			if (product.querySelector && product.querySelector('.discount')) {
				offers.push(product.parentElement);
				product.parentElement.remove();
			}
		});

		// Create new wrapper
		var shopHTML = document.querySelector('.browse-template.product-family-wow .body-content .grid-container.browse.game.wow .browse-container .browse-column.main');
		var offersHTML = document.createElement('ul');
		offersHTML.className = "product-card-container thumbnails";
		offers.forEach(function(offer) {
			offersHTML.appendChild(offer);
		});
		shopHTML.prepend(offersHTML);
	};

	// Verify we are on a World of Warcraft website
	var isWarcraftWebsite = function(url) {
		debug('Checking isWarcraftWebsite(): '+ url);
		return (
			new RegExp(wowWebsite).test(url) > 0 ||
			new RegExp(battleNetWebsite).test(url) > 0
		);
	};

	// Verify is account website
	var isAccountWebsite = function(url) {
		debug('Checking isAccountWebsite(): '+ url);
		return accountUrlPattern.test(url);
	}

	// Verify we are on a PvE leaderboard website
	var isPvELeaderboardsWebsite = function(url) {
		debug('Checking isPvELeaderboardsWebsite(): '+ url);
		return new RegExp(pveLeaderboards).test(url);
	};

	// Verify we are on a PvE leaderboard website
	var isArmoryWebsite = function(url) {
		debug('Checking isArmoryWebsite(): '+ url);
		return characterWebsitePattern.test(url);
	};

	// Verify selected character belongs to selected realm
	var isForeignCharacter = function(char, realm) {
		return (new RegExp(realm).test(char.href) <= 0);
	};

	// Verify we are at wow eShop
	var isWarcraftShopWebsite = function(url) {
		debug('Checking isWarcraftShopWebsite(): '+ url);
		return shopWebsitePattern.test(url);
	}

	// Verify if we are at wowhead website
	var isWowheadWebsite = function(url) {
		debug('Checking isWarcraftShopWebsite(): '+ url);
		return parsePattern(wowheadModifiersUrl).test(url);
	}

	var debugging = true;
	var debug = function(params) {
		if (debugging) {
			console.log('[wow.com enhacer]:', params);
		}
	};

	/*	App start	*/
	initConfigs(init);
}())
