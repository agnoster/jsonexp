var assert = require('assert')

var parse = require('./parse')
var Matcher = require('./matcher')

function JSONExp(src, options) {
    var self = function() {
      return self.exec.apply(self, arguments)
    }

    self.src     = src
    self.pattern = parse(src)
    self.matcher = new Matcher(self.pattern)
    self.options = options || {}

    self.__proto__ = JSONExp.prototype
    self.constructor = JSONExp

    return self
}

JSONExp.prototype = new Function()

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
