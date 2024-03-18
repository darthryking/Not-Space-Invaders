/* Misc. game configs */
export const FRAMERATE = 60; // FPS
export const FRAME_INTERVAL = 1000 / FRAMERATE; // ms per frame

/* Player */
export const PLAYER_SPEED = 5; // Pixels per frame
export const PLAYER_MAX_HEALTH = 10; // hitpoints
export const PLAYER_WEAPON_OFFSET_X = 38; // px

/* Aliens */
export const ALIEN_SPEED = 5; // Pixels per frame
export const ALIEN_MAX_HEALTH = 1; // hitpoints
export const ALIEN_SHIELD_MAX_INTEGRITY = 10; // hitpoints
export const ALIEN_SHIELD_REGEN_DELAY = 5000; // ms
export const ALIEN_BOUNTY = 100; // $
export const SHIELDED_ALIEN_BOUNTY = 200; // $

/* UFOs */
export const UFO_SPRITE_SCALE = 0.25;
export const UFO_SPEED = 2; // Pixels per frame
export const UFO_MAX_HEALTH = 5; // hitpoints
export const UFO_BEAM_MIN_BURST_INTERVAL = 1000; // ms
export const UFO_BEAM_MAX_BURST_INTERVAL = 5000; // ms
export const UFO_BEAM_MIN_BURST_TIME = 500; // ms
export const UFO_BEAM_MAX_BURST_TIME = 2000; // ms
export const UFO_BEAM_Y_OFFSET = 25; // px
export const UFO_BOUNTY = 500; // $

/* Motherships */
export const MOTHERSHIP_SPRITE_SCALE = 5;
export const MOTHERSHIP_SPEED = 1; // Pixels per frame
export const MOTHERSHIP_MAX_HEALTH = 20; // hitpoints
export const MOTHERSHIP_SHIELD_MAX_INTEGRITY = 100; // hitpoints
export const MOTHERSHIP_SHIELD_REGEN_DELAY = 10000; // ms
export const MOTHERSHIP_BEAM_MIN_BURST_INTERVAL = 5000; // ms
export const MOTHERSHIP_BEAM_MAX_BURST_INTERVAL = 10000; // ms
export const MOTHERSHIP_BEAM_MIN_BURST_TIME = Infinity; // ms
export const MOTHERSHIP_BEAM_MAX_BURST_TIME = Infinity; // ms
export const MOTHERSHIP_BEAM_Y_OFFSET = 70; // px
export const MOTHERSHIP_BOUNTY = 1000; // $

/* Meteors */
export const METEOR_SPRITE_SCALE = 0.25;
export const METEOR_SPEED = 1; // px per frame
export const METEOR_GRAVITY = 0.1; // px per frame^2
export const METEOR_MAX_HEALTH = 1; // hitpoints
export const METEOR_EXPLOSION_Y_OFFSET = 50; // px
export const METEOR_EXPLOSION_RADIUS = 100; // px
export const METEOR_EXPLOSION_DURATION = 500; // ms
export const METEOR_EXPLOSION_DAMAGE = 2; // hitpoints
export const METEOR_BOUNTY = 500; // $

/* Laser Gun */
export const LASER_GUN_NAME = "Gun";
export const PLAYER_LASER_GUN_ROF = 3; // Shots per second
export const PLAYER_LASER_GUN_BULLET_SPEED = 10; // px per frame
export const PLAYER_LASER_GUN_BULLET_DAMAGE = 1; // hitpoints

export const ALIEN_LASER_GUN_MIN_ROF = 0.2; // Shots per second
export const ALIEN_LASER_GUN_MAX_ROF = 0.5; // Shots per second
export const ALIEN_LASER_GUN_BULLET_SPEED = 10; // px per frame
export const ALIEN_LASER_GUN_BULLET_DAMAGE = 1; // hitpoints

/* Beam Cannon */
export const BEAM_CANNON_NAME = "Beam Cannon";
export const BEAM_CANNON_MAX_CHARGE_REFILLS = 3;
export const BEAM_CANNON_MAX_CHARGE = 100;
export const BEAM_CANNON_CHARGE_CONSUMPTION = 0.1; // Charge per frame
export const BEAM_CANNON_BEAM_LENGTH = 99999;
export const BEAM_CANNON_SHIELD_DAMAGE_MULTIPLIER = 50;
export const PLAYER_BEAM_CANNON_BEAM_WIDTH = 2; // px
export const PLAYER_BEAM_CANNON_BEAM_COLOR = '#FF0000';
export const PLAYER_BEAM_CANNON_BEAM_DAMAGE = 0.01; // Base damage per frame
export const UFO_BEAM_CANNON_BEAM_WIDTH = 30; // px
export const UFO_BEAM_CANNON_BEAM_COLOR = '#00FFFF';
export const UFO_BEAM_CANNON_BEAM_DAMAGE = 0.5; // Base damage per frame
export const MOTHERSHIP_BEAM_CANNON_BEAM_WIDTH = 60; // px
export const MOTHERSHIP_BEAM_CANNON_BEAM_COLOR = '#9900FF'; // px
export const MOTHERSHIP_BEAM_CANNON_BEAM_DAMAGE = 1; // Base damage per frame

/* Missile Launcher */
export const MISSILE_LAUNCHER_NAME = "Missile Launcher";
export const MISSILE_LAUNCHER_MAX_MISSILES = 3;
export const MISSILE_LAUNCHER_MISSILE_SPEED = 10; // px per frame

// Distance to the mouse that the missile will explode, in px
export const MISSILE_LAUNCHER_MISSILE_SELF_DESTRUCT_DIST = 25;

export const MISSILE_LAUNCHER_MISSILE_EXPLOSION_RADIUS = 100; // px
export const MISSILE_LAUNCHER_MISSILE_EXPLOSION_DURATION = 250; // ms
export const MISSILE_LAUNCHER_MISSILE_EXPLOSION_DAMAGE = 1; // hitpoints
export const MISSILE_LAUNCHER_MISSILE_UFO_DAMAGE_MULTIPLIER = 3;

/* Shop */
export const SHOP_Y = 100; // px
export const SHOP_WIDTH = 800; // px
export const SHOP_HEIGHT = 800; // px

export const BEAM_CANNON_AMMO_NAME = "AA Battery";
export const MISSILE_AMMO_NAME = "Missile";
export const LAWN_FERTILIZER_NAME = "Lawn Fertilizer";
export const EXTRA_LIFE_NAME = "Spare Truck";

export const BEAM_CANNON_PRICE = 1000; // $
export const MISSILE_LAUNCHER_PRICE = 2000; // $
export const BEAM_CANNON_AMMO_PRICE = 500; // $
export const MISSILE_AMMO_PRICE = 1000; // $
export const LAWN_FERTILIZER_PRICE = 1000; // $
export const EXTRA_LIFE_PRICE = 1000; // $

/* UI */
export const BOTTOM_BAR_HEIGHT = 100; // px

/* Lawn */
export const LAWN_HEIGHT = 15; // px
export const NUM_LAWN_SEGMENTS = 100;
export const MAX_HEALED_LAWN_SEGMENTS = NUM_LAWN_SEGMENTS * 0.3;

/* Waves */
export const WAVE_SPAWN_DELAY = 5000; // ms

/* Debug stuff */
export const DEBUG_SHOW_BOUNDING_BOXES = false;
export const DEBUG_SHOW_FIRE_POS = false;
