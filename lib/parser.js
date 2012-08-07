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
    return src
        .replace(/"(.*?[^\\])"/g, escapeString)
        .replace(/\*\*/g,         '{ "' + specials.many    + '": true }')
        .replace(/\[\s*\.\.\./g, '[{ "' + specials.many    + '": true }')
        .replace(/\.\.\.\s*\]/g,  '{ "' + specials.many    + '": true }]')
        .replace(/\*/g,           '{ "' + specials.any     + '": true }')
        .replace(/\.\.\./g,         '"' + specials.glob    + '": true')
        .replace(captureRE,       '{ "' + specials.capture + '": "$1" }')
}

function parse(src) {
    return JSON.parse(preprocess(src))
}

module.exports(parse)
