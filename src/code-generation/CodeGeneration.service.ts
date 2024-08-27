import { Injectable } from "@nestjs/common";
import * as ts from "typescript";
import fs from "fs";
import { CodeGenerationContract } from "./CodeGeneration.contract";
import { utilsFunctionsString } from "./CodeTemplate";
import { cc } from "./CodeTemplate.utils";

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
    let output = ""
    ${utilsFunctionsString}
      
    function generateCode(input) {
      output = ""
      ${codeTemplateString}
      return output
    }
    
    `;

    return functionString;
  }

  includeAllFunctions(applicationModel: any): string {
    let functionsString = ""

    applicationModel.codeTemplateFunctions.forEach(codeTemplateFunction => {
      functionsString += `
      function ${cc(codeTemplateFunction.name)}(input: any) {
        ${codeTemplateFunction.code.codeTemplateString}
      }
      `
    })

    return functionsString;
  }

  generateCode(codeGenerationContract: CodeGenerationContract): CodeGenerationOutput {
    const codeTemplateString = codeGenerationContract.codeTemplateData.codeTemplate.codeTemplateString;
    const { codeGenerationTemplate } = codeGenerationContract.codeTemplateData;

    const functionString = this.buildExecutableFunction(codeTemplateString);

    const commonFunctionString = this.includeAllFunctions(codeGenerationContract.applicationModelObject);

    const applicationModel = codeGenerationContract.applicationModelObject;
    let writeQueue = [];

    eval(ts.transpile(functionString + commonFunctionString + codeGenerationTemplate));

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
      output: "code generated!!"
    };
  }

  generateCodeAllTemplates(codeGenerationContract: CodeGenerationContract): CodeGenerationOutput {
    const applicationModel = codeGenerationContract.applicationModelObject;
    applicationModel.codeTemplateGroups.forEach(codeTemplateGroup => {
      codeTemplateGroup.codeTemplates.forEach(codeTemplate => {
        if (codeTemplate.disabled !== true){
          const contract: CodeGenerationContract = {
            codeTemplateData: {
              codeTemplate: {
                codeTemplateString: codeTemplate.codeTemplate.codeTemplateString
              },
              codeGenerationTemplate: codeTemplate.codeGenerationTemplate
            },
            applicationModelObject: applicationModel
          }

          this.generateCode(contract)
        }
      })
    })

    return {
      output: "code generated from all templates!!"
    };
  }
}
