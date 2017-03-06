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
	var pveGroupPrefix = 'pve-group-';

	/* Faction colors */
	var allianceColor = 'rgba(0, 40, 84, 0.2)';
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

	/* PvE Leaderboards */
	var pveLeaderboards = 'pve/leaderboards';

	/* Config variables */
	var markPvELeaderboardsForeignCharacters = true;			// Use custom styles for foreign charachters
	var markPvELeaderboardsFactionGroups = true;				// Place an icon to show group's factions
	var updatePvELeaderboardsFactionGroupsBackground = true;	// Change table background with its faction's color
	var hidePvELeaderboardsForeignGroups = true;				// Hide groups with too many foreigners
	var showPvELeaderboardsGuild = false;						// Show the guild name of each group

	// Init saved configs
	var initConfigs = function(callback) {

		chrome.storage.sync.get({
        markPvELeaderboardsForeignCharacters: true,
        markPvELeaderboardsFactionGroups: true,
        updatePvELeaderboardsFactionGroupsBackground: true,
        hidePvELeaderboardsForeignGroups: true,
        showPvELeaderboardsGuild: false,

    // Callback function, do anything after loading options
    }, function(options) {
			markPvELeaderboardsForeignCharacters = options.markPvELeaderboardsForeignCharacters;
			markPvELeaderboardsFactionGroups = options.markPvELeaderboardsFactionGroups;
			updatePvELeaderboardsFactionGroupsBackground = options.updatePvELeaderboardsFactionGroupsBackground;
			hidePvELeaderboardsForeignGroups = options.hidePvELeaderboardsForeignGroups;
			showPvELeaderboardsGuild = options.showPvELeaderboardsGuild;

			callback();
    });
	};

	/* Init functions */
	var init = function() {
		debug('Extension loaded');

		if (isWarcraftWebsite(urlToCheck)) {
			debug('Entering on wow website');

			// Verify if we are on PvE Leaderboards Website
			if (isPvELeaderboardsWebsite(urlToCheck)) {
				enhancePvELeaderboards();
			}

			// Add enhacedStyles to the DOM
			document.head.appendChild(enhacedStyles);
		}

		if (isArmoryWebsite(urlToCheck)) {
			debug('Armory website detected!');
			if (guildParameter.test(urlToCheck)) {
				makeGuildNameAvailable();
			}
		}
	};

	// Apply enhances to the website
	var enhancePvELeaderboards = function() {
		debug('Enhacing PvE Leaderboards website');

		var realmSelector = document.querySelector('.Pane-content .List > .List-item > .SelectMenu.SelectMenu--search')
		if (realmSelector) {
			var selectedRealm = realmSelector.innerText
				.toLowerCase()
				.replace("'", "")
				.replace("\n", "");
		}
		
		if (selectedRealm) {
			debug(`Creating rules for ${selectedRealm} realm`);

			enhancePvELeaderboardsCharacters(selectedRealm);
			enhancePvELeaderboardsGroups(selectedRealm);
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
	}

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

				var tableRow = group.parentElement;

				// Mark foreign groups
				if (hidePvELeaderboardsForeignGroups && foreignCharacters > 1) {
					tableRow.parentElement.className = `${tableRow.parentElement.className} SortTable${foreignClassNameModifier}`;
				} else {
					tableRow.parentElement.className = `${tableRow.parentElement.className} SortTable${residentClassNameModifier}`;
				}

				// Mark each group's faction
				if (markPvELeaderboardsFactionGroups) {
					var faction = tableRow.dataset.value;
	
					// Add faction Logo to the table
					tableRow.innerHTML = `
						<span class="Icon Icon--${faction} Icon--medium">
							${faction === 'alliance' ? allianceIcon : ''}
							${faction === 'horde' ? hordeIcon : ''}
						</span>
						<div style="position: relative; display: inline-block; vertical-align: middle; padding-bottom: 5px;">
							${tableRow.innerHTML}
						</div>
					`;
				}

				// Show group's guilds
				if (showPvELeaderboardsGuild && foreignCharacters <= 1) {
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
				.SortTable-col[data-value="alliance"] {
					background: ${allianceColor};
				}
				.SortTable-col[data-value="horde"] {
					background: ${hordeColor};
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
		if (showPvELeaderboardsGuild) {
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

	// Verify we are on a World of Warcraft website
	var isWarcraftWebsite = function(url) {
		debug('Checking isWarcraftWebsite(): '+ url);
		return (
			new RegExp(wowWebsite).test(url) > 0 ||
			new RegExp(battleNetWebsite).test(url) > 0
		);
	};

	// Verify we are on a PvE leaderboard website
	var isPvELeaderboardsWebsite = function(url) {
		debug('Checking isPvELeaderboardsWebsite(): '+ url);
		return (
			new RegExp(pveLeaderboards).test(url)
		);
	};

	// Verify we are on a PvE leaderboard website
	var isArmoryWebsite = function(url) {
		debug('Checking isArmoryWebsite(): '+ url);
		return (
			characterWebsitePattern.test(url)
		);
	};

	// Verify selected character belongs to selected realm
	var isForeignCharacter = function(char, realm) {
		return (new RegExp(realm).test(char.href) <= 0);
	};

	var debugging = true;
	var debug = function(params) {
		if (debugging) {
			console.log('[wow.com enhacer]:', params);
		}
	};

	/*	App start	*/
	initConfigs(init);
}())