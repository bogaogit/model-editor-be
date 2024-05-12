export interface CodeGenerationContract {
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
