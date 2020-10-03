/*
var a = 0;

if (!(a & 255)) {
    console.log("yer")
} else {
    console.log(a&255)
}

if(!(a&255)) console.log("yes")
*/
/*
var b = 0

var c = b

b = 3
//console.log(0x12 & 0x10)

if ((0xE ^ 0xD ^ 0x0) & 0x10) {
    console.log("here")
}

console.log((0x6 ^ 0x7 ^ 0x0))
console.log(0x10)
console.log(!((0x6 ^ 0x7 ^ 0x0) & 0x10))

var one = 1
console.log(!(0))

b = 0x80

//console.log(b)

var obj = {
    a: 5
}

1. subtraction operations carry flag is ?0x50 : 0x40

function d(test) {
    test += 6
}

d(obj.a)
console.log(obj.a)
*/
(0)?console.log("yes"):console.log("no")

var a = 65535
a++
if (a > 65535) {
    a = 0
}

console.log(a)