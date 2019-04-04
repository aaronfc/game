# Features

* Character moving with arrow keys.
* Press D for debug mode.
* Press M to see minimap.
* Randomly generated map.

# Changelog
- Generated minimap as image.
* Rolled back to v3.12.0 because texture marked as deleted when calling `generateTexture`.
* Replacing minimap camera with image. Not yet generated! (just a black image for now).
* Extracted many values to constants.
* Making minimap size configurable. Black lines appearing if size is not in base 2.
* Adding minimap (press M) to see whole world at once. Problems: Bug with 3.10.0, fixed in 3.12.0. Bug with camera background, fixed by me and PRed.
* Creating heightmap with simplex noise algorithm to make it look more realistic.
* Randomly generating terrain and colliding poles. Poles made colliding by specifying tile nunmber from tileset.
* Replacing static tilemap layer with dynamic ones. Problems: adding spacing and margin to the tileset.
* Based on first post of series "Modular Game Worlds in Phaser 3"[1]

# References
[1]: https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
