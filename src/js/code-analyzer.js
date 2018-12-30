import * as esprima from 'esprima';
import escodegen from 'escodegen';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc: true});
};
function makeTableHTML(myArray) {
    var result = '<table border=1>';
    result += '<tr bgcolor = \'#c7d0dd\'><td>lines</td><td>type</td><td>name</td><td>condition</td><td>value</td></tr>';
    for(var i=0; i<myArray.length; i++) {
        result += '<tr>';
        for(var j=0; j<myArray[i].length; j++){
            result += '<td>'+myArray[i][j]+'</td>';
        }
        result += '</tr>';
    }
    result += '</table>';

    return result;
}

function ParseFunctionDecl(parsedCodeBody,result){
    let lineStart = parsedCodeBody.loc.start.line;
    let lineFinish = parsedCodeBody.loc.end.line;
    let type = 'function declaration';
    let name = parsedCodeBody.id.name;
    let condition = '';
    let value = '';
    result.push([(lineStart + ' to ' + lineFinish) ,type ,name ,condition,value]);
    var i;
    for(i = 0; i<parsedCodeBody.params.length; i++) {
        result.push([(lineStart + ' to ' + lineFinish), 'variable declaration', parsedCodeBody.params[i].name, '', '']);
    }
    ParseTable(parsedCodeBody.body,result);
}

function ParseVariableDecl(parsedCodeBody,result){
    let lineStart = parsedCodeBody.loc.start.line;
    let lineFinish = parsedCodeBody.loc.end.line;
    let type = 'variable declaration';
    var i;
    let condition = '';
    for(i = 0; i<parsedCodeBody.declarations.length; i++){
        let value = '';
        if(parsedCodeBody.declarations[i].init !== undefined && parsedCodeBody.declarations[i].init !== null){
            value = escodegen.generate(parsedCodeBody.declarations[i].init);
        }
        let name = parsedCodeBody.declarations[i].id.name;
        result.push([(lineStart + ' to ' + lineFinish) ,type ,name ,condition,value]);
    }
}

function ParseExpressionStatement(parsedCodeBody,result){
    let lineStart = parsedCodeBody.loc.start.line;
    let lineFinish = parsedCodeBody.loc.end.line;
    let type = 'assignment expression';
    let name = escodegen.generate(parsedCodeBody.expression.left);
    let condition = '';
    let value = escodegen.generate(parsedCodeBody.expression.right);
    result.push([(lineStart + ' to ' + lineFinish) ,type ,name ,condition,value]);
}

function ParseReturnStatement(parsedCodeBody,result){
    let lineStart = parsedCodeBody.loc.start.line;
    let lineFinish = parsedCodeBody.loc.end.line;
    let type = 'return statement';
    let name = '';
    let condition = '';
    let value = escodegen.generate(parsedCodeBody.argument);
    result.push([(lineStart + ' to ' + lineFinish) ,type ,name ,condition,value]);
}

function ParseWhileStatement(parsedCodeBody,result){
    let lineStart = parsedCodeBody.loc.start.line;
    let lineFinish = parsedCodeBody.loc.end.line;
    let type = 'while statement';
    let name = '';
    let condition = escodegen.generate(parsedCodeBody.test);
    let value = '';
    result.push([(lineStart + ' to ' + lineFinish) ,type ,name ,condition,value]);
    ParseTable(parsedCodeBody.body,result);
}

function ParseElseIfStatement(parsedCodeBody, result){
    let lineStart = parsedCodeBody.loc.start.line;
    let lineFinish = parsedCodeBody.loc.end.line;
    let type = 'else if statement';
    let name = '';
    let condition = escodegen.generate(parsedCodeBody.test);
    let value = '';
    result.push([(lineStart + ' to ' + lineFinish) ,type ,name ,condition,value]);
    ParseExpression(parsedCodeBody.consequent, result);
    if(parsedCodeBody.alternate === null){
        return;
    }
    else if(parsedCodeBody.alternate.type === 'IfStatement'){
        ParseElseIfStatement(parsedCodeBody.alternate, result);
    }
    else{
        result.push(['? to '+lineFinish ,'else statement' ,''  ,'' ,'']);
        ParseExpression(parsedCodeBody.alternate, result);
    }
}

