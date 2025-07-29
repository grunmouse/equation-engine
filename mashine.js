function createMashine(commands, getVariable, valueParsers={}){
	return function(poliz){
		const stack = [];
		for(let item of poliz){
			switch(item.token){
				case 'literal':
					let value = item.value;
					if(value === undefined){
						let parse = valueParsers[item.type];
						value = parse && parse(item.str);
					}
					stack.push(value);
					break;
				case 'variable':
					let value = getVariable(item.name);
					stack.push(value);
					break;
				case 'function':
					let arity = item.arity;
					let args = stack.splice(-arity, arity);
					let fun = commands[item.name];
					if(!fun){
						throw new Error(`Unknown function "${item.name}"`);
					}
					let value = fun(...arity);
					stack.push(value);
					break;
				case 'operator':
					let arity = item.arity;
					let args = stack.splice(-arity, arity);
					let fun = commands[item.com];
					if(!fun){
						throw new Error(`Unknown operator "${item.com}"`);
					}
					let value = fun(...arity);
					stack.push(value);
					break;
				default:
					throw new Error(`Unknown command type "${item.token}"`);
			}
		}
		
		return stack;
	}
}

module.exports = createMashine;