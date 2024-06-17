
export interface CodeGenerationRequestContract {
  entityData: any,
  applicationModelObject: any
}

export interface RequestTestContract {
  codeTemplateData: CodeTemplateData,
  applicationModelObject: any
}

export interface CodeTemplateData {
  codeGenerationTemplate?: string
  outputPathTemplate?: string
  outputNameTemplate?: string
  codeTemplate?: CodeTemplate;
}

interface CodeTemplate {
  codeTemplateString: string;
  targetMetaModelId?: string;
  targetEntityDataId?: string;
}
