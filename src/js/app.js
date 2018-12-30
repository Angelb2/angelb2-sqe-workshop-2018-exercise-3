import $ from 'jquery';
import * as go from 'gojs';

import {parseCode, ParseTable, makeTableHTML, symbolicSubstitute, calculateResult, colorIfsWePass, blockToString, getBlockSize, dyeMyIf, calculateAll} from './code-analyzer';


function blockToNode($2, table, tableBools, startIndex, endIndex, blockIndex){
    var figureMap = new Map();
    figureMap.set('variable declaration', 'Rectangle');
    figureMap.set('assignment expression', 'Rectangle');
    figureMap.set('return statement', 'Rectangle');
    figureMap.set('if statement', 'Diamond');
    figureMap.set('else if statement', 'Diamond');
    figureMap.set('while statement','Diamond');
    figureMap.set('else statement', 'Ellipse');
    figureMap.set('function declaration', 'Ellipse');
    var colorMap = new Map();
    colorMap.set(true, 'LimeGreen'); colorMap.set(false, 'White');
    var node =
        $2(go.Node, 'Auto',
            $2(go.Shape, { figure: figureMap.get(table[startIndex][1]), fill: colorMap.get(tableBools[startIndex][5]) }),
            $2(go.TextBlock, { text: replaceAll(blockToString(table, startIndex, endIndex, blockIndex), '\n\n', '\n'), margin: 5 }) );
    return [node, 'Block Start: '+startIndex, 'Block End: '+endIndex, 'Block Number: '+blockIndex, table[startIndex][1]];
}
function getNodes($2, table, tableBools, cantCalc){
    tableBools = colorIfsWePass(table, tableBools, cantCalc);
    var output = [];
    let blockIndex = 1;
    for(let i = 0; i < table.length ;){
        if(table[i][1] == 'function declaration')
            i = i + 1;
        let tmp = getBlockSize(table, i);
        var toAdd = blockToNode($2, table, tableBools, i, i+tmp, blockIndex);
        if(toAdd[4] != 'else statement'){
            output.push(toAdd);
            blockIndex = blockIndex + 1;
        }
        i = i + tmp;
    }
    return output;
}
function linkNode($2, nodesTable, i, output, lastNodes){
    lastNodes = addNodesIfNeeded($2, nodesTable, i, output, lastNodes);
    if(nodesTable[i][4] == 'return statement' ) return [1, []];
    if(nodesTable[i][4] == 'variable declaration' || nodesTable[i][4] == 'assignment expression' ){ return [1, [[nodesTable[i][0], '']]]; }
    if(nodesTable[i][4] == 'while statement'){
        output.push($2(go.Link, { fromNode: nodesTable[i][0], toNode: nodesTable[i+1][0] }, $2(go.Shape),
            $2(go.Shape, { toArrow: 'OpenTriangle', fill: null }),
            $2(go.TextBlock, 'T', { segmentOffset: new go.Point(0, -10), segmentOrientation: go.Link.OrientUpright })));
        output.push($2(go.Link, { fromNode: nodesTable[i+1][0], toNode: nodesTable[i][0] }, $2(go.Shape),
            $2(go.Shape, { toArrow: 'OpenTriangle', fill: null }),
            $2(go.TextBlock, '', { segmentOffset: new go.Point(0, -10), segmentOrientation: go.Link.OrientUpright })));
        return [2, [[nodesTable[i][0], 'F']]]; }
    output.push($2(go.Link, { fromNode: nodesTable[i][0], toNode: nodesTable[i+1][0] }, $2(go.Shape),
        $2(go.Shape, { toArrow: 'OpenTriangle', fill: null }), $2(go.TextBlock, 'T', { segmentOffset: new go.Point(0, -10), segmentOrientation: go.Link.OrientUpright })));
    output.push($2(go.Link, { fromNode: nodesTable[i][0], toNode: nodesTable[i+2][0] }, $2(go.Shape), $2(go.Shape, { toArrow: 'OpenTriangle', fill: null }),
        $2(go.TextBlock, 'F', { segmentOffset: new go.Point(0, -10), segmentOrientation: go.Link.OrientUpright })));
    lastNodes.push([nodesTable[i+1][0], '']);
    pushIfNeeded(lastNodes, isElseIf(nodesTable[i][4]), [nodesTable[i+2][0], '']);
    return [2 + isElseIf(nodesTable[i][4]), lastNodes];
}
function getLinks($2, nodesTable, lastNodes, i){
    var output = [];
    for(; i < nodesTable.length;) {
        var linkNodeOutput = linkNode($2, nodesTable, i, output, lastNodes);
        i = i + linkNodeOutput[0];
        lastNodes = linkNodeOutput[1];
    }
    return output;
}
function isElseIf(statement){
    if(statement == 'else if statement')
        return 1;
    return 0;
}
function pushIfNeeded(lastNodes, OneOrZero, toAdd){
    if(OneOrZero == 1){
        lastNodes.push(toAdd);
    }
}
function addNodesIfNeeded($2, nodesTable, i, output, lastNodes){
    if(nodesTable[i][4].includes('else'))
        return lastNodes;
    for(let j = 0; j < lastNodes.length ; j++) {
        output.push($2(go.Link, { fromNode: lastNodes[j][0], toNode: nodesTable[i][0] }, $2(go.Shape),
            $2(go.Shape, { toArrow: 'OpenTriangle', fill: null }),
            $2(go.TextBlock, ''+lastNodes[j][1], { segmentOffset: new go.Point(0, -10), segmentOrientation: go.Link.OrientUpright })));
    }
    return [];
}













