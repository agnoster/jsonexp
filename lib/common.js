var syntax = {}

var keywords = {
    glob    : "$JSONExp GLOB"
    capture : "$JSONExp CAPTURE"
    any     : "$JSONExp ANY"
    many    : "$JSONExp MANY"
}

Pattern = function() {
}

Pattern.prototype = {}
Pattern.prototype.toString = function() { return JSON.stringify(this) }

var fn = {
    glob    : function glob(obj) {
        obj[keywords.glob] = true
        return obj
    }

    capture : function capture(key) {
        var value = {}
        value[keywords.capture] = key
        return value
    }

    any     : function() {
        var value = {}
        value[keywords.any] = true
        return value
    }

    many    : function() {
        var value = {}
        value[keywords.many] = true
        return value
    }
}
