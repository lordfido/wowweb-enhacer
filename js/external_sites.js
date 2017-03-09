(function(){
	/*	Init variables	*/
	var urlToCheck = location.href;
	var enhacedStyles = document.createElement('style');
	enhacedStyles.type = 'text/css';
	
	/* Sufixes */
	var foreignClassNameModifier = '--foreign';
	var residentClassNameModifier = '--resident';

	/* Patterns */
	var battleNetUrlPattern = getPatternFromUrl(battleNetUrl);
	var wowUrlPattern = getPatternFromUrl(wowUrl);
	var guildParameter = /\?guild\=(.*)$/;
	var accountUrlPattern = getPatternFromUrl(accountUrl);
	var armoryUrlPattern = getPatternFromUrl(armoryUrl);
	var weeklyInstanceModifiersUrlPattern = getPatternFromUrl(weeklyInstanceModifiersUrl);
	var pveLeaderboardsUrlPattern = getPatternFromUrl(pveLeaderboardsUrl)
	var shopUrlPattern = getPatternFromUrl(shopUrl);

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
			debug('Options have been loaded');
			debug(options);

			useEquippedItemLevel = options.useEquippedItemLevel;
			showWeeklyModifiersInfo = options.showWeeklyModifiersInfo;
			markPvELeaderboardsForeignCharacters = options.markPvELeaderboardsForeignCharacters;
			markPvELeaderboardsFactionGroups = options.markPvELeaderboardsFactionGroups;
			updatePvELeaderboardsFactionGroupsBackground = options.updatePvELeaderboardsFactionGroupsBackground;
			hidePvELeaderboardsForeignGroups = options.hidePvELeaderboardsForeignGroups;
			showShopOffersFirst = options.showShopOffersFirst;
			betaFeatures = options.betaFeatures;
			selectedRegion = options.selectedRegion;
			selectedCountry = options.selectedCountry;
			selectedLanguage = options.selectedLanguage;

			callback();
		});
	};

	/* Init functions */
	var init = function() {
		debug('Extension loaded');

		if (isWarcraftWebsite(urlToCheck)) {
			debug('Entering on wow website');

			// Verify if we are on Account website
			if (isAccountWebsite(urlToCheck)) {
				enhanceAccount();
			}

			// Verify if we are on Armory website
			if (isArmoryWebsite(urlToCheck)) {
				debug('Entering on Armory website');

				enhanceArmory();
				if (guildParameter.test(urlToCheck)) {
					makeGuildNameAvailable();
				}
			}

			// Verify if we are on PvE Leaderboards Website
			if (isPvELeaderboardsWebsite(urlToCheck)) {
				debug('Entering on PvE Leaderboards website');
				enhancePvELeaderboards();
			}

			// Verify if we are on Shop website
			if (isWarcraftShopWebsite(urlToCheck)) {
				debug('Entering on Shop website');
				enhanceShop();
			}

			// Add enhacedStyles to the DOM
			document.head.appendChild(enhacedStyles);
		}

		if (isWeeklyInstanceModifiersWebsite(urlToCheck)) {
			debug('Entering on weeklyInstanceModifiers website');
			setWeeklyModifiersInfo();
		}
	};

	// Apply enhances to account
	var enhanceAccount = function() {
		updateSuscriptionEnd();
	};

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
			enhancePvELeaderboardsCharacters(selectedRealm);
			enhancePvELeaderboardsGroups(selectedRealm);
		}
	};

	// Apply enhances to shop
	var enhanceShop = function() {
		debug('Enhacing Shop website');

		if (showShopOffersFirst) {
			groupOffersAtTop();
		}
	};

	// Read suscription's end date, and stores it
	var updateSuscriptionEnd = function() {
		// Get date
		var suscriptionEnd = document.querySelector('.section.account-details .account-time span time');

		if (suscriptionEnd) {
			debug('Updating suscription\'s end date');

			var dateTime = suscriptionEnd.getAttribute('datetime');
			var suscriptionEndDate = new Date(dateTime).getTime();
			
			// Get the 'now' moment (last update)
			var lastUpdate = new Date().getTime();

			chrome.storage.sync.set({
				suscriptionEnd: suscriptionEndDate,
				suscriptionEndLastUpdate: lastUpdate,
			}, function() {
				debug('Suscription\'s end has been updated');
			});
		}
	}

	// Set a request for opening weeklyInstanceModifiers and get weekly affixes info
	var getWeeklyModifiersInfo = function() {
		var wrapper = document.querySelector('.Box .contain-max > .List.Separator.Separator--fade > .List-item > .List--vertical > .List-item > .List.List--guttersMedium');
		
		// In case we can use Chrome tools
		if (showWeeklyModifiersInfo && wrapper && chrome && chrome.runtime && chrome.runtime.connect) {
			debug('Gathering weekly instance modifiers');

			var modifierIcons = wrapper.getElementsByClassName('GameIcon-icon');
			var modifierImages = [];
			for (var x in modifierIcons) {
				if (getPictureNameFromDiv(modifierIcons[x])) {
					modifierImages.push(getPictureNameFromDiv(modifierIcons[x]));
				}
			}

			// Compose the URL
			var url = `${parseUrl(weeklyInstanceModifiersUrl, {
				selectedLanguage: selectedLanguage,
			})}?`;

			modifierImages.forEach(function(debuff, index) {
				url += `${(index + 1)}=${debuff}&`;
			});

			// Clean URL
			url = url.substr(0, (url.length - 1));

			// Open website with requested debuffs
			window.open(url);
			debug('Weekly instance modifiers\' request has been sent');

			// Keeps waiting for weekly debuffs
			var getWeeklyModifiers = chrome.runtime.connect({ name: "getWeeklyModifiers" });
			getWeeklyModifiers.postMessage({ check: 'getWeeklyModifiers' });

			getWeeklyModifiers.onMessage.addListener(function(response){
				debug('Modifiers info has been recieved');
				writeModifiers(modifierIcons, response);
			});
		}
	};

	// Write modifiers descriptions in the DOM
	var writeModifiers = function(icons, modifiers) {
		debug('Placing description for weekly modifiers');

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
					list.parentElement.style.width = '33%';

					for (var y in modifiers) {
						var modifier = modifiers[y];
						var imageName = getPictureNameFromDiv(icon);

						if (imageName && imageName === modifier.name) {
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

	// When we load a weeklyInstanceModifiers website, get affixes info, and send it to Chrome Extension
	var setWeeklyModifiersInfo = function() {
		if (showWeeklyModifiersInfo && chrome && chrome.runtime && chrome.runtime.connect) {
			debug('Weekly Instance Modifiers have been found');
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
					debug('Gathering info from weekly instance modifiers');
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
										break;
									}
								}
							}
						}
					});

					// Send data to chrome extension
					debug('Weekly instance modifiers\' info has been sent');
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
			debug('Creating different styles for foreign players');

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

						// Get character's name
						var websiteElements = armoryUrlPattern.exec(firstMember.href);
						var characterName = websiteElements[4];

						// Keeps waiting for character's guild
						debug('Guild names\' request has been sent');
						var getGuildName = chrome.runtime.connect({ name: "getGuildName" });
						getGuildName.postMessage({ check: characterName });

						getGuildName.onMessage.addListener(function(response){
							debug('Guild names have been recieved');

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

		// Debugging
		if (markPvELeaderboardsFactionGroups) {
			debug('Placing faction icons for each group');
		}

		// STYLE: Change row's background color, based on their factions
		if (updatePvELeaderboardsFactionGroupsBackground) {
			debug('Updating background-color for each group');

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
			debug('Hiding \'Group Finder\' groups');

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
			debug('Showing groups\' guild names');

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
			if (nameSelector && guildSelector && chrome && chrome.runtime && chrome.runtime.connect) {

				// If there is no guild param on the URL, place it
				debug('Guild name has been sent');
				var getGuildName = chrome.runtime.connect({name: "getGuildName"});
				getGuildName.postMessage({
					'name': nameSelector.innerText,
					'guild': guildSelector.innerText,
					'guildUrl': guildSelector.href,
				});
				window.close();
			} else {
				setTimeout(function() {
					guildChecker();
				}, 500);
			}
		};
		guildChecker();
	};

	// Move discounts to top
	var groupOffersAtTop = function() {
		debug('Placing discounts at the top');
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
		// debug('Checking isWarcraftWebsite');
		return (wowUrlPattern.test(url) || battleNetUrlPattern.test(url));
	};

	// Verify is account website
	var isAccountWebsite = function(url) {
		// debug('Checking isAccountWebsite');
		return accountUrlPattern.test(url);
	}

	// Verify we are on a PvE leaderboard website
	var isPvELeaderboardsWebsite = function(url) {
		// debug('Checking isPvELeaderboardsWebsite');
		return pveLeaderboardsUrlPattern.test(url);
	};

	// Verify we are on a PvE leaderboard website
	var isArmoryWebsite = function(url) {
		// debug('Checking isArmoryWebsite');
		return armoryUrlPattern.test(url);
	};

	// Verify selected character belongs to selected realm
	var isForeignCharacter = function(char, realm) {
		// debug('Checking isForeignCharacter');
		return (new RegExp(realm).test(char.href) <= 0);
	};

	// Verify we are at wow eShop
	var isWarcraftShopWebsite = function(url) {
		// debug('Checking isWarcraftShopWebsite');
		return shopUrlPattern.test(url);
	}

	// Verify if we are at weeklyInstanceModifiers website
	var isWeeklyInstanceModifiersWebsite = function(url) {
		// debug('Checking isWeeklyInstanceModifiersWebsite');
		return weeklyInstanceModifiersUrlPattern.test(url);
	}

	/*	App start	*/
	initConfigs(init);
}())
