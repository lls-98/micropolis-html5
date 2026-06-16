/**
 * Utility to asynchronously manage, cache, and play discrete multi-file media assets.
 */
export class AssetLoader {
    constructor() {
        this.images = new Map();
        this.sounds = new Map();
    }

    /**
     * Iterates through a mapping configuration object to preload multiple images simultaneously.
     * @param {Object.<string, string>} manifest - Key-value pair configuration map { uniqueKey: URL }
     */
    async loadImages(manifest) {
        const promises = Object.entries(manifest).map(([key, url]) => {
            return new Promise((resolve, reject) => {
                if (this.images.has(key)) return resolve(this.images.get(key));

                const img = new Image();
                img.src = url;
                img.onload = () => {
                    this.images.set(key, img);
                    resolve(img);
                };
                img.onerror = () => {
                    console.warn(`⚠️ Custom asset texture omitted or failed to load: ${url}`);
                    resolve(null); // Resilient fallback to avoid stopping the entire engine
                };
            });
        });
        await Promise.all(promises);
    }

    /**
     * Iterates through a mapping configuration object to preload multiple sound clips.
     * @param {Object.<string, string>} manifest - Key-value pair configuration map { uniqueKey: URL }
     */
    async loadSounds(manifest) {
        const promises = Object.entries(manifest).map(([key, url]) => {
            return new Promise((resolve, reject) => {
                if (this.sounds.has(key)) return resolve(this.sounds.get(key));

                const audio = new Audio();
                audio.src = url;
                audio.oncanplaythrough = () => {
                    this.sounds.set(key, audio);
                    resolve(audio);
                };
                audio.onerror = () => {
                    console.warn(`⚠️ Sound effect resource missing: ${url}`);
                    resolve(null);
                };
            });
        });
        await Promise.all(promises);
    }

    getImage(key) {
        return this.images.get(key) || null;
    }

    playSound(key) {
        const sound = this.sounds.get(key);
        if (sound) {
            sound.currentTime = 0; 
            sound.play().catch(() => {}); // Absorb browser interaction safety blocks
        }
    }
}

export const assets = new AssetLoader();