import React, { useState, useCallback, useEffect } from 'react';
import { Scenario, ScenarioOption } from './types';
import Header from './components/Header';
import ScenarioSelector from './components/ScenarioSelector';
import ImageUploader from './components/ImageUploader';
import Button from './components/Button';
import MockupDisplay from './components/MockupDisplay';
import { generateBaseImage, editImage } from './services/geminiService';
import { useTranslation } from './hooks/useTranslation';
import AspectRatioSelector from './components/AspectRatioSelector';

const SCENARIO_OPTIONS: ScenarioOption[] = [
  {
    id: Scenario.SITTING_FRAME,
    title: 'Woman Sitting with Frame',
    description: 'An elegant woman sitting in a stylish interior, holding a frame for your design.',
    image: 'https://picsum.photos/seed/sitting/400/300',
    requiresDesign: 'frame',
  },
  {
    id: Scenario.STANDING_FRAME,
    title: 'Woman Standing with Frame',
    description: 'A professional shot of a woman standing and presenting a frame for your artwork.',
    image: 'https://picsum.photos/seed/standing/400/300',
    requiresDesign: 'frame',
  },
  {
    id: Scenario.ARMCHAIR_FRAME,
    title: 'Woman in Armchair with Frame',
    description: 'A cozy, high-end scene of a woman on an armchair holding a frame.',
    image: 'https://picsum.photos/seed/armchair/400/300',
    requiresDesign: 'frame',
  },
  {
    id: Scenario.ARMCHAIR_CHANDELIER,
    title: 'Woman with Chandelier (Classic)',
    description: 'A woman in a classic interior points to a ceiling fixture, ready for your lighting design.',
    image: 'https://picsum.photos/seed/chandelier/400/300',
    requiresDesign: 'chandelier',
  },
  {
    id: Scenario.GALLERY_CHANDELIER,
    title: 'Art Gallery Chandelier',
    description: 'Showcase your light fixture as a work of art in a minimalist, modern gallery.',
    image: 'https://picsum.photos/seed/gallery/400/300',
    requiresDesign: 'chandelier',
  },
  {
    id: Scenario.GOTHIC_CHANDELIER,
    title: 'Gothic Manor Chandelier',
    description: 'A dramatic, moody scene in a grand hall, perfect for a classic or fantasy design.',
    image: 'https://picsum.photos/seed/gothic/400/300',
    requiresDesign: 'chandelier',
  },
  {
    id: Scenario.PATIO_CHANDELIER,
    title: 'Bohemian Patio Chandelier',
    description: 'A warm, cozy outdoor patio at dusk, ideal for rustic or modern hanging lights.',
    image: 'https://picsum.photos/seed/patio/400/300',
    requiresDesign: 'chandelier',
  },
  {
    id: Scenario.PRODUCT_SHELF,
    title: 'Product on Store Shelf',
    description: 'Showcase your product on a brightly lit, modern retail shelf.',
    image: 'https://picsum.photos/seed/shelf/400/300',
    requiresDesign: 'product',
  },
  {
    id: Scenario.OFFICE_SCREEN,
    title: 'App on Office Screen',
    description: 'Display your app or website on a sleek monitor in a modern office.',
    image: 'https://picsum.photos/seed/screen/400/300',
    requiresDesign: 'screen',
  },
  {
    id: Scenario.TSHIRT_MODEL,
    title: 'T-Shirt on Model',
    description: 'Your design printed on a t-shirt worn by a model in a studio setting.',
    image: 'https://picsum.photos/seed/tshirt/400/300',
    requiresDesign: 'apparel',
  },
  {
    id: Scenario.CITY_BILLBOARD,
    title: 'Billboard in Neon City',
    description: 'Your ad on a giant billboard in a vibrant, futuristic city at night.',
    image: 'https://picsum.photos/seed/billboard/400/300',
    requiresDesign: 'billboard',
  },
  {
    id: Scenario.COFFEE_MUG,
    title: 'Logo on Coffee Mug',
    description: 'Your design on a mug held in a cozy cafe with a blurred background.',
    image: 'https://picsum.photos/seed/mug/400/300',
    requiresDesign: 'mug_design',
  },
  {
    id: Scenario.COSMETIC_JAR,
    title: 'Luxury Cosmetic Jar',
    description: 'Display your brand on a premium cosmetic jar on an elegant marble surface.',
    image: 'https://picsum.photos/seed/cosmetic/400/300',
    requiresDesign: 'label',
  },
];