function replaceAll(coloredCode, oldchar, newchar){
    while(coloredCode.includes(oldchar)) {
        coloredCode = coloredCode.replace(oldchar, newchar);
    }
    return coloredCode;
}
function colorIf(coloredCode, rowNumber, color, numOfRowsDone){
    while(coloredCode.includes('&&&rownum&&&') && numOfRowsDone < rowNumber) {
        coloredCode = coloredCode.replace('&&&rownum&&&', '');
        numOfRowsDone++;
    }
    coloredCode = coloredCode.replace('&&&rownum&&&', color);
    return coloredCode;
}
function colorIfs(coloredCode, resultArray){
    let i;
    let numOfRowsDone = 1;
    for(i=0; i<resultArray.length; i++){
        if(resultArray[i][1]) {
            coloredCode = colorIf(coloredCode, parseInt(resultArray[i][0]), 'style="background-color:Chartreuse;"', numOfRowsDone);
            numOfRowsDone = parseInt(resultArray[i][0])+1;
        }
        else{
            coloredCode = colorIf(coloredCode, parseInt(resultArray[i][0]), 'style="background-color:tomato;"', numOfRowsDone);
            numOfRowsDone = parseInt(resultArray[i][0])+1;
        }
    }
    while(coloredCode.includes('&&&rownum&&&')) {
        coloredCode = coloredCode.replace('&&&rownum&&&', '');
    }
    return coloredCode;
}
function createGraph(table, tableBools){
    var diagram = new go.Diagram('graph');
    var $2 = go.GraphObject.make;

    var toAddNodes = getNodes($2, table, tableBools, ((eval('['+$('#inputPlaceHolder').val()+']').length) == 0) );
    $('#htmlCode').append(makeTableHTML(toAddNodes));
    var toAddLinks = getLinks($2, toAddNodes, [[toAddNodes[0][0], '']], 1);

    for(let i = 0; i< toAddNodes.length;i++){
        var node = (toAddNodes[i][0]);
        diagram.add(node);
    }
    for(let i = 0; i< toAddLinks.length;i++){
        var link = (toAddLinks[i]);
        diagram.add(link);
    }
}

function createColoredCode(coloredCode, document, resultArray){
    coloredCode = replaceAll(coloredCode, '\n', '</p><p &&&rownum&&&>');
    coloredCode = replaceAll(coloredCode, '    ', '&nbsp;&nbsp;&nbsp;&nbsp;');
    coloredCode = '<p &&&rownum&&&>' + coloredCode + '</p>';
    let list = document.getElementById('outputCodeColor');
    while(list.childNodes.length !== 0) list.removeChild(list.childNodes[0]);
    coloredCode = colorIfs(coloredCode, resultArray);
    $('#outputCodeColor').append(coloredCode);
    return coloredCode;
}

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        let parsedCodeTable = ParseTable(parsedCode, []);
        let bindingTable = [];
        let codeAfterSymSub = symbolicSubstitute(parsedCode,bindingTable,0);
        $('#outputCode').val(codeAfterSymSub);
        var list = document.getElementById('htmlCode');
        while(list.childNodes.length !== 0) list.removeChild(list.childNodes[0]);
        $('#htmlCode').append(makeTableHTML(parsedCodeTable));
        let resultArray = calculateResult(ParseTable(parseCode(codeAfterSymSub),[]),eval('['+$('#inputPlaceHolder').val()+']'));
        $('#htmlCode').append(makeTableHTML(resultArray)); createColoredCode(codeAfterSymSub, document, resultArray);
        parsedCodeTable = dyeMyIf(parsedCodeTable, resultArray, ((eval('['+$('#inputPlaceHolder').val()+']').length) == 0));
        var parsedCodeTableBackup = parsedCodeTable.map(function(arr) { return arr.slice(); });
        parsedCodeTable = calculateAll(parsedCodeTable, eval('['+$('#inputPlaceHolder').val()+']'));
        createGraph(parsedCodeTableBackup, parsedCodeTable);
    });
});

export {ParseTable};



