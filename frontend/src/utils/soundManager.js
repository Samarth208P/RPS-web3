// Sound Manager with persistent audio context
class SoundManager {
    constructor() {
        this.sounds = {}
        this.initialized = false
        this.volume = 0.3
    }

    async init() {
        if (this.initialized) return

        // Preload all sounds
        this.sounds = {
            click: new Audio('/sounds/click.mp3'),
            select: new Audio('/sounds/select.mp3'),
            shake: new Audio('/sounds/shake.mp3'),
            reveal: new Audio('/sounds/reveal.mp3'),
            win: new Audio('/sounds/win.mp3'),
            loss: new Audio('/sounds/loss.mp3'),
            draw: new Audio('/sounds/draw.mp3'),
        }

        // Set volume for all sounds
        Object.values(this.sounds).forEach((audio) => {
            audio.volume = this.volume
            audio.preload = 'auto'
        })

        this.initialized = true
    }

    play(soundName) {
        if (!this.initialized) {
            this.init().then(() => this._play(soundName))
        } else {
            this._play(soundName)
        }
    }

    _play(soundName) {
        const sound = this.sounds[soundName]
        if (sound) {
            // Clone the audio to allow multiple plays
            const clone = sound.cloneNode()
            clone.volume = this.volume
            clone.play().catch((e) => console.log('Audio play failed:', e))
        }
    }

    setVolume(vol) {
        this.volume = vol
        if (this.initialized) {
            Object.values(this.sounds).forEach((audio) => {
                audio.volume = vol
            })
        }
    }
}

// Export singleton instance
export const soundManager = new SoundManager()

// Initialize on first user interaction
if (typeof window !== 'undefined') {
    const initOnInteraction = () => {
        soundManager.init()
        document.removeEventListener('click', initOnInteraction)
        document.removeEventListener('touchstart', initOnInteraction)
    }
    document.addEventListener('click', initOnInteraction)
    document.addEventListener('touchstart', initOnInteraction)
}
