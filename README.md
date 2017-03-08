# WoW Web Enhacer
Wow Web Enhacer (wwe) is a [Google Chrome extension](https://chrome.google.com/webstore/detail/wow-website-enhacer/hhgbpiinmicadgmidmcfoelicbdhdbme?utm_source=chrome-ntp-icon) for improving the way that some world of warcraft official websites are displayed.

## Features
- **Account**: Detect, store and display your account remaining time until your play-time finishes.
- _**Account**: Increase the font-size for remaining time (TODO)._
- **Armory**: Display equipped item level instead of average item level.
- **PvE Leaderboards**: Differentiate characters from selected realm and characters from other realms.
- **PvE Leaderboards**: Display each group's faction.
- **PvE Leaderboards**: Hide groups created on Group Finder.
- **eShop**: Place discounts first.

## Components
Wwe is composed by 3 important files:
- **index.html & js/popup.js**: These files compose our settings screen, and allow the user to choose what enhacements should be done.
- **js/external_sites.js**: This file is injected in all battle.net and worldofwarcraft.com sites, in order to make enhacements.
- **js/background_tasks.js**: Some of wwe's tasks require a background task, and here is where wwe makes the magic.
 
Other useful components are:
- **constants/variables.js**: File to place variables used in several files.
- **css/custom-styles.scss**: Custom styles for overriding blizzard's styles.
