function createMashine(commands, getVariable, valueParsers={}){
	return function(poliz){
		const stack = [];
		for(let item of poliz){
			switch(item.token){
				case 'literal':{
					let value = item.value;
					if(value === undefined){
						let parse = valueParsers[item.type];
						value = parse && parse(item.str);
					}
					stack.push(value);
					break;
				}
				case 'variable':{
					let value = getVariable(item.name);
					stack.push(value);
					break;
				}
				case 'function':{
					let arity = item.arity;
					let args = stack.splice(-arity, arity);
					let funname = item.name;
					let fun = commands[funname];
					if(!fun){
						throw new Error(`Unknown function "${funname}"`);
					}
					let value;
					try{
						value = fun(...args);
					}
					catch(e){
						let ne = new Error(`Error in ${funname}(${JSON.stringify(args)})`);
						ne.stack = e.stack;
						ne.originalError = e;
						ne.args = args;
						throw ne;
					}
					stack.push(value);
					break;
				}
				case 'operator':{
					let arity = item.arity;
					let args = stack.splice(-arity, arity);
					let funname = item.com;
					let fun = commands[funname];
					if(!fun){
						throw new Error(`Unknown operator "${funname}"`);
					}
					let value;
					try{
						value = fun(...args);
					}
					catch(e){
						let ne = new Error(`Error in ${funname}(${JSON.stringify(args)})`);
						ne.stack = e.stack;
						ne.originalError = e;
						ne.args = args;
						throw ne;
					}
					stack.push(value);
					break;
				}
				default:
					throw new Error(`Unknown command type "${item.token}"`);
			}
		}
		
		return stack;
	}
}

module.exports = createMashine;