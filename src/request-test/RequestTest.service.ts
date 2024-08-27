import { Injectable } from "@nestjs/common";
import { RequestTestContract } from "./RequestTest.contract";

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
export class RequestTestService {
  constructor() {
  }

  postRequest(requestTestContract: RequestTestContract): RequestTestContract {
    return requestTestContract
  }
}
