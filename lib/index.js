var assert = require('assert')
var sugar  = require('sugar')

var captureRE = /\[([A-Za-z_][A-Za-z_0-9]*)\]/g

function mergeCaptures(current, next, noOverwrite) {
    for (var key in next) {
        if (!next.hasOwnProperty(key)) continue
        if (current.hasOwnProperty(key) && noOverwrite)
            assert.deepEqual(current[key], next[key], "Got mismatching results for capture [" + key + "]")

        current[key] = next[key]
    }
    return current
}

function processHooks(input, hooks) {
  var keys = Object.keys(hooks)

  return keys.reduce(function(str, key) {
    var regex = new RegExp("<" + key + ": ?([^>]+)>")
    return str.replace(regex, function(_, match) {
      return '"' + hooks[key](match) + '"'
    })
  }, input)
}

function JSONExp(src, options) {
    var self = function() {
      return self.exec.apply(self, arguments)
    }

    self.src     = src
    self.pattern = JSONExp.parse(src)
    self.options = options || {}

    self.__proto__ = JSONExp.prototype
    self.constructor = JSONExp

    return self
}

var specials = function(obj) {
    var opts = {}

    if (obj.hasOwnProperty(specials.glob))    opts.glob    = obj[specials.glob]
    if (obj.hasOwnProperty(specials.capture)) opts.capture = obj[specials.capture]
    if (obj.hasOwnProperty(specials.any))     opts.any     = obj[specials.any]
    if (obj.hasOwnProperty(specials.many))    opts.many    = obj[specials.many]

    if (obj instanceof Array) {
        var last = obj[obj.length - 1]
          , first = obj[0]
        if (first && first.hasOwnProperty(specials.many))
            opts.suffix = first[specials.many]
        if (last && last.hasOwnProperty(specials.many))
            opts.prefix = last[specials.many]
    }

    return opts
}

specials.glob    = "$JSONExp GLOB"
specials.capture = "$JSONExp CAPTURE"
specials.any     = "$JSONExp ANY"
specials.many    = "$JSONExp MANY"

function unicodeEscape(str) {
    var output = '', code
    for (var i = 0; i < str.length; i++) {
        code = str.charCodeAt(i).toString(16)
        while (code.length < 4) code = '0' + code
        output += '\\u' + code
    }
    return output
}

function escapeString(match, contents) {
    return '"' + unicodeEscape(contents) + '"'
}

JSONExp.preprocess = function(src) {
  var output = src
        .replace(/"(.*?[^\\])"/g, escapeString)
        .replace(/\.\.\.\s*\]/g,   '{ "' + specials.many    + '": true }]')
        .replace(/\[\s*\.\.\./g,  '[{ "' + specials.many    + '": true }')
        .replace(/\*/g,     '{ "' + specials.any     + '": true }')
        .replace(/\.\.\./g,   '"' + specials.glob    + '": true')
        .replace(captureRE, '{ "' + specials.capture + '": "$1" }')
        .replace(/(^(\s)*|\s)\/\/.*\n/g, '')

  return processHooks(output, JSONExp.hooks);
}

JSONExp.parse = function(src) {
    return JSON.parse(JSONExp.preprocess(src))
}

JSONExp.prototype = new Function

JSONExp.prototype.exec = function(obj, options) {
    try {
        var match = this.assert(obj, options)
        return match
    } catch (e) {
        if (!(e instanceof assert.AssertionError)) throw e
        return null
    }
}

JSONExp.prototype.assert = function(obj, options) {
    // tests obj for matching, throws assertion errors if mismatched
    options = options || {}
    if (!options.namespace) options.namespace = {}

    var copy = JSON.parse(JSON.stringify(this.pattern))

    var match = this._match(copy, obj, options, '/')

    if (options.merge) mergeCaptures(options.namespace, match, true)

    return match
}

JSONExp.prototype.test = function(obj, options) {
    return !!this.exec(obj, options)
}

JSONExp.prototype._match = function(pattern, given, options, path) {
    var match = {}

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
            var length = pattern.length, o = 0, i = 0
            if (specials(pattern).prefix) {
                length--
            } else if (specials(pattern).suffix) {
                o = given.length - pattern.length
                i = 1
            } else {
                assert.equal(given.length, pattern.length, "Arrays are not the same length at " + path)
            }
            for (; i < length; i++) {
                var m = this._match(pattern[i], given[i + o], options, path + '/' + i)
                mergeCaptures(match, m)
            }
        } else {
            test(typeof pattern, typeof given)

            if (specials(pattern).glob) {
                delete pattern[specials.glob]
            } else {
                for (var key in given) {
                    if (!given.hasOwnProperty(key)) continue
                    assert.ok(pattern.hasOwnProperty(key), "At " + path + ", unexpected key \"" + key + "\": " + JSON.stringify(given[key]) )
                }
            }

            assert.ok(given, "Got null at " + path)
            assert.equal(given.constructor, pattern.constructor, "Not the same type")

            for (var key in pattern) {
                if (!pattern.hasOwnProperty(key)) continue
                assert.ok(given.hasOwnProperty(key), "At " + path + ", key '" + key + "' not found")
                var m = this._match(pattern[key], given[key], options, path + '/' + key)
                mergeCaptures(match, m)
            }
        }
    } else { // non-objects
        test(typeof pattern, typeof given)
        test(pattern, given)
    }
    return match
}

JSONExp.prototype.toString = function() {
    return '' + this.src
}

JSONExp.prototype.equals = function(exp) {
  try {
    assert.deepEqual(this.pattern, exp.pattern)
    return true
  } catch (e) {
    return false
  }
}

JSONExp.prototype.compile = function() {
    // precompile for better performance
    console.log("precompiling not yet implemented")

    /* Someday:
    this.exec = function() {
        // precompiled version
    }
    */
    return this
}

JSONExp.compile = function(pattern, options) {
    var exp = new JSONExp(pattern, options)
    return exp.compile()
}

JSONExp.hooks = {
  date: function(input) {
    return Date.create(input).format('{yyyy}-{MM}-{dd}T{hh}:{mm}:{ss}{zzzz}');
  }
}

module.exports = JSONExp
