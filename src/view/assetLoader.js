/**
 * Utility to asynchronously manage, cache, and play discrete multi-file media assets.
 */
export class AssetLoader {
    constructor() {
        this.images = new Map();
        this.sounds = new Map();
    }

    async loadImages(manifest) {
        const promises = Object.entries(manifest).map(([key, url]) => {
            return new Promise((resolve) => {
                if (this.images.has(key)) return resolve(this.images.get(key));

                const img = new Image();
                img.src = url;
                img.onload = () => {
                    this.images.set(key, img);
                    resolve(img);
                };
                img.onerror = () => {
                    // 🟢 FIX: Log the error clearly but resolve anyway to prevent app freeze!
                    console.error(`❌ [Asset Missing] Failed to load image asset at path: "${url}"`);
                    resolve(null); 
                };
            });
        });
        await Promise.all(promises);
    }

    async loadSounds(manifest) {
        const promises = Object.entries(manifest).map(([key, url]) => {
            return new Promise((resolve) => {
                if (this.sounds.has(key)) return resolve(this.sounds.get(key));

                const audio = new Audio();
                audio.src = url;
                audio.oncanplaythrough = () => {
                    this.sounds.set(key, audio);
                    resolve(audio);
                };
                audio.onerror = () => {
                    // 🟢 FIX: Log the error clearly but resolve anyway to prevent app freeze!
                    console.error(`❌ [Asset Missing] Failed to load audio asset at path: "${url}"`);
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
            sound.play().catch(() => {});
        }
    }
}

export const assets = new AssetLoader();