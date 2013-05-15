CAN HAS FS "fs"?
CAN HAS ST "streamline/lib/streams/server/streams"?

HOW DUZ I DISPATCH YR REQ AN YR RESP AN DUZ WAYT
	I HAS A SEGS ITZ REQ'Z url'Z split WIZ "?" ENUF
	I HAS A PATH ITZ SEGS!0
	I HAS A DOT ITZ PATH'Z lastIndexOf WIZ "." ENUF
	I HAS A EXT ITZ PATH'Z substring WIZ DOT ENUF
	EXT
	WTF
  		OMG ".html"
  			DWNLOAD WIZ RESP AN SEGS!0 AN "text/html" AN WAYT ENUF
  			GTFO
  		OMG ".lol"
  		OMG ".md"
  		OMG ".txt"
  			DWNLOAD WIZ RESP AN SEGS!0 AN "text/plain" AN WAYT ENUF
  			GTFO
		OMGWTF
			RESP'Z statusCode R 403
			RESP'Z end WIZ SMOOSH "Unauthorized file type" ENUF
	OIC
IF U SAY SO

HOW DUZ I DWNLOAD YR RESP AN YR PATH AN YR TYPE AN DUZ WAYT
	I HAS A FPATH ITZ SMOOSH __dirname AN PATH
	I HAS A TXT ITZ FS'Z readFile WIZ FPATH AN "utf8" AN WAYT ENUF
	RESP'Z statusCode R 200
	RESP'Z setHeader WIZ "content-type" AN TYPE ENUF
	RESP'Z write WIZ WAYT AN TXT ENUF
	RESP'Z end WIZ ENUF
IF U SAY SO

I HAS A SVR ITZ ST'Z createHttpServer WIZ DISPATCH ENUF
SVR'Z listen WIZ WAYT AN 1337 AN "localhost"  ENUF

VISIBLE "Server ready. Try http://localhost:1337/server.lol"
KTHXBYE
