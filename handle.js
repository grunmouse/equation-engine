
function tokenType(token){
	if(token){
		if(token.token === 'operator'){
			return token.fix;
		}
		else if(token.token === 'operator' || token.token === 'variable'){
			return 'value';
		}
		else{
			return token.token;
		}
	}
	else{
		return 'none'
	}
}


function unconflict(tokens){
console.log('aaa');
	for(let i = 0; i<tokens.length; ++i){
		let token = tokens[i];
		if(token.token === 'operator'){
			if(token.fix === 'pi'){
				let prev = tokens[i-1];
				let doFix;
				switch(tokenType(prev)){
					case 'value':
					case 'close':
					case 'postfix':
						doFix = 'infix'
						break;
					case 'none':
					case 'open':
					case 'colon':
					case 'infix':
					case 'prefix':
						doFix = 'prefix';
						break;
					default:
						throw new Error(`Unknown token "${tokenType(prev)}`);
				}
				tokens[i] = token.config[doFix];
			}
			else if(token.fix === 'ip'){
				let next = token[i+1];
				let doFix;
				switch(tokenType(next)){
					case 'value':
					case 'open':
					case 'function':
					case 'prefix':
						doFix = 'infix';
						break;
					case 'none':
					case 'close':
					case 'infix':
					case 'postfix':
						doFix = 'postfix';
						break;
					default:
						throw new Error(`Unknown token "${tokenType(prev)}`);
				}
			}
			else if(token.fix === 'pp'){
				let prev = tokens[i-1];
				let doFix;
				switch(tokenType(prev)){
					case 'value':
					case 'close':
					case 'postfix':
						doFix = 'postfix'
						break;
					case 'none':
					case 'open':
					case 'colon':
					case 'infix':
					case 'prefix':
						doFix = 'prefix';
						break;
					default:
						throw new Error(`Unknown token "${tokenType(prev)}`);
				}			
			}
		}
	}
	
	return tokens;
}



module.exports = {
	unconflict
};