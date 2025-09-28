import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Scenario, ScenarioOption } from './types';
import Header from './components/Header';
import ScenarioSelector from './components/ScenarioSelector';
import ImageUploader from './components/ImageUploader';
import Button from './components/Button';
import MockupDisplay from './components/MockupDisplay';
import { generateBaseImage, editImage, applyArtisticStyle } from './services/geminiService';
import { useTranslation } from './hooks/useTranslation';
import AspectRatioSelector from './components/AspectRatioSelector';
import VariationCountSelector from './components/VariationCountSelector';
import ArtisticStyleSelector from './components/ArtisticStyleSelector';
import ToggleSwitch from './components/ToggleSwitch';

const PROMPTS = {
  base: {
    [Scenario.SITTING_FRAME]: 'DSLR photograph, fashion magazine style. An elegant woman sits in a chic, minimalist apartment with soft, natural light from a large window. She holds a large, simple, natural oak wood frame. The interior of the frame is a solid, vibrant magenta color (#FF00FF) to serve as a placeholder. The frame is held flat, facing the camera. Shallow depth of field with a slightly blurred background. 4K, hyper-realistic, sharp focus on the woman and frame.',
    [Scenario.STANDING_FRAME]: 'Professional studio photograph, full-body shot. An elegant woman stands against a clean, neutral grey studio background. She holds a large, simple, elegant walnut wood frame. The interior of the frame is a solid, vibrant magenta color (#FF00FF) as a clear placeholder. The frame is held perfectly flat towards the camera. The lighting is soft and even, mimicking a high-end fashion shoot. 4K, hyper-realistic, tack-sharp details.',
    [Scenario.ARMCHAIR_FRAME]: 'Cozy and luxurious interior photograph. An elegant woman relaxes in a plush, designer armchair. She holds a medium-sized, ornate dark cherry wood frame. The placeholder area inside the frame is a solid, vibrant magenta color (#FF00FF). The scene is lit with warm, soft ambient light, creating a comfortable and sophisticated atmosphere. Shallow depth of field. 4K, hyper-realistic, rich textures.',
    [Scenario.HOME_FRAME]: 'DSLR photograph of a modern, well-lit home entryway. On a clean, white wall, there is a large, simple, light birch wood frame hanging. The interior of the frame is a solid, vibrant magenta color (#FF00FF) as a placeholder. The scene includes a stylish console table with a vase of flowers and a decorative lamp. The lighting is bright and natural. 4K, hyper-realistic, architectural digest style.',
    [Scenario.KITCHEN_FRAME]: 'Professional photograph of a spacious, modern gourmet kitchen with white marble countertops and dark wood cabinets. On a tiled backsplash wall, there is a medium-sized, simple, rustic pine wood frame. The interior of the frame is a solid, vibrant magenta color (#FF00FF) placeholder. The kitchen is clean and tidy, with some tasteful decor like a bowl of fruit. The scene is bathed in bright, natural light from a window. 4K, hyper-realistic, sharp focus.',
    [Scenario.LIVING_ROOM_FRAME]: 'Interior design photograph of a cozy, contemporary living room. A comfortable fabric sofa is against a feature wall. Hanging centered above the sofa is a large, elegant brushed bronze metal frame. The placeholder area inside the frame is a solid, vibrant magenta color (#FF00FF). The room is decorated with plush cushions, a coffee table, and a rug. Warm, inviting ambient light. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.BEDROOM_FRAME]: 'Photograph of a serene and minimalist bedroom. A neatly made bed with high-quality linens is the centerpiece. On the wall above the headboard hangs a medium-sized, warm teak wood frame. The interior of the frame is a solid, vibrant magenta color (#FF00FF) placeholder. Soft morning light streams in through a sheer-curtained window. The atmosphere is peaceful and calm. 4K, hyper-realistic.',
    [Scenario.KIDS_ROOM_FRAME]: 'Bright and cheerful photograph of a modern, playful kids\' room. The room has colorful walls and fun furniture. On one wall, above a small desk, hangs a simple, pale blue painted frame. The interior of the frame is a solid, vibrant magenta color (#FF00FF) placeholder. The room is filled with toys and books, creating a lively atmosphere. Bright, even lighting. 4K, hyper-realistic.',
    [Scenario.HALL_FRAME]: 'Architectural photograph of a long, elegant hallway in a modern home. Multiple frames are arranged in a gallery wall style. One of the frames, centrally located, is a simple dark gray slate frame with a solid, vibrant magenta color (#FF00FF) placeholder inside. The hallway is well-lit with recessed lighting. 4K, hyper-realistic, clean lines.',
    [Scenario.LIBRARY_FRAME]: 'Photograph of a classic, cozy home library with floor-to-ceiling dark wood bookshelves filled with books. There is a comfortable leather armchair and a reading lamp. On the wall, among the shelves, hangs a medium-sized, antique-style mahogany frame with a solid, vibrant magenta (#FF00FF) placeholder. The lighting is warm and atmospheric. 4K, hyper-realistic.',
    [Scenario.MINIMALIST_DESK_FRAME]: 'A clean, minimalist home office scene. A sleek wooden desk is placed against a plain white wall. On the desk, leaning against the wall, is a simple, thin-bezel brushed aluminum frame. The inside of the frame is a solid, vibrant magenta color (#FF00FF) placeholder. The setup includes a modern laptop, a small plant, and a stylish pen holder. Natural light from the side. 4K, hyper-realistic.',
    [Scenario.CREATIVE_STUDIO_FRAME]: 'Photograph of a bright, airy artist\'s studio. The room has white brick walls and large windows. In the center, an easel holds a large, plain pine canvas frame. The canvas area is a solid, vibrant magenta color (#FF00FF) placeholder. The studio is filled with art supplies like paints, brushes, and canvases. The lighting is bright and inspiring. 4K, hyper-realistic.',
    [Scenario.OUTDOOR_CAFE_FRAME]: 'DSLR lifestyle photograph. A person is sitting at a stylish outdoor cafe, holding a medium-sized, simple weathered grey wood frame. The inside of the frame is a solid, vibrant magenta color (#FF00FF) placeholder. The background shows a blurred city street scene with warm afternoon light. Shallow depth of field, focusing on the person and the frame. 4K, hyper-realistic.',
    [Scenario.CORPORATE_BOARDROOM_FRAME]: 'Professional photograph of a modern, executive corporate boardroom. A long, polished table is surrounded by sleek chairs. On the main wall, there is a large, minimalist dark oak frame. The inside of the frame is a solid, vibrant magenta color (#FF00FF) placeholder. The room is well-lit with cool, professional lighting. 4K, hyper-realistic.',
    [Scenario.LUXURY_HOTEL_LOBBY_FRAME]: 'Photograph of an opulent, five-star hotel lobby. The decor is luxurious with marble floors and grand chandeliers. On a prominent wall, a very large, ornate polished brass frame is hanging. The inside of the frame is a solid, vibrant magenta color (#FF00FF) placeholder. The atmosphere is exclusive and high-end. 4K, hyper-realistic.',
    [Scenario.MODERN_OFFICE_RECEPTION_FRAME]: 'A bright, welcoming reception area of a modern tech company. Behind the sleek reception desk, on a clean feature wall, hangs an elegant brushed stainless steel frame. The placeholder area inside the frame is a solid, vibrant magenta color (#FF00FF). The company logo is subtly visible elsewhere. The lighting is bright and contemporary. 4K, hyper-realistic.',
    [Scenario.ARCHITECTS_OFFICE_FRAME]: 'An inspiring, creative architect\'s office. Blueprints and models are on a large work table. On a concrete wall, a simple, industrial-style raw steel frame is hanging. The placeholder area is a solid, vibrant magenta color (#FF00FF). The scene is lit with a combination of natural and task lighting. 4K, hyper-realistic.',
    [Scenario.RESTAURANT_WALL_FRAME]: 'Photograph of a trendy, upscale bistro. The interior has a cozy, intimate ambiance with warm lighting. A medium-sized reclaimed wood frame hangs on an exposed brick wall. The placeholder area is a solid, vibrant magenta color (#FF00FF). The restaurant is bustling with blurred figures in the background. 4K, hyper-realistic.',
    [Scenario.WOMAN_FRAME_ZURICH]: 'Fashion editorial photograph. An elegant, stylish woman stands on Bahnhofstrasse in Zurich, with luxury storefronts blurred in the background. She is holding a large, chic, minimalist brushed silver frame. The inside of the frame is a solid, vibrant magenta color (#FF00FF) placeholder. Bright, natural daylight. 4K, hyper-realistic, sharp focus.',
    [Scenario.WOMAN_FRAME_GENEVA]: 'Travel lifestyle photograph. An elegant woman stands by Lake Geneva, with the Jet d\'Eau visible in the background. She holds a medium-sized, classic light maple wood frame. The placeholder area inside is a solid, vibrant magenta color (#FF00FF). The scene is bright and scenic. 4K, hyper-realistic.',
    [Scenario.WOMAN_FRAME_ZERMATT]: 'Picturesque photograph. A chic woman in stylish winter wear stands in the charming, car-free village of Zermatt, with the Matterhorn in the distant background. She holds a rustic, rough-hewn pine frame. The placeholder area is a solid, vibrant magenta color (#FF00FF). Crisp alpine light. 4K, hyper-realistic.',
    [Scenario.WOMAN_FRAME_BERN]: 'Historic and stylish photograph. A chic woman stands in the UNESCO World Heritage Old Town of Bern, with its characteristic arcades. She holds a vintage-style dark green painted wooden frame. The placeholder is a solid, vibrant magenta color (#FF00FF). Warm, golden hour lighting. 4K, hyper-realistic.',
    [Scenario.WOMAN_FRAME_LUCERNE]: 'Romantic photograph. An elegant woman stands near the iconic Chapel Bridge in Lucerne. She holds a beautiful, ornate silver-leaf frame. The placeholder is a solid, vibrant magenta color (#FF00FF). The scene is idyllic and charming. 4K, hyper-realistic.',
    [Scenario.WOMAN_FRAME_LUGANO]: 'Vibrant, Mediterranean-style photograph. A stylish woman stands on the lakeside promenade of Lugano, with palm trees and the lake in the background. She holds a modern, terracotta-colored frame. The placeholder is a solid, vibrant magenta color (#FF00FF). Bright, sunny day. 4K, hyper-realistic.',
    [Scenario.WOMAN_FRAME_ST_MORITZ]: 'Luxury lifestyle photograph. A glamorous woman in haute couture stands in the luxurious alpine resort of St. Moritz. She holds a high-end, polished chrome designer frame. The placeholder is a solid, vibrant magenta color (#FF00FF). The scene is exclusive and sophisticated. 4K, hyper-realistic.',
    [Scenario.WOMAN_FRAME_INTERLAKEN]: 'Adventurous and scenic photograph. A woman in stylish outdoor gear holds a simple, natural ash wood frame against the stunning backdrop of Interlaken\'s lakes and mountains. The placeholder is a solid, vibrant magenta color (#FF00FF). Clear, bright daylight. 4K, hyper-realistic.',
    [Scenario.WOMAN_FRAME_MONTREUX]: 'Artistic photograph. An artistic woman stands on the chic lakeside promenade of Montreux, famous for its jazz festival. She holds a creative, deep sea-blue painted frame. The placeholder is a solid, vibrant magenta color (#FF00FF). Soft, diffused light. 4K, hyper-realistic.',
    [Scenario.WOMAN_FRAME_CAIRO_MURALS]: 'Vibrant street style photograph. An elegant American woman stands on a colorful street in Cairo. She holds a large, sandstone-textured frame. The placeholder inside is a solid, vibrant magenta color (#FF00FF). In the background, world-class, artistic murals are visible on the walls. The scene is full of life and color. 4K, hyper-realistic.',
    [Scenario.WOMAN_FRAME_ROME_MURALS]: 'Cinematic street photograph. An elegant Italian woman stands on a historic street in Rome. She holds a classic, dark-stained oak frame. The placeholder inside is a solid, vibrant magenta color (#FF00FF). The background features stunning, large-scale modern murals contrasting with the ancient architecture. Golden hour light. 4K, hyper-realistic.',
    [Scenario.ARMCHAIR_CHANDELIER]: 'Close-up DSLR photograph, interior design magazine style. The camera is aimed up, focusing on a high, ornate ceiling in a luxurious classic living room. Centered in the ceiling is a solid, vibrant magenta color (#FF00FF) shape, a clear placeholder for a chandelier. The lighting is sophisticated and highlights the ceiling details. The rest of the room is softly blurred below. 4K, hyper-realistic, tack-sharp focus on the ceiling placeholder, shallow depth of field.',
    [Scenario.GALLERY_CHANDELIER]: 'Close-up architectural photograph of a high ceiling in a minimalist, modern art gallery. Hanging from the center of the ceiling is a solid, vibrant magenta color (#FF00FF) placeholder for a large, sculptural chandelier. The focus is tack-sharp on the placeholder and its connection to the ceiling. The gallery floor and walls are softly blurred below. Bright, even lighting. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.GOTHIC_CHANDELIER]: 'Close-up, atmospheric photograph focusing on a vaulted stone ceiling in a Gothic manor. A solid, vibrant magenta color (#FF00FF) placeholder for a large, wrought-iron chandelier hangs from the ceiling. The mood is dramatic and moody, with shadows and shafts of light highlighting the ceiling architecture. The focus is tack-sharp on the placeholder. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.PATIO_CHANDELIER]: 'Close-up, cozy lifestyle photograph focusing on a wooden pergola on a bohemian-style outdoor patio at dusk. Hanging from the center of the pergola is a solid, vibrant magenta color (#FF00FF) placeholder for a rustic or modern chandelier. String lights are softly blurred in the background, creating a beautiful bokeh effect. The atmosphere is warm and inviting. 4K, hyper-realistic, tack-sharp focus on the placeholder, shallow depth of field.',
    [Scenario.MODERN_DINING_CHANDELIER]: 'Close-up, minimalist interior design photograph. Focus is on a placeholder for a contemporary light fixture, represented by a solid, vibrant magenta color (#FF00FF) shape, hanging from the ceiling. Below, the top of a sleek wooden dining table is softly blurred. Natural light from a large window illuminates the scene. 4K, hyper-realistic, tack-sharp focus on the placeholder, shallow depth of field.',
    [Scenario.HOTEL_LOBBY_CHANDELIER]: 'Close-up photograph focusing on the high, ornate ceiling of a grand, opulent hotel lobby. In the center of the ceiling, a large, circular placeholder in solid, vibrant magenta (#FF00FF) marks the spot for a statement chandelier. The focus is tack-sharp on the placeholder and intricate ceiling details. The lobby below is out of focus. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.FARMHOUSE_CHANDELIER]: 'Close-up, charming photograph focusing on the exposed wooden beams of a rustic farmhouse ceiling. A placeholder for a chandelier, colored in solid, vibrant magenta (#FF00FF), hangs from a central beam. The focus is tack-sharp on the placeholder and the wood texture. The dining area below is softly blurred. 4K, hyper-realistic, cozy lighting, shallow depth of field.',
    [Scenario.GRAND_STAIRCASE_CHANDELIER]: 'Close-up, luxurious photograph focusing on a double-height ceiling in a grand mansion foyer. A large placeholder in solid, vibrant magenta (#FF00FF) hangs, indicating where a magnificent chandelier should be. The sweeping staircase below is softly and elegantly blurred. The focus is tack-sharp on the placeholder. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.BANQUET_HALL_CHANDELIER]: 'Close-up photograph focusing on the very high, ornate ceiling of a formal banquet hall. A single, large placeholder for a grand chandelier, colored in solid, vibrant magenta (#FF00FF), is the central focus. The focus is tack-sharp on the main placeholder and ceiling architecture. The elegantly set tables below are out of focus. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.MUSEUM_ATRIUM_CHANDELIER]: 'Close-up photograph focusing on the ceiling of a modern museum atrium with minimalist architecture. A large, sculptural placeholder in solid, vibrant magenta (#FF00FF) hangs from the ceiling as a centerpiece. The focus is tack-sharp on the placeholder and its connection point. The atrium space below is softly blurred. Clean, bright, and contemporary. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.OPERA_HOUSE_LOBBY_CHANDELIER]: 'Close-up photograph focusing on the ornate, domed ceiling of an opulent, historic opera house lobby. A massive, multi-tiered placeholder for a classic crystal chandelier hangs from the ceiling, colored in solid, vibrant magenta (#FF00FF). The focus is tack-sharp on the placeholder and the gold leaf details of the ceiling. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.PENTHOUSE_SUITE_CHANDELIER]: 'Close-up photograph focusing on the ceiling of a luxurious penthouse suite. A placeholder for a contemporary, artistic chandelier hangs from the ceiling, colored in solid, vibrant magenta (#FF00FF). The city skyline at night is visible and beautifully blurred with bokeh through the windows in the background. The mood is sophisticated and modern. 4K, hyper-realistic, tack-sharp focus on the placeholder, shallow depth of field.',
    [Scenario.WOMAN_LASER_LAMP_KITCHEN_ADVERTISEMENT]: 'A glamorous and elegant American woman in her late twenties stands in a luxurious, modern kitchen with bright natural light and luxurious finishes. She smiles warmly, pointing to a solid, vibrant magenta color (#FF00FF) shape suspended above the kitchen island. This shape is a placeholder for a beautifully designed lamp. The scene is designed as a luxury advertisement, with a cinematic composition, ultra-realistic 8K quality, shallow depth of field, professional product photography style, and warm color gradation.',
    [Scenario.WOMAN_LASER_LAMP_OFFICE_ADVERTISEMENT]: 'A glamorous and elegant American woman in her late twenties stands in a luxurious, modern office space with bright natural light and luxurious finishes. She smiles warmly, pointing to a solid, vibrant magenta color (#FF00FF) shape suspended above the office island. This shape is a placeholder for a beautifully designed lamp. The scene is designed as a luxury advertisement, with a cinematic composition, ultra-realistic 8K quality, shallow depth of field, professional product photography style, and warm color gradation.',
    [Scenario.PRODUCT_SHELF]: 'Close-up commercial product photograph. A single, clean, minimalist product stands on a brightly lit retail shelf. The product is a simple, unbleached cardboard-colored box with a large, solid, vibrant magenta color (#FF00FF) area on its front face, serving as a placeholder for a design. The background is a clean, white, modern store interior, slightly blurred. The focus is tack-sharp on the product. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.OFFICE_SCREEN]: 'Professional photograph of a modern office environment. A sleek, high-resolution computer monitor sits on a clean desk. The screen of the monitor displays a solid, vibrant magenta color (#FF00FF) as a placeholder. The background is a slightly blurred, contemporary office with natural light. 4K, hyper-realistic.',
    [Scenario.CITY_BILLBOARD]: 'Dynamic photograph of a bustling, futuristic city street at night, with neon signs and light trails from traffic. A massive, prominent billboard is visible on the side of a building. The billboard is displaying a solid, vibrant magenta color (#FF00FF) as a placeholder for an advertisement. The atmosphere is energetic and high-tech. 4K, hyper-realistic.',
    [Scenario.HIGHWAY_BILLBOARD]: 'Photograph of a large, classic billboard next to a busy highway at sunset. The sky is filled with warm, golden hour colors. The billboard itself is blank, showing a solid, vibrant magenta color (#FF00FF) as a placeholder. The scene is expansive and cinematic. 4K, hyper-realistic.',
    [Scenario.SUBWAY_AD]: 'Photograph of a modern, brightly lit subway station. An advertising panel on the wall is displaying a solid, vibrant magenta color (#FF00FF) as a placeholder. People are blurred in the background, giving a sense of motion. The scene is clean and urban. 4K, hyper-realistic.',
    [Scenario.BUS_STOP_AD]: 'Street-level photograph of a glass bus stop shelter on a city street. One of the advertising panels is illuminated, showing a solid, vibrant magenta color (#FF00FF) as a placeholder. The scene includes reflections on the glass and the ambient light of the city. 4K, hyper-realistic.',
    [Scenario.RURAL_BILLBOARD]: 'Photograph of a billboard on a quiet country road, surrounded by open fields and a vast sky. The billboard displays a solid, vibrant magenta color (#FF00FF) as a placeholder. The setting is peaceful and natural. 4K, hyper-realistic.',
    [Scenario.BUILDING_BANNER]: 'Architectural photograph of a modern glass and steel building. A huge, vertical banner hangs down the facade. The banner is a solid, vibrant magenta color (#FF00FF) placeholder. The image is taken from a low angle, emphasizing the scale. 4K, hyper-realistic.',
    [Scenario.TIMES_SQUARE_SCREENS]: 'Photograph of a bustling city square at night, similar to Times Square. Multiple massive digital screens on the buildings are all displaying a solid, vibrant magenta color (#FF00FF) as a placeholder. The scene is chaotic, bright, and full of energy. 4K, hyper-realistic.',
    [Scenario.STADIUM_JUMBOTRON]: 'Photograph from within a packed sports stadium during a game. The giant jumbotron screen is the focus, and it is displaying a solid, vibrant magenta color (#FF00FF) as a placeholder. The crowd and the field are slightly blurred. 4K, hyper-realistic.',
    [Scenario.MALL_SCREEN]: 'Photograph of the interior of a bright, modern shopping mall. A large, vertical digital advertising screen is prominent. The screen is showing a solid, vibrant magenta color (#FF00FF) as a placeholder. Shoppers are blurred in the background. 4K, hyper-realistic.',
    [Scenario.CONSTRUCTION_BANNER]: 'Photograph of a city construction site. A long banner is attached to the safety fence. The banner is a solid, vibrant magenta color (#FF00FF) placeholder. The scene is realistic, with construction equipment in the background. 4K, hyper-realistic.',
    [Scenario.COFFEE_MUG]: 'Close-up lifestyle photograph of a person holding a simple, earthy terracotta ceramic coffee mug. The front of the mug has a large, solid, vibrant magenta color (#FF00FF) area as a placeholder for a design. The background is a cozy, heavily blurred cafe setting. The focus is tack-sharp on the mug. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.COSMETIC_JAR]: 'Close-up luxury product photograph. A premium, minimalist frosted glass cosmetic jar sits on an elegant marble surface. The label area on the jar is a solid, vibrant magenta color (#FF00FF) placeholder. The background is simple and slightly blurred. The lighting is soft and sophisticated, creating subtle reflections. 4K, hyper-realistic, tack-sharp focus on the jar, shallow depth of field.',
    [Scenario.BOOK_COVER]: 'Close-up photograph of a realistic hardcover book with a dark green cover, lying on a cozy wooden table, next to a pair of glasses and a cup of tea. The front cover of the book has an area that is a solid, vibrant magenta color (#FF00FF) placeholder. The scene is warm and inviting, with a slightly blurred background. 4K, hyper-realistic, tack-sharp focus on the book.',
    [Scenario.WINE_BOTTLE]: 'Close-up commercial photograph of a classic dark green glass wine bottle against a dark, moody, slightly blurred background. The label on the bottle is a solid, vibrant magenta color (#FF00FF) placeholder. There are subtle highlights on the glass, giving it a premium look. 4K, hyper-realistic, tack-sharp focus on the label area.',
    [Scenario.SHOPPING_BAG]: 'Close-up fashion lifestyle photograph. A stylish person is holding a high-end paper shopping bag in a deep forest green color. The side of the bag facing the camera has a solid, vibrant magenta color (#FF00FF) placeholder. The background is a heavily blurred, upscale retail environment. 4K, hyper-realistic, tack-sharp focus on the bag.',
    [Scenario.SODA_CAN]: 'Close-up commercial product shot of a cold, condensation-covered sleek matte silver aluminum soda can. The label area wrapping around the can is a solid, vibrant magenta color (#FF00FF) placeholder. The background is clean, simple, and slightly blurred to make the can pop. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.STREET_POSTER]: 'Urban photograph of a poster pasted onto a weathered brick wall. The poster is a solid, vibrant magenta color (#FF00FF) placeholder. The texture of the wall and the paper is highly detailed. The lighting suggests a city alleyway. 4K, hyper-realistic.',
    [Scenario.LAPTOP_SCREEN]: 'Photograph of a modern, slim laptop on a wooden desk in a bright, creative workspace. The laptop screen is displaying a solid, vibrant magenta color (#FF00FF) as a placeholder. The scene includes other desk accessories like a notebook and a plant. 4K, hyper-realistic.',
    [Scenario.PHONE_SCREEN]: 'Close-up photograph of a person holding a modern smartphone. The phone\'s screen is on and shows a solid, vibrant magenta color (#FF00FF) placeholder. The background is softly blurred, suggesting a real-world environment. 4K, hyper-realistic.',
    [Scenario.PILL_BOTTLE]: 'Close-up, clean, clinical photograph of a classic amber glass pharmaceutical pill bottle on a plain white surface. The label on the bottle is a solid, vibrant magenta color (#FF00FF) placeholder. The lighting is bright and even. 4K, hyper-realistic, tack-sharp focus on the bottle, shallow depth of field.',
    [Scenario.CEREAL_BOX]: 'Close-up commercial photograph of a recycled cardboard cereal box on a sunny kitchen counter, next to a bowl and a glass of milk. The front of the cereal box is a solid, vibrant magenta color (#FF00FF) placeholder. The background is bright, cheerful, and slightly blurred. 4K, hyper-realistic, tack-sharp focus on the box.',
    [Scenario.TABLET_ON_DESK]: 'Photograph of a tablet device resting on a creative professional\'s desk, next to a sketchbook and stylus. The tablet screen is on, displaying a solid, vibrant magenta color (#FF00FF) as a placeholder. The scene is well-lit and inspiring. 4K, hyper-realistic.',
    [Scenario.PHONE_OUTDOORS]: 'Lifestyle photograph of a phone being used in a bright, outdoor setting, perhaps a park or a cafe patio. The screen is clearly visible and shows a solid, vibrant magenta color (#FF00FF) placeholder. The focus is on the device. 4K, hyper-realistic.',
    [Scenario.MULTI_DEVICE_SHOWCASE]: 'A clean, studio shot of a laptop, tablet, and smartphone arranged neatly next to each other. The screens of all three devices are on and display a solid, vibrant magenta color (#FF00FF) as a placeholder. This setup is perfect for showing responsive designs. 4K, hyper-realistic.',
    [Scenario.CAR_DASHBOARD_SCREEN]: 'Photograph from the driver\'s perspective inside a modern car. The central dashboard infotainment screen is on and displays a solid, vibrant magenta color (#FF00FF) as a placeholder. The interior of the car is sleek and modern. 4K, hyper-realistic.',
    [Scenario.SMARTWATCH_ON_WRIST]: 'Close-up photograph of a stylish smartwatch on a person\'s wrist. The watch face is on, showing a solid, vibrant magenta color (#FF00FF) placeholder. The shot is clean and focuses on the technology. 4K, hyper-realistic.',
    [Scenario.TV_IN_LIVING_ROOM]: 'Photograph of a large, flat-screen smart TV mounted on the wall of a cozy, modern living room. The TV screen is on and is displaying a solid, vibrant magenta color (#FF00FF) as a placeholder. The room is softly lit. 4K, hyper-realistic.',
    [Scenario.ATM_SCREEN]: 'Eye-level photograph of an ATM screen in a well-lit, modern bank lobby. The screen is active and shows a solid, vibrant magenta color (#FF00FF) as a placeholder for a user interface. 4K, hyper-realistic.',
    [Scenario.PROJECTOR_SCREEN_MEETING]: 'Photograph of a corporate meeting room with a large projector screen on the wall. The screen is displaying a presentation, indicated by a solid, vibrant magenta color (#FF00FF) placeholder. The room is modern, with a few blurred figures of people. 4K, hyper-realistic.',
    [Scenario.HANDHELD_CONSOLE_SCREEN]: 'Close-up shot of a person playing on a modern handheld gaming device. The screen is bright and shows a solid, vibrant magenta color (#FF00FF) as a placeholder for game UI. The focus is on the screen. 4K, hyper-realistic.',
    [Scenario.COWORKING_SPACE_LAPTOP]: 'Photograph of a laptop on a desk in a vibrant, collaborative co-working space. The screen is on, showing a solid, vibrant magenta color (#FF00FF) placeholder. The background is lively with other workers blurred out. 4K, hyper-realistic.',
    [Scenario.MEDICAL_TABLET_SCREEN]: 'Photograph of a doctor or nurse holding a tablet in a clean, modern clinic setting. The tablet screen is on, displaying a solid, vibrant magenta color (#FF00FF) placeholder for a medical application. 4K, hyper-realistic.',
    [Scenario.RETAIL_POS_SCREEN]: 'Photograph of a point-of-sale terminal in a chic boutique. The screen is on and shows a solid, vibrant magenta color (#FF00FF) placeholder for the sales software. The background is a stylish retail environment. 4K, hyper-realistic.',
    [Scenario.DIGITAL_WHITEBOARD_MEETING]: 'Photograph of a team brainstorming session in a modern office, using a large, interactive digital whiteboard. The whiteboard screen is on and displays a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic.',
    [Scenario.TSHIRT_MODEL]: 'Close-up studio photograph of a person\'s torso wearing a plain, high-quality heather grey t-shirt. The chest area of the t-shirt features a solid, vibrant magenta color (#FF00FF) placeholder. The lighting is clean and professional. 4K, hyper-realistic, tack-sharp focus on the fabric and placeholder area.',
    [Scenario.HOODIE_MODEL]: 'Close-up, high-fashion streetwear photograph focusing on the torso of a model wearing a plain, stylish forest green hoodie in an urban environment. The front of the hoodie has a solid, vibrant magenta color (#FF00FF) placeholder. The background is a slightly blurred city wall. 4K, hyper-realistic, tack-sharp focus on the hoodie\'s texture and placeholder area.',
    [Scenario.SWEATSHIRT_HANGER]: 'Close-up, minimalist product photograph of a plain oatmeal-colored sweatshirt on a wooden hanger against a clean, textured concrete wall. The center of the sweatshirt has a solid, vibrant magenta color (#FF00FF) placeholder. The lighting is soft and even. 4K, hyper-realistic, tack-sharp focus on the fabric texture.',
    [Scenario.TOTE_BAG_LIFESTYLE]: 'Close-up lifestyle photograph focusing on a person carrying a plain natural off-white canvas tote bag. The side of the bag facing the camera is a solid, vibrant magenta color (#FF00FF) placeholder. The background is a bright, slightly blurred outdoor market. 4K, hyper-realistic, tack-sharp focus on the tote bag\'s texture and placeholder area.',
    [Scenario.BASEBALL_CAP_MODEL]: 'Close-up, high-fashion portrait of a person wearing a plain navy blue baseball cap. The person is looking slightly away from the camera. The front of the cap has a solid, vibrant magenta color (#FF00FF) placeholder. The focus is entirely on the cap. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.BABY_ONESIE_FLATLAY]: 'Close-up, top-down flat-lay photograph of a plain, soft sage green baby onesie on a clean, light-colored wooden surface. The chest area of the onesie features a solid, vibrant magenta color (#FF00FF) placeholder. The scene is styled with a few cute baby toys. 4K, hyper-realistic.',
    [Scenario.TANK_TOP_FITNESS]: 'Close-up, dynamic fitness photograph of a model\'s torso wearing a plain charcoal gray athletic tank top in a modern gym. The front of the tank top has a solid, vibrant magenta color (#FF00FF) placeholder. The background is slightly blurred gym equipment. 4K, hyper-realistic, tack-sharp focus on the tank top.',
    [Scenario.SOCKS_PAIR]: 'Close-up, top-down flat-lay photograph of a pair of plain cream-colored socks, neatly arranged on a clean, neutral background. The area for the design on each sock is a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic, sharp details.',
    [Scenario.BEANIE_MODEL]: 'Close-up, cozy portrait of a person wearing a plain mustard yellow beanie in a warm, autumnal outdoor setting. The folded part of the beanie has a solid, vibrant magenta color (#FF00FF) placeholder. The background is filled with soft, blurry autumn leaves. 4K, hyper-realistic, tack-sharp focus on the beanie and its texture.',
    [Scenario.APRON_PERSON]: 'Close-up shot of a person\'s torso wearing a plain, natural linen-colored apron in a rustic, inviting kitchen. The front of the apron has a large solid, vibrant magenta color (#FF00FF) placeholder. The person is engaged in a cooking activity, with hands slightly blurred. 4K, hyper-realistic, tack-sharp focus on the apron.',
    [Scenario.FRAMED_POSTER_LIVING_ROOM]: 'Photograph of a stylish, modern living room with a large, simple natural wood frame hanging on a clean wall above a sofa. The interior of the frame is a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic.',
    [Scenario.CAFE_INTERIOR_POSTER]: 'Photograph of a trendy, cozy coffee shop interior. A medium-sized dark walnut frame is on a brick wall. The inside of the frame is a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic.',
    [Scenario.STREET_A_FRAME_SIGN]: 'Photograph of a classic wooden A-frame sandwich board sign on a city sidewalk outside a shop. The sign face is a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic.',
    [Scenario.WHEATPASTE_POSTERS_WALL]: 'Photograph of an urban wall covered in multiple, slightly overlapping wheatpaste posters. One central poster is a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic.',
    [Scenario.COMMUNITY_BULLETIN_BOARD]: 'Photograph of a cork community bulletin board. One flyer pinned to the board is a solid, vibrant magenta color (#FF00FF) placeholder amongst other notices. 4K, hyper-realistic.',
    [Scenario.ART_GALLERY_POSTER]: 'Photograph of a minimalist modern art gallery wall. A large, clean poster is displayed. The poster area is a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic.',
    [Scenario.PERSON_HOLDING_POSTER]: 'Lifestyle photograph of a person holding up a poster with both hands. The poster is a solid, vibrant magenta color (#FF00FF) placeholder. The background is a softly blurred indoor setting. 4K, hyper-realistic.',
    [Scenario.BUS_SHELTER_POSTER]: 'Photograph of a backlit paper poster inside a modern, glass bus stop shelter at dusk. The poster is a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic.',
    [Scenario.MUSIC_VENUE_POSTER_WALL]: 'Photograph of a gritty wall outside a music venue, covered in posters. One prominent poster is a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic.',
    [Scenario.MUG_OFFICE_DESK]: 'Photograph of a professional-looking matte black mug on a modern, stylish office desk. The mug has a solid, vibrant magenta color (#FF00FF) placeholder for a design. 4K, hyper-realistic.',
    [Scenario.MUG_CAMPING]: 'Photograph of a rugged dark green enamel mug in a rustic outdoor setting by a campfire. The mug has a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic.',
    [Scenario.MUGS_PAIR]: 'Photograph of two matching stoneware mugs in a sandy beige color, side-by-side on a clean surface. Each mug has a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic.',
    [Scenario.MUG_WITH_BOOKS]: 'Photograph of a cozy, intellectual scene with a deep blue ceramic mug next to a stack of books. The mug has a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic.',
    [Scenario.MUG_KITCHEN_COUNTER]: 'Photograph of a clean, bright shot of a light gray mug on a modern kitchen counter. The mug has a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic.',
    [Scenario.MUG_HOLIDAY]: 'Photograph of a festive scene with a crimson red mug surrounded by warm holiday decorations. The mug has a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic.',
    [Scenario.ESPRESSO_CUP_SAUCER]: 'Photograph of a chic, high-end cafe scene featuring a small, classic white porcelain espresso cup. The cup has a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic.',
    [Scenario.MUG_IN_GIFT_BOX]: 'Photograph of an elegant charcoal-colored mug presented elegantly inside an open gift box. The mug has a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic.',
    [Scenario.MUG_HELD_BY_PERSON]: 'Close-up, lifestyle shot of a person holding a warm, cream-colored mug with both hands. The mug has a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic.',
    [Scenario.SERUM_BOTTLE]: 'Close-up photograph of a sleek dark amber glass dropper bottle on a clean, slightly blurred surface. The label area is a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic, tack-sharp focus on the bottle.',
    [Scenario.PUMP_BOTTLE]: 'Close-up photograph of a versatile white ceramic pump bottle for lotions or soaps on a clean, slightly blurred bathroom counter. The label area is a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic, tack-sharp focus on the bottle.',
    [Scenario.SQUEEZE_TUBE]: 'Close-up photograph of a soft, matte pastel green cosmetic tube for creams or gels. The label area is a solid, vibrant magenta color (#FF00FF) placeholder. The background is clean and slightly out of focus. 4K, hyper-realistic, tack-sharp focus.',
    [Scenario.CANDLE_JAR]: 'Close-up photograph of a cozy scene with a smoky gray glass candle jar. The label area is a solid, vibrant magenta color (#FF00FF) placeholder. The background is warm and out of focus. 4K, hyper-realistic, tack-sharp focus on the jar.',
    [Scenario.COFFEE_BAG]: 'Close-up photograph of a natural kraft paper stand-up coffee bag pouch with a modern aesthetic. The front label is a solid, vibrant magenta color (#FF00FF) placeholder. The background is a slightly blurred cafe setting. 4K, hyper-realistic.',
    [Scenario.BEER_BOTTLE]: 'Close-up photograph of a chilled amber glass beer bottle with condensation. The label is a solid, vibrant magenta color (#FF00FF) placeholder. The background is dark and slightly blurred. 4K, hyper-realistic, tack-sharp focus on the label.',
    [Scenario.HONEY_JAR]: 'Close-up photograph of a rustic glass honey jar with a wooden dipper. The label is a solid, vibrant magenta color (#FF00FF) placeholder. The background is warm and slightly blurred. 4K, hyper-realistic, tack-sharp focus on the jar.',
    [Scenario.SOAP_BAR_WRAP]: 'Close-up photograph of a rustic, oatmeal-colored handmade bar of soap with a paper wrap. The wrap design area is a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic, tack-sharp focus on the texture.',
    [Scenario.SPRAY_BOTTLE]: 'Close-up photograph of a clean, clear glass spray bottle with a metal nozzle. The label area is a solid, vibrant magenta color (#FF00FF) placeholder. The background is bright and out of focus. 4K, hyper-realistic, tack-sharp focus on the bottle.',
    [Scenario.WOMAN_HOLDING_PRODUCT_STREET]: 'Close-up commercial lifestyle photo, focusing on the hands of a beautiful, stylish woman holding a simple, eco-friendly kraft paper product box. The front of the box is a solid vibrant magenta (#FF00FF) placeholder. The background is a vibrant, heavily blurred American city street. 4K, hyper-realistic, tack-sharp focus on the product, shallow depth of field.',
    [Scenario.WOMAN_STOOL_PRODUCT_LA]: 'Close-up interior lifestyle photo. A stylish woman in a modern Los Angeles living room sits on a stool, focusing on her holding a stylish, matte olive green product box. The front of the box is a solid vibrant magenta (#FF00FF) placeholder. The background is slightly blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_COUCH_PRODUCT_LA]: 'Close-up interior lifestyle photo, focusing on the product. A stylish woman in a trendy Los Angeles bedroom sits on a couch, pointing at a trendy, muted terracotta product box placed on a table. The front of the box is a solid vibrant magenta (#FF00FF) placeholder. The background is slightly blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_SOFA_PRODUCT_PARIS]: 'Close-up interior lifestyle photo, focusing on the product. An elegant woman on a velvet sofa in a modern Parisian living room points at an elegant, deep navy blue product box on a coffee table. The front of the box is a solid vibrant magenta (#FF00FF) placeholder. The background is beautifully blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_LINGERIE_PRODUCT_SWISS_PARISIAN]: 'Close-up luxury lifestyle photo. An elegant Swiss woman in tasteful lingerie is in a Parisian-style bedroom in Switzerland, pointing to a luxury, soft cream-colored product box. The front of the box is a solid vibrant magenta (#FF00FF) placeholder. The background is softly blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_NIGHTGOWN_PRODUCT_SWISS_PARISIAN]: 'Close-up luxury lifestyle photo. An elegant Swiss woman in a white nightgown and robe is in a Parisian-style bedroom in Switzerland, pointing to a premium, dusty rose colored product box. The front of the box is a solid vibrant magenta (#FF00FF) placeholder. The background is softly blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.MOTHER_DAUGHTER_PRODUCT_CAMBRIDGE_ITALIANATE]: 'Close-up, heartwarming lifestyle photo. An elegant American woman and her daughter in a trendy Italianate hall in Cambridge, showing awe towards a charming, light gray product box. The box has a solid vibrant magenta (#FF00FF) placeholder. The background is blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_PRODUCT_CAMBRIDGE_ITALIANATE]: 'Close-up lifestyle photo. An elegant American woman in a trendy Italianate hall in Cambridge, showing awe towards a sophisticated, charcoal gray product box. The box has a solid vibrant magenta (#FF00FF) placeholder. The background is blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_PRODUCT_ZURICH]: 'Close-up commercial photo. A stylish woman presents a forest green product box on Bahnhofstrasse, Zurich. The box has a solid vibrant magenta (#FF00FF) placeholder. The background is blurred to emphasize the product. 4K, hyper-realistic, tack-sharp focus.',
    [Scenario.WOMAN_PRODUCT_GENEVA]: 'Close-up commercial photo. An elegant woman holds a sandy beige product box by Lake Geneva. The box has a solid vibrant magenta (#FF00FF) placeholder. The background is beautifully blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_PRODUCT_ZERMATT]: 'Close-up commercial photo. A chic woman showcases a sky blue product box in Zermatt. The box has a solid vibrant magenta (#FF00FF) placeholder. The background of mountains is softly blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_PRODUCT_BERN]: 'Close-up commercial photo. A chic woman presents an earthy brown product box in the Old Town of Bern. The box has a solid vibrant magenta (#FF00FF) placeholder. The historic background is blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_PRODUCT_LUCERNE]: 'Close-up commercial photo. An elegant woman holds a stone gray product box near the Chapel Bridge in Lucerne. The box has a solid vibrant magenta (#FF00FF) placeholder. The background is softly blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_PRODUCT_LUGANO]: 'Close-up commercial photo. A stylish woman showcases a burgundy-colored product box in Lugano. The box has a solid vibrant magenta (#FF00FF) placeholder. The lakeside background is blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_PRODUCT_ST_MORITZ]: 'Close-up luxury commercial photo. A glamorous woman showcases a gold-accented product box in St. Moritz. The box has a solid vibrant magenta (#FF00FF) placeholder. The luxury background is blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_PRODUCT_INTERLAKEN]: 'Close-up commercial photo. An adventurous woman holds a slate blue product box in Interlaken. The box has a solid vibrant magenta (#FF00FF) placeholder. The stunning mountain background is blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_PRODUCT_MONTREUX]: 'Close-up commercial photo. An artistic woman presents a lavender-colored product box in Montreux. The box has a solid vibrant magenta (#FF00FF) placeholder. The lakeside background is blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_PRODUCT_LIVING_ROOM]: 'Close-up lifestyle photo. A beautiful woman holds a light beige product box naturally in a bright, modern living room. The box has a solid vibrant magenta (#FF00FF) placeholder. The background is softly blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_PRODUCT_KITCHEN]: 'Close-up lifestyle photo. A cheerful woman showcases a mint green product box in a sunlit kitchen. The box has a solid vibrant magenta (#FF00FF) placeholder. The background is softly blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_PRODUCT_BEDROOM]: 'Close-up lifestyle photo. An elegant woman presents a soft pink product box in a serene bedroom. The box has a solid vibrant magenta (#FF00FF) placeholder. The background is softly blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_PRODUCT_HOME_OFFICE]: 'Close-up lifestyle photo. A professional woman holds a professional navy blue product box in her chic home office. The box has a solid vibrant magenta (#FF00FF) placeholder. The background is softly blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_PRODUCT_BATHROOM]: 'Close-up lifestyle photo. A woman presents a seafoam green beauty product box in a luxurious bathroom. The box has a solid vibrant magenta (#FF00FF) placeholder. The background is softly blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_PRODUCT_NURSERY]: 'Close-up lifestyle photo. A mother holds a pastel yellow baby product box in a bright nursery. The box has a solid vibrant magenta (#FF00FF) placeholder. The background is softly blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_LASER_PRODUCT_MODERN_LIVING_ROOM]: 'Close-up lifestyle photo. An elegant woman holds a wooden laser light product in a modern living room. The product has a solid vibrant magenta (#FF00FF) placeholder area. The background is softly blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_LASER_PRODUCT_SCANDINAVIAN_BEDROOM]: 'Close-up lifestyle photo. A woman showcases a wooden laser light product in a serene, Scandinavian-style bedroom. The product has a solid vibrant magenta (#FF00FF) placeholder area. The background is softly blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_LASER_PRODUCT_BOHEMIAN_STUDIO]: 'Close-up lifestyle photo. A woman presents a wooden laser light product in an artistic, bohemian-style studio. The product has a solid vibrant magenta (#FF00FF) placeholder area. The background is softly blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_LASER_PRODUCT_MINIMALIST_OFFICE]: 'Close-up lifestyle photo. A professional woman holds a wooden laser light product in a clean, minimalist home office. The product has a solid vibrant magenta (#FF00FF) placeholder area. The background is softly blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_LASER_PRODUCT_RUSTIC_DINING_ROOM]: 'Close-up lifestyle photo. A woman holds a wooden laser light product in a warm, rustic dining room. The product has a solid vibrant magenta (#FF00FF) placeholder area. The background is softly blurred. 4K, hyper-realistic, tack-sharp focus on the product.',
    [Scenario.WOMAN_LASER_LAMP_KITCHEN]: 'Close-up interior design photo. An elegant woman pointing to a laser-cut wooden lamp in a luxury kitchen. The lamp shade has a solid vibrant magenta (#FF00FF) placeholder for a design. The background is softly blurred. 4K, hyper-realistic, tack-sharp focus on the lamp.',
    [Scenario.ICE_CREAM_PINT]: 'Close-up commercial photograph of a simple, off-white paper ice cream pint container. The label area is a solid, vibrant magenta color (#FF00FF) placeholder. The background is bright and softly blurred. 4K, hyper-realistic, tack-sharp focus.',
    [Scenario.CHOCOLATE_BAR_WRAPPER]: 'Close-up commercial photograph of a luxury chocolate bar in a dark brown paper wrapper. The wrapper has an area that is a solid, vibrant magenta color (#FF00FF) placeholder. The background is softly blurred. 4K, hyper-realistic, tack-sharp focus.',
    [Scenario.OLIVE_OIL_BOTTLE]: 'Close-up commercial photograph of a dark green glass bottle of olive oil. The label is a solid, vibrant magenta color (#FF00FF) placeholder. The background is subtly blurred. 4K, hyper-realistic, tack-sharp focus on the label.',
    [Scenario.CHIPS_BAG]: 'Close-up studio photograph of a matte-finish, earthy-toned bag of potato chips. The front design area is a solid, vibrant magenta color (#FF00FF) placeholder. The background is clean and simple. 4K, hyper-realistic, tack-sharp focus.',
    [Scenario.YOGURT_CUP]: 'Close-up commercial photograph of a simple white yogurt cup. The label is a solid, vibrant magenta color (#FF00FF) placeholder. The background is a bright, softly blurred breakfast scene. 4K, hyper-realistic, tack-sharp focus.',
    [Scenario.THROW_PILLOW_SOFA]: 'Interior design photograph of a natural linen throw pillow on a modern sofa. The entire front face of the pillow is a solid, vibrant magenta color (#FF00FF) placeholder for a pattern or design. 4K, hyper-realistic.',
    [Scenario.DUVET_COVER_BED]: 'Interior design photograph of a bed with a simple, light grey cotton duvet cover. The entire top surface of the duvet is a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic.',
    [Scenario.WALL_CLOCK_LIVING_ROOM]: 'Close-up photograph of a modern, frameless wall clock with a light wood face in a living room. The face of the clock is a solid, vibrant magenta color (#FF00FF) placeholder. The background wall is slightly blurred. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.SHOWER_CURTAIN_BATHROOM]: 'Photograph of a simple, off-white fabric shower curtain in a clean, modern bathroom. The entire shower curtain is a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic.',
    [Scenario.BEACH_TOWEL_SAND]: 'Top-down photograph of a navy blue and white striped beach towel laid out on the sand. The entire towel is a solid, vibrant magenta color (#FF00FF) placeholder. 4K, hyper-realistic.',
    [Scenario.DRONE_BOX_PACKAGING]: 'Close-up commercial photograph of a sleek, matte black box for a high-tech drone. The front of the box is a solid, vibrant magenta color (#FF00FF) placeholder. The background is clean and slightly blurred. 4K, hyper-realistic, tack-sharp focus on the box.',
    [Scenario.SMART_SPEAKER_BOX]: 'Close-up commercial photograph of the retail box in a clean, soft grey color for a smart speaker. The front of the box is a solid, vibrant magenta color (#FF00FF) placeholder. The background is minimalist and slightly blurred. 4K, hyper-realistic, tack-sharp focus.',
    [Scenario.CAMERA_BOX_PACKAGING]: 'Close-up commercial photograph of the premium, dark charcoal packaging for a new digital camera. The front of the box is a solid, vibrant magenta color (#FF00FF) placeholder. The background is softly lit and blurred. 4K, hyper-realistic, tack-sharp focus.',
    [Scenario.GAMING_MOUSE_BOX]: 'Close-up commercial photograph of the box for a gaming mouse in a dynamic, lit environment. The box is dark with cyan accents, and the front of the box is a solid, vibrant magenta color (#FF00FF) placeholder. The background is blurred. 4K, hyper-realistic, tack-sharp focus.',
    [Scenario.WEBCAM_BOX_PACKAGING]: 'Close-up commercial photograph of the retail box in a simple, professional blue for a webcam. The front of the box is a solid, vibrant magenta color (#FF00FF) placeholder. The background is a slightly blurred office setting. 4K, hyper-realistic, tack-sharp focus.',
    [Scenario.FOLDED_SHIRT_HELD]: 'Close-up photograph of a hand holding a neatly folded plain olive green t-shirt against a natural, outdoor background. The visible area on the shirt is a solid, vibrant magenta color (#FF00FF) placeholder. Professional, vivid natural colors, tack-sharp focus on the shirt, 8K resolution.',
    [Scenario.FOLDED_SHIRT_HELD_CLOSEUP]: 'Extreme close-up, highly realistic outdoor photograph of a folded navy blue shirt held in hand on the right side. The shirt has a solid, vibrant magenta (#FF00FF) placeholder area. The logo area is in tack-sharp focus. Green grass, trees, and a blue sky, cinematic lighting, clear details, 8K resolution.',
    [Scenario.WOMAN_HOLDING_TSHIRT_OUTDOORS_CLOSEUP]: 'Extreme close-up, commercial photograph of an elegant woman holding a simple white t-shirt. The placeholder area on the t-shirt is a solid vibrant magenta (#FF00FF). The focus is tack-sharp on the placeholder area, against a backdrop of wide grass and forests. Cinematic composition, highly realistic details, 8K resolution.',
    [Scenario.WOMAN_TSHIRT_CREATIVE_OFFICE]: 'Close-up torso shot, professional photograph of a confident woman wearing a simple, high-quality light grey t-shirt in a bright, modern creative office. The chest area of the t-shirt features a solid, vibrant magenta color (#FF00FF) placeholder. The background is a slightly blurred office with plants and natural light. 4K, hyper-realistic, tack-sharp focus on the fabric and placeholder area.',
    [Scenario.WOMAN_BLOUSE_CITY_STREET]: 'Close-up torso shot, fashion editorial photograph. A stylish woman wears a chic, flowy powder blue blouse on a beautiful, slightly blurred city street with classic architecture. The front of the blouse has a solid, vibrant magenta color (#FF00FF) placeholder for a design. Golden hour lighting. 4K, hyper-realistic, tack-sharp focus on the blouse.',
    [Scenario.WOMAN_SILK_BLOUSE_ELEGANT_INTERIOR]: 'Close-up torso shot, luxury fashion photograph. An elegant woman wears a beautiful, ivory-colored silk blouse inside a sophisticated, minimalist interior. The chest area of the blouse features a solid, vibrant magenta color (#FF00FF) placeholder. The lighting is soft and flattering, highlighting the texture of the silk. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.WOMAN_SPORTS_BLOUSE_OUTDOORS_CLOSEUP]: 'Close-up photograph of a woman\'s torso wearing a plain, high-performance white sports blouse. The chest area of the blouse features a solid, vibrant magenta color (#FF00FF) placeholder. The background is a highly realistic outdoor scene with green grass, trees, and a blue sky. Cinematic lighting, vivid natural colors, tack-sharp focus on the blouse, clear details, 8K resolution.',
    [Scenario.TSHIRT_MODEL_OUTDOORS_CLOSEUP]: 'Close-up photograph of a beautiful model\'s torso wearing a plain, high-quality light grey t-shirt. The chest area of the t-shirt features a solid, vibrant magenta color (#FF00FF) placeholder for a logo. The logo area is in tack-sharp focus. The background is a highly realistic outdoor scene with green grass, trees, and a blue sky. Cinematic lighting, vivid natural colors, clear details, 8K resolution.',
  },
  edit: {
    frame: 'Carefully replace the magenta area (#FF00FF) in the frame with the provided design. The design should fit perfectly within the frame\'s boundaries. Maintain the original image\'s lighting, shadows, reflections, and perspective to ensure a photorealistic result. Do not alter the frame or the background.',
    chandelier: 'Replace the magenta shape (#FF00FF) on the ceiling with the provided chandelier design. The chandelier should hang naturally from the ceiling. Realistically integrate it into the scene by matching the room\'s lighting, casting appropriate shadows, and adding realistic highlights or glows. Do not change the room.',
    product: 'Carefully apply the provided design onto the magenta placeholder area (#FF00FF) of the product. The design should wrap around the product\'s shape naturally. Maintain the original product\'s texture, lighting, shadows, and reflections for a seamless, photorealistic look. Do not alter the background or the product itself.',
    screen: 'Place the provided user interface design onto the magenta screen area (#FF00FF). The design should fit the screen dimensions perfectly. Add a subtle, realistic glow from the screen onto its surroundings. Maintain the original photo\'s perspective, reflections, and lighting. Do not alter anything outside the screen.',
    apparel: 'Realistically print the provided design onto the magenta placeholder area (#FF00FF) of the clothing item. The design should follow the natural folds, wrinkles, and texture of the fabric. Match the lighting and shadows of the original photo to make it look like a real print. Do not alter the model or the background.',
    billboard: 'Place the provided advertisement design onto the magenta billboard area (#FF00FF). The design should align perfectly with the billboard\'s perspective and dimensions. Adjust the design\'s lighting and color balance to match the environment (e.g., bright for daytime, illuminated for nighttime). Do not alter the surrounding scene.',
    poster: 'Replace the magenta placeholder area (#FF00FF) with the provided poster design. Ensure the design fits the poster\'s dimensions and perspective perfectly. Maintain the original photo\'s lighting, shadows, and the texture of the paper. For wheatpaste posters, add realistic wrinkles and texture.',
    mug_design: 'Apply the provided design onto the magenta area (#FF00FF) of the mug. The design should curve naturally with the shape of the mug. Maintain the original lighting, shadows, and reflections on the mug\'s surface for a photorealistic result.',
    label: 'Apply the provided label design to the magenta placeholder area (#FF00FF) on the product (bottle, jar, box, etc.). The label should wrap realistically around the product\'s contours. Preserve the original photo\'s lighting, shadows, and surface reflections to ensure the final image looks authentic.'
  },
  style: {
    cinematic: 'Apply a cinematic color grade to the image. Increase contrast, deepen shadows, and give it a slightly desaturated, filmic look with a teal and orange color palette.',
    vintage: 'Give the image a vintage 1970s photo effect. Apply a warm, yellowish tint, slightly fade the colors, reduce contrast, and add a subtle film grain texture.',
    watercolor: 'Transform the image into a watercolor painting. Soften the details, blend colors smoothly, and apply a textured paper effect to mimic a real painting.',
    noir: 'Convert the image to a high-contrast black and white, reminiscent of a classic noir film. Make the blacks very deep and the whites bright, emphasizing dramatic shadows and highlights.',
    pop_art: 'Apply a vibrant, comic-book style pop art effect. Use bold, saturated colors, strong outlines around objects, and a halftone dot pattern in some areas.',
    impressionism: 'Give the image the appearance of an Impressionist painting. Use soft, visible brushstrokes, focus on the play of light, and slightly blur fine details to create a dreamy, artistic effect.',
    background_blur: 'Apply a realistic, subtle background blur (bokeh effect) to the image. Keep the main subject, especially any product, frame, or person, in tack-sharp focus. The background should be softly and naturally out of focus, enhancing the depth of field.',
  }
};

const App: React.FC = () => {
  const { t, lang } = useTranslation();

  const SCENARIO_OPTIONS: ScenarioOption[] = useMemo(() => [
    // People with Frames
    { id: Scenario.SITTING_FRAME, title: t('SITTING_FRAME_title'), description: t('SITTING_FRAME_description'), image: '/scenarios/SITTING_FRAME.jpg', requiresDesign: 'frame', subcategory: 'subcategoryPeople' },
    { id: Scenario.STANDING_FRAME, title: t('STANDING_FRAME_title'), description: t('STANDING_FRAME_description'), image: '/scenarios/STANDING_FRAME.jpg', requiresDesign: 'frame', subcategory: 'subcategoryPeople' },
    { id: Scenario.ARMCHAIR_FRAME, title: t('ARMCHAIR_FRAME_title'), description: t('ARMCHAIR_FRAME_description'), image: '/scenarios/ARMCHAIR_FRAME.jpg', requiresDesign: 'frame', subcategory: 'subcategoryPeople' },
    { id: Scenario.OUTDOOR_CAFE_FRAME, title: t('OUTDOOR_CAFE_FRAME_title'), description: t('OUTDOOR_CAFE_FRAME_description'), image: '/scenarios/OUTDOOR_CAFE_FRAME.jpg', requiresDesign: 'frame', subcategory: 'subcategoryPeople' },
    { id: Scenario.WOMAN_FRAME_ZURICH, title: t('WOMAN_FRAME_ZURICH_title'), description: t('WOMAN_FRAME_ZURICH_description'), image: '/scenarios/WOMAN_FRAME_ZURICH.jpg', requiresDesign: 'frame', subcategory: 'subcategoryPeople' },
    { id: Scenario.WOMAN_FRAME_GENEVA, title: t('WOMAN_FRAME_GENEVA_title'), description: t('WOMAN_FRAME_GENEVA_description'), image: '/scenarios/WOMAN_FRAME_GENEVA.jpg', requiresDesign: 'frame', subcategory: 'subcategoryPeople' },
    { id: Scenario.WOMAN_FRAME_ZERMATT, title: t('WOMAN_FRAME_ZERMATT_title'), description: t('WOMAN_FRAME_ZERMATT_description'), image: '/scenarios/WOMAN_FRAME_ZERMATT.jpg', requiresDesign: 'frame', subcategory: 'subcategoryPeople' },
    { id: Scenario.WOMAN_FRAME_BERN, title: t('WOMAN_FRAME_BERN_title'), description: t('WOMAN_FRAME_BERN_description'), image: '/scenarios/WOMAN_FRAME_BERN.jpg', requiresDesign: 'frame', subcategory: 'subcategoryPeople' },
    { id: Scenario.WOMAN_FRAME_LUCERNE, title: t('WOMAN_FRAME_LUCERNE_title'), description: t('WOMAN_FRAME_LUCERNE_description'), image: '/scenarios/WOMAN_FRAME_LUCERNE.jpg', requiresDesign: 'frame', subcategory: 'subcategoryPeople' },
    { id: Scenario.WOMAN_FRAME_LUGANO, title: t('WOMAN_FRAME_LUGANO_title'), description: t('WOMAN_FRAME_LUGANO_description'), image: '/scenarios/WOMAN_FRAME_LUGANO.jpg', requiresDesign: 'frame', subcategory: 'subcategoryPeople' },
    { id: Scenario.WOMAN_FRAME_ST_MORITZ, title: t('WOMAN_FRAME_ST_MORITZ_title'), description: t('WOMAN_FRAME_ST_MORITZ_description'), image: '/scenarios/WOMAN_FRAME_ST_MORITZ.jpg', requiresDesign: 'frame', subcategory: 'subcategoryPeople' },
    { id: Scenario.WOMAN_FRAME_INTERLAKEN, title: t('WOMAN_FRAME_INTERLAKEN_title'), description: t('WOMAN_FRAME_INTERLAKEN_description'), image: '/scenarios/WOMAN_FRAME_INTERLAKEN.jpg', requiresDesign: 'frame', subcategory: 'subcategoryPeople' },
    { id: Scenario.WOMAN_FRAME_MONTREUX, title: t('WOMAN_FRAME_MONTREUX_title'), description: t('WOMAN_FRAME_MONTREUX_description'), image: '/scenarios/WOMAN_FRAME_MONTREUX.jpg', requiresDesign: 'frame', subcategory: 'subcategoryPeople' },
    { id: Scenario.WOMAN_FRAME_CAIRO_MURALS, title: t('WOMAN_FRAME_CAIRO_MURALS_title'), description: t('WOMAN_FRAME_CAIRO_MURALS_description'), image: '/scenarios/WOMAN_FRAME_CAIRO_MURALS.jpg', requiresDesign: 'frame', subcategory: 'subcategoryPeople' },
    { id: Scenario.WOMAN_FRAME_ROME_MURALS, title: t('WOMAN_FRAME_ROME_MURALS_title'), description: t('WOMAN_FRAME_ROME_MURALS_description'), image: '/scenarios/WOMAN_FRAME_ROME_MURALS.jpg', requiresDesign: 'frame', subcategory: 'subcategoryPeople' },

    // Frames in Rooms
    { id: Scenario.HOME_FRAME, title: t('HOME_FRAME_title'), description: t('HOME_FRAME_description'), image: '/scenarios/HOME_FRAME.jpg', requiresDesign: 'frame', subcategory: 'subcategoryRooms' },
    { id: Scenario.KITCHEN_FRAME, title: t('KITCHEN_FRAME_title'), description: t('KITCHEN_FRAME_description'), image: '/scenarios/KITCHEN_FRAME.jpg', requiresDesign: 'frame', subcategory: 'subcategoryRooms' },
    { id: Scenario.LIVING_ROOM_FRAME, title: t('LIVING_ROOM_FRAME_title'), description: t('LIVING_ROOM_FRAME_description'), image: '/scenarios/LIVING_ROOM_FRAME.jpg', requiresDesign: 'frame', subcategory: 'subcategoryRooms' },
    { id: Scenario.BEDROOM_FRAME, title: t('BEDROOM_FRAME_title'), description: t('BEDROOM_FRAME_description'), image: '/scenarios/BEDROOM_FRAME.jpg', requiresDesign: 'frame', subcategory: 'subcategoryRooms' },
    { id: Scenario.KIDS_ROOM_FRAME, title: t('KIDS_ROOM_FRAME_title'), description: t('KIDS_ROOM_FRAME_description'), image: '/scenarios/KIDS_ROOM_FRAME.jpg', requiresDesign: 'frame', subcategory: 'subcategoryRooms' },
    { id: Scenario.HALL_FRAME, title: t('HALL_FRAME_title'), description: t('HALL_FRAME_description'), image: '/scenarios/HALL_FRAME.jpg', requiresDesign: 'frame', subcategory: 'subcategoryRooms' },
    { id: Scenario.LIBRARY_FRAME, title: t('LIBRARY_FRAME_title'), description: t('LIBRARY_FRAME_description'), image: '/scenarios/LIBRARY_FRAME.jpg', requiresDesign: 'frame', subcategory: 'subcategoryRooms' },
    { id: Scenario.MINIMALIST_DESK_FRAME, title: t('MINIMALIST_DESK_FRAME_title'), description: t('MINIMALIST_DESK_FRAME_description'), image: '/scenarios/MINIMALIST_DESK_FRAME.jpg', requiresDesign: 'frame', subcategory: 'subcategoryRooms' },
    { id: Scenario.CREATIVE_STUDIO_FRAME, title: t('CREATIVE_STUDIO_FRAME_title'), description: t('CREATIVE_STUDIO_FRAME_description'), image: '/scenarios/CREATIVE_STUDIO_FRAME.jpg', requiresDesign: 'frame', subcategory: 'subcategoryRooms' },
    { id: Scenario.CORPORATE_BOARDROOM_FRAME, title: t('CORPORATE_BOARDROOM_FRAME_title'), description: t('CORPORATE_BOARDROOM_FRAME_description'), image: '/scenarios/CORPORATE_BOARDROOM_FRAME.jpg', requiresDesign: 'frame', subcategory: 'subcategoryRooms' },
    { id: Scenario.LUXURY_HOTEL_LOBBY_FRAME, title: t('LUXURY_HOTEL_LOBBY_FRAME_title'), description: t('LUXURY_HOTEL_LOBBY_FRAME_description'), image: '/scenarios/LUXURY_HOTEL_LOBBY_FRAME.jpg', requiresDesign: 'frame', subcategory: 'subcategoryRooms' },
    { id: Scenario.MODERN_OFFICE_RECEPTION_FRAME, title: t('MODERN_OFFICE_RECEPTION_FRAME_title'), description: t('MODERN_OFFICE_RECEPTION_FRAME_description'), image: '/scenarios/MODERN_OFFICE_RECEPTION_FRAME.jpg', requiresDesign: 'frame', subcategory: 'subcategoryRooms' },
    { id: Scenario.ARCHITECTS_OFFICE_FRAME, title: t('ARCHITECTS_OFFICE_FRAME_title'), description: t('ARCHITECTS_OFFICE_FRAME_description'), image: '/scenarios/ARCHITECTS_OFFICE_FRAME.jpg', requiresDesign: 'frame', subcategory: 'subcategoryRooms' },
    { id: Scenario.RESTAURANT_WALL_FRAME, title: t('RESTAURANT_WALL_FRAME_title'), description: t('RESTAURANT_WALL_FRAME_description'), image: '/scenarios/RESTAURANT_WALL_FRAME.jpg', requiresDesign: 'frame', subcategory: 'subcategoryRooms' },

    // Chandelier
    { id: Scenario.ARMCHAIR_CHANDELIER, title: t('ARMCHAIR_CHANDELIER_title'), description: t('ARMCHAIR_CHANDELIER_description'), image: '/scenarios/ARMCHAIR_CHANDELIER.jpg', requiresDesign: 'chandelier', subcategory: 'general' },
    { id: Scenario.GALLERY_CHANDELIER, title: t('GALLERY_CHANDELIER_title'), description: t('GALLERY_CHANDELIER_description'), image: '/scenarios/GALLERY_CHANDELIER.jpg', requiresDesign: 'chandelier', subcategory: 'general' },
    { id: Scenario.GOTHIC_CHANDELIER, title: t('GOTHIC_CHANDELIER_title'), description: t('GOTHIC_CHANDELIER_description'), image: '/scenarios/GOTHIC_CHANDELIER.jpg', requiresDesign: 'chandelier', subcategory: 'general' },
    { id: Scenario.PATIO_CHANDELIER, title: t('PATIO_CHANDELIER_title'), description: t('PATIO_CHANDELIER_description'), image: '/scenarios/PATIO_CHANDELIER.jpg', requiresDesign: 'chandelier', subcategory: 'general' },
    { id: Scenario.MODERN_DINING_CHANDELIER, title: t('MODERN_DINING_CHANDELIER_title'), description: t('MODERN_DINING_CHANDELIER_description'), image: '/scenarios/MODERN_DINING_CHANDELIER.jpg', requiresDesign: 'chandelier', subcategory: 'general' },
    { id: Scenario.HOTEL_LOBBY_CHANDELIER, title: t('HOTEL_LOBBY_CHANDELIER_title'), description: t('HOTEL_LOBBY_CHANDELIER_description'), image: '/scenarios/HOTEL_LOBBY_CHANDELIER.jpg', requiresDesign: 'chandelier', subcategory: 'general' },
    { id: Scenario.FARMHOUSE_CHANDELIER, title: t('FARMHOUSE_CHANDELIER_title'), description: t('FARMHOUSE_CHANDELIER_description'), image: '/scenarios/FARMHOUSE_CHANDELIER.jpg', requiresDesign: 'chandelier', subcategory: 'general' },
    { id: Scenario.GRAND_STAIRCASE_CHANDELIER, title: t('GRAND_STAIRCASE_CHANDELIER_title'), description: t('GRAND_STAIRCASE_CHANDELIER_description'), image: '/scenarios/GRAND_STAIRCASE_CHANDELIER.jpg', requiresDesign: 'chandelier', subcategory: 'general' },
    { id: Scenario.BANQUET_HALL_CHANDELIER, title: t('BANQUET_HALL_CHANDELIER_title'), description: t('BANQUET_HALL_CHANDELIER_description'), image: '/scenarios/BANQUET_HALL_CHANDELIER.jpg', requiresDesign: 'chandelier', subcategory: 'general' },
    { id: Scenario.MUSEUM_ATRIUM_CHANDELIER, title: t('MUSEUM_ATRIUM_CHANDELIER_title'), description: t('MUSEUM_ATRIUM_CHANDELIER_description'), image: '/scenarios/MUSEUM_ATRIUM_CHANDELIER.jpg', requiresDesign: 'chandelier', subcategory: 'general' },
    { id: Scenario.OPERA_HOUSE_LOBBY_CHANDELIER, title: t('OPERA_HOUSE_LOBBY_CHANDELIER_title'), description: t('OPERA_HOUSE_LOBBY_CHANDELIER_description'), image: '/scenarios/OPERA_HOUSE_LOBBY_CHANDELIER.jpg', requiresDesign: 'chandelier', subcategory: 'general' },
    { id: Scenario.PENTHOUSE_SUITE_CHANDELIER, title: t('PENTHOUSE_SUITE_CHANDELIER_title'), description: t('PENTHOUSE_SUITE_CHANDELIER_description'), image: '/scenarios/PENTHOUSE_SUITE_CHANDELIER.jpg', requiresDesign: 'chandelier', subcategory: 'general' },
    { id: Scenario.WOMAN_LASER_LAMP_KITCHEN_ADVERTISEMENT, title: t('WOMAN_LASER_LAMP_KITCHEN_ADVERTISEMENT_title'), description: t('WOMAN_LASER_LAMP_KITCHEN_ADVERTISEMENT_description'), image: '/scenarios/WOMAN_LASER_LAMP_KITCHEN_ADVERTISEMENT.jpg', requiresDesign: 'chandelier', subcategory: 'general' },
    { id: Scenario.WOMAN_LASER_LAMP_OFFICE_ADVERTISEMENT, title: t('WOMAN_LASER_LAMP_OFFICE_ADVERTISEMENT_title'), description: t('WOMAN_LASER_LAMP_OFFICE_ADVERTISEMENT_description'), image: '/scenarios/WOMAN_LASER_LAMP_OFFICE_ADVERTISEMENT.jpg', requiresDesign: 'chandelier', subcategory: 'general' },
    
    // Product
    { id: Scenario.PRODUCT_SHELF, title: t('PRODUCT_SHELF_title'), description: t('PRODUCT_SHELF_description'), image: '/scenarios/PRODUCT_SHELF.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductRetail' },
    { id: Scenario.WOMAN_HOLDING_PRODUCT_STREET, title: t('WOMAN_HOLDING_PRODUCT_STREET_title'), description: t('WOMAN_HOLDING_PRODUCT_STREET_description'), image: '/scenarios/WOMAN_HOLDING_PRODUCT_STREET.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductLifestyle' },
    { id: Scenario.WOMAN_STOOL_PRODUCT_LA, title: t('WOMAN_STOOL_PRODUCT_LA_title'), description: t('WOMAN_STOOL_PRODUCT_LA_description'), image: '/scenarios/WOMAN_STOOL_PRODUCT_LA.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductHomeLifestyle' },
    { id: Scenario.WOMAN_COUCH_PRODUCT_LA, title: t('WOMAN_COUCH_PRODUCT_LA_title'), description: t('WOMAN_COUCH_PRODUCT_LA_description'), image: '/scenarios/WOMAN_COUCH_PRODUCT_LA.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductHomeLifestyle' },
    { id: Scenario.WOMAN_SOFA_PRODUCT_PARIS, title: t('WOMAN_SOFA_PRODUCT_PARIS_title'), description: t('WOMAN_SOFA_PRODUCT_PARIS_description'), image: '/scenarios/WOMAN_SOFA_PRODUCT_PARIS.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductHomeLifestyle' },
    { id: Scenario.WOMAN_LINGERIE_PRODUCT_SWISS_PARISIAN, title: t('WOMAN_LINGERIE_PRODUCT_SWISS_PARISIAN_title'), description: t('WOMAN_LINGERIE_PRODUCT_SWISS_PARISIAN_description'), image: '/scenarios/WOMAN_LINGERIE_PRODUCT_SWISS_PARISIAN.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductHomeLifestyle' },
    { id: Scenario.WOMAN_NIGHTGOWN_PRODUCT_SWISS_PARISIAN, title: t('WOMAN_NIGHTGOWN_PRODUCT_SWISS_PARISIAN_title'), description: t('WOMAN_NIGHTGOWN_PRODUCT_SWISS_PARISIAN_description'), image: '/scenarios/WOMAN_NIGHTGOWN_PRODUCT_SWISS_PARISIAN.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductHomeLifestyle' },
    { id: Scenario.MOTHER_DAUGHTER_PRODUCT_CAMBRIDGE_ITALIANATE, title: t('MOTHER_DAUGHTER_PRODUCT_CAMBRIDGE_ITALIANATE_title'), description: t('MOTHER_DAUGHTER_PRODUCT_CAMBRIDGE_ITALIANATE_description'), image: '/scenarios/MOTHER_DAUGHTER_PRODUCT_CAMBRIDGE_ITALIANATE.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductHomeLifestyle' },
    { id: Scenario.WOMAN_PRODUCT_CAMBRIDGE_ITALIANATE, title: t('WOMAN_PRODUCT_CAMBRIDGE_ITALIANATE_title'), description: t('WOMAN_PRODUCT_CAMBRIDGE_ITALIANATE_description'), image: '/scenarios/WOMAN_PRODUCT_CAMBRIDGE_ITALIANATE.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductHomeLifestyle' },
    { id: Scenario.WOMAN_PRODUCT_ZURICH, title: t('WOMAN_PRODUCT_ZURICH_title'), description: t('WOMAN_PRODUCT_ZURICH_description'), image: '/scenarios/WOMAN_PRODUCT_ZURICH.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductLifestyle' },
    { id: Scenario.WOMAN_PRODUCT_GENEVA, title: t('WOMAN_PRODUCT_GENEVA_title'), description: t('WOMAN_PRODUCT_GENEVA_description'), image: '/scenarios/WOMAN_PRODUCT_GENEVA.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductLifestyle' },
    { id: Scenario.WOMAN_PRODUCT_ZERMATT, title: t('WOMAN_PRODUCT_ZERMATT_title'), description: t('WOMAN_PRODUCT_ZERMATT_description'), image: '/scenarios/WOMAN_PRODUCT_ZERMATT.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductLifestyle' },
    { id: Scenario.WOMAN_PRODUCT_BERN, title: t('WOMAN_PRODUCT_BERN_title'), description: t('WOMAN_PRODUCT_BERN_description'), image: '/scenarios/WOMAN_PRODUCT_BERN.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductLifestyle' },
    { id: Scenario.WOMAN_PRODUCT_LUCERNE, title: t('WOMAN_PRODUCT_LUCERNE_title'), description: t('WOMAN_PRODUCT_LUCERNE_description'), image: '/scenarios/WOMAN_PRODUCT_LUCERNE.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductLifestyle' },
    { id: Scenario.WOMAN_PRODUCT_LUGANO, title: t('WOMAN_PRODUCT_LUGANO_title'), description: t('WOMAN_PRODUCT_LUGANO_description'), image: '/scenarios/WOMAN_PRODUCT_LUGANO.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductLifestyle' },
    { id: Scenario.WOMAN_PRODUCT_ST_MORITZ, title: t('WOMAN_PRODUCT_ST_MORITZ_title'), description: t('WOMAN_PRODUCT_ST_MORITZ_description'), image: '/scenarios/WOMAN_PRODUCT_ST_MORITZ.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductLifestyle' },
    { id: Scenario.WOMAN_PRODUCT_INTERLAKEN, title: t('WOMAN_PRODUCT_INTERLAKEN_title'), description: t('WOMAN_PRODUCT_INTERLAKEN_description'), image: '/scenarios/WOMAN_PRODUCT_INTERLAKEN.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductLifestyle' },
    { id: Scenario.WOMAN_PRODUCT_MONTREUX, title: t('WOMAN_PRODUCT_MONTREUX_title'), description: t('WOMAN_PRODUCT_MONTREUX_description'), image: '/scenarios/WOMAN_PRODUCT_MONTREUX.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductLifestyle' },
    { id: Scenario.WOMAN_PRODUCT_LIVING_ROOM, title: t('WOMAN_PRODUCT_LIVING_ROOM_title'), description: t('WOMAN_PRODUCT_LIVING_ROOM_description'), image: '/scenarios/WOMAN_PRODUCT_LIVING_ROOM.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductHomeLifestyle' },
    { id: Scenario.WOMAN_PRODUCT_KITCHEN, title: t('WOMAN_PRODUCT_KITCHEN_title'), description: t('WOMAN_PRODUCT_KITCHEN_description'), image: '/scenarios/WOMAN_PRODUCT_KITCHEN.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductHomeLifestyle' },
    { id: Scenario.WOMAN_PRODUCT_BEDROOM, title: t('WOMAN_PRODUCT_BEDROOM_title'), description: t('WOMAN_PRODUCT_BEDROOM_description'), image: '/scenarios/WOMAN_PRODUCT_BEDROOM.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductHomeLifestyle' },
    { id: Scenario.WOMAN_PRODUCT_HOME_OFFICE, title: t('WOMAN_PRODUCT_HOME_OFFICE_title'), description: t('WOMAN_PRODUCT_HOME_OFFICE_description'), image: '/scenarios/WOMAN_PRODUCT_HOME_OFFICE.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductHomeLifestyle' },
    { id: Scenario.WOMAN_PRODUCT_BATHROOM, title: t('WOMAN_PRODUCT_BATHROOM_title'), description: t('WOMAN_PRODUCT_BATHROOM_description'), image: '/scenarios/WOMAN_PRODUCT_BATHROOM.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductHomeLifestyle' },
    { id: Scenario.WOMAN_PRODUCT_NURSERY, title: t('WOMAN_PRODUCT_NURSERY_title'), description: t('WOMAN_PRODUCT_NURSERY_description'), image: '/scenarios/WOMAN_PRODUCT_NURSERY.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductHomeLifestyle' },
    { id: Scenario.WOMAN_LASER_PRODUCT_MODERN_LIVING_ROOM, title: t('WOMAN_LASER_PRODUCT_MODERN_LIVING_ROOM_title'), description: t('WOMAN_LASER_PRODUCT_MODERN_LIVING_ROOM_description'), image: '/scenarios/WOMAN_LASER_PRODUCT_MODERN_LIVING_ROOM.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductHomeLifestyle' },
    { id: Scenario.WOMAN_LASER_PRODUCT_SCANDINAVIAN_BEDROOM, title: t('WOMAN_LASER_PRODUCT_SCANDINAVIAN_BEDROOM_title'), description: t('WOMAN_LASER_PRODUCT_SCANDINAVIAN_BEDROOM_description'), image: '/scenarios/WOMAN_LASER_PRODUCT_SCANDINAVIAN_BEDROOM.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductHomeLifestyle' },
    { id: Scenario.WOMAN_LASER_PRODUCT_BOHEMIAN_STUDIO, title: t('WOMAN_LASER_PRODUCT_BOHEMIAN_STUDIO_title'), description: t('WOMAN_LASER_PRODUCT_BOHEMIAN_STUDIO_description'), image: '/scenarios/WOMAN_LASER_PRODUCT_BOHEMIAN_STUDIO.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductHomeLifestyle' },
    { id: Scenario.WOMAN_LASER_PRODUCT_MINIMALIST_OFFICE, title: t('WOMAN_LASER_PRODUCT_MINIMALIST_OFFICE_title'), description: t('WOMAN_LASER_PRODUCT_MINIMALIST_OFFICE_description'), image: '/scenarios/WOMAN_LASER_PRODUCT_MINIMALIST_OFFICE.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductHomeLifestyle' },
    { id: Scenario.WOMAN_LASER_PRODUCT_RUSTIC_DINING_ROOM, title: t('WOMAN_LASER_PRODUCT_RUSTIC_DINING_ROOM_title'), description: t('WOMAN_LASER_PRODUCT_RUSTIC_DINING_ROOM_description'), image: '/scenarios/WOMAN_LASER_PRODUCT_RUSTIC_DINING_ROOM.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductHomeLifestyle' },
    { id: Scenario.WOMAN_LASER_LAMP_KITCHEN, title: t('WOMAN_LASER_LAMP_KITCHEN_title'), description: t('WOMAN_LASER_LAMP_KITCHEN_description'), image: '/scenarios/WOMAN_LASER_LAMP_KITCHEN.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductHomeLifestyle' },
    { id: Scenario.BOOK_COVER, title: t('BOOK_COVER_title'), description: t('BOOK_COVER_description'), image: '/scenarios/BOOK_COVER.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductPackaging' },
    { id: Scenario.CEREAL_BOX, title: t('CEREAL_BOX_title'), description: t('CEREAL_BOX_description'), image: '/scenarios/CEREAL_BOX.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductPackaging' },
    { id: Scenario.SHOPPING_BAG, title: t('SHOPPING_BAG_title'), description: t('SHOPPING_BAG_description'), image: '/scenarios/SHOPPING_BAG.jpg', requiresDesign: 'product', subcategory: 'subcategoryProductPackaging' },
    { id: Scenario.ICE_CREAM_PINT, title: t('ICE_CREAM_PINT_title'), description: t('ICE_CREAM_PINT_description'), image: '/scenarios/ICE_CREAM_PINT.jpg', requiresDesign: 'label', subcategory: 'subcategorySnacksDesserts' },
    { id: Scenario.CHOCOLATE_BAR_WRAPPER, title: t('CHOCOLATE_BAR_WRAPPER_title'), description: t('CHOCOLATE_BAR_WRAPPER_description'), image: '/scenarios/CHOCOLATE_BAR_WRAPPER.jpg', requiresDesign: 'label', subcategory: 'subcategorySnacksDesserts' },
    { id: Scenario.CHIPS_BAG, title: t('CHIPS_BAG_title'), description: t('CHIPS_BAG_description'), image: '/scenarios/CHIPS_BAG.jpg', requiresDesign: 'label', subcategory: 'subcategorySnacksDesserts' },
    { id: Scenario.YOGURT_CUP, title: t('YOGURT_CUP_title'), description: t('YOGURT_CUP_description'), image: '/scenarios/YOGURT_CUP.jpg', requiresDesign: 'label', subcategory: 'subcategorySnacksDesserts' },
    { id: Scenario.THROW_PILLOW_SOFA, title: t('THROW_PILLOW_SOFA_title'), description: t('THROW_PILLOW_SOFA_description'), image: '/scenarios/THROW_PILLOW_SOFA.jpg', requiresDesign: 'apparel', subcategory: 'subcategoryHomeGoods' },
    { id: Scenario.DUVET_COVER_BED, title: t('DUVET_COVER_BED_title'), description: t('DUVET_COVER_BED_description'), image: '/scenarios/DUVET_COVER_BED.jpg', requiresDesign: 'apparel', subcategory: 'subcategoryHomeGoods' },
    { id: Scenario.WALL_CLOCK_LIVING_ROOM, title: t('WALL_CLOCK_LIVING_ROOM_title'), description: t('WALL_CLOCK_LIVING_ROOM_description'), image: '/scenarios/WALL_CLOCK_LIVING_ROOM.jpg', requiresDesign: 'product', subcategory: 'subcategoryHomeGoods' },
    { id: Scenario.SHOWER_CURTAIN_BATHROOM, title: t('SHOWER_CURTAIN_BATHROOM_title'), description: t('SHOWER_CURTAIN_BATHROOM_description'), image: '/scenarios/SHOWER_CURTAIN_BATHROOM.jpg', requiresDesign: 'apparel', subcategory: 'subcategoryHomeGoods' },
    { id: Scenario.BEACH_TOWEL_SAND, title: t('BEACH_TOWEL_SAND_title'), description: t('BEACH_TOWEL_SAND_description'), image: '/scenarios/BEACH_TOWEL_SAND.jpg', requiresDesign: 'apparel', subcategory: 'subcategoryHomeGoods' },
    { id: Scenario.DRONE_BOX_PACKAGING, title: t('DRONE_BOX_PACKAGING_title'), description: t('DRONE_BOX_PACKAGING_description'), image: '/scenarios/DRONE_BOX_PACKAGING.jpg', requiresDesign: 'product', subcategory: 'subcategoryElectronicsPackaging' },
    { id: Scenario.SMART_SPEAKER_BOX, title: t('SMART_SPEAKER_BOX_title'), description: t('SMART_SPEAKER_BOX_description'), image: '/scenarios/SMART_SPEAKER_BOX.jpg', requiresDesign: 'product', subcategory: 'subcategoryElectronicsPackaging' },
    { id: Scenario.CAMERA_BOX_PACKAGING, title: t('CAMERA_BOX_PACKAGING_title'), description: t('CAMERA_BOX_PACKAGING_description'), image: '/scenarios/CAMERA_BOX_PACKAGING.jpg', requiresDesign: 'product', subcategory: 'subcategoryElectronicsPackaging' },
    { id: Scenario.GAMING_MOUSE_BOX, title: t('GAMING_MOUSE_BOX_title'), description: t('GAMING_MOUSE_BOX_description'), image: '/scenarios/GAMING_MOUSE_BOX.jpg', requiresDesign: 'product', subcategory: 'subcategoryElectronicsPackaging' },
    { id: Scenario.WEBCAM_BOX_PACKAGING, title: t('WEBCAM_BOX_PACKAGING_title'), description: t('WEBCAM_BOX_PACKAGING_description'), image: '/scenarios/WEBCAM_BOX_PACKAGING.jpg', requiresDesign: 'product', subcategory: 'subcategoryElectronicsPackaging' },

    // Screen
    { id: Scenario.OFFICE_SCREEN, title: t('OFFICE_SCREEN_title'), description: t('OFFICE_SCREEN_description'), image: '/scenarios/OFFICE_SCREEN.jpg', requiresDesign: 'screen', subcategory: 'subcategoryScreens' },
    { id: Scenario.LAPTOP_SCREEN, title: t('LAPTOP_SCREEN_title'), description: t('LAPTOP_SCREEN_description'), image: '/scenarios/LAPTOP_SCREEN.jpg', requiresDesign: 'screen', subcategory: 'subcategoryScreens' },
    { id: Scenario.PHONE_SCREEN, title: t('PHONE_SCREEN_title'), description: t('PHONE_SCREEN_description'), image: '/scenarios/PHONE_SCREEN.jpg', requiresDesign: 'screen', subcategory: 'subcategoryScreens' },
    { id: Scenario.TABLET_ON_DESK, title: t('TABLET_ON_DESK_title'), description: t('TABLET_ON_DESK_description'), image: '/scenarios/TABLET_ON_DESK.jpg', requiresDesign: 'screen', subcategory: 'subcategoryScreens' },
    { id: Scenario.PHONE_OUTDOORS, title: t('PHONE_OUTDOORS_title'), description: t('PHONE_OUTDOORS_description'), image: '/scenarios/PHONE_OUTDOORS.jpg', requiresDesign: 'screen', subcategory: 'subcategoryScreens' },
    { id: Scenario.MULTI_DEVICE_SHOWCASE, title: t('MULTI_DEVICE_SHOWCASE_title'), description: t('MULTI_DEVICE_SHOWCASE_description'), image: '/scenarios/MULTI_DEVICE_SHOWCASE.jpg', requiresDesign: 'screen', subcategory: 'subcategoryScreens' },
    { id: Scenario.CAR_DASHBOARD_SCREEN, title: t('CAR_DASHBOARD_SCREEN_title'), description: t('CAR_DASHBOARD_SCREEN_description'), image: '/scenarios/CAR_DASHBOARD_SCREEN.jpg', requiresDesign: 'screen', subcategory: 'subcategoryScreens' },
    { id: Scenario.SMARTWATCH_ON_WRIST, title: t('SMARTWATCH_ON_WRIST_title'), description: t('SMARTWATCH_ON_WRIST_description'), image: '/scenarios/SMARTWATCH_ON_WRIST.jpg', requiresDesign: 'screen', subcategory: 'subcategoryScreens' },
    { id: Scenario.TV_IN_LIVING_ROOM, title: t('TV_IN_LIVING_ROOM_title'), description: t('TV_IN_LIVING_ROOM_description'), image: '/scenarios/TV_IN_LIVING_ROOM.jpg', requiresDesign: 'screen', subcategory: 'subcategoryScreens' },
    { id: Scenario.ATM_SCREEN, title: t('ATM_SCREEN_title'), description: t('ATM_SCREEN_description'), image: '/scenarios/ATM_SCREEN.jpg', requiresDesign: 'screen', subcategory: 'subcategoryScreens' },
    { id: Scenario.PROJECTOR_SCREEN_MEETING, title: t('PROJECTOR_SCREEN_MEETING_title'), description: t('PROJECTOR_SCREEN_MEETING_description'), image: '/scenarios/PROJECTOR_SCREEN_MEETING.jpg', requiresDesign: 'screen', subcategory: 'subcategoryScreens' },
    { id: Scenario.HANDHELD_CONSOLE_SCREEN, title: t('HANDHELD_CONSOLE_SCREEN_title'), description: t('HANDHELD_CONSOLE_SCREEN_description'), image: '/scenarios/HANDHELD_CONSOLE_SCREEN.jpg', requiresDesign: 'screen', subcategory: 'subcategoryScreens' },
    { id: Scenario.COWORKING_SPACE_LAPTOP, title: t('COWORKING_SPACE_LAPTOP_title'), description: t('COWORKING_SPACE_LAPTOP_description'), image: '/scenarios/COWORKING_SPACE_LAPTOP.jpg', requiresDesign: 'screen', subcategory: 'subcategoryScreens' },
    { id: Scenario.MEDICAL_TABLET_SCREEN, title: t('MEDICAL_TABLET_SCREEN_title'), description: t('MEDICAL_TABLET_SCREEN_description'), image: '/scenarios/MEDICAL_TABLET_SCREEN.jpg', requiresDesign: 'screen', subcategory: 'subcategoryScreens' },
    { id: Scenario.RETAIL_POS_SCREEN, title: t('RETAIL_POS_SCREEN_title'), description: t('RETAIL_POS_SCREEN_description'), image: '/scenarios/RETAIL_POS_SCREEN.jpg', requiresDesign: 'screen', subcategory: 'subcategoryScreens' },
    { id: Scenario.DIGITAL_WHITEBOARD_MEETING, title: t('DIGITAL_WHITEBOARD_MEETING_title'), description: t('DIGITAL_WHITEBOARD_MEETING_description'), image: '/scenarios/DIGITAL_WHITEBOARD_MEETING.jpg', requiresDesign: 'screen', subcategory: 'subcategoryScreens' },
    
    // Apparel
    { id: Scenario.TSHIRT_MODEL, title: t('TSHIRT_MODEL_title'), description: t('TSHIRT_MODEL_description'), image: '/scenarios/TSHIRT_MODEL.jpg', requiresDesign: 'apparel', subcategory: 'subcategoryTops' },
    { id: Scenario.TSHIRT_MODEL_OUTDOORS_CLOSEUP, title: t('TSHIRT_MODEL_OUTDOORS_CLOSEUP_title'), description: t('TSHIRT_MODEL_OUTDOORS_CLOSEUP_description'), image: '/scenarios/TSHIRT_MODEL_OUTDOORS_CLOSEUP.jpg', requiresDesign: 'apparel', subcategory: 'subcategoryTops' },
    { id: Scenario.WOMAN_TSHIRT_CREATIVE_OFFICE, title: t('WOMAN_TSHIRT_CREATIVE_OFFICE_title'), description: t('WOMAN_TSHIRT_CREATIVE_OFFICE_description'), image: '/scenarios/WOMAN_TSHIRT_CREATIVE_OFFICE.jpg', requiresDesign: 'apparel', subcategory: 'subcategoryTops' },
    { id: Scenario.WOMAN_BLOUSE_CITY_STREET, title: t('WOMAN_BLOUSE_CITY_STREET_title'), description: t('WOMAN_BLOUSE_CITY_STREET_description'), image: '/scenarios/WOMAN_BLOUSE_CITY_STREET.jpg', requiresDesign: 'apparel', subcategory: 'subcategoryTops' },
    { id: Scenario.WOMAN_SILK_BLOUSE_ELEGANT_INTERIOR, title: t('WOMAN_SILK_BLOUSE_ELEGANT_INTERIOR_title'), description: t('WOMAN_SILK_BLOUSE_ELEGANT_INTERIOR_description'), image: '/scenarios/WOMAN_SILK_BLOUSE_ELEGANT_INTERIOR.jpg', requiresDesign: 'apparel', subcategory: 'subcategoryTops' },
    { id: Scenario.WOMAN_SPORTS_BLOUSE_OUTDOORS_CLOSEUP, title: t('WOMAN_SPORTS_BLOUSE_OUTDOORS_CLOSEUP_title'), description: t('WOMAN_SPORTS_BLOUSE_OUTDOORS_CLOSEUP_description'), image: '/scenarios/WOMAN_SPORTS_BLOUSE_OUTDOORS_CLOSEUP.jpg', requiresDesign: 'apparel', subcategory: 'subcategoryTops' },
    { id: Scenario.HOODIE_MODEL, title: t('HOODIE_MODEL_title'), description: t('HOODIE_MODEL_description'), image: '/scenarios/HOODIE_MODEL.jpg', requiresDesign: 'apparel', subcategory: 'subcategoryTops' },
    { id: Scenario.SWEATSHIRT_HANGER, title: t('SWEATSHIRT_HANGER_title'), description: t('SWEATSHIRT_HANGER_description'), image: '/scenarios/SWEATSHIRT_HANGER.jpg', requiresDesign: 'apparel', subcategory: 'subcategoryTops' },
    { id: Scenario.TANK_TOP_FITNESS, title: t('TANK_TOP_FITNESS_title'), description: t('TANK_TOP_FITNESS_description'), image: '/scenarios/TANK_TOP_FITNESS.jpg', requiresDesign: 'apparel', subcategory: 'subcategoryTops' },
    { id: Scenario.FOLDED_SHIRT_HELD, title: t('FOLDED_SHIRT_HELD_title'), description: t('FOLDED_SHIRT_HELD_description'), image: '/scenarios/FOLDED_SHIRT_HELD.jpg', requiresDesign: 'apparel', subcategory: 'subcategoryTops' },
    { id: Scenario.FOLDED_SHIRT_HELD_CLOSEUP, title: t('FOLDED_SHIRT_HELD_CLOSEUP_title'), description: t('FOLDED_SHIRT_HELD_CLOSEUP_description'), image: '/scenarios/FOLDED_SHIRT_HELD_CLOSEUP.jpg', requiresDesign: 'apparel', subcategory: 'subcategoryTops' },
    { id: Scenario.WOMAN_HOLDING_TSHIRT_OUTDOORS_CLOSEUP, title: t('WOMAN_HOLDING_TSHIRT_OUTDOORS_CLOSEUP_title'), description: t('WOMAN_HOLDING_TSHIRT_OUTDOORS_CLOSEUP_description'), image: '/scenarios/WOMAN_HOLDING_TSHIRT_OUTDOORS_CLOSEUP.jpg', requiresDesign: 'apparel', subcategory: 'subcategoryTops' },

    { id: Scenario.TOTE_BAG_LIFESTYLE, title: t('TOTE_BAG_LIFESTYLE_title'), description: t('TOTE_BAG_LIFESTYLE_description'), image: '/scenarios/TOTE_BAG_LIFESTYLE.jpg', requiresDesign: 'apparel', subcategory: 'subcategoryAccessories' },
    { id: Scenario.BASEBALL_CAP_MODEL, title: t('BASEBALL_CAP_MODEL_title'), description: t('BASEBALL_CAP_MODEL_description'), image: '/scenarios/BASEBALL_CAP_MODEL.jpg', requiresDesign: 'apparel', subcategory: 'subcategoryAccessories' },
    { id: Scenario.BEANIE_MODEL, title: t('BEANIE_MODEL_title'), description: t('BEANIE_MODEL_description'), image: '/scenarios/BEANIE_MODEL.jpg', requiresDesign: 'apparel', subcategory: 'subcategoryAccessories' },
    { id: Scenario.SOCKS_PAIR, title: t('SOCKS_PAIR_title'), description: t('SOCKS_PAIR_description'), image: '/scenarios/SOCKS_PAIR.jpg', requiresDesign: 'apparel', subcategory: 'subcategoryAccessories' },
    { id: Scenario.APRON_PERSON, title: t('APRON_PERSON_title'), description: t('APRON_PERSON_description'), image: '/scenarios/APRON_PERSON.jpg', requiresDesign: 'apparel', subcategory: 'subcategoryAccessories' },

    { id: Scenario.BABY_ONESIE_FLATLAY, title: t('BABY_ONESIE_FLATLAY_title'), description: t('BABY_ONESIE_FLATLAY_description'), image: '/scenarios/BABY_ONESIE_FLATLAY.jpg', requiresDesign: 'apparel', subcategory: 'subcategoryKids' },

    // Billboard
    { id: Scenario.CITY_BILLBOARD, title: t('CITY_BILLBOARD_title'), description: t('CITY_BILLBOARD_description'), image: '/scenarios/CITY_BILLBOARD.jpg', requiresDesign: 'billboard', subcategory: 'subcategoryBillboardUrban' },
    { id: Scenario.TIMES_SQUARE_SCREENS, title: t('TIMES_SQUARE_SCREENS_title'), description: t('TIMES_SQUARE_SCREENS_description'), image: '/scenarios/TIMES_SQUARE_SCREENS.jpg', requiresDesign: 'billboard', subcategory: 'subcategoryBillboardUrban' },
    { id: Scenario.SUBWAY_AD, title: t('SUBWAY_AD_title'), description: t('SUBWAY_AD_description'), image: '/scenarios/SUBWAY_AD.jpg', requiresDesign: 'billboard', subcategory: 'subcategoryBillboardUrban' },
    { id: Scenario.BUS_STOP_AD, title: t('BUS_STOP_AD_title'), description: t('BUS_STOP_AD_description'), image: '/scenarios/BUS_STOP_AD.jpg', requiresDesign: 'billboard', subcategory: 'subcategoryBillboardUrban' },
    { id: Scenario.BUILDING_BANNER, title: t('BUILDING_BANNER_title'), description: t('BUILDING_BANNER_description'), image: '/scenarios/BUILDING_BANNER.jpg', requiresDesign: 'billboard', subcategory: 'subcategoryBillboardUrban' },
    { id: Scenario.CONSTRUCTION_BANNER, title: t('CONSTRUCTION_BANNER_title'), description: t('CONSTRUCTION_BANNER_description'), image: '/scenarios/CONSTRUCTION_BANNER.jpg', requiresDesign: 'billboard', subcategory: 'subcategoryBillboardUrban' },
    { id: Scenario.HIGHWAY_BILLBOARD, title: t('HIGHWAY_BILLBOARD_title'), description: t('HIGHWAY_BILLBOARD_description'), image: '/scenarios/HIGHWAY_BILLBOARD.jpg', requiresDesign: 'billboard', subcategory: 'subcategoryBillboardRoadside' },
    { id: Scenario.RURAL_BILLBOARD, title: t('RURAL_BILLBOARD_title'), description: t('RURAL_BILLBOARD_description'), image: '/scenarios/RURAL_BILLBOARD.jpg', requiresDesign: 'billboard', subcategory: 'subcategoryBillboardRoadside' },
    { id: Scenario.STADIUM_JUMBOTRON, title: t('STADIUM_JUMBOTRON_title'), description: t('STADIUM_JUMBOTRON_description'), image: '/scenarios/STADIUM_JUMBOTRON.jpg', requiresDesign: 'billboard', subcategory: 'subcategoryBillboardIndoor' },
    { id: Scenario.MALL_SCREEN, title: t('MALL_SCREEN_title'), description: t('MALL_SCREEN_description'), image: '/scenarios/MALL_SCREEN.jpg', requiresDesign: 'billboard', subcategory: 'subcategoryBillboardIndoor' },

    // Poster
    { id: Scenario.STREET_POSTER, title: t('STREET_POSTER_title'), description: t('STREET_POSTER_description'), image: '/scenarios/STREET_POSTER.jpg', requiresDesign: 'poster', subcategory: 'subcategoryPosterUrban' },
    { id: Scenario.STREET_A_FRAME_SIGN, title: t('STREET_A_FRAME_SIGN_title'), description: t('STREET_A_FRAME_SIGN_description'), image: '/scenarios/STREET_A_FRAME_SIGN.jpg', requiresDesign: 'poster', subcategory: 'subcategoryPosterUrban' },
    { id: Scenario.WHEATPASTE_POSTERS_WALL, title: t('WHEATPASTE_POSTERS_WALL_title'), description: t('WHEATPASTE_POSTERS_WALL_description'), image: '/scenarios/WHEATPASTE_POSTERS_WALL.jpg', requiresDesign: 'poster', subcategory: 'subcategoryPosterUrban' },
    { id: Scenario.BUS_SHELTER_POSTER, title: t('BUS_SHELTER_POSTER_title'), description: t('BUS_SHELTER_POSTER_description'), image: '/scenarios/BUS_SHELTER_POSTER.jpg', requiresDesign: 'poster', subcategory: 'subcategoryPosterUrban' },
    { id: Scenario.MUSIC_VENUE_POSTER_WALL, title: t('MUSIC_VENUE_POSTER_WALL_title'), description: t('MUSIC_VENUE_POSTER_WALL_description'), image: '/scenarios/MUSIC_VENUE_POSTER_WALL.jpg', requiresDesign: 'poster', subcategory: 'subcategoryPosterUrban' },
    { id: Scenario.FRAMED_POSTER_LIVING_ROOM, title: t('FRAMED_POSTER_LIVING_ROOM_title'), description: t('FRAMED_POSTER_LIVING_ROOM_description'), image: '/scenarios/FRAMED_POSTER_LIVING_ROOM.jpg', requiresDesign: 'poster', subcategory: 'subcategoryPosterIndoor' },
    { id: Scenario.CAFE_INTERIOR_POSTER, title: t('CAFE_INTERIOR_POSTER_title'), description: t('CAFE_INTERIOR_POSTER_description'), image: '/scenarios/CAFE_INTERIOR_POSTER.jpg', requiresDesign: 'poster', subcategory: 'subcategoryPosterIndoor' },
    { id: Scenario.ART_GALLERY_POSTER, title: t('ART_GALLERY_POSTER_title'), description: t('ART_GALLERY_POSTER_description'), image: '/scenarios/ART_GALLERY_POSTER.jpg', requiresDesign: 'poster', subcategory: 'subcategoryPosterIndoor' },
    { id: Scenario.COMMUNITY_BULLETIN_BOARD, title: t('COMMUNITY_BULLETIN_BOARD_title'), description: t('COMMUNITY_BULLETIN_BOARD_description'), image: '/scenarios/COMMUNITY_BULLETIN_BOARD.jpg', requiresDesign: 'poster', subcategory: 'subcategoryPosterCommunity' },
    { id: Scenario.PERSON_HOLDING_POSTER, title: t('PERSON_HOLDING_POSTER_title'), description: t('PERSON_HOLDING_POSTER_description'), image: '/scenarios/PERSON_HOLDING_POSTER.jpg', requiresDesign: 'poster', subcategory: 'subcategoryPosterCommunity' },

    // Coffee Mugs
    { id: Scenario.COFFEE_MUG, title: t('COFFEE_MUG_title'), description: t('COFFEE_MUG_description'), image: '/scenarios/COFFEE_MUG.jpg', requiresDesign: 'mug_design', subcategory: 'subcategoryMugLifestyle' },
    { id: Scenario.MUG_HELD_BY_PERSON, title: t('MUG_HELD_BY_PERSON_title'), description: t('MUG_HELD_BY_PERSON_description'), image: '/scenarios/MUG_HELD_BY_PERSON.jpg', requiresDesign: 'mug_design', subcategory: 'subcategoryMugLifestyle' },
    { id: Scenario.MUGS_PAIR, title: t('MUGS_PAIR_title'), description: t('MUGS_PAIR_description'), image: '/scenarios/MUGS_PAIR.jpg', requiresDesign: 'mug_design', subcategory: 'subcategoryMugLifestyle' },
    { id: Scenario.MUG_CAMPING, title: t('MUG_CAMPING_title'), description: t('MUG_CAMPING_description'), image: '/scenarios/MUG_CAMPING.jpg', requiresDesign: 'mug_design', subcategory: 'subcategoryMugLifestyle' },
    { id: Scenario.MUG_OFFICE_DESK, title: t('MUG_OFFICE_DESK_title'), description: t('MUG_OFFICE_DESK_description'), image: '/scenarios/MUG_OFFICE_DESK.jpg', requiresDesign: 'mug_design', subcategory: 'subcategoryMugHomeOffice' },
    { id: Scenario.MUG_KITCHEN_COUNTER, title: t('MUG_KITCHEN_COUNTER_title'), description: t('MUG_KITCHEN_COUNTER_description'), image: '/scenarios/MUG_KITCHEN_COUNTER.jpg', requiresDesign: 'mug_design', subcategory: 'subcategoryMugHomeOffice' },
    { id: Scenario.MUG_WITH_BOOKS, title: t('MUG_WITH_BOOKS_title'), description: t('MUG_WITH_BOOKS_description'), image: '/scenarios/MUG_WITH_BOOKS.jpg', requiresDesign: 'mug_design', subcategory: 'subcategoryMugHomeOffice' },
    { id: Scenario.MUG_HOLIDAY, title: t('MUG_HOLIDAY_title'), description: t('MUG_HOLIDAY_description'), image: '/scenarios/MUG_HOLIDAY.jpg', requiresDesign: 'mug_design', subcategory: 'subcategoryMugThemed' },
    { id: Scenario.MUG_IN_GIFT_BOX, title: t('MUG_IN_GIFT_BOX_title'), description: t('MUG_IN_GIFT_BOX_description'), image: '/scenarios/MUG_IN_GIFT_BOX.jpg', requiresDesign: 'mug_design', subcategory: 'subcategoryMugThemed' },
    { id: Scenario.ESPRESSO_CUP_SAUCER, title: t('ESPRESSO_CUP_SAUCER_title'), description: t('ESPRESSO_CUP_SAUCER_description'), image: '/scenarios/ESPRESSO_CUP_SAUCER.jpg', requiresDesign: 'mug_design', subcategory: 'subcategoryMugThemed' },

    // Cosmetics & Labels
    { id: Scenario.COSMETIC_JAR, title: t('COSMETIC_JAR_title'), description: t('COSMETIC_JAR_description'), image: '/scenarios/COSMETIC_JAR.jpg', requiresDesign: 'label', subcategory: 'subcategoryCosmetics' },
    { id: Scenario.SERUM_BOTTLE, title: t('SERUM_BOTTLE_title'), description: t('SERUM_BOTTLE_description'), image: '/scenarios/SERUM_BOTTLE.jpg', requiresDesign: 'label', subcategory: 'subcategoryCosmetics' },
    { id: Scenario.PUMP_BOTTLE, title: t('PUMP_BOTTLE_title'), description: t('PUMP_BOTTLE_description'), image: '/scenarios/PUMP_BOTTLE.jpg', requiresDesign: 'label', subcategory: 'subcategoryCosmetics' },
    { id: Scenario.SQUEEZE_TUBE, title: t('SQUEEZE_TUBE_title'), description: t('SQUEEZE_TUBE_description'), image: '/scenarios/SQUEEZE_TUBE.jpg', requiresDesign: 'label', subcategory: 'subcategoryCosmetics' },
    { id: Scenario.WINE_BOTTLE, title: t('WINE_BOTTLE_title'), description: t('WINE_BOTTLE_description'), image: '/scenarios/WINE_BOTTLE.jpg', requiresDesign: 'label', subcategory: 'subcategoryBeverages' },
    { id: Scenario.SODA_CAN, title: t('SODA_CAN_title'), description: t('SODA_CAN_description'), image: '/scenarios/SODA_CAN.jpg', requiresDesign: 'label', subcategory: 'subcategoryBeverages' },
    { id: Scenario.BEER_BOTTLE, title: t('BEER_BOTTLE_title'), description: t('BEER_BOTTLE_description'), image: '/scenarios/BEER_BOTTLE.jpg', requiresDesign: 'label', subcategory: 'subcategoryBeverages' },
    { id: Scenario.OLIVE_OIL_BOTTLE, title: t('OLIVE_OIL_BOTTLE_title'), description: t('OLIVE_OIL_BOTTLE_description'), image: '/scenarios/OLIVE_OIL_BOTTLE.jpg', requiresDesign: 'label', subcategory: 'subcategoryFoodPantry' },
    { id: Scenario.COFFEE_BAG, title: t('COFFEE_BAG_title'), description: t('COFFEE_BAG_description'), image: '/scenarios/COFFEE_BAG.jpg', requiresDesign: 'label', subcategory: 'subcategoryFoodPantry' },
    { id: Scenario.HONEY_JAR, title: t('HONEY_JAR_title'), description: t('HONEY_JAR_description'), image: '/scenarios/HONEY_JAR.jpg', requiresDesign: 'label', subcategory: 'subcategoryFoodPantry' },
    { id: Scenario.PILL_BOTTLE, title: t('PILL_BOTTLE_title'), description: t('PILL_BOTTLE_description'), image: '/scenarios/PILL_BOTTLE.jpg', requiresDesign: 'label', subcategory: 'subcategoryHomeHealth' },
    { id: Scenario.CANDLE_JAR, title: t('CANDLE_JAR_title'), description: t('CANDLE_JAR_description'), image: '/scenarios/CANDLE_JAR.jpg', requiresDesign: 'label', subcategory: 'subcategoryHomeHealth' },
    { id: Scenario.SOAP_BAR_WRAP, title: t('SOAP_BAR_WRAP_title'), description: t('SOAP_BAR_WRAP_description'), image: '/scenarios/SOAP_BAR_WRAP.jpg', requiresDesign: 'label', subcategory: 'subcategoryHomeHealth' },
    { id: Scenario.SPRAY_BOTTLE, title: t('SPRAY_BOTTLE_title'), description: t('SPRAY_BOTTLE_description'), image: '/scenarios/SPRAY_BOTTLE.jpg', requiresDesign: 'label', subcategory: 'subcategoryHomeHealth' },
  ], [t]);


  const CATEGORIES = useMemo(() => {
    const categories: Record<string, { title: string, scenariosBySubcategory: Record<string, ScenarioOption[]> }> = {};
    SCENARIO_OPTIONS.forEach(option => {
      const designType = option.requiresDesign;
      const categoryKey = `category_${designType}`;
      if (!categories[categoryKey]) {
        categories[categoryKey] = {
          title: t(categoryKey),
          scenariosBySubcategory: {}
        };
      }
      const subcategory = option.subcategory || 'general';
      if (!categories[categoryKey].scenariosBySubcategory[subcategory]) {
        categories[categoryKey].scenariosBySubcategory[subcategory] = [];
      }
      categories[categoryKey].scenariosBySubcategory[subcategory].push(option);
    });
    return categories;
  }, [SCENARIO_OPTIONS, t]);
  
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  const [selectedCategoryKey, setSelectedCategoryKey] = useState(Object.keys(CATEGORIES)[0]);
  
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(
      () => {
        const firstCategory = CATEGORIES[Object.keys(CATEGORIES)[0]];
        const firstSubcategoryKey = Object.keys(firstCategory.scenariosBySubcategory)[0];
        return firstCategory.scenariosBySubcategory[firstSubcategoryKey][0].id;
      }
  );

  const [design, setDesign] = useState<{ base64: string, mimeType: string, dataUrl: string } | null>(null);
  const [baseSceneVariations, setBaseSceneVariations] = useState<string[]>([]);
  const [selectedBaseScene, setSelectedBaseScene] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [variationCount, setVariationCount] = useState(3);
  const [artisticStyle, setArtisticStyle] = useState('none');
  const [backgroundBlur, setBackgroundBlur] = useState(false);
  const [highQualityMode, setHighQualityMode] = useState(false);

  const currentScenarioInfo = useMemo(() => {
    return SCENARIO_OPTIONS.find(opt => opt.id === selectedScenario);
  }, [selectedScenario, SCENARIO_OPTIONS]);
  
  const ARTISTIC_STYLES = useMemo(() => [
    { id: 'none', label: 'styleNone', description: 'styleNoneDescription' },
    { id: 'cinematic', label: 'styleCinematic', description: 'styleCinematicDescription' },
    { id: 'vintage', label: 'styleVintage', description: 'styleVintageDescription' },
    { id: 'watercolor', label: 'styleWatercolor', description: 'styleWatercolorDescription' },
    { id: 'noir', label: 'styleNoir', description: 'styleNoirDescription' },
    { id: 'pop_art', label: 'stylePopArt', description: 'stylePopArtDescription' },
    { id: 'impressionism', label: 'styleImpressionism', description: 'styleImpressionismDescription' },
  ], []);


  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    document.body.className = `bg-gray-100 dark:bg-gray-800 font-sans font-size-${fontSize}`;
  }, [fontSize]);
  
  const handleThemeChange = (newTheme: 'light' | 'dark') => setTheme(newTheme);
  const handleFontSizeChange = (newSize: 'sm' | 'base' | 'lg') => setFontSize(newSize);

  const handleToggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };


  const handleImageUpload = useCallback((base64: string, mimeType: string, dataUrl: string) => {
    setDesign({ base64, mimeType, dataUrl });
    setUploadError('');
  }, []);

  const handleClearImage = useCallback(() => {
    setDesign(null);
  }, []);

  const handleSelectCategory = (categoryKey: string) => {
    setSelectedCategoryKey(categoryKey);
    const categoryData = CATEGORIES[categoryKey];
    const firstSubcategoryKey = Object.keys(categoryData.scenariosBySubcategory)[0];
    const firstScenario = categoryData.scenariosBySubcategory[firstSubcategoryKey][0];
    setSelectedScenario(firstScenario.id);
    resetGenerationState();
  };
  
  const handleSelectScenario = (scenarioId: Scenario) => {
      setSelectedScenario(scenarioId);
      resetGenerationState();
  };

  const resetGenerationState = () => {
      setBaseSceneVariations([]);
      setSelectedBaseScene(null);
      setGeneratedImage(null);
      setError(null);
      setDesign(null);
      setUploadError('');
      setBackgroundBlur(false);
  }

  const handleGenerateScenes = async () => {
    setError(null);
    setBaseSceneVariations([]);
    setSelectedBaseScene(null);
    setGeneratedImage(null);
    setIsLoading(true);
    setLoadingStep(t('generatingScenes'));
    try {
      const basePrompt = PROMPTS.base[selectedScenario];
      const variations = await generateBaseImage(basePrompt, aspectRatio, variationCount);
      setBaseSceneVariations(variations);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMockup = async () => {
    if (!selectedBaseScene) {
      setError("Please generate and select a base scene first.");
      return;
    }
    const requiresDesign = currentScenarioInfo?.requiresDesign;
    if (requiresDesign !== 'none' && !design) {
      setError(`Please upload a design image for the ${requiresDesign}.`);
      return;
    }
    
    setError(null);
    setIsLoading(true);
    setGeneratedImage(null);

    try {
      let finalImage = selectedBaseScene;

      if (requiresDesign !== 'none' && design) {
        setLoadingStep(t('compositingDesign'));
        const editPrompt = PROMPTS.edit[requiresDesign];
        const editedImage = await editImage(selectedBaseScene, design.base64, design.mimeType, editPrompt);
        finalImage = editedImage;
      }
      
      if (backgroundBlur) {
        setLoadingStep(t('applyingStyle'));
        const blurPrompt = PROMPTS.style.background_blur;
        const blurredImage = await applyArtisticStyle(finalImage, blurPrompt);
        finalImage = blurredImage;
      }

      if (artisticStyle !== 'none') {
        setLoadingStep(t('applyingStyle'));
        const stylePrompt = PROMPTS.style[artisticStyle as keyof typeof PROMPTS.style];
        const styledImage = await applyArtisticStyle(finalImage, stylePrompt);
        finalImage = styledImage;
      }
      
      if (highQualityMode && artisticStyle === 'none' && !backgroundBlur) {
        setLoadingStep(t('applyingStyle'));
        const enhancePrompt = "Enhance the image to achieve photorealistic quality, with ultra-fine details, improved lighting, and crisp focus. Do not change the composition or content.";
        const enhancedImage = await applyArtisticStyle(finalImage, enhancePrompt);
        finalImage = enhancedImage;
      }

      setGeneratedImage(`data:image/png;base64,${finalImage}`);

    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const designTypeNeeded = currentScenarioInfo?.requiresDesign ?? 'none';
  const showUploader = designTypeNeeded !== 'none';
  const showGenerateScenes = PROMPTS.base.hasOwnProperty(selectedScenario);
  
  return (
    <div className={`min-h-screen ${theme} font-sans`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Header 
        theme={theme} 
        onThemeChange={handleThemeChange}
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        onToggleFullScreen={handleToggleFullScreen}
      />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            
            {/* Step 1: Scenario Selection */}
            <section aria-labelledby="scenario-heading">
              <ScenarioSelector
                categories={CATEGORIES}
                selectedCategory={selectedCategoryKey}
                onSelectCategory={handleSelectCategory}
                selectedScenario={selectedScenario}
                onSelectScenario={handleSelectScenario}
              />
            </section>
            
            {/* Step 2: Scene Generation */}
            {showGenerateScenes && (
              <section aria-labelledby="scene-generation-heading" className="space-y-6">
                <h2 id="scene-generation-heading" className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('step2Title')}</h2>
                 <p className="text-gray-600 dark:text-gray-400 -mt-4">{t('step2Subtitle')}</p>
                <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                <VariationCountSelector value={variationCount} onChange={setVariationCount} />
                <Button onClick={handleGenerateScenes} disabled={isLoading}>
                  {isLoading && loadingStep === t('generatingScenes') ? t('generatingScenes') : t('generateScenesButton')}
                </Button>
                 {baseSceneVariations.length > 0 && !isLoading && (
                  <div className="grid grid-cols-3 gap-2">
                    {baseSceneVariations.map((imgSrc, index) => (
                      <button 
                        key={index} 
                        onClick={() => setSelectedBaseScene(imgSrc)}
                        className={`rounded-md overflow-hidden border-4 transition-colors duration-200 ${selectedBaseScene === imgSrc ? 'border-gray-800 dark:border-gray-500' : 'border-transparent hover:border-gray-400'}`}
                      >
                        <img src={`data:image/png;base64,${imgSrc}`} alt={`Variation ${index + 1}`} className="w-full h-full object-cover aspect-square" />
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Step 3: Upload Design */}
            {showUploader && (
              <section aria-labelledby="upload-heading" className="space-y-2">
                <h2 id="upload-heading" className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('step3Title')}</h2>
                <p className="text-gray-600 dark:text-gray-400">{t('step3Subtitle', { designType: t(designTypeNeeded) })}</p>
                <ImageUploader
                  onImageUpload={handleImageUpload}
                  onClearImage={handleClearImage}
                  onError={setUploadError}
                  designType={designTypeNeeded}
                  previewUrl={design?.dataUrl ?? null}
                />
                {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
              </section>
            )}

            {/* Step 4: Artistic Effects */}
            <section aria-labelledby="effects-heading" className="space-y-6">
               <h2 id="effects-heading" className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('step4Title')}</h2>
              <ArtisticStyleSelector
                styles={ARTISTIC_STYLES}
                selectedStyle={artisticStyle}
                onSelectStyle={setArtisticStyle}
              />
               <ToggleSwitch
                  label={t('backgroundBlurEffect')}
                  description={t('backgroundBlurEffectDescription')}
                  checked={backgroundBlur}
                  onChange={setBackgroundBlur}
                />
               <ToggleSwitch
                  label={t('highQualityMode')}
                  description={t('highQualityModeDescription')}
                  checked={highQualityMode}
                  onChange={setHighQualityMode}
                  disabled={artisticStyle !== 'none' || backgroundBlur || !showGenerateScenes}
                />
            </section>

          </div>
          
          {/* Step 5: Result Display */}
          <div className="lg:col-span-2">
             <section aria-labelledby="result-heading" className="sticky top-8">
              <h2 id="result-heading" className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t('step5Title')}</h2>
              <MockupDisplay
                isLoading={isLoading}
                loadingStep={loadingStep}
                error={error}
                generatedImage={generatedImage}
                aspectRatio={aspectRatio}
              />
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleGenerateMockup} 
                  disabled={isLoading || !selectedBaseScene || (showUploader && !design)}
                  className="w-full sm:w-auto flex-grow"
                >
                  {isLoading && loadingStep !== t('generatingScenes') ? t('generatingButton') : t('generateButton')}
                </Button>
                {generatedImage && (
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generatedImage;
                      link.download = `mockup-${selectedScenario}.png`;
                      link.click();
                    }}
                    className="w-full sm:w-auto"
                  >
                    {t('downloadButton')}
                  </Button>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;