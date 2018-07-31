"use strict";

$(document).ready(function () {
    console.clear();
    var add = function add(a, b) {
        return a + b;
    };
    var word = "Ready! ";
    console.warn(word + add(6, 9));
});