function ParseIfStatement(parsedCodeBody, result){
    let lineStart = parsedCodeBody.loc.start.line;
    let lineFinish = parsedCodeBody.loc.end.line;
    let type = 'if statement';
    let name = '';
    let condition = escodegen.generate(parsedCodeBody.test);
    let value = '';
    result.push([(lineStart + ' to ' + lineFinish) ,type ,name ,condition,value]);
    ParseExpression(parsedCodeBody.consequent, result);
    if(parsedCodeBody.alternate === null){
        return;
    }
    else if(parsedCodeBody.alternate.type === 'IfStatement'){
        ParseElseIfStatement(parsedCodeBody.alternate, result);
    }
    else{
        result.push(['? to '+lineFinish , 'else statement', '', '', '']);
        ParseExpression(parsedCodeBody.alternate, result);
    }
}

function ParseForStatement(parsedCodeBody,result){
    let lineStart = parsedCodeBody.loc.start.line;
    let lineFinish = parsedCodeBody.loc.end.line;
    let type = 'for statement';
    let name = '';
    let condition = escodegen.generate(parsedCodeBody.init) +';'+ escodegen.generate(parsedCodeBody.test) +';'+ escodegen.generate(parsedCodeBody.update);
    let value = '';
    result.push([(lineStart + ' to ' + lineFinish) ,type ,name ,condition,value]);
    ParseTable(parsedCodeBody.body,result);
}
function ParseExpression(parsedCodeBody, result) {
    var parserMap = new Map();
    parserMap.set('BlockStatement', ParseTable);
    parserMap.set('FunctionDeclaration', ParseFunctionDecl);
    parserMap.set('VariableDeclaration', ParseVariableDecl);
    parserMap.set('ExpressionStatement', ParseExpressionStatement);
    parserMap.set('ReturnStatement', ParseReturnStatement);
    parserMap.set('WhileStatement', ParseWhileStatement);
    parserMap.set('IfStatement', ParseIfStatement);
    parserMap.set('ForStatement', ParseForStatement);
    (parserMap.get(parsedCodeBody.type))(parsedCodeBody,result);
}

function ParseTable(parsedCode, result) {
    var i;
    for(i = 0; i<parsedCode.body.length; i++){
        //value = escodegen.generate(parsedCode.body[i].right);
        ParseExpression(parsedCode.body[i],result);
    }
    return result;
}








function isInArray(name, bindings){
    var i;
    for(i = 0; i < bindings.length; i++){
        if(bindings[i].length > 5 && bindings[i][2] === name && bindings[i][5] === -50){
            return true;
        }
    }
    return false;
}
function isFuncVar(parsedCode, bindings){
    if(parsedCode.type === 'VariableDeclaration')
        return false;
    if(parsedCode.type === 'ExpressionStatement')
        return isInArray(parsedCode.expression.left.name,bindings);
    return true;
}

function removeAllExcessInfo(parsedCode, bindings){
    var i;
    for(i = 0; i < parsedCode.body.length; i++){
        if(!isFuncVar(parsedCode.body[i],bindings)){
            parsedCode.body.splice(i,1);
            i--;
        }
    }
}

