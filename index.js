
const createLexer = require('./lexer.js');
const shuntingYard = require('./shunting_yard.js');
const {
	unconflict
} = require('./handle.js'); // Промежуточная обработка
const createMashine = require('./mashine.js');
/*
operators, functions, values, names
*/

function createParser(operators, functions, values, names){
	const lexer = createLexer(operators, functions, values, names);
	
	return function(equation){
		let tokens = lexer(equation);
		let commands = unconflict(tokens);
		let poliz = shuntingYard(commands);
		return poliz;
	}
}

module.exports = {
	createLexer,
	shuntingYard,
	unconflict,

	createParser,
	createMashine
}