## 1.6.1
- More compatibility with Foundry V13, although editing multiple doors at once won't copy settings from existing groups properly.

## 1.6.0
### Compatibility
- Smart Doors is now compatible with Foundry v13

## 1.5.0
### Compatibility
- Smart Doors is now compatible with Foundry v12

## 1.4.1
### Translation
- Added portugese (Brazil) translation (thanks eunaumtenhoid!)


## 1.4.0
### Compatibility
- Smart Doors is now compatible with Foundry v10

### Translation
- Updated the english text for several UI items
- Updated the german translation (thanks Athemis!)
- Updated the french translation (thanks rectulo!)


## 1.3.3
### Bugfixes
- Fixed a bug that could cause some settings to not apply if multiple settings were changed at once
- Fixed a bug that caused the french translation to not work


## 1.3.2
### Bugfixes
- The message sent to chat when triggering a locke door alert can now be translated

### Translation
- Added japanese translation (thanks to touge)
- Added german translation


## 1.3.1
### Bugfixes
- The keybinding to toggle secret doors no longer supresses other keybindings that are assigned to the same key


## 1.3.0
### New features
- The keybinding for the Toggle Secret Door feature can now be reconfigured via Foundries keybinding configuration (the default key has changed to AltLeft)

### Compatibility
- Smart Doors is now compatible with Foundry 9

### Translation
- Added french translation (thanks to Elfenduli)


## 1.2.9
### Feature revival
- The "Tint secret doors" feature is back, but will remain disabled by default.

## 1.2.8
### Compatibility
- Smart Doors is now compatible with Foundry 0.8.8
- Due to API changes inside Foundry, Smart Doors is no longer compatible with Foundry versions older than 0.8.7

## 1.2.7
### Compatibility
- Smart Doors is now compatible with Foundry 0.8.5

### Feature removals
- The door icons now have outlines by defualt in Foundry. As a result the "Door Icon Outline" feature was removed.
- Secret doors now have a different icon from regular doors in Foundry, making the "Tint Secret Doors" feature redundant. As a result it was removed.

## 1.2.6
### Compatibility
- Smart Doors now uses the libwrapper module and as a result is now compatible with the module "FoundryVTT Arms Reach"

## 1.2.5
### New features
- Synchronized doors can now be configured to synchronize their secret door status as well

## v1.2.4
### Bugfix
- Fixed a race condition that may cause doors to not be properly synchronized across scenes

## v1.2.3
### Other
- Smart Doors is now compatible with Arms Reach

## v1.2.2
### Bugfix
- Disabled features are now less likely to interfere with other modules, increasing compatibility.
  - This module can now be used together with the `Arms Reach` module if the `Toggle Secret Doors` feature is disabled in the settings.

### Other
- Warn the user about incompatibility if they use this module together with `Arms Reach` and have incompatible features enabled.

## v1.2.1
### Other
- Verified compatibility with 0.7.9

## v1.2.0
### New features
- Draw outlines around Door Control icons to increase their visibility

### Other
- Secret doors are now tinted black instead of dark grey.


## v1.1.0
### New features
- Tint secret doors grey for the GM to differentiate them from regular doors
- Toggle doors between secret and normal with ctrl+click
- Makes the size of door controls independent of the scene's grid size

### Bugfixes
- In cloned scenes Locked Door Alerts will now only highlight the door in the correct scene
- When adding a door to a synchronization group it will now assume the correct state if it's being synchronized with it's twin door on a cloned map
- Fixed a bug that allowed synchonized doors to be opened dispite them being locked
- Fixed a bug where secret doors that were synchronized with doors on other scenes wouldn't be tinted corretly after interacting with them

## v1.0.1
- When adding a door to a synchronization group adjust it's state to bring it in sync with the other doors
- Use the players character as speaker for the Locked Door Alert
