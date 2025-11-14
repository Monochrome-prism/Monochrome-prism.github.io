import { gameState } from '../config/gameState.js';

// Sound Effects System using Web Audio API
export class SoundFX {
    constructor() {
        this.audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
    }

    // Get effective SFX volume (master * sfx)
    getVolume() {
        return (gameState.masterVolume || 1.0) * (gameState.sfxVolume || 1.0) * 0.3;
    }

    // Resume audio context if suspended (required by browsers)
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Play a sound effect
    play(type) {
        // Try to resume audio context if suspended
        this.resumeAudioContext();

        // Catch any errors to prevent crashes
        try {
            switch (type) {
            case "shoot":
                this.playShoot();
                break;
            case "hit":
                this.playHit();
                break;
            case "enemyDeath":
                this.playEnemyDeath();
                break;
            case "playerHit":
                this.playPlayerHit();
                break;
            case "xpCollect":
                this.playXPCollect();
                break;
            case "levelUp":
                this.playLevelUp();
                break;
            case "select":
                this.playSelect();
                break;
            case "hover":
                this.playHover();
                break;
            }
        } catch (error) {
            // Silently catch audio errors to prevent crashes
            // Audio context might be suspended or unavailable
            console.warn('Sound effect error:', error);
        }
    }

    playShoot() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.frequency.setValueAtTime(
            400,
            this.audioContext.currentTime,
        );
        osc.frequency.exponentialRampToValueAtTime(
            200,
            this.audioContext.currentTime + 0.1,
        );

        gain.gain.setValueAtTime(
            this.getVolume() * 0.3,
            this.audioContext.currentTime,
        );
        gain.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + 0.1,
        );

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    playHit() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = "square";
        osc.frequency.setValueAtTime(
            200,
            this.audioContext.currentTime,
        );
        osc.frequency.exponentialRampToValueAtTime(
            50,
            this.audioContext.currentTime + 0.05,
        );

        gain.gain.setValueAtTime(
            this.getVolume() * 0.4,
            this.audioContext.currentTime,
        );
        gain.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + 0.05,
        );

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.05);
    }

    playEnemyDeath() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(
            300,
            this.audioContext.currentTime,
        );
        osc.frequency.exponentialRampToValueAtTime(
            50,
            this.audioContext.currentTime + 0.2,
        );

        gain.gain.setValueAtTime(
            this.getVolume() * 0.5,
            this.audioContext.currentTime,
        );
        gain.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + 0.2,
        );

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.2);
    }

    playPlayerHit() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(
            100,
            this.audioContext.currentTime,
        );

        gain.gain.setValueAtTime(
            this.getVolume() * 0.6,
            this.audioContext.currentTime,
        );
        gain.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + 0.15,
        );

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.15);
    }

    playXPCollect() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(
            800,
            this.audioContext.currentTime,
        );
        osc.frequency.exponentialRampToValueAtTime(
            1200,
            this.audioContext.currentTime + 0.1,
        );

        gain.gain.setValueAtTime(
            this.getVolume() * 0.3,
            this.audioContext.currentTime,
        );
        gain.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + 0.1,
        );

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    playLevelUp() {
        // Play a quick ascending arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, C
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.type = "sine";
            osc.frequency.setValueAtTime(
                freq,
                this.audioContext.currentTime,
            );

            const startTime =
                this.audioContext.currentTime + i * 0.1;
            gain.gain.setValueAtTime(
                this.getVolume() * 0.4,
                startTime,
            );
            gain.gain.exponentialRampToValueAtTime(
                0.01,
                startTime + 0.15,
            );

            osc.start(startTime);
            osc.stop(startTime + 0.15);
        });
    }

    playSelect() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.frequency.setValueAtTime(
            600,
            this.audioContext.currentTime,
        );
        osc.frequency.exponentialRampToValueAtTime(
            800,
            this.audioContext.currentTime + 0.05,
        );

        gain.gain.setValueAtTime(
            this.getVolume() * 0.3,
            this.audioContext.currentTime,
        );
        gain.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + 0.05,
        );

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.05);
    }

    playHover() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.frequency.setValueAtTime(
            400,
            this.audioContext.currentTime,
        );

        gain.gain.setValueAtTime(
            this.getVolume() * 0.15,
            this.audioContext.currentTime,
        );
        gain.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + 0.03,
        );

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.03);
    }
}

// Initialize and export a singleton instance
export const soundFX = new SoundFX();
