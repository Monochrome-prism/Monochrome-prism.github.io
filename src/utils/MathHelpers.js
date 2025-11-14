/**
 * MathHelpers.js
 *
 * Pure mathematical utility functions for common game calculations
 * All functions are stateless and return computed values
 */

/**
 * Get a random spawn position on one of the screen edges
 * @param {number} gameWidth - Width of the game screen (default: 800)
 * @param {number} gameHeight - Height of the game screen (default: 600)
 * @returns {{x: number, y: number}} Position object with x and y coordinates
 */
export function getSpawnPositionOnEdge(gameWidth = 800, gameHeight = 600) {
    const edge = Phaser.Math.Between(0, 3);

    switch (edge) {
        case 0: // Top
            return {
                x: Phaser.Math.Between(20, gameWidth - 20),
                y: -20
            };
        case 1: // Right
            return {
                x: gameWidth + 20,
                y: Phaser.Math.Between(20, gameHeight - 20)
            };
        case 2: // Bottom
            return {
                x: Phaser.Math.Between(20, gameWidth - 20),
                y: gameHeight + 20
            };
        case 3: // Left
        default:
            return {
                x: -20,
                y: Phaser.Math.Between(20, gameHeight - 20)
            };
    }
}

/**
 * Apply knockback velocity to a physics body
 * Calculates the angle from source to target and applies velocity
 * @param {Phaser.Physics.Arcade.Body} body - The physics body to apply knockback to
 * @param {number} fromX - Source X position
 * @param {number} fromY - Source Y position
 * @param {number} toX - Target X position
 * @param {number} toY - Target Y position
 * @param {number} power - Knockback power/force
 */
export function applyKnockback(body, fromX, fromY, toX, toY, power) {
    const angle = Phaser.Math.Angle.Between(fromX, fromY, toX, toY);
    body.setVelocity(
        Math.cos(angle) * power,
        Math.sin(angle) * power
    );
}

/**
 * Normalize an angle to the range -PI to PI
 * Useful when Phaser.Math.Angle.Difference is not available (v3.70.0)
 * @param {number} angle - Angle in radians to normalize
 * @returns {number} Normalized angle between -PI and PI
 */
export function normalizeAngle(angle) {
    let normalized = angle;
    while (normalized < -Math.PI) normalized += Math.PI * 2;
    while (normalized > Math.PI) normalized -= Math.PI * 2;
    return normalized;
}

/**
 * Calculate velocity components from an angle and speed
 * @param {number} angle - Angle in radians
 * @param {number} speed - Speed/magnitude of velocity
 * @returns {{x: number, y: number}} Velocity components
 */
export function getVelocityFromAngle(angle, speed) {
    return {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
    };
}

/**
 * Calculate the absolute difference between two angles
 * Returns the smallest angle between them
 * @param {number} angle1 - First angle in radians
 * @param {number} angle2 - Second angle in radians
 * @returns {number} Absolute angle difference (0 to PI)
 */
export function getAngleDifference(angle1, angle2) {
    let diff = angle1 - angle2;
    diff = normalizeAngle(diff);
    return Math.abs(diff);
}
