import assert from 'assert';
import {ParseTable, parseCode, makeTableHTML, symbolicSubstitute, calculateResult, colorIfsWePass, blockToString, getBlockSize, dyeMyIf, calculateAll} from '../src/js/code-analyzer';
import $ from 'jquery';


describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('')),
            '{"type":"Program","body":[],"sourceType":"script","loc":{"start":{"line":0,"column":0},"end":{"line":0,"column":0}}}'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a","loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":5}}},"init":{"type":"Literal","value":1,"raw":"1","loc":{"start":{"line":1,"column":8},"end":{"line":1,"column":9}}},"loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":9}}}],"kind":"let","loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":10}}}],"sourceType":"script","loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":10}}}'
        );
    });
});
describe('The expressions parser', () => {
    it('is parsing let expressions correctly', () => {
        let jsonString = parseCode('let low;');
        let output = ParseTable(jsonString,[]);
        assert.deepEqual(
            output,
            [['1 to 1','variable declaration','low','','']]
        );
    });
});
describe('The expressions parser', () => {
    it('is parsing let expressions correctly v2', () => {
        let jsonString = parseCode('let low = 1;');
        let output = ParseTable(jsonString,[]);
        assert.deepEqual(
            output,
            [['1 to 1','variable declaration','low','','1']]
        );
    });
});

describe('The expressions parser', () => {
    it('is parsing assignment expressions correctly', () => {
        let jsonString = parseCode('low = 0;');
        let output = ParseTable(jsonString,[]);
        assert.deepEqual(
            output,
            [['1 to 1','assignment expression','low','','0']]
        );
    });
});

describe('The functions parser', () => {
    it('is parsing functions correctly', () => {
        let jsonString = parseCode('function funcName(X){}');
        let output = ParseTable(jsonString,[]);
        assert.deepEqual(
            output,
            [['1 to 1','function declaration','funcName','',''],['1 to 1','variable declaration','X','','']]
        );
    });
});

describe('The else if parser', () => {
    it('is parsing else if correctly', () => {
        let jsonString = parseCode( 'function funcName(i){\n' +
                                    '     if(i < 5)\n' +
                                    '          return 5;\n' +
                                    '     else if(i > 0)\n' +
                                    '          return 0;\n' +
                                    '     else if(i > -4)\n' +
                                    '          return -4;\n' +
                                    '     else\n' +
                                    '          return -1;\n' +
                                    '}');
        let output = ParseTable(jsonString,[]);
        assert.deepEqual(
            output,
            [['1 to 10','function declaration','funcName','',''],['1 to 10','variable declaration','i','',''],['2 to 9','if statement','','i < 5',''],['3 to 3','return statement','','','5'],['4 to 9','else if statement','','i > 0',''],['5 to 5','return statement','','','0'],['6 to 9','else if statement','','i > -4',''],['7 to 7','return statement','','','-4'],['? to 9','else statement','','',''],['9 to 9','return statement','','','-1']]
        );
    });
});
describe('The else if parser', () => {
    it('is parsing else if correctly v2', () => {
        let jsonString = parseCode( 'function funcName(i){\n' +
            '     if(i < 5)\n' +
            '          return 5;\n' +
            '     else if(i > 0)\n' +
            '          return 0;\n' +
            '     else if(i > -4)\n' +
            '          return -4;\n' +
            '}');
        let output = ParseTable(jsonString,[]);
        assert.deepEqual(
            output,
            [['1 to 8','function declaration','funcName','',''],['1 to 8','variable declaration','i','',''],['2 to 7','if statement','','i < 5',''],['3 to 3','return statement','','','5'],['4 to 7','else if statement','','i > 0',''],['5 to 5','return statement','','','0'],['6 to 7','else if statement','','i > -4',''],['7 to 7','return statement','','','-4']]
        );
    });
});

describe('The for loops parser', () => {
    it('is parsing for loops correctly', () => {
        let jsonString = parseCode( 'function funcName(i){\n' +
                                    '     for(i = 0;i <= i;i++){\n' +
                                    '           return -1;\n' +
                                    '     }\n' +
                                    '}');
        let output = ParseTable(jsonString,[]);
        assert.deepEqual(
            output,
            [['1 to 5','function declaration','funcName','',''],['1 to 5','variable declaration','i','',''],['2 to 4','for statement','','i = 0;i <= i;i++',''],['3 to 3','return statement','','','-1']]
        );
    });
});

describe('The statements parser', () => {
    it('is parsing while statements correctly', () => {
        let jsonString = parseCode('while (low <= high) {\n' +
                                    '    low=low+1;\n' +
                                    '}');
        let output = ParseTable(jsonString,[]);
        assert.deepEqual(
            output,
            [['1 to 3','while statement','','low <= high',''],['2 to 2','assignment expression','low','','low + 1']]
        );
    });
});

