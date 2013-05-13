/*
Copyright (c) <2010>, Mark Watkinson
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the <organization> nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL MARK WATKINSON BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*
 * loljs 1.1 
 * a LOLCODe to JavaScript translator
 * 
 * 
 * Usage:
 * 
 * var js = loljs(lolcode);
 * eval(js);
 * 
 * 
 * you might also want to set the puts function otherwise stdout all goes to
 * alert() boxes, which is somewhat irritating.

lolspace_set_puts(function puts(str, newline){
  var stdout = document.getElementById('stdout');
  str = str.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;');
  stdout.innerHTML +=  str + ((newline !== false)? '<br>' : '');
});

 * Edited by Bruno Jouhier - see BRJOU comments

 */


var lolspace_user_functions = [];
var lolspace_errored = false;
var lolspace_puts_cb = console.log;

// It's easier to define an XOR function here than to do it in place 
// when parsing the operators.
function lolspace_xor(op1, op2)
{
  return !!((op1 || op2) && !(op1 && op2));
}


function lolspace_prettify_array(array)
{
  var str = "";
  for (var name in array)
  {
    var el = array[name];
    if (el.constructor == Array)
      str += lolspace_prettify_array(el) + ', ';
    else
      str += el + ', ';
  }
  
  str = str.replace(/, $/, '');
  return '[' + str + ']';
}

function lolspace_puts(str, newline)
{
  if (str.constructor == Array)
    str = lolspace_prettify_array(str);
  str = "" + str;
  if (lolspace_puts_cb != null)
    lolspace_puts_cb(str, newline);
  else
    alert(str);
}


function lolspace_set_puts(func)
{
  lolspace_puts_cb = func;
}


function lolspace_chr(n)
{
  return String.fromCharCode(n);
}
function lolspace_ord(c)
{
  return c.charCodeAt(0);
}


function lolspace_len(x)
{
  if (x.length !== undefined)
    return x.length;
  return 0;
}

/*
 * casts a value to array.
 * If the value is a string, it is split by each character
 * if not, the result is just an array consisting of the input 
 */
function lolspace_cast_bukkit(val)
{
  if (typeof val == 'string' || typeof val == 'String')
    return val.split("");
  return [val];
}

// prints an error which occurred during parsing
function lolspace_error(errstr)
{
  if (!lolspace_errored || lolspace_puts_cb != null)
    lolspace_puts("loljs hit an error, sorry!\n" + errstr);
  lolspace_errored = true;
}

// inits the lolspace, call this before parsing anything.
function lolspace_init()
{
  lolspace_errored = false;
  lolspace_user_functions = [];
  // BRJOU
  lolspace_user_functions.push({name:'setTimeout', num_args:2});
}

// returns true iff funcname is a user defined function inside 
// the lolcode
function lolspace_is_func(funcname)
{
  for (var i=0; i<lolspace_user_functions.length; i++)
  {
    if (lolspace_user_functions[i].name == funcname)
      return true;
  }
  return false;
}
// returns the number of arguments a user defined function
// takes, or logical false if it's not a function.
function lolspace_func_get_num_args(funcname)
{
  for (var i=0; i<lolspace_user_functions.length; i++)
  {
    if (lolspace_user_functions[i].name == funcname)
      return lolspace_user_functions[i].num_args;
  }
  return false;
}


function lolspace_strip_comments(str)
{
  str = str.replace(/OBTW([\s\S]*?)TLDR/g, '');
  str = str.replace(/BTW.*/g, '');
  return str;
}

