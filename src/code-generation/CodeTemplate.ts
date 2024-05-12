import * as ts from 'typescript';


export const utilsFunctionsString = `
function cc(
    inputString: string,
): string {
    return lf(pc(inputString));
}

function pc(
    inputString: string,
): string {
    return inputString
        .match(/[a-z,0-9]+/gi)
        .map(function (word) {
            return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
        })
        .join("");
}

function lf(
    inputString: string,
): string {
    return inputString.charAt(0).toLowerCase() + inputString.slice(1);
}

function a(
    inputString: string,
): string {
    result += "\\n" + inputString
}

function al(
    inputString: string,
): string {
    result += inputString
}

`

export class CodeTemplate {
    static generateCode(
        codeTemplateString: string,
        data: any
    ): string {
        let result = ""
        try {
            eval(ts.transpile(utilsFunctionsString + codeTemplateString));
            return result + ""
        } catch (e) {
            return "Code Template has errors: " + e
        }
    }
}