function IdentifierSymSub(identifier, result){
    var i;
    let notFound = true;
    for(i = result.length-1; i>0 && notFound ; i--){
        if(result[i][2] === identifier.name){
            notFound = false;
            if(result[i][4] !== '') {
                //identifier.name = (identifier.name + 'TEST' + result[i][4]);
                identifier = esprima.parseScript((result[i][4])).body[0];
                identifier = identifier.expression;
                return identifier;
            }
        }
    }
    return identifier;
}
function BinaryExpSymSub(parsedCodeInit, result){
    var parserMap = new Map();
    parserMap.set('BinaryExpression', BinaryExpSymSub);
    parserMap.set('Identifier', IdentifierSymSub);
    if((parsedCodeInit.type) === 'Identifier')
        return (parserMap.get(parsedCodeInit.type))(parsedCodeInit,result);
    else {
        if ((parserMap.get(parsedCodeInit.left.type)) !== undefined)
            parsedCodeInit.left = (parserMap.get(parsedCodeInit.left.type))(parsedCodeInit.left, result);
        if ((parserMap.get(parsedCodeInit.right.type)) !== undefined)
            parsedCodeInit.right = (parserMap.get(parsedCodeInit.right.type))(parsedCodeInit.right, result);
    }
    return parsedCodeInit;
}
function BinaryExpSymSubIfNeeded(parsedCodeInit, result){
    if(parsedCodeInit.type === 'BinaryExpression' || parsedCodeInit.type === 'Identifier'){
        parsedCodeInit = BinaryExpSymSub(parsedCodeInit, result);
    }
    return parsedCodeInit;
}


function SymSubVariableDecl(parsedCodeBody,result, scopeNumber){
    let lineStart = parsedCodeBody.loc.start.line;
    let lineFinish = parsedCodeBody.loc.end.line;
    let type = 'variable declaration';
    var i;
    let condition = '';
    for(i = 0; i<parsedCodeBody.declarations.length; i++){
        let value = '';
        if(parsedCodeBody.declarations[i].init !== undefined && parsedCodeBody.declarations[i].init !== null){
            parsedCodeBody.declarations[i].init = BinaryExpSymSubIfNeeded(parsedCodeBody.declarations[i].init, result);
            value = escodegen.generate(parsedCodeBody.declarations[i].init);
        }
        let name = parsedCodeBody.declarations[i].id.name;
        result.push([(lineStart + ' to ' + lineFinish) ,type ,name ,condition,value, scopeNumber]);
    }
}
function SymSubFunctionDecl(parsedCodeBody,result, scopeNumber){
    let resultLength = result.length;
    let lineStart = parsedCodeBody.loc.start.line;
    let lineFinish = parsedCodeBody.loc.end.line;
    var i;
    for(i = 0; i<parsedCodeBody.params.length; i++) {
        result.push([(lineStart + ' to ' + lineFinish), 'variable declaration', parsedCodeBody.params[i].name, '', '', -50]);
    }
    SymSubTable(parsedCodeBody.body, result, scopeNumber);
    removeAllExcessInfo(parsedCodeBody.body, result);
    while(result.length !== resultLength) result.pop();
}
function SymSubExpressionStatement(parsedCodeBody,result, scopeNumber){
    let lineStart = parsedCodeBody.loc.start.line;
    let lineFinish = parsedCodeBody.loc.end.line;
    let type = 'assignment expression';
    let name = escodegen.generate(parsedCodeBody.expression.left);
    let condition = '';
    if(parsedCodeBody.expression.right.type === 'BinaryExpression' || parsedCodeBody.expression.right.type === 'Identifier'){
        parsedCodeBody.expression.right = BinaryExpSymSub(parsedCodeBody.expression.right, result);
    }
    let value = escodegen.generate(parsedCodeBody.expression.right);
    result.push([(lineStart + ' to ' + lineFinish) ,type ,name ,condition,value, scopeNumber]);
}
function removeAllIfNeeded(parsedCode, result){
    if(parsedCode.type === 'BlockStatement') { removeAllExcessInfo(parsedCode, result); }
}
function SymSubIfStatement(parsedCodeBody,result, scopeNumber){
    let resultLength = result.length;
    let lineStart = parsedCodeBody.loc.start.line;
    let lineFinish = parsedCodeBody.loc.end.line;
    let type = 'if statement';
    let name = '';
    if(parsedCodeBody.test.type === 'BinaryExpression' || parsedCodeBody.test.type === 'Identifier'){
        parsedCodeBody.test = BinaryExpSymSub(parsedCodeBody.test, result);
    }
    let condition = escodegen.generate(parsedCodeBody.test);
    let value = '';
    result.push([(lineStart + ' to ' + lineFinish) ,type ,name ,condition,value, scopeNumber]);
    ParseExpressionSymSub(parsedCodeBody.consequent, result);
    removeAllIfNeeded(parsedCodeBody.consequent, result);
    while(result.length !== resultLength) result.pop();
    if(parsedCodeBody.alternate === null){ /*void*/ }
    else { ParseExpressionSymSub(parsedCodeBody.alternate, result);
        removeAllIfNeeded(parsedCodeBody.alternate, result);
    }
}
function SymSubReturnStatement(parsedCodeBody,result, scopeNumber){
    let lineStart = parsedCodeBody.loc.start.line;
    let lineFinish = parsedCodeBody.loc.end.line;
    let type = 'return statement';
    let name = '';
    let condition = '';
    if(parsedCodeBody.argument.type === 'BinaryExpression' || parsedCodeBody.argument.type === 'Identifier'){
        parsedCodeBody.argument = BinaryExpSymSub(parsedCodeBody.argument, result);
    }
    let value = escodegen.generate(parsedCodeBody.argument);
    result.push([(lineStart + ' to ' + lineFinish) ,type ,name ,condition,value, scopeNumber]);
}
function SymSubWhileStatement(parsedCodeBody,result, scopeNumber){
    let resultLength = result.length;
    let lineStart = parsedCodeBody.loc.start.line;
    let lineFinish = parsedCodeBody.loc.end.line;
    let type = 'while statement';
    let name = '';
    if(parsedCodeBody.test.type === 'BinaryExpression' || parsedCodeBody.test.type === 'Identifier'){
        parsedCodeBody.test = BinaryExpSymSub(parsedCodeBody.test, result);
    }
    let condition = escodegen.generate(parsedCodeBody.test);
    let value = '';
    result.push([(lineStart + ' to ' + lineFinish) ,type ,name ,condition,value, scopeNumber]);
    SymSubTable(parsedCodeBody.body, result, scopeNumber);
    while(result.length !== resultLength) result.pop();
    removeAllExcessInfo(parsedCodeBody.body, result);
}

