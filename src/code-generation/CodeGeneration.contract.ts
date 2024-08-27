
export interface CodeGenerationRequestContract {
  entityData: any,
  applicationModelObject: any
}

export interface CodeGenerationContract {
  codeTemplateData: CodeTemplateData,
  applicationModelObject: any
}

export interface CodeTemplateData {
  codeGenerationTemplate?: string
  codeTemplate?: CodeTemplate;
}

interface CodeTemplate {
  codeTemplateString: string;
}
