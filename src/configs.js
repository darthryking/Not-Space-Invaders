/* Misc. game configs */
export const FRAMERATE = 60; // FPS
export const FRAME_INTERVAL = 1000 / FRAMERATE; // ms per frame

/* Player */
export const PLAYER_SPEED = 5; // Pixels per frame
export const PLAYER_MAX_HEALTH = 10; // hitpoints

/* Aliens */
export const ALIEN_SPEED = 5; // Pixels per frame
export const ALIEN_MAX_HEALTH = 1; // hitpoints

/* Laser Gun */
export const PLAYER_LASER_GUN_ROF = 3; // Shots per second
export const PLAYER_LASER_GUN_BULLET_SPEED = 10; // px per frame
export const PLAYER_LASER_GUN_BULLET_DAMAGE = 1; // hitpoints

export const ALIEN_LASER_GUN_MIN_ROF = 0.1; // Shots per second
export const ALIEN_LASER_GUN_MAX_ROF = 1; // Shots per second
export const ALIEN_LASER_GUN_BULLET_SPEED = 10; // px per frame
export const ALIEN_LASER_GUN_BULLET_DAMAGE = 1; // hitpoints

/* Beam Cannon */
export const BEAM_CANNON_BEAM_WIDTH = 2; // px
export const BEAM_CANNON_BEAM_LENGTH = 99999;
export const BEAM_CANNON_BEAM_COLOR = '#00FFFF';

/* Missile Launcher */
export const MISSILE_LAUNCHER_MISSILE_SPEED = 10; // px per frame

// Distance to the mouse that the missile will explode, in px
export const MISSILE_LAUNCHER_MISSILE_SELF_DESTRUCT_DIST = 10;

/* Debug stuff */
export const DEBUG_SHOW_BOUNDING_BOXES = false;
export const DEBUG_SHOW_FIRE_POS = false;
