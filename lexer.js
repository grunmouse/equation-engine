function doCreateLexer(lexPattern, valuesPattern, isName, values, operHandle, functions){
	return function equationLexer(str){
		
		const reLex = new RegExp(lexPattern, 'g');
		const isValue = new RegExp('^(?:'+ valuesPattern + ')$');
		
		let tokens = str.split(/\s+/).map((s)=>(s.match(reLex))).flat();
		
		let operand = false;
		for(let i=0; i<tokens.length; ++i){
			let token = tokens[i];
			let first = token[0];
			if(isValue.test(token)){
				//число
				let value, type;
				for(let [re, t, fun] of values){
					let found = re.exec(token);
					if(found && found[0] === token){
						type = t;
						value = fun ? fun(token) : token;
					}
				}
				tokens[i] = {token:'literal', str:token, value, type};
				operand=true;
			}
			else if(isName.test(token)){
				//имя
				if(token in operHandle){
					let handle = operHandle[token];
					if(handle.type === 'simple'){
						tokens[i] = handle.oper;
						operand = oper.fix === 'postfix';
					}
					else{
						tokens[i] = {token:'operator', sign:token, fix:handle.type, config:handle}
					}
				}
				else if(token in functions){
					let func = functions[token];
					tokens[i] = {...func};
					operand = false;
				}
				else{
					tokens[i] = {token:"variable", name:token};
					operand = true;
				}
			}
			else{
				if(token === "("){
					tokens[i] = {token:"open", sign:token};
					operand = false;
				}
				else if(token === ")"){
					tokens[i] = {token:"close", sign:token};
					operand = true;
				}
				else if(token === ','){
					tokens[i] = {token:"colon", sign:token};
					operand = false;
				}
				else if(token in operHandle){
					let handle = operHandle[token];
					if(handle.type === 'simple'){
						tokens[i] = handle.oper;
						operand = tokens[i].fix === 'postfix';
					}
					else{
						tokens[i] = {token:'operator', sign:token, fix:handle.type, config:handle}
					}
				}
				else{
					throw new Error(`Unknown token ${token}`);
				}
			}
				
		}
		
		return tokens;
	}
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const brackets = /\(|\)/;
const argSep = ",";


function ensureFunctions(functions){
	for(let [key, oper] of Object.entries(functions)){
		oper.name = key;
		oper.token = "function";
		if(!oper.arity){
			oper.arity = 1;
		}
	}
	return functions;
}

function ensureOperators(operators){
	for(let [key, oper] of Object.entries(operators)){
		if(!oper.sign){
			oper.sign = key;
		}
		if(!oper.com){
			oper.com = key;
		}
		oper.token = "operator";
		if(!oper.arity){
			oper.arity = 2;
		}
		if(!oper.fix){
			oper.fix = 'infix';
		}
	}
	
	return operators;
}

function createLexer(operators, functions, values, names){
	const valuesPattern = values.map(a=>(a[0].source)).join('|');

	const isName = new RegExp('^'+names.source+'$');
	
	operators = ensureOperators(operators);
	
	let operSigns = new Set();
	let operCollision = {};
	for(let oper of Object.values(operators)){
		operCollision[oper.sign] = operCollision[oper.sign] || [];
		operCollision[oper.sign].push(oper);
		if(!isName.test(oper.sign)){
			operSigns.add(oper.sign);
		}
	}
	operSigns = [...operSigns];
	operSigns.sort((a,b)=>(b.length - a.length || -(a<b)+(a>b)));
	operSigns = operSigns.map(escapeRegExp);

	const operHandle = {};
	for(let sign of Object.keys(operCollision)){
		let opers = operCollision[sign];
		let conf = {};
		for(let oper of opers){
			conf[oper.fix] = oper;
		}
		if(opers.length === 1){
			conf.type = 'simple';
			conf.oper = opers[0];
		}
		else if(opers.length ===2){
			if(conf.infix && conf.prefix){
				conf.type = 'pi';
			}
			else if(conf.infix && conf.postfix){
				conf.type = 'ip';
			}
			else if(conf.prefix && conf.postfix){
				conf.type = 'pp';
			}
		}
		else if(opers.length === 3){
			conf.type = 'pip';
		}
		
		operHandle[sign] = conf;
	}

	functions = ensureFunctions(functions);

	const lexPattern = [valuesPattern, names, ...operSigns, /\(|\)|,/].map(a=>(a.source || a)).join('|');

	return doCreateLexer(lexPattern, valuesPattern, isName, values, operHandle, functions);
}

module.exports = createLexer;