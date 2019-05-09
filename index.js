// Require Node.js Dependencies
const { lstat, readdir } = require("fs").promises;
const { join } = require("path");

/**
 * @async
 * @generator
 * @func recSize
 * @param {!String} location location
 * @returns {AsyncIterableIterator<Number>}
 */
async function* recSize(location) {
    const files = await readdir(location);
    const stats = await Promise.all(
        files.map((file) => lstat(join(location, file)))
    );

    for (let id = 0; id < files.length; id++) {
        const dc = stats[id];
        if (dc.isDirectory()) {
            yield* recSize(join(location, files[id]));
        }
        else {
            yield [files[id], dc.size];
        }
    }
}

/**
 * @async
 * @func dirSize
 * @desc Get size of a given directory recursively
 * @param {!String} location location
 * @param {RegExp} [pattern=null] pattern for file
 * @returns {Promise<Number>}
 */
async function dirSize(location, pattern = null) {
    const st = await lstat(location);
    if (!st.isDirectory()) {
        throw new Error("location must be path to a directory");
    }
    if (pattern !== null && Object.prototype.toString.call(pattern).slice(8, -1) !== "RegExp") {
        throw new TypeError("pattern must be a RegExp or a null value");
    }

    let sum = 0;
    for await (const [file, size] of recSize(location)) {
        if (pattern !== null && !pattern.test(file)) {
            continue;
        }
        sum += size;
    }

    return sum;
}

module.exports = dirSize;
