function createMashine(commands, getVariable, valueParsers={}){
	return function(poliz, env){
		const stack = [];
		for(let item of poliz){
			switch(item.token){
				case 'literal':{
					let value = item.value;
					let parse = valueParsers[item.type];
					if(parse){
						if(typeof value === 'undefined'){
							value = parse(item.str, env, item);
						}
						else{
							value = parse(value, env, item);
						}
					}
					stack.push(value);
					break;
				}
				case 'variable':{
					let value = getVariable(item.name, env, item);
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
						value = fun(...args, env);
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
						value = fun(...args, env);
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