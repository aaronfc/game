/**
 * Author: Michael Hadley, mikewesthad.com
 * Asset Credits:
 *  - Tuxemon, https://github.com/Tuxemon/Tuxemon
 */

// UI config
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const MINIMAP_WIDTH = 600; // Base 2
const MINIMAP_HEIGHT = 600; // Base 2
const TILE_SIZE = 32;

// Character config
const WALKING_VELOCITY = 700; // px/second

// Real life
const EARTH_EQUATORIAL_CIRCUMFERENCE = 40075 * 1000; // meters
const EARTH_MERIDIONAL_HALF_CIRCUMFERENCE = 40007 * 1000 / 2; // meters
const AVERAGE_WALKING_VELOCITY =  83.33; // 5.0km/h -> 83.33m/s
const SECONDS_TO_WALK_EARTH_LONGITUDE = EARTH_EQUATORIAL_CIRCUMFERENCE/AVERAGE_WALKING_VELOCITY;
const SECONDS_TO_WALK_EARTH_LATITUDE = EARTH_MERIDIONAL_HALF_CIRCUMFERENCE/AVERAGE_WALKING_VELOCITY;

// Virtual world config
const CALCULATED_WORLD_WIDTH = SECONDS_TO_WALK_EARTH_LONGITUDE*WALKING_VELOCITY;
const CALCULATED_WORLD_HEIGHT = SECONDS_TO_WALK_EARTH_LATITUDE*WALKING_VELOCITY;
var WORLD_TILES_WIDTH = Math.floor(CALCULATED_WORLD_WIDTH/TILE_SIZE);
var WORLD_TILES_HEIGHT = Math.floor(CALCULATED_WORLD_HEIGHT/TILE_SIZE);
console.log(WORLD_TILES_WIDTH);
console.log(WORLD_TILES_HEIGHT);
WORLD_TILES_WIDTH = 100;
WORLD_TILES_HEIGHT = 100;
const WORLD_WIDTH = TILE_SIZE * WORLD_TILES_WIDTH;
const WORLD_HEIGHT = TILE_SIZE * WORLD_TILES_HEIGHT;



const config = {
  type: Phaser.WEBGL,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  parent: "game-container",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);
let cursors;
let player;
let debugGraphic;
let minimapImage;

function preload() {
  this.load.image("tiles", "assets/tuxmon-sample-32px-extruded.png");
  //this.load.tilemapTiledJSON("map", "https://www.mikewesthad.com/phaser-3-tilemap-blog-posts/post-1/assets/tilemaps/tuxemon-town.json");

  // An atlas is a way to pack multiple images together into one texture. I'm using it to load all
  // the player animations (walking left, walking right, etc.) in one image. For more info see:
  //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
  // If you don't use an atlas, you can do the same thing with a spritesheet, see:
  //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
  this.load.atlas("atlas", "assets/atlas.png", "assets/atlas.json");
}

var noise = new Noise(Math.random());

function generateHeights(width, height) {
  var properties = [];
  for(var i=0; i<height; i++) { // TODO @aaron - Play with this loop values to see how affects scenary
      properties[i] = [];
      for(var j=0; j<width; j++) {
          var value = noise.simplex2(i/200, j/200);
          properties[i][j] = value;
      }
  }
  return properties;
}

function generateGround(mapHeights) {
  const GRASS_1 = 125;
  const GRASS_2 = 126;
  const DIRT_1 = 124;
  const DIRT_2 = 132;
  const WATER_1 = 248;
  const WATER_2 = 249;
  const WATER_3 = 250;

  var ground = [];
  for(var i=0; i<mapHeights.length; i++) {
      ground[i] = [];
      for(var j=0; j<mapHeights[0].length; j++) {
        const height = mapHeights[i][j];
          /*ground[i][j] = height < 0.3 ? WATER_1 :
            height < 0.6 ? Math.random() < 0.5 ? DIRT_1 : DIRT_2 : Math.random() < 0.5 ? GRASS_1 : GRASS_2;*/
          ground[i][j] = height < 0.0 ? WATER_1 : height > 0.8 ? GRASS_1 : DIRT_1;
      }
  }
  return ground;
}

function createMinimapImage(scene, ground) {
  let graphics = scene.make.graphics().fillStyle(0x000000).fillRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);
  graphics.generateTexture('minimap', MINIMAP_WIDTH, MINIMAP_HEIGHT);
  minimapImage = scene.add.image(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 'minimap')
    .setDepth(30)
    .setScrollFactor(0)
    .setVisible(false);
  graphics.destroy();
}

