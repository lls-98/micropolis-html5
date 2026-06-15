/**
 * Sound enumerates the auditory event keys produced by the Micropolis engine.
 * The simulation triggers these keys; the client-side UI frontend handles 
 * the actual audio playback.
 * Ports Sound.java.
 */
export class Sound {
    static EXPLOSION_LOW  = new Sound('EXPLOSION_LOW', 'explosion-low');
    static EXPLOSION_HIGH = new Sound('EXPLOSION_HIGH', 'explosion-high');
    static EXPLOSION_BOTH = new Sound('EXPLOSION_BOTH', 'explosion-low');
    static UHUH           = new Sound('UHUH', 'bop');
    static SORRY          = new Sound('SORRY', 'bop');
    static BUILD          = new Sound('BUILD', 'layzone');
    static BULLDOZE       = new Sound('BULLDOZE', null);
    static HONKHONK_LOW   = new Sound('HONKHONK_LOW', 'honkhonk-low');
    static HONKHONK_MED   = new Sound('HONKHONK_MED', 'honkhonk-med');
    static HONKHONK_HIGH  = new Sound('HONKHONK_HIGH', 'honkhonk-high');
    static HONKHONK_HI    = new Sound('HONKHONK_HI', 'honkhonk-hi');
    static SIREN          = new Sound('SIREN', 'siren');
    static HEAVYTRAFFIC   = new Sound('HEAVYTRAFFIC', 'heavytraffic');
    static MONSTER        = new Sound('MONSTER', 'zombie-roar-5');

    /**
     * @param {string} key - Upper-case enum lookup token.
     * @param {string|null} wavName - Filename prefix for the corresponding asset file.
     */
    constructor(key, wavName) {
        this.key = key;
        this.wavName = wavName;
    }

    /**
     * Returns an array containing all sound definitions.
     * @returns {Sound[]}
     */
    static values() {
        return [
            this.EXPLOSION_LOW, this.EXPLOSION_HIGH, this.EXPLOSION_BOTH,
            this.UHUH, this.SORRY, this.BUILD, this.BULLDOZE,
            this.HONKHONK_LOW, this.HONKHONK_MED, this.HONKHONK_HIGH, this.HONKHONK_HI,
            this.SIREN, this.HEAVYTRAFFIC, this.MONSTER
        ];
    }

    /**
     * Gets the base filename prefix token string.
     * @returns {string|null}
     */
    getWavName() {
        return this.wavName;
    }

    /**
     * Generates a relative asset directory URL path string for the web frontend.
     * @param {string} [basePath='/sounds/'] - Optional base directory hosting the sound assets.
     * @returns {string|null} Full relative path to the sound asset, or null if no sound is mapped.
     */
    getAudioPath(basePath = '/sounds/') {
        if (!this.wavName) {
            return null;
        }
        // Ensure the base path ends with a single slash
        const formattedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
        return `${formattedBase}${this.wavName}.wav`;
    }

    toString() {
        return `Sound.${this.key}`;
    }
}