function ParseExpressionSymSub(parsedCodeBody, result, scopeNumber) {
    var parserMap = new Map();
    parserMap.set('BlockStatement', SymSubTable);
    parserMap.set('FunctionDeclaration', SymSubFunctionDecl);
    parserMap.set('VariableDeclaration', SymSubVariableDecl);
    parserMap.set('ExpressionStatement', SymSubExpressionStatement);
    parserMap.set('ReturnStatement', SymSubReturnStatement);
    parserMap.set('WhileStatement', SymSubWhileStatement);
    parserMap.set('IfStatement', SymSubIfStatement);
    (parserMap.get(parsedCodeBody.type))(parsedCodeBody,result, scopeNumber);
}
function SymSubTable(parsedCode, bindings, scopeNumber) {
    var i;
    for (i = 0; i < parsedCode.body.length; i++) {
        scopeNumber++;
        ParseExpressionSymSub(parsedCode.body[i], bindings, scopeNumber);
    }
    return parsedCode;
}





function stringSymSub(str, codeTable){
    var i;
    for(i = 0; i<codeTable.length; i++){
        if(codeTable[i][2] === str){
            str = codeTable[i][4];
            return str;
        }
    }
    return str;
}
function symbolicSubstitute(parsedCode, bindings, scopeNumber){
    parsedCode = SymSubTable(parsedCode,bindings, scopeNumber);
    parsedCode = escodegen.generate(parsedCode);
    //parsedCode = JSON.stringify(parsedCode);
    return parsedCode;
}
function calculateIf(newCodeTable, ifStatement) {
    let testArray = (ifStatement[3]).split(' ');
    var i;
    for(i=0 ; i<testArray.length;i++){
        if(testArray[i].includes('[')){
            let splitted = testArray[i].split('[');
            let param = stringSymSub(splitted[0], newCodeTable);
            testArray[i]=param+'['+splitted.splice(1).join('[');
        }
        else
            testArray[i] = stringSymSub(testArray[i], newCodeTable);
    }
    ifStatement.push(eval(testArray.join(' ')));
    return ifStatement;
}
function findIfLines(newCodeTable){
    let i;
    let output = [];
    for(i = 0; i<newCodeTable.length;i++){
        if(newCodeTable[i].length === 6){
            output.push([ (newCodeTable[i][0].split(' '))[0], newCodeTable[i][5] ] );
        }
    }
    return output;
}
function calculateIfs(newCodeTable) {
    var i;
    for(i=0; i<newCodeTable.length;i++){
        if(newCodeTable[i][1] === 'if statement' || newCodeTable[i][1] === 'else if statement'){
            newCodeTable[i] = calculateIf(newCodeTable, newCodeTable[i]);
        }
    }
    return findIfLines(newCodeTable);
}
function createStringArray(str){
    if(!isNaN(str)){
        return str;
    }
    if(Array.isArray(str)){
        str = str.map(x=>createStringArray(x));
        return '['+str+']';
    }
    return '\'' + str + '\'';

}
function calculateResult(newCodeTable,paramsArray){
    if(paramsArray.length == 0){
        return newCodeTable;
    }
    var i;
    let counter = 0;
    for(i=0; i<newCodeTable.length && counter < paramsArray.length ; i++){
        if(newCodeTable[i][1] === 'variable declaration'){
            let newParamValue = createStringArray(paramsArray[counter]);
            newCodeTable[i][4] = newParamValue;
            counter++;
        }
    }
    return calculateIfs(newCodeTable);
}







