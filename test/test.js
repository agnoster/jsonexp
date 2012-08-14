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
    '{ "foo": "http://bar" }', { foo: "http://bar" }
))
.addBatch(test(
    '{ "foo": <date: 1 month ago> }', {
      foo: Date.create('1 month ago').format('{yyyy}-{MM}-{dd}T{hh}:{mm}:{ss}{zzzz}')
    }
))

.export(module)
    
