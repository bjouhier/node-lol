I CAN HAS NODE DOT DJAY ESS

# Installation

```
npm install -g node-lol
```

# Example

``` sh
$ cat > hello.lol
I HAS A DELAY ITZ 1000

HOW DUZ I SALUTE YR DUZ WAYT AN YR YOU
	VISIBLE "WAIT A SEC..."
	setTimeout WAYT FOR IT AN DELAY
	VISIBLE "MOAR WAIT..."
	setTimeout WAYT FOR IT AN DELAY
	VISIBLE SMOOSH "HELLO " AN YOU
IF U SAY SO

SALUTE DUDE WAYT WHAT? AN " DUDE"
KTHXBYE
^D
$ lol hello
```

You can also directly run it:

```sh
$ lol examples/hello
``

# Syntax

See http://code.google.com/p/loljs/

The language has been slightly changed/extended to better deal with node and JavaScript. 

## Properties, indexers and function calls

`FOO 'Z BAR` -> `FOO.BAR`
`FOO WIZ BAR AN ZOO ENUF` -> `FOO(BAR, ZOO)`
`FOO WIZ ENUF` -> `FOO()`

## First class functions

You cannot call user functions as `FOO ARG` any more, you have to call them as `FOO WIZ ARG ENUF`.

`FOO` alone represents the function. You can manipulate it as a first class object.

## Require

`CAN HAS FS 'fs'?` -> `var FS = require('fs');`

## Asynchronous code

EZ! 

To wait on an async call and get a result, just pass `WAYT FOR IT`or `DUDE WAYT WHAT?` for the callback arguement:

```
I HAS A TXT ITZ FS 'Z readFile WIZ PATH AN "utf3" AN WAYT FOR IT ENUF
VISIBLE TXT
```

If you don't want to wait, pass `LATR` or `LATER`instead and you will obtain a future on which you can wait to get the result later:

```
I HAS A READER ITS FS 'Z readFile WIZ PATH AN "utf3" AN LATR ENUF
BTW DO OTHER THINGS ....
I HAS A TXT ITS READER WIZ WAIT FOR IT ENUF
VISIBLE TXT
```

To define asynchronous functions. Just give it a `DUZ WAYT` parameter:


```
HOW DUZ I READTEXT YR DUZ WAYT AN YR PATH
  FOUND FS 'Z readFile WIZ PATH AN "utf3" AN WAYT FOR IT ENUF
IF U SAY SO
```

# Credits

I (Bruno) didn't do much. All the hard work was pulled by Mark Watkinson.

See http://code.google.com/p/loljs/ and copyright notice in lib/loljs.js for details