function applyVarMap(splitted, variablesMap){
    for(let i = 0; i < splitted.length; i++){
        if(variablesMap.get(splitted[i]) != undefined){
            splitted[i] = variablesMap.get(splitted[i]);
        }
    }
    return splitted;
}

function lineSymSub(codeLine, variablesMap){
    var splitted = codeLine[4].split(' ');
    codeLine[4] = (applyVarMap(splitted, variablesMap).join(' '));
    if(codeLine[2] != ''){
        variablesMap.set(codeLine[2], (codeLine[4]));
    }
    var splitted2 = codeLine[3].split(' ');
    codeLine[3] = (applyVarMap(splitted2, variablesMap).join(' '));

}
function calculateLineIfWhileStopCond(codeLine, lastLine){
    if(parseInt(codeLine[0].split(' ')[0] + '') > parseInt(lastLine + ''))
        return true;
    if(parseInt(codeLine[0].split(' ')[2] + '') == parseInt(lastLine + ''))
        return true;
    return false;
}
function calculateLineIfWhile(codeTable, variablesMap, i){
    if(codeTable[i][1] == 'while statement'){
        lineSymSub(codeTable[i], variablesMap);
        codeTable[i][5] = eval('['+codeTable[i][3] + ']') == 'true';
    }
    if(codeTable[i][5] == true){
        return 1;
    }
    else{
        let lastLine = (codeTable[i][0].split(' '))[2];
        let j = i + 1;
        for(; j<codeTable.length && !calculateLineIfWhileStopCond(codeTable[j], lastLine) ; j++){
            codeTable[j][5] = false;
        }
        return j-i;
    }
}
function calculateLine(codeLine, variablesMap){
    let amountOfLinesCalculated = 0;
    if(codeLine[1] == 'function declaration'){
        codeLine[5] = true;
        amountOfLinesCalculated++;
    }
    else if(codeLine[1] == 'variable declaration' || codeLine[1] == 'assignment expression' || codeLine[1] == 'return statement' ){
        codeLine[5] = true;
        amountOfLinesCalculated++;
        lineSymSub(codeLine, variablesMap);
    }
    return amountOfLinesCalculated;
}

function actualCalculate(codeTable, variablesMap, i, j){
    for(;i < j;){
        let iBefore = i;
        i = i + calculateLine(codeTable[i], variablesMap);
        if(iBefore == i)
            i = i + calculateLineIfWhile(codeTable, variablesMap, i);
    }
    return i;
}

