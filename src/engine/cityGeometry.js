/**
 * CityLocation represents a discrete coordinate point (X, Y) on the city map.
 * Ports the utility of CityLocation.java.
 */
export class CityLocation {
    /**
     * Constructs and initializes city coordinates.
     * @param {number} x - East-West axis (increasing is East)
     * @param {number} y - North-South axis (increasing is South)
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Unique hash value generation matching Java's internal hash tracking rules.
     * @returns {number}
     */
    hashCode() {
        return this.x * 33 + this.y;
    }

    /**
     * Checks equality against another object instance.
     * @param {any} obj 
     * @returns {boolean}
     */
    equals(obj) {
        if (obj instanceof CityLocation) {
            return this.x === obj.x && this.y === obj.y;
        }
        return false;
    }

    /**
     * Serializes coordinates to a readable string format.
     * @returns {string} Example: "(12,45)"
     */
    toString() {
        return `(${this.x},${this.y})`;
    }
}

/**
 * CityDimension encapsulates the standalone width and height 
 * of a structural layout grid profile.
 * Ports the utility of CityDimension.java.
 */
export class CityDimension {
    /**
     * Constructs and initializes size dimensions.
     * @param {number} width 
     * @param {number} height 
     */
    constructor(width = 0, height = 0) {
        this.width = width;
        this.height = height;
    }

    /**
     * Unique hash value generation matching Java's dimension tracking rules.
     * @returns {number}
     */
    hashCode() {
        return this.width * 33 + this.height;
    }

    /**
     * Checks equality against another dimension profile instance.
     * @param {any} obj 
     * @returns {boolean}
     */
    equals(obj) {
        if (obj instanceof CityDimension) {
            return this.width === obj.width && this.height === obj.height;
        }
        return false;
    }

    /**
     * Serializes size dimensions to a readable string format.
     * @returns {string} Example: "3x3"
     */
    toString() {
        return `${this.width}x${this.height}`;
    }
}

/**
 * CityRect specifies a rectangular area layout within the city's coordinate space.
 * Ports the utility of CityRect.java.
 */
export class CityRect {
    /**
     * Constructs and initializes a rectangular bounding area.
     * @param {number} x - Upper-left corner X coordinate
     * @param {number} y - Upper-left corner Y coordinate
     * @param {number} width 
     * @param {number} height 
     */
    constructor(x = 0, y = 0, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * Checks equality against another boundary rectangle instance.
     * @param {any} obj 
     * @returns {boolean}
     */
    equals(obj) {
        if (obj instanceof CityRect) {
            return (
                this.x === obj.x &&
                this.y === obj.y &&
                this.width === obj.width &&
                this.height === obj.height
            );
        }
        return false;
    }

    /**
     * Serializes the rectangle bounding footprint to a readable string format.
     * @returns {string} Example: "[10,20,3x3]"
     */
    toString() {
        return `[${this.x},${this.y},${this.width}x${this.height}]`;
    }
}