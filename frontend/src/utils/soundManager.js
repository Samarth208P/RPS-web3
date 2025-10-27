class SoundManager {
    constructor() {
        this.sounds = {}
        this.bgMusic = null
        this.enabled = true
        this.musicEnabled = false  // Changed to false - starts muted
        this.musicVolume = 0.5
    }

    preload(soundName, soundFile) {
        const audio = new Audio(soundFile)
        audio.preload = 'auto'
        this.sounds[soundName] = audio
    }

    preloadMusic(soundFile) {
        this.bgMusic = new Audio(soundFile)
        this.bgMusic.loop = true
        this.bgMusic.volume = this.musicVolume
        this.bgMusic.preload = 'auto'
    }

    play(soundName, options = {}) {
        if (!this.enabled || !this.sounds[soundName]) {
            console.warn(`Sound "${soundName}" not found. Available sounds:`, Object.keys(this.sounds))
            return
        }

        const sound = this.sounds[soundName]

        // Reset to start if already playing
        if (!sound.paused) {
            sound.currentTime = 0
        }

        // Apply options
        if (options.loop !== undefined) {
            sound.loop = options.loop
        }
        if (options.volume !== undefined) {
            sound.volume = options.volume
        }

        sound.play().catch(error => {
            console.warn(`Failed to play sound ${soundName}:`, error)
        })
    }

    playMusic() {
        if (!this.musicEnabled || !this.bgMusic) return

        this.bgMusic.play().catch(error => {
            console.warn('Failed to play background music:', error)
        })
    }

    pauseMusic() {
        if (!this.bgMusic) return
        this.bgMusic.pause()
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled

        if (this.musicEnabled) {
            this.playMusic()
        } else {
            this.pauseMusic()
        }

        return this.musicEnabled
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume))
        if (this.bgMusic) {
            this.bgMusic.volume = this.musicVolume
        }
    }

    stop(soundName) {
        if (!this.sounds[soundName]) return

        const sound = this.sounds[soundName]
        sound.pause()
        sound.currentTime = 0
    }

    stopAll() {
        Object.keys(this.sounds).forEach(soundName => {
            this.stop(soundName)
        })
    }

    setVolume(soundName, volume) {
        if (!this.sounds[soundName]) return
        this.sounds[soundName].volume = Math.max(0, Math.min(1, volume))
    }

    toggle() {
        this.enabled = !this.enabled
        if (!this.enabled) {
            this.stopAll()
        }
        return this.enabled
    }
}

// Create and export singleton instance
export const soundManager = new SoundManager()

// Preload all sounds
soundManager.preload('click', '/sounds/click.mp3')
soundManager.preload('select', '/sounds/select.mp3')
soundManager.preload('shake', '/sounds/shake.mp3')
soundManager.preload('reveal', '/sounds/reveal.mp3')
soundManager.preload('win', '/sounds/win.mp3')
soundManager.preload('loss', '/sounds/lose.mp3')
soundManager.preload('draw', '/sounds/draw.mp3')

// Preload background music
soundManager.preloadMusic('/sounds/bg-music.mp3')
