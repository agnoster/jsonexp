# JSONExp [![build status](https://secure.travis-ci.org/agnoster/jsonexp.png?branch=master)](http://travis-ci.org/agnoster/jsonexp)

Powerful, expressive pattern matching for data structures

> "It's like regexes, but for JSON!" -- A perceptive individual

## Huh?

Perhaps an example would be illustrative?

    var JSONExp = require('jsonexp')

    // Need to find a 30-year-old male from Berlin
    var test = JSONExp('{ "name": [NAME], "male": true, "age": 30, "home": "Berlin", ... }')

    var people = [
        { name: "Bob", male: true, age: 42, home: "San Francisco", lame: true },
        { name: "Sue", male: false, age: 23, home: "Berlin", awesome: true },
        { name: "Jim", male: true, age: 30, home: "Berlin", stoic: true }]

    people.forEach(function(p) {
        console.log(test.exec(p))
    })

The output of this would be:

    null
    null
    { NAME: 'Jim' }

For more information, see the [docs][].

## License

MIT License, fork away and contribute back! Use GH Issues and Pull Requests for this purpose.

```
Copyright (C) 2012 by Isaac Wolkerstorfer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

[docs]: https://github.com/agnoster/jsonexp/wiki/Documentation
