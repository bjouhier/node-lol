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
	setTimeout WIZ WAYT AN DELAY ENUF
	VISIBLE "MOAR WAIT..."
	setTimeout WIZ WAYT AN DELAY ENUF
	VISIBLE SMOOSH "HELLO " AN YOU
IF U SAY SO

SALUTE WIZ WAYT AN " DUDE" ENUF
KTHXBYE
^D
$ lol hello
```

You can also directly run it:

```sh
$ lol examples/hello
```

# Syntax

See http://code.google.com/p/loljs/

The language has been slightly changed/extended to better deal with node and JavaScript. 

## Properties and function calls

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

To wait on an async call and get a result, just pass `WAYT`or `WAIT` for the callback arguement:

```
I HAS A TXT ITZ FS 'Z readFile WIZ PATH AN "utf3" AN WAYT ENUF
VISIBLE TXT
```

If you don't want to wait, pass `LATR` or `LATER` instead and you will obtain a future on which you can wait to get the result later:

```
I HAS A READER ITS FS 'Z readFile WIZ PATH AN "utf3" AN LATR ENUF
BTW DO OTHER THINGS ....
I HAS A TXT ITS READER WIZ WAYT ENUF
VISIBLE TXT
```

To define asynchronous functions. Just give it a `DUZ WAYT` or `DUZ WAIT` parameter:


```
HOW DUZ I READTEXT YR DUZ WAYT AN YR PATH
  FOUND FS 'Z readFile WIZ PATH AN "utf3" AN WAYT ENUF
IF U SAY SO
```

# Credits

I (Bruno) didn't do much. All the hard work was pulled by Mark Watkinson.

See http://code.google.com/p/loljs/ and copyright notice in lib/loljs.js for details
