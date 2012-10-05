function specials(obj) {
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

module.exports = specials
