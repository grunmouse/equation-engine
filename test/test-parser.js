const assert = require('assert');

const {createParser} = require('../index.js');

function partDeepEqual(actual, expected){
	let keys = Object.keys(expected);
	let tested = Object.fromEntries(Object.entries(actual).filter(([key, value])=>(keys.includes(key))));
	
	assert.deepEqual(actual, expected);
}

function polizEqual(actual, expected){
	let tested = actual.map((act, i)=>{
		let exp = expected[i];
		if(!exp){
			return act;
		}
		let keys = Object.keys(exp);
		let tested = Object.fromEntries(Object.entries(act).filter(([key, value])=>(keys.includes(key))));
		
		return tested;
	});
	
	assert.deepEqual(tested, expected);
}

describe('one operation', ()=>{
	const parser = createParser(
		{
			'+':{order:1}
		},
		{},
		[
			[/\d+/, 'number']
		],
		/[A-Z]/g
	);
	it('1 + 1', ()=>{
		let poliz = parser('1 + 1');
		assert.deepEqual(poliz, [
			{
				"str": "1",
				"token": "literal",
				"type": "number",
				value: undefined
			},
			{
				"str": "1",
				"token": "literal",
				"type": "number",
				value: undefined
			},
			{
				"arity": 2,
				"com": "+",
				"fix": "infix",
				"order": 1,
				"sign": "+",
				"token": "operator"
			}
		]);
	});
	it('1 + 1 + 1', ()=>{
		let poliz = parser('1+1+1');
		polizEqual(poliz,
			[
				{str:'1', token:'literal', type:'number'},
				{str:'1', token:'literal', type:'number'},
				{token:'operator', arity:2, com:'+'},
				{str:'1', token:'literal', type:'number'},
				{token:'operator', arity:2, com:'+'}
			]
		);
	});
});

describe('two operator', ()=>{
	const parser = createParser(
		{
			'*':{order:0},
			'+':{order:1}
		},
		{},
		[
			[/\d+/, 'number']
		],
		/[A-Z]/g
	);
	
	it('2*2+2', ()=>{
		let poliz = parser('2*2+2');
		polizEqual(poliz,
			[
				{str:'2', token:'literal', type:'number'},
				{str:'2', token:'literal', type:'number'},
				{token:'operator', arity:2, com:'*'},
				{str:'2', token:'literal', type:'number'},
				{token:'operator', arity:2, com:'+'}
			]
		);
	});
	it('2+2*2', ()=>{
		let poliz = parser('2+2*2');
		polizEqual(poliz,
			[
				{str:'2', token:'literal', type:'number'},
				{str:'2', token:'literal', type:'number'},
				{str:'2', token:'literal', type:'number'},
				{token:'operator', arity:2, com:'*'},
				{token:'operator', arity:2, com:'+'}
			]
		);
	});
	it('(2+2)*2', ()=>{
		let poliz = parser('(2+2)*2');
		polizEqual(poliz,
			[
				{str:'2', token:'literal', type:'number'},
				{str:'2', token:'literal', type:'number'},
				{token:'operator', arity:2, com:'+'},
				{str:'2', token:'literal', type:'number'},
				{token:'operator', arity:2, com:'*'}
			]
		);
	});
});

describe('with unar', ()=>{
	const parser = createParser(
		{
			'-':{order:0, arity:1, fix:'prefix'},
			'+':{order:1}
		},
		{},
		[
			[/\d+/, 'number']
		],
		/[A-Z]/g
	);
	it('-2', ()=>{
		let poliz = parser('-2');
		polizEqual(poliz,
			[
				{str:'2', token:'literal', type:'number'},
				{token:'operator', arity:1, com:'-'}
			]
		);
	});
	it('-2+2', ()=>{
		let poliz = parser('-2+2');
		polizEqual(poliz,
			[
				{str:'2', token:'literal', type:'number'},
				{token:'operator', arity:1, com:'-'},
				{str:'2', token:'literal', type:'number'},
				{token:'operator', arity:2, com:'+'}
			]
		);
	});
	it('2+-2', ()=>{
		let poliz = parser('2+-2');
		polizEqual(poliz,
			[
				{str:'2', token:'literal', type:'number'},
				{str:'2', token:'literal', type:'number'},
				{token:'operator', arity:1, com:'-'},
				{token:'operator', arity:2, com:'+'}
			]
		);
	});
	it('-2+-2', ()=>{
		let poliz = parser('-2+-2');
		polizEqual(poliz,
			[
				{str:'2', token:'literal', type:'number'},
				{token:'operator', arity:1, com:'-'},
				{str:'2', token:'literal', type:'number'},
				{token:'operator', arity:1, com:'-'},
				{token:'operator', arity:2, com:'+'}
			]
		);
	});
});

describe('with variable', ()=>{
	const parser = createParser(
		{
			'-':{order:0, arity:1, fix:'prefix'},
			'*':{order:1},
			'+':{order:2}
		},
		{},
		[
			[/\d+/, 'number']
		],
		/[A-Z]/g
	);
	it('A+1', ()=>{
		let poliz = parser('A+1');
		polizEqual(poliz,
			[
				{token:'variable', name:"A"},
				{str:"1", token:"literal", type:"number"},
				{token:'operator', arity:'2', com:'+'}
			]
		);
	});
});

describe('with variable & functions', ()=>{
	const parser = createParser(
		{
			'-':{order:0, arity:1, fix:'prefix'},
			'*':{order:1},
			'+':{order:2}
		},
		{
			'sin':{},
			'atan2':{arity:2},
			'max':{arity:-1}
		},
		[
			[/\d+/, 'number']
		],
		/[A-Za-z0-9]+/g
	);
	it('sin(A)+1', ()=>{
		let poliz = parser('sin(A)+1');
		polizEqual(poliz,
			[
				{token:'variable', name:"A"},
				{token:'function', name:"sin", arity:1},
				{str:"1", token:"literal", type:"number"},
				{token:'operator', arity:'2', com:'+'}
			]
		);
	});
	it('atan2(sin(A),b)', ()=>{
		let poliz = parser('atan2(sin(A),b)');
		polizEqual(poliz,
			[
				{token:'variable', name:"A"},
				{token:'function', name:"sin", arity:1},
				{token:'variable', name:"b"},
				{token:'function', name:"atan2", arity:2}
			]
		);
	});
	it('atan2(Y,X)+max(3,4,5)', ()=>{
		let poliz = parser('atan2(Y,X)+max(3,4,5)');
		polizEqual(poliz,
			[
				{token:'variable', name:"Y"},
				{token:'variable', name:"X"},
				{token:'function', name:"atan2", arity:2},
				{str:"3", token:"literal", type:"number"},
				{str:"4", token:"literal", type:"number"},
				{str:"5", token:"literal", type:"number"},
				{token:'function', name:"max", arity:3},
				{token:'operator', arity:'2', com:'+'}
			]
		);
	});
});

