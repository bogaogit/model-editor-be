import * as ts from 'typescript';


export const utilsFunctionsString = `
function cc(
    inputString: string,
): string {
    if (inputString){
        return lf(pc(inputString));
    } else {
        return "";
    }
}

function pc(
    inputString: string,
): string {
    if (inputString){
        return inputString
            .match(/[a-z,0-9]+/gi)
            .map(function (word) {
                return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
            })
            .join("");
    } else {
        return "";
    }
}

function lf(
    inputString: string,
): string {
    if (inputString){
        return inputString.charAt(0).toLowerCase() + inputString.slice(1);
    } else {
        return "";
    }
}

function a(
    inputString: string,
): string {
    output += "\\n" + inputString
}

function al(
    inputString: string,
): string {
    output += inputString
}

`
