import { Injectable } from "@nestjs/common";
import * as ts from "typescript";
import fs from "fs";
import { CodeGenerationContract } from "./CodeGeneration.contract";
import { utilsFunctionsString } from "./CodeTemplate";

/**
 * example code generation tamplate:
 *
 * applicationModel.entities.forEach(entity => {
 *     writeQueue.push({
 *         path: `D:\\repo\\application-be\\src\\application\\contracts`,
 *         fileName: `${entity.name}.ts`,
 *         code: generateCode(entity)
 *     })
 * })
 *
 * keywards: applicationModel, writeQueue, generateCode
 *
 * applicationModel: application model object
 * writeQueue: write file job array
 * generateCode: code template function
 */

export interface CodeGenerationOutput {
  output: string;
}

@Injectable()
export class CodeGenerationService {
  constructor() {
  }

  buildExecutableFunction(codeTemplateString: string): string {
    const functionString = `
    let result = ""
    ${utilsFunctionsString}
      
    function generateCode(data) {
      result = ""
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
    let writeQueue = [];

    eval(ts.transpile(functionString + codeGenerationTemplate));

    writeQueue.forEach(writeToFile => {
      fs.mkdir(writeToFile.path,{recursive:true},(err) => {
        if(err) {
          console.warn(err)
        }
      })

      fs.writeFile(
        writeToFile.path + "\\" + writeToFile.fileName,
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