const PROMPTS = {
  base: {
    [Scenario.SITTING_FRAME]: 'DSLR photograph, fashion magazine style. An elegant woman sits in a chic, minimalist apartment with soft, natural light from a large window. She holds a large, simple, matte black frame. The interior of the frame is a solid, vibrant magenta color (#FF00FF) to serve as a placeholder. The frame is held flat, facing the camera. Shallow depth of field with a slightly blurred background. 4K, hyper-realistic, sharp focus on the woman and frame.',
    [Scenario.STANDING_FRAME]: 'Professional studio photograph, full-body shot. An elegant woman stands against a clean, neutral grey studio background. She holds a large, simple, matte black frame. The interior of the frame is a solid, vibrant magenta color (#FF00FF) as a clear placeholder. The frame is held perfectly flat towards the camera. The lighting is soft and even, mimicking a high-end fashion shoot. 4K, hyper-realistic, tack-sharp details.',
    [Scenario.ARMCHAIR_FRAME]: 'Cozy and luxurious interior photograph. An elegant woman relaxes in a plush, designer armchair. She holds a medium-sized, ornate wooden frame. The placeholder area inside the frame is a solid, vibrant magenta color (#FF00FF). The scene is lit with warm, soft ambient light, creating a comfortable and sophisticated atmosphere. Shallow depth of field. 4K, hyper-realistic, rich textures.',
    [Scenario.ARMCHAIR_CHANDELIER]: 'Dramatic, elegant interior photograph. A woman in a stylish armchair in a luxurious room with a high ceiling looks up and points. Above her, hanging from the ceiling, is a simple, placeholder light fixture emitting a distinct, vibrant magenta glow (#FF00FF). This is the object to be replaced. The overall scene has moody, cinematic lighting. 4K, hyper-realistic, professional color grading.',
    [Scenario.GALLERY_CHANDELIER]: 'Professional photograph, wide-angle shot of a minimalist, white-walled art gallery with polished concrete floors. A stylishly dressed woman stands in the center, looking up in admiration. The gallery is empty except for her. Hanging from the high ceiling is a single, glowing magenta (#FF00FF) placeholder object, positioned as if it\'s a central art installation. The lighting is clean and diffuse, with soft shadows, typical of a high-end gallery. 4K, hyper-realistic, sophisticated atmosphere.',
    [Scenario.GOTHIC_CHANDELIER]: 'Cinematic photograph, moody and atmospheric. A woman in a long, elegant velvet gown stands in the center of a vast, gothic-style manor library with towering, dark wood bookshelves and a vaulted ceiling. A large, circular window at the back lets in faint moonlight. The only significant light source is a large, brightly glowing magenta (#FF00FF) placeholder object hanging from the center of the ceiling. The woman gestures gracefully towards it. The scene has high contrast, deep shadows, and a sense of timeless grandeur. 8K resolution, hyper-realistic, rich textures of wood and fabric.',
    [Scenario.PATIO_CHANDELIER]: 'Lifestyle photograph taken at dusk, golden hour lighting. A relaxed woman sits on a comfortable outdoor sofa on a beautifully decorated bohemian-style patio with lush potted plants and string lights in the background. Above the seating area, hanging from a wooden pergola, is a glowing magenta (#FF00FF) placeholder for a chandelier. The atmosphere is warm, cozy, and inviting with a shallow depth of field (bokeh). 4K, hyper-realistic, soft and warm tones.',
    [Scenario.PRODUCT_SHELF]: 'Commercial product photograph of a modern, brightly-lit retail shelf made of light wood and metal. On the shelf, in the center, is a simple, solid magenta (#FF00FF) cube acting as a placeholder for a product. The background is filled with generic, out-of-focus products to create a realistic store environment. Clean, minimalist aesthetic. 4K, hyper-realistic, tack-sharp focus on the magenta placeholder.',
    [Scenario.OFFICE_SCREEN]: 'Professional photograph of a modern, sleek office environment. A high-end, bezel-less computer monitor sits on a clean, wooden desk. The monitor is turned on and displays a solid, vibrant magenta color (#FF00FF) as a placeholder for a UI design. A window in the background provides soft, natural light, creating subtle reflections on the screen. The background is stylishly blurred (bokeh effect). 4K, hyper-realistic.',
    [Scenario.TSHIRT_MODEL]: 'E-commerce fashion photograph. A model stands against a plain, off-white studio background. The model is wearing a high-quality, plain t-shirt. On the front of the t-shirt is a large, perfectly centered, solid magenta (#FF00FF) rectangle, serving as a clear placeholder for a design. The lighting is bright and even, with no harsh shadows. The focus is on the t-shirt. 4K, hyper-realistic, clean aesthetic.',
    [Scenario.CITY_BILLBOARD]: 'Ultra-realistic, cinematic photograph of a bustling city street at night, inspired by Tokyo\'s Shibuya Crossing. Towering skyscrapers with glowing neon signs. One massive, central digital billboard is turned on but displays only a solid, vibrant magenta color (#FF00FF) as a placeholder. Rain-slicked streets reflect the city lights. Long exposure effect with light trails from cars. Moody, cyberpunk aesthetic. 8K resolution, hyper-detailed.',
    [Scenario.COFFEE_MUG]: 'Shallow depth of field, professional cafe photograph. A person\'s hands are holding a clean, white ceramic coffee mug. The focus is on the mug. On the side of the mug facing the camera is a perfectly centered, solid magenta (#FF00FF) rectangle as a placeholder for a logo. The background is a warm, cozy, out-of-focus cafe with bokeh lights. Natural light from a window illuminates the scene. 4K, hyper-realistic, inviting atmosphere.',
    [Scenario.COSMETIC_JAR]: 'Luxury product photography. A premium, minimalist cosmetic jar (like a face cream jar) sits on a white marble vanity. Next to it are a few delicate rose petals and subtle water droplets. The jar is unbranded, but the area for the main label is a solid, vibrant magenta color (#FF00FF). The lighting is soft, diffuse, and elegant, creating soft shadows and highlights on the jar\'s glossy surface. 4K, hyper-realistic, clean and sophisticated aesthetic.',
  },
  edit: {
    frame: 'Find the vibrant magenta area (#FF00FF) inside the frame and replace it perfectly with the provided user design. The design should inherit the scene\'s lighting, perspective, and any subtle shadows or reflections. Integrate it seamlessly for a photorealistic result.',
    chandelier: 'Replace the glowing magenta placeholder light fixture with the user-provided chandelier design. The new chandelier must be integrated into the ceiling, become the primary light source for the top of the scene, glow realistically, and cast accurate light and shadows onto the room and the woman below.',
    product: 'Find the magenta cube placeholder on the shelf and replace it entirely with the provided user product image. The product should sit realistically on the shelf, adopting the scene\'s lighting and casting a soft, accurate shadow. The final image should look like a professional product shot.',
    screen: 'Find the magenta area (#FF00FF) on the monitor screen and replace it perfectly with the provided user UI design. The design should look like it is being displayed on a backlit screen, with a slight emissive glow. Preserve any natural screen reflections from the scene to maintain realism.',
    apparel: 'Find the magenta rectangular placeholder (#FF00FF) on the t-shirt and replace it with the provided user design. The design must warp and conform perfectly to the t-shirt\'s fabric, including any wrinkles, folds, and shadows. The texture of the fabric should be visible through the design for maximum realism.',
    billboard: 'Find the large, glowing magenta billboard (#FF00FF) in the image. Replace the magenta area entirely with the provided user\'s design. The design must look like it\'s being displayed on a realistic, emissive LED screen. It should be bright, casting a subtle colored light onto nearby surfaces and the wet street below. Ensure the perspective is perfect.',
    mug_design: 'Locate the magenta rectangular placeholder (#FF00FF) on the white coffee mug. Apply the user\'s design onto this area. The design must curve and distort naturally to match the mug\'s cylindrical shape. It should adopt the scene\'s lighting, with realistic highlights and shadows. The texture of the ceramic should subtly show through the design.',
    label: 'Find the magenta placeholder area (#FF00FF) on the cosmetic jar. Replace it with the user\'s label design. The label must wrap perfectly around the jar\'s curved surface. It should inherit the glossy reflections and lighting from the environment, making it look like a real, printed label on a high-end product. Ensure the integration is seamless and photorealistic.',
  }
};

