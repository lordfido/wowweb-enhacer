var characters = [];
var requests = 0;
var stored = 0;
var weeklyModifiers = false;;

/*	Extension Logic	*/
/*	Verify we have asked for character's guild	*/
chrome.runtime.onConnect.addListener(function(getGuildName){
	if(getGuildName.name === "getGuildName"){
		getGuildName.onMessage.addListener(function(response){
            if (response.name && response.guild) {
                debug(`Getting character info: ${response.name}`);

                if (characters.indexOf(function(char) { return (char.name == response.name && char.guild == response.guild) }) < 0) {
                    debug(`Saving new character in collection: ${response.name}`);
                    characters.push(response);
                    stored += 1;
                    getGuildName.postMessage(response);
                }
            }

            if (response.check) {
                debug(`Asking for selected character: ${response.check}`);
                requests += 1;

                var getSelectedCharacter = function() {
                    var selectedCharacter = characters.find(function(char) { return (char.name === response.check) });
                    if (selectedCharacter) {
                        debug(`Selecting requested character: ${selectedCharacter}`);
                        selectedCharacter.group = response.group;
                        getGuildName.postMessage(selectedCharacter);
                    
                    // Prevent an infinite loop, by stopping the function when all characters have been stored
                    } else if (stored < requests) {
                        setTimeout(function() {
                            getSelectedCharacter();
                        }, 500);
                    }
                };
                getSelectedCharacter();
            }
		});
	}
});

/*	Verify we have asked for weekly modifiers	*/
chrome.runtime.onConnect.addListener(function(getWeeklyModifiers){
	if(getWeeklyModifiers.name === "getWeeklyModifiers"){
		getWeeklyModifiers.onMessage.addListener(function(response) {
            // Asking (from PvE Leaderboards) for weekly modifiers
            if (response.check) {
                debug(`Asking for weekly modifiers`);
                weeklyModifiers = false;

                var getWeeklyModifiersInfo = function() {
                    if (weeklyModifiers) {
                        debug(`Sending weekly modifiers: ${weeklyModifiers}`);
                        getWeeklyModifiers.postMessage(weeklyModifiers);
                    
                    // Prevent an infinite loop, by stopping the function when all characters have been stored
                    } else {
                        setTimeout(function() {
                            getWeeklyModifiersInfo();
                        }, 500);
                    }
                };
                getWeeklyModifiersInfo();

            // Sending weekly modifiers (from wowhead);
            } else {
                debug(`Getting weekly modifiers info: ${response}`);
                weeklyModifiers = response;
            }
		});
	}
});