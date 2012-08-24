var JSONExp = require('../lib/')
  , vows = require('vows')
  , assert = require('assert')
  , sugar = require('sugar')

function test(src, pattern, cases) {
    var batch = {}
    var topic = {}
    topic.topic = function() { return new JSONExp(src) }
    topic['Has correct pattern'] = function(exp) { assert.deepEqual(exp.pattern, pattern) }
    for (var c in cases) {
        if (!cases.hasOwnProperty(c)) continue

        topic["Matching " + c] = testCase(c, cases[c])
    }

    batch[src] = topic
    return batch
}

function testCase(json, expected) {
    var c = { topic: function(exp) { return exp(JSON.parse(json)) } }
    c["Returns " + JSON.stringify(expected)] = function(match) { assert.deepEqual(match, expected) }
    return c
}

vows.describe('JSONExp')
.addBatch(test(
    '{ "foo": "bar" }', { foo: "bar" },
        { '{ "foo": "bar" }': {}
        , '{ "foo": "baz" }': null
        , '{ "for": "bar" }': null
        , '{}': null
        , 'null': null
        }
))
.addBatch(test(
    '{ "foo": [FOO] }', { foo: { '$JSONExp CAPTURE': 'FOO' } },
        { '{ "foo": "bar" }': { 'FOO': 'bar' }
        , '{ "foo": "baz" }': { 'FOO': 'baz' }
        , '{ "for": "bar" }': null
        , '{}': null
        , 'null': null
        }
))
.addBatch(test(
    '{ //This is a comment\n\t "foo": "bar" }', { foo: "bar" }
))
.addBatch(test(
    '//This is another comment\n\t{ "foo": "bar" }', { foo: "bar" }
))
.addBatch(test(
    '{\n   //This is another comment\n "bar": {\n  // Hi!\n "foo": "bar" }}',
    {bar: { foo: "bar" }}
))
.addBatch(test(
  "{\n  \"param\": [\n    {\"value\": \"key\", \"othervalue\": \"otherkey\"},\n    // a comment here \n    {\"key\": \"value\", \"key2\": \"value2\", \"key3\": {}}\n  ],\n  \"value\": true\n}\n", {param: [{value: "key", othervalue: "otherkey"}, {key: "value", key2: "value2", key3: {}}], value: true}
))
.addBatch(test(
    '{ "foo": "http://bar" }', { foo: "http://bar" }
))
.addBatch(test(
    '[1, 2]', [1, 2],
        { '[1]': null
        , '{"0": 1}': null
        , '[1, 2]': {}
        , '[2, 1]': null
        , '[1, 2, 3]': null
        }
))
.addBatch(test(
    '[...]', [{ "$JSONExp MANY": true }],
        { '[]': {}
        , '["a"]': {}
        , '["a", "b"]': {}
        , '["a", "b", "c"]': {}
        }
))
.addBatch(test(
    '["a", "b", ...]', ["a", "b", { "$JSONExp MANY": true }],
        { '["a"]': null
        , '["a", "b"]': {}
        , '["a", "b", "c"]': {}
        , '["c", "a", "b"]': null
        }
))
.addBatch(test(
    '[..., 1, 0]', [{ "$JSONExp MANY": true }, 1, 0],
        { '[1]': null
        , '[1, 0]': {}
        , '[2, 1, 0]': {}
        , '[5, 4, 3, 2, 1, 0]': {}
        , '[1, 0, 2]': null
        }
))
.addBatch(test(
    '{ "foo": <date: 1 month ago> }', {
      foo: Date.create('1 month ago').format('{yyyy}-{MM}-{dd}T{hh}:{mm}:{ss}{zzzz}')
    }
))

.export(module)
