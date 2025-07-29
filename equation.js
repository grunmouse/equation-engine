
const operators = {
	'-negate':{order:0, arity:1, fix:'prefix', sign:"-"},
	'**':{order:1, right:true},
	'^':{order:1, right:true, com:'**'},
	'*':{order:2},
	'/':{order:2},
	'\\':{order:2},
	'%':{order:2},
	'+':{order:3},
	'-':{order:3},
	'>':{order:4},
	'>=':{order:4},
	'<':{order:4},
	'<=':{order:4},
	'=':{order:4},
	'<>':{order:4},
	'!':{order:5, arity:1, fix:'prefix'},
	'&&':{order:6},
	'||':{order:7}
};

const functions = {
	'floor':{},
	'round':{},
	'ceiling':{},
	
	'abs':{},
	'sign':{},
	
	'exp':{},
	'log':{},
	'sqrt':{}
};

const names = /[A-Za-z][A-Za-z_]*/

const values = [
	[/0b[01]+|0x[0-9A-Fa-f]+/, 'integer', a=>parseInt(a)],
	[/\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/, 'number', a=>parseFloat(a)]
]



const createLexer = require('./lexer.js');
const shuntingYard = require('./shunting_yard.js');
const {
	unconflict
} = require('./handle.js'); // Промежуточная обработка

const samples = `
3 + 4
10 - 2 * 5
(1 + 2) * 3
4 / 2 + 6
7 + 3 * (10 / (12 / (3 + 1) - 1))
-5 + 3.14
+2.5 * (-4.2)
0.1 + 0.2
.5 * 8
-0.5e-3 + 1.2E+4
sin(0)
cos(pi / 2)
log(10) + ln(e)
a + b * c
x1 - y2 / z3
alpha + beta * gamma
radius * 2 * pi
velocity^2 / (2 * acceleration)
((1 + 2) * (3 - 4)) / (5 + (6 - 7))
((a + b) * (c - d)) ^ 2
sqrt((x - x0)^2 + (y - y0)^2)
exp(log(10) + sin(pi / 4))
x > 0 && y < 5
!(a == b) || c != d
(x >= 10) && (y <= 20)
true || false && !false
`.split('\n').filter(a=>a.trim());

const errSamples = `
5 +
sin()
3 ** 2
log(-1)
((1 + 2)
`.split('\n').filter(a=>a.trim());

const lexer = createLexer(operators, functions, values, names);
let tokens = lexer(samples[5]);
let commands = unconflict(tokens);
let poliz = shuntingYard(commands);

console.log(tokens);
console.log(commands);
//console.log(poliz);