describe('The statements parser', () => {
    it('is parsing return and function statements correctly', () => {
        let jsonString = parseCode('function funcName(){\n' +
                                    '    return -1;\n' +
                                    '}');
        let output = ParseTable(jsonString,[]);
        assert.deepEqual(
            output,
            [['1 to 3','function declaration','funcName','',''],['2 to 2','return statement','','','-1']]
        );
    });
});

describe('The statements parser', () => {
    it('is parsing if statements correctly', () => {
        let jsonString = parseCode('function funcName(){\n' +
                                    '    if (X < Y)\n' +
                                    '        high = mid;\n' +
                                    '    else\n' +
                                    '        return mid;\n' +
                                    '}');
        let output = ParseTable(jsonString,[]);
        assert.deepEqual(
            output,
            [   ['1 to 6','function declaration','funcName','',''], ['2 to 5','if statement','','X < Y',''], ['3 to 3','assignment expression','high','','mid'], ['? to 5',   'else statement','','',''], ['5 to 5','return statement','','','mid']   ]
        );
    });
});
describe('The statements parser', () => {
    it('is parsing if statements correctly v2', () => {
        let jsonString = parseCode('function funcName(){\n' +
            '    if (X < Y){\n' +
            '        high = mid;\n' +
            '}\n' +
            '}');
        let output = ParseTable(jsonString,[]);
        assert.deepEqual(
            output,
            [   ['1 to 5','function declaration','funcName','',''], ['2 to 4','if statement','','X < Y',''], ['3 to 3','assignment expression','high','','mid']   ]
        );
    });
});

describe('The table creator', () => {
    it('is creating a table correctly', () => {
        let tableString = makeTableHTML([['test1','test2','test3','test4','test5'],['test2-1','test2-2','test2-3','test2-4','test2-5']]);
        assert.deepEqual(
            tableString,
            '<table border=1><tr bgcolor = \'#c7d0dd\'><td>lines</td><td>type</td><td>name</td><td>condition</td><td>value</td></tr>'+
            '<tr><td>test1</td><td>test2</td><td>test3</td><td>test4</td><td>test5</td></tr>'+
            '<tr><td>test2-1</td><td>test2-2</td><td>test2-3</td><td>test2-4</td><td>test2-5</td></tr></table>'
        );
    });
});


describe('The symbol changer', () => {
    it('is changing symbols correctly', () => {
        let parsedCode = parseCode('function foo(x, y, z){\n' +
                                    '    let a = x + 1;\n' + '    let b = a + y;\n' + '    let c = a;\n' + '    c = 8;\n' +
                                    '    if (b < z) {\n' + '        c = c + 5;\n' +
                                    '        return x + y + z + c;\n' + '    } else if (b < z * 2) {\n' +
                                    '        c = c + x + 5;\n' + '        return x + y + z + c;\n' +
                                    '    } else {\n' + '        c = c + z + 5;\n' +
                                    '        return x + y + z + c;\n' + '    }\n' + '}\n');
        let codeAfterSymSub = symbolicSubstitute(parsedCode,[],0);
        assert.deepEqual(
            codeAfterSymSub,
            'function foo(x, y, z) {\n' + '    if (x + 1 + y < z) {\n' +
            '        return x + y + z + (8 + 5);\n' + '    } else if (x + 1 + y < z * 2) {\n' +
            '        return x + y + z + (8 + x + 5);\n' + '    } else {\n' +
            '        return x + y + z + (8 + z + 5);\n' + '    }\n' + '}'
        );
    });
});
describe('The symbol changer', () => {
    it('is changing symbols correctly v2', () => {
        let parsedCode = parseCode('function foo(x, y, z){\n' +
                                    '    while(z){\n' +
                                    '        let a = 0;\n' + '        a = y;\n' +
                                    '        x = x + 1;\n' + '        if(y){\n' +
                                    '            return z;\n' +
                                    '        }\n' + '    }\n' + '}\n');
        let codeAfterSymSub = symbolicSubstitute(parsedCode,[],0);
        assert.deepEqual(
            codeAfterSymSub,
            'function foo(x, y, z) {\n' +
            '    while (z) {\n' +
            '        x = x + 1;\n' +
            '        if (y) {\n' +
            '            return z;\n' + '        }\n' + '    }\n' + '}'
        );
    });
});

describe('The symbol changer', () => {
    it('is calculating ifs correctly', () => {
        let parsedCode = parseCode('function foo(x, y, z){\n' +
                                    '    if(x < y)\n' +
                                    '        return 0;\n' +
                                    '    else if(x < z[0])\n' +
                                    '        return 1;\n' +
                                    '}\n');
        let codeAfterSymSub = symbolicSubstitute(parsedCode,[],0);
        let resultArray = calculateResult(ParseTable(parseCode(codeAfterSymSub),[]),eval('[4,4,[5,2]]'));
        assert.deepEqual(
            resultArray,
            [['2',false], ['4',true]]
        );
    });
});