function calculateAll(codeTable, paramsArray){
    if(paramsArray.length == 0){
        return codeTable;
    }
    let counter = 0;
    for(var i=0; i<codeTable.length && counter < paramsArray.length ; i++){
        if(codeTable[i][1] === 'variable declaration'){
            let newParamValue = createStringArray(paramsArray[counter]);
            codeTable[i][4] = newParamValue + '';
            counter++;
        }
    }
    actualCalculate(codeTable, new Map(), 0, codeTable.length);
    return codeTable;
}
function checkTwoConditions(cond1, cond2){
    return (cond1 && cond2);
}
function actualDyeMyIf(parsedCodeTable, resultArray){
    let resultArrayIndex = 0;
    let hasSeenTrue = false;
    for(let i = 0; i < parsedCodeTable.length; i++){
        if(checkTwoConditions(parsedCodeTable[i][1].includes('if'), !hasSeenTrue)){
            hasSeenTrue = hasSeenTrue || resultArray[resultArrayIndex][1] ;
            parsedCodeTable[i].push(resultArray[resultArrayIndex][1]);
            resultArrayIndex++;
        }
        else if(parsedCodeTable[i][1] == 'else statement'){
            parsedCodeTable[i].push(!hasSeenTrue);
            hasSeenTrue = false;
        }
        else{ parsedCodeTable[i].push(false); }
    }
    return parsedCodeTable;
}
function dyeMyIf(parsedCodeTable, resultArray, allFalse){
    if(allFalse){
        parsedCodeTable.map(function(arr) { return arr.push(false); });
        return parsedCodeTable;
    }
    return actualDyeMyIf(parsedCodeTable, resultArray);
}
function getBlockEnd(codeLine){
    if(codeLine[1].includes('if') || codeLine[1] == 'else statement' || codeLine[1] == 'return statement'|| codeLine[1] == 'while statement' ){
        return true;
    }
    return false;
}
function getWhileSize(table, i, lastLine){
    let output = 0;
    for(; i < table.length ; i++){
        if(parseInt( table[i][0].split(' ')[2]) > lastLine){
            return output;
        }
        output++;
    }
    return output;
}
function getBlockSize(table, i){
    let output = 1;
    if(getBlockEnd(table[i])){
        return output;
    }
    if( checkTwoConditions((i-1 > 0),  table[i-1][1].includes('e statement')))
        return getWhileSize(table, i, parseInt(table[i-1][0].split(' ')[2]));
    for(;(output + i) < table.length && !getBlockEnd(table[i+output]) ;){
        output = output + 1;
    }
    return output;
}
function varToString(tableLine){
    if(tableLine[4] == '')
        return '';
    return ''+tableLine[2] + '=' + tableLine[4];
}
function assToString(tableLine){
    return ''+tableLine[2] + '=' + tableLine[4];
}
function returnToString(tableLine){
    return 'return ' + tableLine[4];
}
function condToString(tableLine){
    return ''+tableLine[3];
}
function blockToString(table, startIndex, endIndex, blockIndex){
    var toStringMap = new Map();
    toStringMap.set('variable declaration', varToString);
    toStringMap.set('assignment expression', assToString);
    toStringMap.set('return statement', returnToString);
    toStringMap.set('if statement', condToString);
    toStringMap.set('else if statement', condToString);
    toStringMap.set('while statement',condToString);
    toStringMap.set('else statement', (function () { return 'else';}));
    toStringMap.set('function declaration', (function () {return '';}));
    var output = '-' + blockIndex + '-\n';
    for(;startIndex < endIndex; startIndex++){
        output = output + (toStringMap.get(table[startIndex][1]))(table[startIndex]) + '\n';
    }
    return output;
}

function colorIfsWePass(table, tableBools, cantCalc){
    if(cantCalc){
        return tableBools;
    }
    let sawTrue = false;
    for(let i = 0;i<table.length;i++){
        if(checkTwoConditions((!sawTrue), (table[i][1].includes('if')))){
            sawTrue = tableBools[i][5];
            tableBools[i][5] = true;
        }
        if(table[i][1] == 'else statement') {
            tableBools[i][5] = !sawTrue;
            sawTrue = false;
        }
    }
    return tableBools;
}




export {parseCode, ParseTable, makeTableHTML, symbolicSubstitute, calculateResult, colorIfsWePass, blockToString, getBlockSize, dyeMyIf, calculateAll};
