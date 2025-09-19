export enum Scenario {
  SITTING_FRAME = 'SITTING_FRAME',
  STANDING_FRAME = 'STANDING_FRAME',
  ARMCHAIR_FRAME = 'ARMCHAIR_FRAME',
  ARMCHAIR_CHANDELIER = 'ARMCHAIR_CHANDELIER',
  GALLERY_CHANDELIER = 'GALLERY_CHANDELIER',
  GOTHIC_CHANDELIER = 'GOTHIC_CHANDELIER',
  PATIO_CHANDELIER = 'PATIO_CHANDELIER',
  PRODUCT_SHELF = 'PRODUCT_SHELF',
  OFFICE_SCREEN = 'OFFICE_SCREEN',
  TSHIRT_MODEL = 'TSHIRT_MODEL',
  CITY_BILLBOARD = 'CITY_BILLBOARD',
  COFFEE_MUG = 'COFFEE_MUG',
  COSMETIC_JAR = 'COSMETIC_JAR',
}

export type DesignType = 'frame' | 'chandelier' | 'product' | 'screen' | 'apparel' | 'billboard' | 'mug_design' | 'label';

export interface ScenarioOption {
  id: Scenario;
  title: string;
  description: string;
  image: string;
  requiresDesign: DesignType | 'none';
}