describe('The symbol changer', () => {
    it('is calculating ifs correctly v2', () => {
        let parsedCode = parseCode('function foo(x, y){\n' +
                                    '    if(x == y)\n' +
                                    '        return 0;\n' +
                                    '    return 1;\n' +
                                    '}\n');
        let codeAfterSymSub = symbolicSubstitute(parsedCode,[],0);
        let resultArray = calculateResult(ParseTable(parseCode(codeAfterSymSub),[]),eval('[\'ok\',\'ok\']'));
        assert.deepEqual(
            resultArray,
            [['2',true]]
        );
    });
});

describe('The symbol changer', () => {
    it('is calculating ifs correctly v3', () => {
        let parsedCode = parseCode('function foo(){\n' +
            '    return 1;\n' +
            '}\n');
        let codeAfterSymSub = symbolicSubstitute(parsedCode,[],0);
        let resultArray = calculateResult(ParseTable(parseCode(codeAfterSymSub),[]),eval('[]'));
        assert.deepEqual(
            resultArray,
            [['1 to 3', 'function declaration', 'foo', '',''],['2 to 2', 'return statement', '','','1']]
        );
    });
});

describe('The symbol changer', () => {
    it('is changing bools correctly', () => {
        let array = [   ['1 to 6','function declaration','funcName','',''], ['2 to 5','if statement','','X < Y',''], ['3 to 3','assignment expression','high','','mid'], ['? to 5',   'else statement','','',''], ['5 to 5','return statement','','','mid']   ];
        let arrayBools = [   ['1 to 6','function declaration','funcName','','', false], ['2 to 5','if statement','','X < Y','', false], ['3 to 3','assignment expression','high','','mid', false], ['? to 5',   'else statement','','','', false], ['5 to 5','return statement','','','mid', false]   ];
        let resultArray = colorIfsWePass(array, arrayBools, false);
        assert.deepEqual(
            resultArray,
            [   ['1 to 6','function declaration','funcName','','', false], ['2 to 5','if statement','','X < Y','', true], ['3 to 3','assignment expression','high','','mid', false], ['? to 5',   'else statement','','','', true], ['5 to 5','return statement','','','mid', false]   ]
        );
    });
});

describe('The symbol changer', () => {
    it('is changing bools correctly v2', () => {
        let array = [   ['1 to 6','function declaration','funcName','',''], ['2 to 5','if statement','','X < Y',''], ['3 to 3','assignment expression','high','','mid'], ['? to 5',   'else statement','','',''], ['5 to 5','return statement','','','mid']   ];
        let arrayBools = [   ['1 to 6','function declaration','funcName','','', false], ['2 to 5','if statement','','X < Y','', false], ['3 to 3','assignment expression','high','','mid', false], ['? to 5',   'else statement','','','', false], ['5 to 5','return statement','','','mid', false]   ];
        let resultArray = colorIfsWePass(array, arrayBools, true);
        assert.deepEqual(
            resultArray,
            arrayBools
        );
    });
});

describe('The code analyzer', () => {
    it('is turning blocks to strings correctly', () => {
        let array = [
            ['1 to 6','function declaration','funcName','',''],
            ['2 to 5','if statement','','X < Y',''],
            ['3 to 3','assignment expression','high','','mid'],
            ['? to 5','else statement','','',''],
            ['5 to 5','return statement','','','mid'],
            ['99 to 99','variable declaration','x','',''],
            ['99 to 99','variable declaration','y','','8']];

        let resultString = blockToString(array, 0, 7, 666);
        assert.deepEqual(
            resultString,
            '-666-\n\nX < Y\nhigh=mid\nelse\nreturn mid\n\ny=8\n'
        );
    });
});

describe('The code analyzer', () => {
    it('is calculating block size correctly', () => {
        let array = [
            ['1 to 6','function declaration','funcName','',''], ['2 to 5','if statement','','X < Y',''],
            ['3 to 3','assignment expression','high','','mid'], ['? to 100','else statement','','',''],
            ['5 to 7','variable declaration','x','',''], ['7 to 7','while statement','','z',''],
            ['3 to 3','assignment expression','high','','mid'], ['3 to 3','assignment expression','high','','mid'],
            ['3 to 3','assignment expression','high','','mid'], ['8 to 8','return statement','','','mid'],
            ['7 to 7','while statement','','z',''], ['3 to 3','assignment expression','high','','mid'],
            ['3 to 3','assignment expression','high','','mid']];

        assert.deepEqual( getBlockSize(array, 9),    1 );
        assert.deepEqual( getBlockSize(array, 6),    3 );
        assert.deepEqual( getBlockSize(array, 5),    1 );
        assert.deepEqual( getBlockSize(array, 7),    2 );
        assert.deepEqual( getBlockSize(array, 11),    2 );
    });
});

