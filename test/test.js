'use strict';

var assert = require('assert');
var generators = require('..');
var range = generators.range;

const square = x => x*x;
const pair = x => !(x%2);
const root = Math.sqrt;

describe('Generators', function () {
    describe('#items', function () {
        it('allows iteration on an array', function () {
            let expectedList = [1, 2, 3];

            for (let item of generators.items([1, 2, 3])) {
                let expected = expectedList.shift();

                assert.equal(item, expected);
            }
        });

        it('allows iteration on an object', function () {
            let expectedList = [1, 2, 3];

            for (let item of generators.items({foo: 1, bar: 2, moo: 3})) {
                let expected = expectedList.shift();

                assert.equal(item, expected);
            }
        });
    });

    describe('#unique', function () {
        it('filters duplicates on an array', function () {
            let expectedList = [1, 2, 3, 5];

            for (let item of generators.unique([1, 2, 3, 2, 5])) {
                let expected = expectedList.shift();

                assert.equal(item, expected);
            }
        });

        it('filters duplicates on an generator', function () {
            function *dupGen() {
                let foo = [1, 1, 1, 1, 2, 1, 1, 1, 1, 1];
                for (let i of foo) {
                    yield i;
                }
            }

            let expectedList = [1, 2];

            for (let item of generators.unique(dupGen())) {
                let expected = expectedList.shift();

                assert.equal(item, expected);
            }
        });
    });

    describe('#map', function () {
        it('map an array', function () {
            let expectedList = [1, 4, 9, 16];

            for (let item of generators.map([1, 2, 3, 4], square)) {
                let expected = expectedList.shift();

                assert.equal(item, expected);
            }
        });

        it('map a generator', function () {
            let expectedList = [0, 1, 4, 9, 16];

            for (let item of generators.map(range(4, true), square)) {
                let expected = expectedList.shift();

                assert.equal(item, expected);
            }
        });
    });

    describe('#iter', function () {
        const iterable = [1, 2, 3, 2, 5, 5];

        it('for ... of', function () {
            let expectedList = [...iterable];

            for (const item of generators.iter(iterable)) {
                const expected = expectedList.shift();
                assert.equal(item, expected);
            }
        });

        it('#map', function () {
            let expectedList = [1, 4, 9, 4, 25, 25];

            for (const item of generators.iter(iterable).map(square)) {
                const expected = expectedList.shift();
                assert.equal(item, expected);
            }
        });

        it('#map + #unique', function () {
            let expectedList = [1, 4, 9, 25];

            for (const item of generators.iter(iterable).map(square).unique()) {
                const expected = expectedList.shift();
                assert.equal(item, expected);
            }
        });

        it('#map + #filter', function () {
            let expectedList = [4, 4];

            for (const item of generators.iter(iterable).map(square).filter(pair)) {
                const expected = expectedList.shift();
                assert.equal(item, expected);
            }
        });

        it('#map + #filter + #map', function () {
            let expectedList = [2, 2];

            for (const item of generators.iter(iterable).map(square).filter(pair).map(root)) {
                const expected = expectedList.shift();
                assert.equal(item, expected);
            }
        });
    });

    // not as useful I wished it would be, maybe I should yield [val, key]?
    describe('#iter@obj', function () {
        const iterable = {
            'user1': 1,
            'user2': 2,
            'user3': 3,
            'user4': 2,
            'user5': 5,
            'user6': 5
        };

        it('for ... of', function () {
            let expectedList = [1, 2, 3, 2, 5, 5];

            for (const item of generators.iter(iterable)) {
                const expected = expectedList.shift();
                assert.equal(item, expected);
            }
        });

        it('#map', function () {
            let expectedList = [1, 4, 9, 4, 25, 25];

            for (const item of generators.iter(iterable).map(square)) {
                const expected = expectedList.shift();
                assert.equal(item, expected);
            }
        });

        it('#map + #unique', function () {
            let expectedList = [1, 4, 9, 25];

            for (const item of generators.iter(iterable).map(square).unique()) {
                const expected = expectedList.shift();
                assert.equal(item, expected);
            }
        });

        it('#map + #filter', function () {
            let expectedList = [4, 4];

            for (const item of generators.iter(iterable).map(square).filter(pair)) {
                const expected = expectedList.shift();
                assert.equal(item, expected);
            }
        });

        it('#map + #filter + #map', function () {
            let expectedList = [2, 2];

            for (const item of generators.iter(iterable).map(square).filter(pair).map(root)) {
                const expected = expectedList.shift();
                assert.equal(item, expected);
            }
        });
    });
});