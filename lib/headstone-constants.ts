// lib/headstone-constants.ts

// Shape configuration
export const DEFAULT_SHAPE_IMAGE = 'serpentine.svg';
export const SHAPES_BASE = '/shapes/headstones/';
export const DEFAULT_SHAPE_URL = SHAPES_BASE + DEFAULT_SHAPE_IMAGE;

// Texture paths
export const TEX_BASE = '/textures/forever/l/';
export const DEFAULT_TEX = 'Imperial-Red.webp';

// Headstone dimension constraints (mm)
export const MIN_HEADSTONE_DIM = 300;
export const MAX_HEADSTONE_DIM = 1200;

// Inscription constraints
export const MIN_INSCRIPTION_SIZE_MM = 5;
export const MAX_INSCRIPTION_SIZE_MM = 1200;
export const MIN_INSCRIPTION_ROTATION_DEG = -45;
export const MAX_INSCRIPTION_ROTATION_DEG = 45;

// Base configuration
export const BASE_HEIGHT_METERS = 0.5; // Base height in meters (500mm)
export const BASE_WIDTH_MULTIPLIER = 1.4; // Base is 1.4x wider than headstone
export const BASE_DEPTH_MULTIPLIER = 1.5; // Base is 1.5x deeper than headstone
export const BASE_MIN_WIDTH = 0.05; // Minimum base width in meters
export const BASE_MIN_DEPTH = 0.05; // Minimum base depth in meters

// Addition model defaults
export const ADDITION_TARGET_HEIGHT_METERS = 0.18; // Default height for additions (18cm)
export const ADDITION_MIN_SCALE = 0.05;
export const ADDITION_MAX_SCALE = 5;

// Performance constants
export const LERP_FACTOR = 0.25; // Smoothing factor for animations
export const EPSILON = 1e-3; // Small value for floating point comparisons
export const Z_TOLERANCE = 0.25; // Tolerance for Z-axis comparisons

// Shader colors
export const SKY_TOP_COLOR = { r: 0.4, g: 0.7, b: 1.0 };
export const SKY_BOTTOM_COLOR = { r: 0.7, g: 0.9, b: 1.0 };
export const GRASS_DARK_COLOR = { r: 0.3, g: 0.5, b: 0.2 };
export const GRASS_LIGHT_COLOR = { r: 0.4, g: 0.6, b: 0.3 };

// Camera configuration
export const CAMERA_2D_TILT_ANGLE = 12.6; // Degrees
export const CAMERA_2D_DISTANCE = 10; // Distance from target (reduced for zoom)
export const CAMERA_3D_POSITION_Y = 1;
export const CAMERA_3D_POSITION_Z = 8; // Reduced for zoom
export const CAMERA_FOV = 35; // Reduced FOV for more zoom
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 100;