// prepares a string of lolcode for parsing
function lolspace_prepare(str)
{
  // we don't really care about hai or kthxbye or includes
  str = str.replace(/HAI.*/g, '');
  str = str.replace(/KTHXB(YE|AI).*/g, '');
  // BRJOU: node needs this one
  //str = str.replace(/CAN HAS .*/g, '');
  

    
  str = str.replace(/[ \t]+/g, ' ');
  
  str = str.replace(/[,]/g, '\n');
  
  
  str = str.replace(/\.{3}[ ]*\n/g, ''); 
  
  str = str.replace(/\r\n|\r|\n/g, '\n');
  //right trim
  str = str.replace(/[ ]+\n/g, '\n');  
  
  
  // alias the 'x IS NOW A ' to 'x R MAEK..'
  str = str.replace(/(.*) IS NOW A (.*)/g, '$1 R MAEK $1 A $2');
  //alias 'I HAS A .. ITZ .. to 'I HAS A ..\n .. R ..
  // i.e. separate declaration and assignment
  str = str.replace(/(I HAS A (.*)) IT[SZ] (.*)/g, '$1\n$2 R $3');
  
  
  // this is totally cheating
  str = str.replace(/\bWIN\b/g, 'true');
  str = str.replace(/\bFAIL\b/g, 'false');

  // BRJOU  
  str = str.replace(/\s*'Z\s*/g, '~');

  return str;
}

// aliases string literals to @x where x is a number >= 0
// if strip is set to false, this will substitute them back in
// this also handles escape sequences inside string literals.

function lolspace_do_string_literals(str, strip)
{
  if (strip == true || strip == undefined)
  {
    this.aliases = [];
    this.num_alaises = 0;

    var i = -1;
    var last_i = 0;
    var start;
    var in_str = false;
    var str_ = "";
    while ((i = str.indexOf('"', i+1)) !== -1)
    {
      if (!in_str)
      {
        str_ += str.substr(last_i, i-last_i);
        in_str = true;
        start = i;
      }
      else
      {
        var escapes = 0;
        var j=i-1;
        while (j>=0 && str[j--] == ':')
          escapes++;
        if (!(escapes % 2))
        {
          in_str = false;
          
          var quoted = str.substr(start+1, (i-start-1));
          quoted = quoted.replace(/(\\*)(\n)/g, function($0, $1){
            if ($1.length % 2)
              return $0;
            return "\\n";
          });
          quoted = quoted.replace(/:([\)>o":]|\(.*?\)|\{.*?\})/g, function($0, $1){
            // simple escapes
            switch($1){
              case ')': return '\\n';
              case '>': return '\\t';
              case 'o': return '^g'; //meh
              case '"': return '\\"';
              case ':': return ':';
            }
            // var interpolation, just concatenate it.
            if ($1.charAt(0) == '{')
              return '"+' + $1.substr(1,$1.length-2) + '+"';
              
            // hex unicode  
            if ($1.charAt(0) == '(')
              return '\\u' + $1.substr(1,$1.length-2);
           
            // TODO: named unicode chars, don't know if js provides a shortcut for this?
            // i'm not typing out all of them. 
            // http://www.unicode.org/Public/4.1.0/ucd/NamesList.txt
            return $0;
          });
          
          this.aliases[this.num_alaises] = quoted;
          str_ += '@' + this.num_alaises++;
          i++;
        }
      }
      last_i = i;
    }
    str_ += str.substr(last_i);
    
    return str_;
  }
  else
  {
    for (var i=this.num_alaises-1; i>=0; i--)
      str = str.replace('@' + i, '"' + this.aliases[i] + '"');
    return str;
  }
  
  
}

/*
 * tokenises the input string
 * returns a sequence of tokens and corresponding input string,
 * as an array, in the form:
 * 
 * [
 *      token1, string1,
 *      token2, string2,
 *      token3, string3
 *      ...
 * ]
 * 
 */
function lolspace_tokenise(str)
{
  var tokens = [];
  var string = [];
  for (var i=0; i<str.length; i++)
  {
    var str_ = str.substr(i);
    var match = null;
    if ((match = /^A\b/.exec(str_)))
      tokens.push('A');
    else if ( (match = (/^I HAS A(?=\s)/.exec(str_))) )
      tokens.push('DECLARE');
    else if( (match = (/^(R|IT[SZ])(?=\s)/.exec(str_))) )
      tokens.push('ASSIGN');
    else if( (match = (/^G[EI]MMEH(?=\s)/.exec(str_))) )
      tokens.push('PROMPT');
    else if( (match = /^MAEK(?=\s)/.exec(str_)) )
      tokens.push('CAST');
    
    else if( (match = /^(NOOB|YARN|NUMBR|NUMBAR|TROOF|BUKKIT)(?=\s)/.exec(str_)) )
      tokens.push('TYPE');
    else if( (match = /^(SMALL?E?R|BIGG?E?R) THAN\b/.exec(str_)) )
      tokens.push('CMP_OP');
    else if( (match = /^O RLY\?/.exec(str_)) )
      tokens.push('START_IF');
    else if ( (match = /^YA RLY\b/.exec(str_)) )
      tokens.push('IF');
    else if ( (match = /^MEBBE\b/.exec(str_)) )
      tokens.push('ELSE_IF');
    else if ( (match = /^NO WAI\b/.exec(str_)) )
      tokens.push('ELSE');
    else if( (match = /^OIC\b/.exec(str_)))
      tokens.push('END_IF');
    
    else if( (match = /^AN\b/.exec(str_)) )
      tokens.push('COMMA')
    
    else if ( (match = /^((\-\s*)?\d+(\.\d+)?|true|false|@\d+(!\w+){0,2})\b/.exec(str_)))
      tokens.push('LITERAL');
        
    // operators, oh joy
      
    else if( (match = (/^(((SUM|DIFF|PRODUKT|MOD|QUOSHUNT|BOTH|EITHER|BIGGR|SMALLR|WON) OF)|BOTH SAEM|DIFFRINT)\b/.exec(str_))))
      tokens.push('BINARY_OP');
    
    else if( (match = (/^(ALL|ANY|CHR|ORD|LEN) OF\b/.exec(str_))))
      tokens.push('NARY_OP');
    // bukkit assignment
    else if( (match = (/^GOT\b/.exec(str_)) ))
      tokens.push('NARY_OP');
    
    else if( (match = (/^NOT\b/.exec(str_))))
      tokens.push('NARY_OP');
    
    else if ( (match = /^IM IN [YU]R \w+$/.exec(str_)))
      tokens.push('LOOP_INF');
    else if( (match = /^IM IN [YU]R [a-zA-Z]\w+/.exec(str_)))
      tokens.push('LOOP');
    else if( (match = /^IM OUTTA [YU]R \w+\b/.exec(str_)))
      tokens.push('END_LOOP');
    else if( (match = /^(WILE|TILL?)\b/.exec(str_)))
      tokens.push('LOOP_CONDITION');
    else if( (match = /^(UPPIN|NERFIN) [YU]R\b/.exec(str_)))
      tokens.push('LOOP_ACTION');
    
    else if ( (match = /^!!*/.exec(str_)))
      tokens.push('SCREECH');
    else if ( (match = /^\?/.exec(str_)))
      tokens.push('QUESTION_MARK');
    else if( (match = /^UPZ\b/.exec(str_)))
      tokens.push('INC_OP');
    
    else if ( (match = /^VISIBLE\b/.exec(str_)) )
      tokens.push('STDOUT');
    
    else if( (match = /^IZ\b/.exec(str_)))
      tokens.push('INLINE_IF');
    else if( (match = /^KTHX\b/.exec(str_)))
      tokens.push('INLINE_IF_END');
    else if( (match = /^GTFO\b/.exec(str_)))
      tokens.push('BREAK');
    else if( (match = /^WTF\\?\b/.exec(str_)))
      tokens.push('SWITCH');
    
    else if( (match = /^OMG\b/.exec(str_)))
      tokens.push('SWITCH_CASE');
    else if( (match = /^OMGWTF\b/.exec(str_)))
      tokens.push('SWITCH_CASE_DEFAULT');  
    
    
    else if (match = /^SMOOSH\b/.exec(str_))
      tokens.push('NARY_OP');
    
    // Nothing denotes an empty array, so we treat it as a termination
    else if( match = /^(MKAY|NOTHING?(?: ELSE)?)\b/.exec(str_))
      tokens.push('OP_TERM');
    
    else if( (match = (/^HOW DUZ I\b/).exec(str_)) )
      tokens.push('FUNC_DEF');
    else if( (match = (/^YR\b/).exec(str_)) )
      tokens.push('VAR');
    else if( (match = (/^FOUND\b/).exec(str_)))
      tokens.push('RETURN');
    else if( (match = (/^IF U SAY SO\b/).exec(str_)) )
      tokens.push('FUNC_DEF_END');
    // BRJOU
    else if( (match = (/^CAN HAS\b/).exec(str_)) )
      tokens.push('REQUIRE');
    else if( (match = (/^DUZ WA(I|Y)T\b/).exec(str_)) )
      tokens.push('WAIT_PARAM');
    else if( (match = (/^(WA(I|Y)T FOR IT\b|DUDE WA(I|Y)T WHAT\?)/).exec(str_)) )
      tokens.push('WAIT');
    else if( (match = (/^LATE?R\b/).exec(str_)) )
      tokens.push('LATER');
    else if( (match = (/^WIZ\b/).exec(str_)) )
      tokens.push('PAREN');
    else if( (match = (/^WIZ\b/).exec(str_)) )
      tokens.push('PAREN');
    else if( (match = (/^ENUF\b/).exec(str_)) )
      tokens.push('CLOSE');
    
    // BRJOU: added ~ and also _ at start
    else if( (match = (/^[a-zA-Z@_][a-zA-Z0-9_~]*(\!\w+)*/.exec(str_))) )
      tokens.push('IDENTIIFER');
    
    if (match)
    {
      i+=match[0].length-1;
      string.push(match[0]);
    }
    else if ((match = str_.match(/^\S+/)))
    {
      lolspace_error('Tokeniser: unrecognised sequence:\n' + str_.match(/^\S+/) + '\n' + str_.substr(i));
      i+=match[0].length-1;
    }
    
    
      
  }
  if (tokens.length != string.length)
    lolspace_error('Somehow I ended up with a different number of tokens than matches. This is fatal. Sorry.')    
  var ret = [];
  for (var i=0; i<tokens.length; i++)
  {
    ret.push(tokens[i]);
    ret.push(string[i]);
  }
  return ret;
}



// BIGR THAN and SMALR than are different to other binary ops in that they
// take their operands on either side. Which is slightly inconvenient
// as everything else uses prefix notation.
function lolspace_sub_cmp_op(tokens)
{
  var s = tokens[1];
  if (s.charAt(0) == 'B')
    return '>' + lolspace_eval_line(tokens.slice(2));
  else if (s.charAt(0) == 'S')
    return '<' + lolspace_eval_line(tokens.slice(2));
  
  // NOTE: not should be handled in eval_expr, I don't know if this
  // actually gets called.
  else if (s == 'NOT')
    return '!(' + lolspace_eval_line(tokens.slice(2)) + ')';
}

function lolspace_get_var_(token)
{
  var value = token[1];
  var xc = value.split('!').length-1;
  
  // BRJOU
  value = value.replace(/~/g, '.');

  if (!xc)
    return value;
  
  value = value.replace(/!/, '[');
  value = value.replace(/!/g, '][');
  value += ']';
  return value;
}

/*
 * evaluates a lolcode expression or arbitrary arity.
 * Expressions use prefix notation and may nest.
 * Also handles nested function calls.
 * 
 * bit of a mess.
 */

function lolspace_eval_expr(tokens)
{
  var string = tokens[1];
  
  var op_symbols = {
    'SUM OF': {symbol: '+', nary:2, before:'(', after:')'},
    'DIFF OF': {symbol: '-', nary:2, before:'(', after:')'},
    'PRODUKT OF': {symbol: '*', nary:2, before:'(', after:')'},
    'MOD OF':  {symbol: '%', nary:2, before:'(', after:')'},
    'QUOSHUNT OF':  {symbol: '/', nary:2, before:'(', after:')'},
    'BOTH OF':  {symbol: '&&', nary:2, before:'(', after:')'},
    'EITHER OF':  {symbol: '||', nary:2, before:'(', after:')'},
    'BOTH SAEM':  {symbol: '==', nary:2, before:'(', after:')'},
    'DIFFRINT': {symbol: '!=', nary:2, before:'(', after:')'},
    'BIGGR OF': {symbol: ',', nary:2, before:'(Math.max(', after:'))'},
    'SMALLR OF': {symbol: ',', nary:2, before:'(Math.min(', after:'))'},
    
    'WON OF' : {symbol: ',', nary:2, before:'(lolspace_xor(', after:'))'},
    
    'ALL OF': {symbol: ')&&(', nary:-1, before:'((', after:'))'},
    'ANY OF': {symbol: ')||(', nary:-1, before:'((', after:'))'},
    'SMOOSH':  {symbol: '+', nary:-1, before:'""+', after:''},
    'NOT' : { symbol:'', nary:1, before:'!(', after:')'},
              
    'GOT' : { symbol:',', nary:-1, before:'[', after:']'},
    
    'CHR OF' : {symbol:'', nary:1, before:'lolspace_chr(', after:')'},
    'ORD OF' : {symbol:'', nary:1, before:'lolspace_ord(', after:')'},
    'LEN OF' : {symbol:'', nary:1, before:'lolspace_len(', after:')'},
    // BRJOU
    "'Z" : {symbol:'.', nary:2, before:'(', after:')'},
    
  };
  
  
  var stack = [];
  
  var str_ = "";
//   alert(tokens);
  for (var i=0; i<tokens.length; i+=2)
  {
    var s = tokens[i+1];
    var t= tokens[i];
    var schedule_pop = false;
    
    switch(t)
    {
      case 'BINARY_OP':
      case 'NARY_OP':
        if (stack.length)
        {
          var st = stack[stack.length-1];
          
          str_ += (st.terms)? st.symbol : '';        
        }
        
        var sym = op_symbols[s];
        // HELLO, CLONE METHOD?
        var sym_copy = {symbol: sym.symbol, nary: sym.nary, before: sym.before, after: sym.after};
        
        sym_copy.terms = 0;
        str_ += sym_copy.before;
        stack.push(sym_copy);
        break;
      case 'COMMA':
//         var st = stack[stack.length-1];
//         str_ += st.symbol;
        break;
      case 'OP_TERM':
//         var sym = stack.pop();
        schedule_pop = true;
//         str_ += stack[stack.length-1].after;
        break;
      case 'IDENTIIFER':        
        // THIS IS A HACK.    
        if (stack.length)
        {
          var sym = stack[stack.length-1];
          str_ += (sym.terms)? sym.symbol : '';
        }
        // BRJOU: disable functions
        var args = false; //lolspace_func_get_num_args(s);
        if (args !== false)
        {
          var sym = {nary:args, terms:0, symbol:',', before:'', after:')'};
          stack.push(sym);
          
          str_ += s + '(';
          
//           var ide = lolspace_eval_identifier(tokens.slice(i), false);
//           str_ += ide;
//           i+= args*2;
        }
        else
        {

          str_ += lolspace_get_var_([t,s]);      
          
          if (sym) ++sym.terms;
        }
        break;
        
      case 'LITERAL':
        var sym = stack[stack.length-1];
        str_ += (sym && sym.terms)? sym.symbol : '';

//         str_ += s;
        str_ += lolspace_get_var_([t,s]);      

        if (sym) ++sym.terms
        break;

      // BRJOU
      case 'WAIT':
      case 'LATER':
        var sym = stack[stack.length-1];
        str_ += t === 'WAIT' ? '_' : 'null';
        if (sym) ++sym.terms;        
        break;

      case 'PAREN':
        str_ += '(';
        for (var j = i + 2; tokens[j] != 'CLOSE'; j += 2) {
          if (j >= tokens.length) throw new Error('ENUF missing');
          if (tokens[j] == 'PAREN') throw new Error('cannot nest calls');
          if (tokens[j] == 'COMMA') {
            str_ += lolspace_eval_expr(tokens.slice(i + 2, j)) + ',';
            i = j;
          }
        }
        if (j > i + 2) str_ += lolspace_eval_expr(tokens.slice(i + 2, j));
        i = j;
        str_ += ')';
        break;
        
      default:
        lolspace_error('Unexpected token in expression\n' + t + '\n' + s);
    }
    if (!stack.length)
      break;
    
    while (1)
    {
      var sym = stack[stack.length-1];
      if ((sym.terms >= sym.nary && sym.nary != -1) || schedule_pop)
      {
        schedule_pop = false;
        stack.pop();
        str_ += sym.after;  
        if(stack.length) stack[stack.length-1].terms++;
        else break;
      }
      else
        break;
    }
    if (!stack.length)
      break;
  }
  
  while (stack.length)
  {
    str_ += stack.pop().after;
  }
  
  
  if (i < tokens.length-2)
    str_ += lolspace_eval_line(tokens.slice(i+2));
  
  
  
  return str_ ;
    
}


function lolspace_eval_identifier(tokens)
{

  var id = tokens[1];
  if (!lolspace_is_func(id))
    
    return lolspace_get_var_([tokens[0], tokens[1]]) + lolspace_eval_line(tokens.slice(2));
  // outsource functions to the expression evaluator.
  return lolspace_eval_expr(tokens);
/*
  var num_args = lolspace_func_get_num_args(id);
  var call = id + '(';
  for (i=0; i<num_args; i++)
  {
    call += tokens[2 + i*2 + 1] + ',';
  }
  call = call.replace(/,$/, '');
  call += ')';
  return call + (cont? lolspace_eval_line(tokens.slice(2 + num_args*2)) : '');  
  */
}


/*
 * evaluates a line left to right. The line may not be a full
 * line. If it is definitely a full line, use translate_line.
 */

function lolspace_eval_line(tokens)
{
  if (!tokens.length)
    return '';
  var t = tokens[0];
  
  switch(t)
  {
    
    case 'BINARY_OP':
    case 'NARY_OP':
    // BRJOU: added next 2  
    case 'PAREN':  
      return lolspace_eval_expr(tokens);
    
    case 'IDENTIIFER':
      return lolspace_eval_identifier(tokens);
    
    case 'ASSIGN':
      return '=' + lolspace_eval_line(tokens.slice(2));
    
    case 'LITERAL':
      return lolspace_eval_identifier(tokens);
//       return tokens[1] + lolspace_eval_line(tokens.slice(2));
      
      
    case 'CAST':
      // MAEK VAR A TYPE
      var func = '';
      var type = null;
      
      // we need to split this for inline casting.
      var val = [];
      var i;
      for (i=2; i<tokens.length; i+=2)
      {
        if (tokens[i] == 'A')
        {
          i+=2;
          type = tokens[i+1];
          break;
        }
        val.push(tokens[i], tokens[i+1]);
      }
      
      switch(type)
      {
        case 'YARN': func = 'String'; break;
        case 'TROOF': func = 'Boolean'; break;
        case 'NUMBR': func = 'parseInt'; break;
        case 'NUMBAR': func = 'Number'; break;
        case 'BUKKIT': func = 'lolspace_cast_bukkit'; break;
        default: lolspace_error("Cast to unknown type\n" + type);
                 return;
      }
      return func + '(' + lolspace_eval_line(val) + ')' + lolspace_eval_line(tokens.slice(i+2));
   
    case 'TYPE': // this is probably a result of the user 
      // defining a variable called NUMBAR or something,
      // so we just pass over it.
      // I think the only other place a TPYE occurs is in
      // a cast, which is handled elsewhere.
      return tokens[1] + lolspace_eval_line(tokens.slice(2));
   
    case 'QUESTION_MARK':
      // this is a leftover from IZ X BIGGR THAN Y?, 
      // we don't care.
      return lolspace_eval_line(tokens.slice(2));
      
    case 'CMP_OP':
     return lolspace_sub_cmp_op(tokens);
     
   default:  
     lolspace_error("Unknown token " + t);
     return tokens.slice(2);
  }
  
}


/*
 * parses a non-infinte loop
 */
function lolspace_parse_loop(tokens)
{

  /*
    our tokens should look something like this:
     [token]   text
0    [LOOP] IM IN YR LP
2    [LOOP_ACTION] UPPIN YR
4    [IDENTIIFER] COUNTER
6    [LOOP_CONDITION] WILE
8    [IDENTIIFER] COUNTER
10   [CMP_OP] SMALLR THAN
12   [IDENTIIFER] LIMIT
   */
  
  var action = tokens[5] + (tokens[3].match(/^UPPIN/)? '++' : '--');  
  var condition = lolspace_eval_line(tokens.slice(8));
//   alert(condition);
  if (tokens[7].charAt(0) == 'T') //til
    condition = '!(' + condition + ')';

  var init = tokens[5] + '= ((typeof ' + tokens[5] + '=="undefined")? 0 :' + tokens[5] + ')';
  var loop = 'for((' + init + ');'  + condition + ';' + action + '){';
  return loop;
  
}




/*
 * evaluates a function definition
 */
function lolspace_eval_func_def(tokens)
{
  
  /*
   * e.g. tokens:
   * FUNC_DEF,HOW DUZ I,
   * IDENTIIFER,ADD,
   * VAR,YR,
   * IDENTIIFER,NUM1,
   * COMMA,AN,
   * VAR,YR,
   * IDENTIIFER,NUM2
   */
  
  var f = "function " + tokens[3] + "(";
  var args = 0;
  for (var i=4; i<tokens.length; i+=2)
  {
    var s = tokens[i+1];
    var t = tokens[i];
    // BRJOU
    if (t != 'IDENTIIFER' && t != 'WAIT_PARAM')
      continue;
    f += t == 'WAIT_PARAM' ? '_' : s;

    args++;
    f += ',';
  }
  f = f.replace(/,+$/, '');
  f += '){\nvar IT=undefined;\n';
  lolspace_user_functions.push({name:tokens[3], num_args:args});
  return f;
  
}

/*
 * top level function for translating a full line into javascript
 * Call this ONLY if the line is definitely a full line, as 
 * a lot of commands may exist only as the first token of
 * a line.
 */
function lolspace_translate_line(tokens)
{
  if (!tokens.length)
    return '';
  
  var t = tokens[0];    
  var js = "";
  switch(t)
  {
    case 'BINARY_OP':
    case 'NARY_OP':  
      return 'IT=' + lolspace_eval_expr(tokens) + ';';
      
    case 'DECLARE': 
      return ('var ' + tokens[3] + ' = null;');
    case 'START_IF':
      return '';
    case 'IF':
      return 'if(IT){';
    case 'ELSE_IF':
      return '}else if(' + lolspace_eval_line(tokens.slice(2)) + '){';
    case 'ELSE':
      return '} else {';
      
    case 'END_IF':
    case 'END_LOOP':
      return '}';
    
    case 'IDENTIIFER':
    case 'LITERAL':
      if (tokens.length >= 2 && tokens[2] != 'ASSIGN')
        return 'IT = ' + lolspace_eval_identifier(tokens) + ';';
      else
        return lolspace_eval_identifier(tokens) + ';';

    case 'PROMPT':
      return tokens[3] + ' = prompt("' + tokens[3] + '");';
      
    case 'STDOUT':
    
      var newline = !(tokens[tokens.length-2] == 'SCREECH');
      var t;
      if (newline)
        t = tokens.slice(2);
      else
        t = tokens.slice(2, tokens.length-2);
      // BRJOU
      // return 'lolspace_puts(' + lolspace_eval_line(t)  + ',' + newline +  ');';
      return 'process.stdout.write(""+(' + lolspace_eval_line(t)  + ')' + (newline ? '+"\\n"' : '')  +  ');';
    
    case 'INC_OP':
      var v = lolspace_eval_identifier([tokens[2], tokens[3]]);
      //  following this var and optionally !!\d
      if (tokens.length >= 8)
        v += '+=' + lolspace_eval_line(tokens.slice(6)) + ';';
      else
        v += '++;';
      return v;
      break;
      
    case 'INLINE_IF':
      return 'if(' + lolspace_eval_line(tokens.slice(2)) + '){';
      
    case 'INLINE_IF_END':
      return '}';
    
    case 'BREAK':
      return 'break;';
    case 'LOOP_INF':
      return 'while(1){';
    
    case 'LOOP':
      return lolspace_parse_loop(tokens);
      
    case 'SWITCH':
      return 'switch(IT){';
    case 'SWITCH_CASE':
      return 'case ' + tokens[3] + ':';
    case 'SWITCH_CASE_DEFAULT':
      return 'default:';

    case 'RETURN':
      // tokens 3 should be 'YR'
      return 'return ' + lolspace_eval_line(tokens.slice(4)) + ';';
    case 'FUNC_DEF':
      return lolspace_eval_func_def(tokens);
    case 'FUNC_DEF_END':
      return 'return (IT==undefined)? null : IT;}';
      
    //BRJOU
    case 'REQUIRE':
      return 'var ' + tokens[3] + '=require(' + tokens[5] + ');';
      
    default:
      return lolspace_eval_line(tokens);

  }
  
  
  
  return js;
  
  
}

// user interface function.
// takes a full lolcode program and
// returns a full javascript program.
function loljs(str)
{
  lolspace_init();
  str = lolspace_strip_comments(str);
  str = lolspace_do_string_literals(str, true);
  
  str = lolspace_prepare(str);
  
  var s = str.split('\n');
  var js_out = "var IT;\n";
  for (var i=0; i<s.length; i++)
  {
    var t = lolspace_tokenise(s[i]);
    var js = lolspace_translate_line(t);
    js_out += js + "\n";
  }
  js_out = lolspace_do_string_literals(js_out, false);
  return js_out;
}

// BRJOU
exports.loljs = loljs;