function create() {

  //const map = this.make.tilemap({ key: "map" });
  const map = this.make.tilemap({tileWidth: 32, tileHeight: 32});

  // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
  // Phaser's cache (i.e. the name you used in preload)
  const tileset = map.addTilesetImage("tiles", "tiles", 32, 32, 1, 2);
  // Parameters: layer name (or index) from Tiled, tileset, x, y
  //const belowLayer = map.createStaticLayer(0, tileset, 0, 0);
  const groundLayer = map.createBlankDynamicLayer("ground", tileset, 0, 0, WORLD_TILES_WIDTH, WORLD_TILES_HEIGHT, TILE_SIZE, TILE_SIZE);
  // Empty 50x50 grass
  const mapHeights = generateHeights(WORLD_TILES_WIDTH, WORLD_TILES_HEIGHT);
  const ground = generateGround(mapHeights);

  createMinimapImage(this, ground);

  groundLayer.putTilesAt(ground, 0, 0);
  const worldLayer = map.createBlankDynamicLayer("world", tileset, 0, 0, WORLD_TILES_WIDTH, WORLD_TILES_HEIGHT, TILE_SIZE, TILE_SIZE);
  // Mostly empty world but with some poles
  var world = [];
  for(var i=0; i<WORLD_TILES_HEIGHT; i++) {
      world[i] = [];
      for(var j=0; j<WORLD_TILES_WIDTH; j++) {
          world[i][j] = Math.floor((Math.random() * 100) + 1) < 5 ? 241 : -1;
      }
  }
  worldLayer.putTilesAt(world, 0, 0);
  //const aboveLayer = map.createBlankDynamicLayer("above", tileset);

  const debugGraphics = undefined;

  worldLayer.setCollision([241], true, false);

  // By default, everything gets depth sorted on the screen in the order we created things. Here, we
  // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
  // Higher depths will sit on top of lower depth objects.
  //aboveLayer.setDepth(10);

  // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
  // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
  //const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");

  // Create a sprite with physics enabled via the physics system. The image used for the sprite has
  // a bit of whitespace, so I'm using setSize & setOffset to control the size of the player's body.
  player = this.physics.add
    .sprite(32*32, 32*32, "atlas", "misa-front") // 0, 0 spawn point
    .setSize(30, 40)
    .setOffset(0, 24);

  // Watch the player and worldLayer for collisions, for the duration of the scene:
  this.physics.add.collider(player, worldLayer);

  // Create the player's walking animations from the texture atlas. These are stored in the global
  // animation manager so any sprite can access them.
  const anims = this.anims;
  anims.create({
    key: "misa-left-walk",
    frames: anims.generateFrameNames("atlas", { prefix: "misa-left-walk.", start: 0, end: 3, zeroPad: 3 }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "misa-right-walk",
    frames: anims.generateFrameNames("atlas", { prefix: "misa-right-walk.", start: 0, end: 3, zeroPad: 3 }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "misa-front-walk",
    frames: anims.generateFrameNames("atlas", { prefix: "misa-front-walk.", start: 0, end: 3, zeroPad: 3 }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "misa-back-walk",
    frames: anims.generateFrameNames("atlas", { prefix: "misa-back-walk.", start: 0, end: 3, zeroPad: 3 }),
    frameRate: 10,
    repeat: -1
  });

  const camera = this.cameras.main;
  camera.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  camera.startFollow(player);
  camera.setName("main");

  cursors = this.input.keyboard.createCursorKeys();

  // Help text that has a "fixed" position on the screen
  this.add
    .text(16, 16, 'Arrow keys to move\nPress "D" to show hitboxes', {
      font: "18px monospace",
      fill: "#000000",
      padding: { x: 20, y: 10 },
      backgroundColor: "#ffffff"
    })
    .setScrollFactor(0)
    .setDepth(30);

  // Debug graphics
  this.input.keyboard.on("keydown_D", event => {
    if (debugGraphic == undefined) {
      // Turn on physics debugging to show player's hitbox
      this.physics.world.createDebugGraphic();

      // Create worldLayer collision graphic above the player, but below the help text
      debugGraphic = this.add
        .graphics()
        .setAlpha(0.75)
        .setDepth(20);
      worldLayer.renderDebug(debugGraphic, {
        tileColor: null, // Color of non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tile
        faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
      });
    } else {
      debugGraphic.destroy();
      debugGraphic = undefined;
      this.physics.world.debugGraphic.destroy();
    }
  });

  // Minimap "M"
  this.input.keyboard.on("keydown_M", event => {
    if(minimapImage) {
      minimapImage.setVisible(!minimapImage.visible);
    }
  });

}

function update(time, delta) {
  const speed = WALKING_VELOCITY;
  const prevVelocity = player.body.velocity.clone();

  // Stop any previous movement from the last frame
  player.body.setVelocity(0);

  // Horizontal movement
  if (cursors.left.isDown) {
    player.body.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(speed);
  }

  // Vertical movement
  if (cursors.up.isDown) {
    player.body.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(speed);
  }

  // Normalize and scale the velocity so that player can't move faster along a diagonal
  player.body.velocity.normalize().scale(speed);

  // Update the animation last and give left/right animations precedence over up/down animations
  if (cursors.left.isDown) {
    player.anims.play("misa-left-walk", true);
  } else if (cursors.right.isDown) {
    player.anims.play("misa-right-walk", true);
  } else if (cursors.up.isDown) {
    player.anims.play("misa-back-walk", true);
  } else if (cursors.down.isDown) {
    player.anims.play("misa-front-walk", true);
  } else {
    player.anims.stop();

    // If we were moving, pick and idle frame to use
    if (prevVelocity.x < 0) player.setTexture("atlas", "misa-left");
    else if (prevVelocity.x > 0) player.setTexture("atlas", "misa-right");
    else if (prevVelocity.y < 0) player.setTexture("atlas", "misa-back");
    else if (prevVelocity.y > 0) player.setTexture("atlas", "misa-front");
  }
}
