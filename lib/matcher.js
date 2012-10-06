var assert = require('assert')
var specials = require('./specials')

function mergeCaptures(current, next, noOverwrite) {
    for (var key in next) {
        if (!next.hasOwnProperty(key)) continue
        if (current.hasOwnProperty(key) && noOverwrite)
            assert.deepEqual(current[key], next[key], "Got mismatching results for capture [" + key + "]")

        current[key] = next[key]
    }
    return current
}

function Matcher(pattern) {
  this.pattern = pattern
}

Matcher.prototype = {}

Matcher.prototype.assert = function(obj, options) {
    // tests obj for matching, throws assertion errors if mismatched
    options = options || {}
    if (!options.namespace) options.namespace = {}

    var copy = JSON.parse(JSON.stringify(this.pattern))

    var match = this._match(copy, obj, options, '/')

    if (options.merge) mergeCaptures(options.namespace, match, true)

    return match
}

Matcher.prototype._match = function(pattern, given, options, path) {
    var match = {}, key, m, length

    function test(a, b, message) {
        assert.equal(a, b, "At key '" + path + "': expected " + a + ", got " + b)
    }

    if ('object' == typeof pattern && pattern) {
        if (specials(pattern).capture) {
            match[specials(pattern).capture] = given
        } else if (specials(pattern).any) {
            // anything will do
        } else if (given instanceof Array) {
            // ignore arrays
            assert.ok(pattern, "Expected an Array at " + path + ", got null")
            assert.ok(pattern instanceof Array, "Expected an Array at " + path + ", got " + pattern.constructor)
            length = pattern.length, o = 0, i = 0
            if (specials(pattern).prefix) {
                length--
            } else if (specials(pattern).suffix) {
                o = given.length - pattern.length
                i = 1
            } else {
                assert.equal(given.length, pattern.length, "Arrays are not the same length at " + path)
            }
            for (; i < length; i++) {
                m = this._match(pattern[i], given[i + o], options, path + '/' + i)
                mergeCaptures(match, m)
            }
        } else {
            test(typeof pattern, typeof given)

            if (specials(pattern).glob) {
                delete pattern[specials.glob]
            } else {
                for (key in given) {
                    if (!given.hasOwnProperty(key)) continue
                    assert.ok(pattern.hasOwnProperty(key), "At " + path + ", unexpected key \"" + key + "\": " + JSON.stringify(given[key]) )
                }
            }

            assert.ok(given, "Got null at " + path)
            assert.equal(given.constructor, pattern.constructor, "Not the same type")

            for (key in pattern) {
                if (!pattern.hasOwnProperty(key)) continue
                assert.ok(given.hasOwnProperty(key), "At " + path + ", key '" + key + "' not found")
                m = this._match(pattern[key], given[key], options, path + '/' + key)
                mergeCaptures(match, m)
            }
        }
    } else { // non-objects
        test(typeof pattern, typeof given)
        test(pattern, given)
    }
    return match
}

Matcher.prototype.exec = function(obj, options) {
    try {
        var match = this.assert(obj, options)
        return match
    } catch (e) {
        if (!(e instanceof assert.AssertionError)) throw e
        return null
    }
}

module.exports = Matcher
