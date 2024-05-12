import { Injectable } from "@nestjs/common";
import * as ts from "typescript";
import fs from "fs";
import { CodeGenerationContract } from "./CodeGeneration.contract";
import { utilsFunctionsString } from "./CodeTemplate";

export interface CodeGenerationOutput {
  output: string;
}

@Injectable()
export class CodeGenerationService {
  constructor() {
  }

  buildExecutableFunction(codeTemplateString: string): string {
    const functionString = `
    ${utilsFunctionsString}
    
    function output(data) {
      let result = ""
      ${codeTemplateString}
      return result
    }
    
    `;

    return functionString;
  }

  generateCode(codeGenerationContract: CodeGenerationContract): CodeGenerationOutput {
    const codeTemplateString = codeGenerationContract.codeTemplateData.codeTemplate.codeTemplateString;
    const { codeGenerationTemplate } = codeGenerationContract.codeTemplateData;

    const functionString = this.buildExecutableFunction(codeTemplateString);

    const applicationModel = codeGenerationContract.applicationModelObject;
    let writeToFileBuffer = [];

    eval(ts.transpile(functionString + codeGenerationTemplate));

    console.log("********************");
    console.log(writeToFileBuffer);


    writeToFileBuffer.forEach(writeToFile => {
      fs.writeFile(
        writeToFile.path,
        writeToFile.code,
        (err) => {
          console.log(err);
        });
    });

    return {
      output: "code generated !! from" + codeGenerationContract.codeTemplateData.codeTemplate.codeTemplateString
    };
  }
}