describe('The code analyzer', () => {
    it('is dying ifs correctly', () => {
        assert.deepEqual( dyeMyIf([],[],false),    [] );
        assert.deepEqual( dyeMyIf([[],[]],[],true),    [[false],[false]] );
        let parsedTable =  [
            ['1 to 6','function declaration','funcName','',''], ['2 to 2','variable declaration','x','','8'],
            ['3 to 3','variable declaration','x','','8'], ['4 to 7','if statement','','x < y',''],
            ['5 to 5','assignment expression','high','','mid'], ['4 to 9','else if statement','','x < y',''],
            ['7 to 9','assignment expression','high','','mid'], ['? to 9','else statement','','',''],
            ['9 to 9','assignment expression','high','','mid'], ['10 to 10','return statement','','','mid'] ];

        assert.deepEqual(
            dyeMyIf(parsedTable,[[3, true]],false),
            [ ['1 to 6','function declaration','funcName','','', false], ['2 to 2','variable declaration','x','','8', false],
                ['3 to 3','variable declaration','x','','8', false], ['4 to 7','if statement','','x < y','', true],
                ['5 to 5','assignment expression','high','','mid', false], ['4 to 9','else if statement','','x < y','', false],
                ['7 to 9','assignment expression','high','','mid', false], ['? to 9','else statement','','','', false],
                ['9 to 9','assignment expression','high','','mid', false], ['10 to 10','return statement','','','mid', false]] );
    });
});

describe('The code analyzer', () => {
    it('is calculating ifs correctly', () => {
        let codeTable = [
            ['1 to 15','function declaration','foo','',''], ['1 to 15','variable declaration','x','',''], ['1 to 15','variable declaration','y','',''],
            ['1 to 15','variable declaration','z','',''], ['2 to 2','variable declaration','a','','x + 1'], ['3 to 3','variable declaration','b','','a + y'],
            ['4 to 4','variable declaration','c','','0'], ['6 to 12','if statement','','b < z','', false], ['7 to 7','assignment expression','c','','c + 5'],
            ['8 to 12','else if statement','','b < z * 2','', true], ['9 to 9','assignment expression','c','','c + x + 5'], ['? to 12','else statement','','','', false],
            ['11 to 11','assignment expression','c','','c + z + 5'], ['14 to 14','return statement','','','c'] ];
        assert.deepEqual(
            calculateAll(codeTable, [1,2,3]),
            [['1 to 15','function declaration','foo','','', true], ['1 to 15','variable declaration','x','','1', true], ['1 to 15','variable declaration','y','','2', true],
                ['1 to 15','variable declaration','z','','3', true], ['2 to 2','variable declaration','a','','1 + 1', true], ['3 to 3','variable declaration','b','','1 + 1 + 2', true],
                ['4 to 4','variable declaration','c','','0', true], ['6 to 12','if statement','','b < z','', false], ['7 to 7','assignment expression','c','','c + 5', false],
                ['8 to 12','else if statement','','b < z * 2','', true], ['9 to 9','assignment expression','c','','0 + 1 + 5', true], ['? to 12','else statement','','','', false],
                ['11 to 11','assignment expression','c','','c + z + 5', false], ['14 to 14','return statement','','','0 + 1 + 5', true]]
        );
        assert.deepEqual(calculateAll([], []), []);
    });
});

describe('The code analyzer', () => {
    it('is calculating while loops correctly', () => {
        let codeTable = [
            ['1 to 9','function declaration','foo','',''], ['1 to 9','variable declaration','x','',''],
            ['1 to 9','variable declaration','z','',''], ['2 to 2','variable declaration','a','','x + 1'],
            ['4 to 6','while statement','','a < z',''], ['5 to 5','assignment expression','a','','a + 1'],
            ['8 to 8','return statement','','','a'] ];
        assert.deepEqual(
            calculateAll(codeTable, [1,2]),
            [['1 to 9','function declaration','foo','','', true], ['1 to 9','variable declaration','x','','1', true],
                ['1 to 9','variable declaration','z','','2', true], ['2 to 2','variable declaration','a','','1 + 1', true],
                ['4 to 6','while statement','','1 + 1 < 2','', false], ['5 to 5','assignment expression','a','','a + 1', false],
                ['8 to 8','return statement','','','1 + 1', true] ]
        );
        assert.deepEqual(calculateAll([], []), []);
    });
});

