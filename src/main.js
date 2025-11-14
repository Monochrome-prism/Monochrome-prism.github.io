import { CharacterSelectScene } from './scenes/CharacterSelectScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import AchievementScene from './scenes/AchievementScene.js';
import SkillTreeScene from './scenes/SkillTreeScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

// Game Configuration - After all classes are defined
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 700,
    parent: "game-container",
    backgroundColor: "#2d2d44",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 700,
        min: {
            width: 400,
            height: 350,
        },
        max: {
            width: 1600,
            height: 1400,
        },
        fullscreenTarget: "game-container",
    },
    scene: [CharacterSelectScene, SettingsScene, AchievementScene, SkillTreeScene, GameScene, GameOverScene],
};

const game = new Phaser.Game(config);
