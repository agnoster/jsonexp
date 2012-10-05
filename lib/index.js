var assert = require('assert')

var parse = require('./parse')
var Matcher = require('./matcher')

function JSONExp(src, options) {
    this.options = options || {}
    this.src     = src
    this.pattern = parse(src)
    this.matcher = new Matcher(this.pattern)
}

JSONExp.prototype = {}

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

JSONExp.prototype.exec = JSONExp.prototype.match = function(src, options) {
  return this.matcher.exec(src, options)
}

JSONExp.prototype.test = function(obj, options) {
    return !!this.exec(obj, options)
}

module.exports = JSONExp
