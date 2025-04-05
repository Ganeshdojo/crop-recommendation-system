declare module "*.json" {
  const value: {
    [key: string]: {
      image: string;
      growingConditions: {
        Temperature: string;
        Rainfall: string;
        "Growth Period": string;
        "Optimal pH": string;
        GrowthPeriod?: string;
        OptimalpH?: string;
      };
      soilRequirements: {
        nitrogen?: string;
        phosphorus?: string;
        potassium?: string;
        ph?: string;
        Nitrogen?: string;
        Phosphorus?: string;
        Potassium?: string;
        pH?: string;
      };
      description: string;
    };
  };
  export default value;
}