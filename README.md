# JSONExp

Powerful, expressive pattern matching for data structures

> "It's like regexes, but for JSON!" -- A perceptive individual

## Huh?

Perhaps an example would be illustrative?

    // Need to find a 30-year-old male from Berlin
    var test = JSONExp('{ "name": [NAME], "male": false, "age": 30, "home": "Berlin", ... }')

    var people = [
        { name: "Bob", male: true, age: 42, home: "San Francisco", lame: true },
        { name: "Sue", male: false, age: 23, home: "Berlin", awesome: true },
        { name: "Jim", male: true, age: 30, home: "Berlin", stoic: true }]

    people.forEach(function(p) {
        console.log(test(p))
    }

The output of this would be:

    null
    null
    { NAME: "Jim" }
