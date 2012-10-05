var specials = require('./specials')

var captureRE = /\[([A-Za-z_][A-Za-z_0-9]*)\]/g

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

function preprocess(src) {
  var output = src
        .replace(/"(.*?[^\\])"/g, escapeString)
        .replace(/\.\.\.\s*\]/g,   '{ "' + specials.many    + '": true }]')
        .replace(/\[\s*\.\.\./g,  '[{ "' + specials.many    + '": true }')
        .replace(/\*/g,     '{ "' + specials.any     + '": true }')
        .replace(/\.\.\./g,   '"' + specials.glob    + '": true')
        .replace(captureRE, '{ "' + specials.capture + '": "$1" }')
        .replace(/(^(\s)*|\s)\/\/.*\n/g, '')

  return output
}

function parse(src) {
    return JSON.parse(preprocess(src))
}

module.exports = parse
