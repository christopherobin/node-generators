'use strict';
/**
 * This library is just a collection of useful generators, it heavily depends on the latest
 * features of ES6 and will only work on the newest versions of node
 */


/**
 * Some duck typing in here, a generator by definition as a next and throw methods
 *
 * @param val
 * @returns {boolean}
 */
const isGenerator = exports.isGenerator = function isGenerator(val) {
    return (typeof (val.next) === 'function') && (typeof (val.throw) === 'function');
};


/**
 * Iterate from 0 up to max
 *
 * @param {int}     max
 * @param {Boolean} [inclusive] Default to  false
 */
const range = exports.range = function *range(max, inclusive) {
    if (inclusive) max++;
    for (let i = 0; i < max; i++) {
        yield i;
    }
};


/**
 * Iterates on an array/object, yields value
 *
 * @param {Array|Object} iterable
 */
const items = exports.items = function *items(iterable) {
    const index = Array.isArray(iterable) ? range(iterable.length) : Object.keys(iterable);
    for (let idx of index) {
        yield iterable[idx];
    }
};


/**
 * Iterates on an array/object/generator but filters duplicate values, yields value
 *
 * @param {Array|Object|Generator} iterable
 */
exports.unique = function *unique(iterable) {
    let seen = new Set();

    if (!isGenerator(iterable)) {
        iterable = items(iterable);
    }

    for (let item of iterable) {
        if (seen.has(item)) continue;
        yield item;
        seen.add(item);
    }
};


/**
 * Iterates and apply a function on each yielded value, yields mapFn(value)
 *
 * @param {Array|Object|Generator} iterable
 * @param {Function}               mapFn
 */
exports.map = function *map(iterable, mapFn) {
    if (!isGenerator(iterable)) {
        iterable = items(iterable);
    }

    for (let item of iterable) {
        yield mapFn(item);
    }
};


/**
 * Iterates and filter values based on the filter function, yields [key, value] if filterFn(value, key) is true
 *
 * @param {Array|Object|Generator} iterable
 * @param {Function}               filterFn
 * @param {Boolean}                keyVal
 */
exports.filter = function *filter(iterable, filterFn) {
    if (!isGenerator(iterable)) {
        iterable = items(iterable);
    }

    for (let item of items(iterable)) {
        if (filterFn(item)) yield item;
    }
};


const Filtered = Symbol('filtered');

/**
 * Wraps an object/array and runs operations defined on it in order
 */
class IterGenerator {
    /**
     * Takes either an object or array and builds a generator around it
     *
     * @param iterable
     */
    constructor(iterable) {
        this._operations = [];
        this._iterable = iterable;

        if (!isGenerator(this._iterable)) {
            this._iterable = items(this._iterable);
        }
    }

    /**
     * Add a map operation, calls mapFn (value, key) on the value
     *
     * @param {Function} mapFn
     * @returns {IterGenerator}
     */
    map(mapFn) {
        this._operations.push({
            type: 'map',
            fn: mapFn
        });
        return this;
    }

    /**
     * Add a map operation, calls filterFn (value, key) on the value, filters the value if false returned
     *
     * @param {Function} filterFn
     * @returns {IterGenerator}
     */
    filter(filterFn) {
        this._operations.push({
            type: 'filter',
            fn: filterFn
        });
        return this;
    }

    /**
     * Removes duplicate values at that point of the operation chain
     *
     * @returns {IterGenerator}
     */
    unique() {
        this._operations.push({
            type: 'unique',
            ws: new Set()
        });
        return this;
    }


    _apply(val) {
        // run each defined operation in order
        for (let op of this._operations) {
            switch (op.type) {
                case 'map':
                    val = op.fn(val);
                    break;
                case 'filter':
                    if (!op.fn(val)) return Filtered;
                    break;
                case 'unique':
                    if (op.ws.has(val)) {
                        return Filtered;
                    }
                    op.ws.add(val);
                    break;
            }
        }
        return val;
    }

    /**
     * Our actual generator, run the given operations in order before yielding the value and key
     */
    *[Symbol.iterator]() {
        for (let item of this._iterable) {
            let val = this._apply(item);
            if (val === Filtered) continue;
            yield val;
        }
    }
}

exports.IterGenerator = IterGenerator;
// convenient wrapper to get a generator
exports.iter = val => new IterGenerator(val);