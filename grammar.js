module.exports = grammar({
  name: 'uiua',
  extras:        $ => [/[ \t]+/, $.comment, $._endOfLine],
  conflicts:     $ => [],     // Yay! It's empty!
  rules: {
    source_file: $ => $.PROGRAM,
    PROGRAM:     $ => seq(
      repeat(seq(choice($.binding, $.segment, $.module), $._endOfLine)),
      choice($.binding, $.segment, $.module),
      optional($._endOfLine)
    ),
    binding: $ => seq(
      $.identifier,
      $.leftArrow,
      optional($.signature),
      choice($.inlineFunction, $.segment),
    ),
    module:      $ => (seq(
      $.tripleMinus,
      repeat(seq($.segment, $._endOfLine)),
      $.segment,
      $._endOfLine,
      $.tripleMinus
    )),
    segment:     $ => prec.right(seq(
      choice(
        $.term,
        $.comment,
      ),
      optional($.segment),
    )),
    term:        $ => choice(
      $.switchFunctions,
      // prec.right(seq($.signature, $.term)),
      $.compound,
      $.primitive,
      $.system,
      $.array,
      $.number,
      $.character,
      $.string,
      $.multiLineString,
      $.otherConstant,
      $.identifier,
      $.identifierDeprecated,
      $.placeHolder,
    ),
    inlineFunction: $ => seq(
      $.openParen,
      optional($.signature),
      repeat(seq($.segment, $._endOfLine)),
      $.segment,
      optional($._endOfLine),
      $.closeParen,
    ),
    switchFunctions: $ => seq(
      $.openParen,
      repeat1(seq(optional($.signature), $.term, $.branchSeparator)),
      optional($.signature),
      $.term,
      $.closeParen
    ),
    array:       $ => choice(
      prec(5, seq(repeat1(seq($.term, $.underscore)),$.term)),
      seq($.openBracket, optional($._endOfLine), repeat(seq($.segment, optional($._endOfLine))), $.closeBracket),
      seq($.openCurly, optional($._endOfLine), repeat(seq($.segment, optional($._endOfLine))), $.closeCurly),
    ),
    number:      $ => choice(
      $.constant,
      $.fraction,
      token(choice(
        /¯?[πητ]([eE]¯?\d+)?/,
        /¯?\d+(\.\d+)?([eE]¯?\d+)?/
      )),
    ),
    fraction:    $ => token(/¯?\d+\/\d+/),
    otherConstant: $ => choice(
      token('os'),
      token('Family'),
      token('Arch'),
      token('ExeExt'),
      token('PllExt'),
      token('Sep'),
    ),
    character:   $ => prec(5,
      token(/@([^\\]|\\[bnrst0\\"'_]|\\x[0-9A-Fa-f]{2,2}|\\u[0-9A-Fa-f]{4,4})/)
    ),
    string:      $ => token(
      seq(optional('$'),'"', repeat(choice(/\\["nt]/, /[^"]+/)), '"')
    ),
    multiLineString: $ => /\$.*/,
    signature:   $ => seq('|', /[0-9]+(\.[0-9]+)?/),
    identifier:  $ => token(/[A-Z][A-Za-z]*!*|[a-z][A-Za-z]?!*|\p{Emoji}/u),
    identifierDeprecated:  $ => token(/[a-z][A-Za-z]{2,}/),
    system:      $ => token(/&[a-z]+/),
    comment:     $ => /#.*/,
    tripleMinus: $ => token("---"),
    openParen:   $ => token('('),
    closeParen:  $ => token(')'),
    openCurly:   $ => token('{'),
    closeCurly:  $ => token('}'),
    openBracket: $ => token('['),
    closeBracket:$ => token(']'),
    underscore:  $ => token('_'),
    leftArrow:   $ => token('←'),
    placeHolder: $ => seq('^', /[0-9]+(\.[0-9]+)?/),
    branchSeparator: $=> token('|'),
    compound:    $ => choice(
      prec(1, seq(
        $.modifier1,
        choice($.inlineFunction, $.function, $.system, $.identifier),
      )),
      prec(1, seq(
        $.modifier2,
        choice($.inlineFunction, $.function, $.system, $.identifier),
      )),
      prec(2, seq(
        $.modifier2,
        choice($.inlineFunction, $.function, $.system, $.identifier),
        choice($.inlineFunction, $.function, $.system, $.identifier),
      )),
    ),
    primitive:   $ => choice(
      $.function,
      $.modifier1,
      $.modifier2,
      $.deprecated,
    ),
    constant:    $ => choice(
      // (0, Eta, Constant, ("eta", 'η')),
      token('eta'),
      token('η'),
      // (0, Pi, Constant, ("pi", 'π')),
      token('pi'),
      token('π'),
      // (0, Tau, Constant, ("tau", 'τ')),
      token('tau'),
      token('τ'),
      // (0, Infinity, Constant, ("infinity", '∞')),
      token('infinity'),
      token('∞'),
      token('e'),
      token('NaN'),
      token('NumProcs'),
    ),
    function:    $ => choice(
      // (1(2), Dup, Stack, ("duplicate", '.')),
      token('.'),
      // (2(3), Over, Stack, ("over", ',')),
      token(','),
      // (2(2), Flip, Stack, ("flip", AsciiToken::Colon, '∶')),
      token('∶'),
      // (1(0), Pop, Stack, ("pop", ';')),
      token(';'),
      // (1, Identity, Stack, ("identity", '∘')),
      token('identity'),
      token('id'),
      token('∘'),
      // (1, Not, MonadicPervasive, ("not", '¬')),
      token('not'),
      token('¬'),
      // (1, Sign, MonadicPervasive, ("sign", '±')),
      token('sign'),
      token('±'),
      // (1, Neg, MonadicPervasive, ("negate", AsciiToken::Backtick, '¯') ),
      token('`'),
      token('¯'),
      // (1, Abs, MonadicPervasive, ("absolute value", '⌵')),
      token('absolute value'),
      token('⌵'),
      // (1, Sqrt, MonadicPervasive, ("sqrt", '√')),
      token('sqrt'),
      token('√'),
      // (1, Sin, MonadicPervasive, ("sine", '○')),
      token('sine'),
      token('○'),
      // (1, Cos, MonadicPervasive),
      // (1, Asin, MonadicPervasive),
      // (1, Acos, MonadicPervasive),
      // (1, Floor, MonadicPervasive, ("floor", '⌊')),
      token('floor'),
      token('⌊'),
      // (1, Ceil, MonadicPervasive, ("ceiling", '⌈')),
      token('ceiling'),
      token('⌈'),
      // (1, Round, MonadicPervasive, ("round", '⁅')),
      token('round'),
      token('⁅'),
      // (2, Eq, DyadicPervasive, ("equals", AsciiToken::Equal, '=')),
      token('='),
      // (2, Ne, DyadicPervasive, ("not equals", AsciiToken::BangEqual, '≠') ),
      token('!='),
      token('≠'),
      // (2, Lt, DyadicPervasive, ("less than", '<')),
      token('<'),
      // (2, Le, DyadicPervasive, ("less or equal", AsciiToken::LessEqual, '≤') ),
      token('<='),
      token('≤'),
      // (2, Gt, DyadicPervasive, ("greater than", '>')),
      token('>'),
      // (2, Ge, DyadicPervasive, ("greater or equal", AsciiToken::GreaterEqual, '≥') ),
      token('>='),
      token('≥'),
      // (2, Add, DyadicPervasive, ("add", '+')),
      token('+'),
      // (2, Sub, DyadicPervasive, ("subtract", '-')),
      token('-'),
      // (2, Mul, DyadicPervasive, ("multiply", AsciiToken::Star, '×')),
      token('*'),
      token('×'),
      // (2, Div, DyadicPervasive, ("divide", AsciiToken::Percent, '÷') ),
      token('%'),
      token('÷'),
      // (2, Mod, DyadicPervasive, ("modulus", '◿')),
      token('modulus'),
      token('◿'),
      // (2, Pow, DyadicPervasive, ("power", 'ⁿ')),
      token('power'),
      token('ⁿ'),
      // (2, Log, DyadicPervasive, ("logarithm", 'ₙ')),
      token('logarithm'),
      token('ₙ'),
      // (2, Min, DyadicPervasive, ("minimum", '↧')),
      token('minimum'),
      token('↧'),
      // (2, Max, DyadicPervasive, ("maximum", '↥')),
      token('maximum'),
      token('↥'),
      // (2, Atan, DyadicPervasive, ("atangent", '∠')),
      token('atangent'),
      token('∠'),
      // (1, Len, MonadicArray, ("length", '⧻')),
      token('length'),
      token('⧻'),
      // (1, Shape, MonadicArray, ("shape", '△')),
      token('shape'),
      token('△'),
      // (1, Range, MonadicArray, ("range", '⇡')),
      token('range'),
      token('⇡'),
      // (1, First, MonadicArray, ("first", '⊢')),
      token('first'),
      token('⊢'),
      // (1, Last, MonadicArray),
      // (1, Reverse, MonadicArray, ("reverse", '⇌')),
      token('reverse'),
      token('⇌'),
      // (1, Deshape, MonadicArray, ("deshape", '♭')),
      token('deshape'),
      token('♭'),
      // (1, Bits, MonadicArray, ("bits", '⋯')),
      token('bits'),
      token('⋯'),
      // (1, InverseBits, MonadicArray),
      // (1, Transpose, MonadicArray, ("transpose", '⍉')),
      token('transpose'),
      token('⍉'),
      // (1, InvTranspose, MonadicArray),
      // (1, Rise, MonadicArray, ("rise", '⍏')),
      token('rise'),
      token('⍏'),
      // (1, Fall, MonadicArray, ("fall", '⍖')),
      token('fall'),
      token('⍖'),
      // (1, Where, MonadicArray, ("where", '⊚')),
      token('where'),
      token('⊚'),
      // (1, Classify, MonadicArray, ("classify", '⊛')),
      token('classify'),
      token('⊛'),
      // (1, Deduplicate, MonadicArray, ("deduplicate", '⊝')),
      token('deduplicate'),
      token('⊝'),
      // (1, Box, MonadicArray, ("box", '□')),
      token('box'),
      token('□'),
      // (1, Unbox, MonadicArray, ("unbox", '⊔')),
      token('unbox'),
      token('⊔'),
      // (2, Match, DyadicArray, ("match", '≅')),
      token('match'),
      token('≍'),
      // (2, Couple, DyadicArray, ("couple", '⊟')),
      token('couple'),
      token('⊟'),
      // (1(2), Uncouple, MonadicArray),
      // (2, Join, DyadicArray, ("join", '⊂')),
      token('join'),
      token('⊂'),
      // (2, Select, DyadicArray, ("select", '⊏')),
      token('select'),
      token('⊏'),
      // (3, Unselect, Misc),
      // (2, Pick, DyadicArray, ("pick", '⊡')),
      token('pick'),
      token('⊡'),
      // (3, Unpick, Misc),
      // (2, Reshape, DyadicArray, ("reshape", '↯')),
      token('reshape'),
      token('↯'),
      // (2, Take, DyadicArray, ("take", '↙')),
      token('take'),
      token('↙'),
      // (3, Untake, Misc),
      // (2, Drop, DyadicArray, ("drop", '↘')),
      token('drop'),
      token('↘'),
      // (3, Undrop, Misc),
      // (2, Rotate, DyadicArray, ("rotate", '↻')),
      token('rotate'),
      token('↻'),
      // (2, Windows, DyadicArray, ("windows", '◫')),
      token('windows'),
      token('◫'),
      // (2, Keep, DyadicArray, ("keep", '▽')),
      token('keep'),
      token('▽'),
      // (3, Unkeep, Misc),
      // (2, Find, DyadicArray, ("find", '⌕')),
      token('find'),
      token('⌕'),
      // (2, Member, DyadicArray, ("member", '∊')),
      token('member'),
      token('∊'),
      // (2, IndexOf, DyadicArray, ("indexof", '⊗')),
      token('indexof'),
      token('⊗'),
      // (2(0), Assert, Control, ("assert", '⍤')),
      token('assert'),
      token('⍤'),
      // (1, Wait, Misc, ("wait", '↲')),
      token('wait'),
      // (1(None), Recur, Control, ("recur", '↬')),
      // token('recur'),
      // token('↬'),
      // (1, Parse, Misc, "parse"),
      token('parse'),
      // (0, Rand, Misc, ("random", '⚂')),
      token('random'),
      token('⚂'),
      // (1(2), Gen, Misc, "gen"),
      token('gen'),
      // (2, Deal, Misc, "deal"),
      token('deal'),
      // (0, Tag, Misc, "tag"),
      token('tag'),
      // (0, Now, Misc, "now"),
      token('now'),
      // (1, Type, Misc, "type"),
      token('type'),
      // (1, Trace, Stack, ("trace", '~')),
      token('⸮'),
      // (1, InvTrace, Stack),
      // (0(0)[1], Dump, Stack, "dump"),
      token('dump'),
      token('regex'),
      token('utf'),

      // Since 0.0.21
      token('rock'),
      token('ro'),
      token('⋄'),
      token('surface'),
      token('~'),
      token('deep'),
      token('de'),
      token('≊'),
      token('abyss'),
      token('ab'),
      token('≃'),
      token('seabed'),
      token('se'),
      token('∸'),

      // Since 0.0.23
      token('send'),
      token('recv'),
      token('tryrecv'),

      // Since 0.0.26
      token('complex'),
      token('ℂ'),
    ),
    modifier1:   $ => choice(
      // (1[1], Reduce, AggregatingModifier, ("reduce", '/')),
      token('reduce'),
      token('/'),
      // (1[1], Scan, AggregatingModifier, ("scan", '\\')),
      token('scan'),
      token('\\'),
      // ([1], Each, IteratingModifier, ("each", '∵')),
      token('each'),
      token('∵'),
      // ([1], Rows, IteratingModifier, ("rows", '≡')),
      token('rows'),
      token('≡'),
      // (1[1], Repeat, IteratingModifier, ("repeat", '⍥')),
      token('repeat'),
      token('⍥'),
      // ([1], Dip, Stack, ("dip", '⊙')),
      token('dip'),
      token('⊙'),
      // ([1], Gap, Stack, ("gap", '⋅')),
      token('gap'),
      token('⋅'),
      // ([1], Invert, OtherModifier, ("invert", '⍘')),
      token('invert'),
      token('⍘'),
      // ([1], Spawn, OtherModifier, ("spawn", '↰')),
      token('spawn'),

      // Since 0.21
      token('pack'),
      token('⊐'),
      token('tribute'),
      token('≐'),

      // Since 0.24
      token('reach'),
      token('⟜'),
    ),
    modifier2:   $ => choice(
      // (2[1], Fold, AggregatingModifier, ("fold", '∧')),
      token('fold'),
      token('∧'),
      // (2[1], Distribute, IteratingModifier, ("distribute", '∺')),
      token('distribute'),
      token('∺'),
      // (2[1], Table, IteratingModifier, ("table", '⊞')),
      token('table'),
      token('⊞'),
      // (2[1], Cross, IteratingModifier, ("cross", '⊠')),
      token('cross'),
      token('⊠'),
      // (2[1], Group, AggregatingModifier, ("group", '⊕')),
      token('group'),
      token('⊕'),
      // (2[1], Partition, AggregatingModifier, ("partition", '⊜')),
      token('partition'),
      token('⊜'),
      // (2[1], Both, Stack, ("both", '∩')),
      token('both'),
      token('∩'),
      // ([2], Bracket, Stack, ("bracket", '⊓')),
      token('bracket'),
      token('⊓'),
      // ([2], Fork, Stack, ("fork", '⊃')),
      token('fork'),
      token('⊃'),
      // ([2], Under, OtherModifier, ("under", '⍜')),
      token('under'),
      token('⍜'),
      // ([2], Level, IteratingModifier, ("level", '⍚')),
      token('level'),
      token('≑'),
      // ([2], Fill, OtherModifier, ("fill", '⬚')),
      token('fill'),
      token('⬚'),
      // ([2], Try, OtherModifier, ("try", '⍣')),
      token('try'),
      token('⍣'),

      // Since 0.21
      token('combinate'),
      token('◳'),

      // Since 0.26
      token('do'),
      token('⍢'),
    ),
    deprecated:  $ => choice(
      token('❥'),
      token('→'),
      token('∷'),
      token('·'),
      token('⍛'),
      token('⌂'),
      token('↰'),
    ),
    // _whitespace: $ => /[ \t]+/,
    _endOfLine:$ => token(/\r?\n/),
  }
});
