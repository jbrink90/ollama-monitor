type ModelBrand = {
  name: string;
  icon: string;
};

const modelBrands: Array<{
  match: RegExp;
  brand: ModelBrand;
}> = [
  {
    match: /^qwen/i,
    brand: {
      name: "Qwen",
      icon: "/brands/qwen.svg",
    },
  },
  {
    match: /^(llama|codellama)/i,
    brand: {
      name: "Llama",
      icon: "/brands/meta.svg",
    },
  },
  {
    match: /^gemma/i,
    brand: {
      name: "Gemma",
      icon: "/brands/google.svg",
    },
  },
  {
    match: /^mistral/i,
    brand: {
      name: "Mistral",
      icon: "/brands/mistral.svg",
    },
  },
  {
    match: /^phi/i,
    brand: {
      name: "Microsoft",
      icon: "/brands/microsoft.svg",
    },
  },
  {
    match: /^deepseek/i,
    brand: {
      name: "DeepSeek",
      icon: "/brands/deepseek.svg",
    },
  },
];

export function getModelBrand(modelName: string): ModelBrand {
  const match = modelBrands.find((entry) =>
    entry.match.test(modelName)
  );

  return (
    match?.brand ?? {
      name: "Unknown model",
      icon: "/brands/model-default.svg",
    }
  );
}