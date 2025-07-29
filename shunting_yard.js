/**
 * Алгоритм сортировочной станции
 */
function shuntingYard(tokens){
	const stack = [{token:'bottom'}];
	const output = [];
	stack.top = function(){return this[this.length-1];};
	
	for(let token of tokens){
		if(token.token === "literal" || token.token==="variable"){
			output.push(token);
		}
		else if(token.token === "function"){
			stack.push(token);
		}
		else if(token.token === "operator"){
			while(stack.top().token === "operator"){
				let top = stack.top();
				if(top.order < token.order){
					output.push(stack.pop());
				}
				else if(top.order === token.order){
					if(top.right){
						break;
					}
					else{
						output.push(stack.pop());
					}
				}
				else{
					break;
				}
			}
			if(token.fix === 'postfix'){
				output.push(token);
			}
			else{
				stack.push(token);
			}
		}
		else if(token.token === "open"){
			stack.push(token);
		}
		else if(token.token === "close"){
			while(["bottom", "open"].indexOf(stack.top().token)==-1){
				output.push(stack.pop());
			}
			if(stack.top().token !== "open"){
				throw new Error("Unpaired brackets");
			}
			stack.pop();
			while(stack.top().token === "function"){
				output.push(stack.pop());
			}
		}
		else if(token.token === "colon"){
			while(["bottom", "open"].indexOf(stack.top().token)==-1){
				output.push(stack.pop());
			}
			stack.top().arity++;
		}
	}
	
	while(stack.top().token !== "bottom"){
		output.push(stack.pop());
	}
	
	return output;
}

module.exports = shuntingYard;