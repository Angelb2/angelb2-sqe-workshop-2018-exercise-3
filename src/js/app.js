import $ from 'jquery';
import {parseCode, ParseTable, makeTableHTML, symbolicSubstitute, calculateResult} from './code-analyzer';
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
        $('#htmlCode').append(makeTableHTML(resultArray));
        createColoredCode(codeAfterSymSub, document, resultArray);
    });
});

export {ParseTable};