const CATEGORY_TITLES: Record<string, string> = {
  frame: 'Frame Mockups',
  chandelier: 'Chandelier Mockups',
  product: 'Product Mockups',
  screen: 'Screen & App Mockups',
  apparel: 'Apparel Mockups',
  billboard: 'Billboard Mockups',
  mug_design: 'Coffee Mug Mockups',
  label: 'Cosmetic & Label Mockups'
};

const SCENARIO_CATEGORIES = SCENARIO_OPTIONS.reduce((acc, scenario) => {
  const category = scenario.requiresDesign;
  if (category !== 'none') {
    if (!acc[category]) {
      acc[category] = {
        title: CATEGORY_TITLES[category] || `${category.replace('_', ' ')} Mockups`,
        scenarios: [],
      };
    }
    acc[category].scenarios.push(scenario);
  }
  return acc;
}, {} as Record<string, { title: string; scenarios: ScenarioOption[] }>);

const categoryKeys = Object.keys(SCENARIO_CATEGORIES);

const App: React.FC = () => {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryKeys[0]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIO_CATEGORIES[categoryKeys[0]].scenarios[0].id);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [applyTiltShift, setApplyTiltShift] = useState<boolean>(false);
  
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.body.className = `bg-gray-100 dark:bg-gray-800`;
  }, [theme]);
  
  const handleImageUpload = useCallback((base64: string, mime: string, dataUrl: string) => {
    setUploadedImage(base64);
    setMimeType(mime);
    setPreviewUrl(dataUrl);
  }, []);

  const handleClearImage = useCallback(() => {
    setUploadedImage('');
    setMimeType('');
    setPreviewUrl(null);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setSelectedScenario(SCENARIO_CATEGORIES[category].scenarios[0].id);
    handleClearImage();
    setGeneratedImage(null);
  }, [handleClearImage]);

  const handleScenarioChange = useCallback((scenario: Scenario) => {
    setSelectedScenario(scenario);
  }, []);
  
  const handleToggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleGenerate = async () => {
    const scenarioInfo = SCENARIO_OPTIONS.find(s => s.id === selectedScenario);
    if (!scenarioInfo || scenarioInfo.requiresDesign === 'none') {
        setError("Please select a valid scenario that requires a design.");
        return;
    }
    if (!uploadedImage) {
      setError("Please upload a design image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      setLoadingStep(t('generatingScene'));
      const basePrompt = PROMPTS.base[selectedScenario];
      const baseImageB64 = await generateBaseImage(basePrompt, aspectRatio);
      
      setLoadingStep(t('compositingDesign'));
      
      const designType = scenarioInfo.requiresDesign;
      let editPrompt = PROMPTS.edit[designType];

      if (applyTiltShift) {
        editPrompt += ' Finally, apply a strong, convincing tilt-shift photography effect to the entire image. The focus should be sharp on the user\'s design and the immediate area around it, with the foreground and background heavily blurred to create a miniature, toy-like appearance. The effect should be artistic and professional.';
      }

      const finalImageB64 = await editImage(baseImageB64, uploadedImage, mimeType, editPrompt);

      setGeneratedImage(`data:image/png;base64,${finalImageB64}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleDownload = useCallback(() => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'ai-mockup.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [generatedImage]);
  
  const currentScenario = SCENARIO_OPTIONS.find(s => s.id === selectedScenario);
  const fontSizeClass = `font-size-${fontSize}`;

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 ${fontSizeClass}`}>
      <Header 
        theme={theme}
        onThemeChange={setTheme}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        onToggleFullScreen={handleToggleFullScreen}
      />
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <div className="space-y-8">
            <div className="space-y-8 p-6 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <ScenarioSelector 
                categories={SCENARIO_CATEGORIES}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategoryChange}
                selectedScenario={selectedScenario}
                onSelectScenario={handleScenarioChange}
              />
               <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
            </div>

            {currentScenario && currentScenario.requiresDesign !== 'none' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('step2Title')}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t('step2Subtitle', { designType: currentScenario.requiresDesign.replace('_', ' ') })}
                </p>
                <ImageUploader 
                  onImageUpload={handleImageUpload}
                  onClearImage={handleClearImage}
                  previewUrl={previewUrl}
                  designType={currentScenario.requiresDesign}
                />
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('step3Title')}</h2>
              <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <label htmlFor="tilt-shift-toggle" className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      id="tilt-shift-toggle" 
                      className="sr-only peer"
                      checked={applyTiltShift}
                      onChange={(e) => setApplyTiltShift(e.target.checked)}
                    />
                    <div className="w-14 h-8 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-gray-800 dark:peer-checked:bg-gray-500 transition-colors"></div>
                    <div className="absolute left-1 top-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform peer-checked:translate-x-full"></div>
                  </div>
                  <div className="ml-4 rtl:mr-4 rtl:ml-0 text-gray-700 dark:text-gray-200 font-medium">
                    {t('tiltShiftEffect')}
                  </div>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 ml-18 rtl:mr-18 rtl:ml-0 pl-1 rtl:pr-1">
                  {t('tiltShiftDescription')}
                </p>
              </div>
            </div>
            
            <div className="text-center pt-4">
               <Button 
                onClick={handleGenerate}
                disabled={isLoading || (currentScenario?.requiresDesign !== 'none' && !uploadedImage)}
              >
                {isLoading ? t('generatingButton') : t('generateButton')}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sticky top-12 h-max">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t('step4Title')}</h2>
             <MockupDisplay
              isLoading={isLoading}
              loadingStep={loadingStep}
              error={error}
              generatedImage={generatedImage}
              aspectRatio={aspectRatio}
            />
            {generatedImage && !isLoading && !error && (
              <div className="mt-6 text-center">
                <Button onClick={handleDownload} variant="secondary">
                  {t('downloadButton')}
                </Button>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
