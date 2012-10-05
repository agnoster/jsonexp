var JSONExp = require('../lib/')
  , vows = require('vows')
  , assert = require('assert')

function test(src, cases) {
    var batch = {}
    var topic = {}
    topic.topic = function() { return new JSONExp(src) }
    for (var c in cases) {
        if (!cases.hasOwnProperty(c)) continue

        topic["Matching " + c] = testCase(c, cases[c])
    }

    batch[src] = topic
    return batch
}

function testSame(src, cmp) {
    var batch = {}
    var topic = {}
    topic.topic = function() { return new JSONExp(src) }
    topic["is the same as: " + cmp] = function(exp) { assert.ok(exp.equals(new JSONExp(cmp))) }

    batch[src] = topic
    return batch
}

function testCase(json, expected) {
    var c = { topic: function(exp) { return exp.exec(JSON.parse(json)) } }
    c["Returns " + JSON.stringify(expected)] = function(match) { assert.deepEqual(match, expected) }
    return c
}

vows.describe('JSONExp')
.addBatch({
  "equals()": {
    topic: function() { return new JSONExp('{ "foo": "bar", "bar": "foo" }') },
    'return true for an equivalent JSONExp': function(exp) {
      var equiv = new JSONExp('{"bar":"foo", "foo":"bar"}')
      assert.isTrue(exp.equals(equiv))
    },
    'returns false for a different JSONExp': function(exp) {
      var equiv = new JSONExp('{"bar":"foo"}')
      assert.isFalse(exp.equals(equiv))
    }
  }
})
.addBatch(test(
    '{ "foo": "bar" }',
        { '{ "foo": "bar" }': {}
        , '{ "foo": "baz" }': null
        , '{ "for": "bar" }': null
        , '{}': null
        , 'null': null
        }
))
.addBatch(test(
    '{ "foo": [FOO] }',
        { '{ "foo": "bar" }': { 'FOO': 'bar' }
        , '{ "foo": "baz" }': { 'FOO': 'baz' }
        , '{ "for": "bar" }': null
        , '{}': null
        , 'null': null
        }
))
.addBatch(testSame(
    '{ //This is a comment\n\t "foo": "bar" }',
    '{ "foo": "bar" }'
))
.addBatch(testSame(
    '//This is another comment\n\t{ "foo": "bar" }',
    '{ "foo": "bar" }'
))
.addBatch(testSame(
    '{\n   //This is another comment\n "bar": {\n  // Hi!\n "foo": "bar" }}',
    '{"bar": { "foo": "bar" }}'
))
.addBatch(testSame(
  "{\n  \"param\": [\n    {\"value\": \"key\", \"othervalue\": \"otherkey\"},\n    // a comment here \n    {\"key\": \"value\", \"key2\": \"value2\", \"key3\": {}}\n  ],\n  \"value\": true\n}\n",
  '{"param": [{"value": "key", "othervalue": "otherkey"}, {"key": "value", "key2": "value2", "key3": {}}], "value": true}'
))
.addBatch(testSame(
    '{ "foo": "http://bar" }',
    '{ "foo": "http://bar" }'
))
.addBatch(test(
    '[1, 2]',
        { '[1]': null
        , '{"0": 1}': null
        , '[1, 2]': {}
        , '[2, 1]': null
        , '[1, 2, 3]': null
        }
))
.addBatch(test(
    '[...]',
        { '[]': {}
        , '["a"]': {}
        , '["a", "b"]': {}
        , '["a", "b", "c"]': {}
        }
))
.addBatch(test(
    '["a", "b", ...]',
        { '["a"]': null
        , '["a", "b"]': {}
        , '["a", "b", "c"]': {}
        , '["c", "a", "b"]': null
        }
))
.addBatch(test(
    '[..., 1, 0]',
        { '[1]': null
        , '[1, 0]': {}
        , '[2, 1, 0]': {}
        , '[5, 4, 3, 2, 1, 0]': {}
        , '[1, 0, 2]': null
        }
))
.export(module)
