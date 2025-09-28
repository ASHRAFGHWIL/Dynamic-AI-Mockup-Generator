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
    [Scenario.SITTING_FRAME]: 'DSLR photograph, fashion magazine style. An elegant woman sits in a chic, minimalist apartment with soft, natural light from a large window. She holds a large, simple, matte black frame. The interior of the frame is a solid, vibrant magenta color (#FF00FF) to serve as a placeholder. The frame is held flat, facing the camera. Shallow depth of field with a slightly blurred background. 4K, hyper-realistic, sharp focus on the woman and frame.',
    [Scenario.STANDING_FRAME]: 'Professional studio photograph, full-body shot. An elegant woman stands against a clean, neutral grey studio background. She holds a large, simple, matte black frame. The interior of the frame is a solid, vibrant magenta color (#FF00FF) as a clear placeholder. The frame is held perfectly flat towards the camera. The lighting is soft and even, mimicking a high-end fashion shoot. 4K, hyper-realistic, tack-sharp details.',
    [Scenario.ARMCHAIR_FRAME]: 'Cozy and luxurious interior photograph. An elegant woman relaxes in a plush, designer armchair. She holds a medium-sized, ornate wooden frame. The placeholder area inside the frame is a solid, vibrant magenta color (#FF00FF). The scene is lit with warm, soft ambient light, creating a comfortable and sophisticated atmosphere. Shallow depth of field. 4K, hyper-realistic, rich textures.',
    [Scenario.HOME_FRAME]: 'DSLR photograph of a modern, well-lit home entryway. On a clean, white wall, there is a large, simple, matte black frame hanging. The interior of the frame is a solid, vibrant magenta color (#FF00FF) as a placeholder. The scene includes a stylish console table with a vase of flowers and a decorative lamp. The lighting is bright and natural. 4K, hyper-realistic, architectural digest style.',
    [Scenario.KITCHEN_FRAME]: 'Professional photograph of a spacious, modern gourmet kitchen with white marble countertops and dark wood cabinets. On a tiled backsplash wall, there is a medium-sized, simple wooden frame. The interior of the frame is a solid, vibrant magenta color (#FF00FF) placeholder. The kitchen is clean and tidy, with some tasteful decor like a bowl of fruit. The scene is bathed in bright, natural light from a window. 4K, hyper-realistic, sharp focus.',
    [Scenario.LIVING_ROOM_FRAME]: 'Interior design photograph of a cozy, contemporary living room. A comfortable fabric sofa is against a feature wall. Hanging centered above the sofa is a large, elegant metal frame. The placeholder area inside the frame is a solid, vibrant magenta color (#FF00FF). The room is decorated with plush cushions, a coffee table, and a rug. Warm, inviting ambient light. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.BEDROOM_FRAME]: 'Photograph of a serene and minimalist bedroom. A neatly made bed with high-quality linens is the centerpiece. On the wall above the headboard hangs a medium-sized, light wood frame. The interior of the frame is a solid, vibrant magenta color (#FF00FF) placeholder. Soft morning light streams in through a sheer-curtained window. The atmosphere is peaceful and calm. 4K, hyper-realistic.',
    [Scenario.KIDS_ROOM_FRAME]: 'Bright and cheerful photograph of a modern, playful kids\' room. The room has colorful walls and fun furniture. On one wall, above a small desk, hangs a simple, white frame. The interior of the frame is a solid, vibrant magenta color (#FF00FF) placeholder. The room is filled with toys and books, creating a lively atmosphere. Bright, even lighting. 4K, hyper-realistic.',
    [Scenario.HALL_FRAME]: 'Architectural photograph of a long, elegant hallway in a modern home. The walls are a neutral color, and the floor is polished hardwood. On the main wall, one frame in a gallery-style arrangement is a solid, vibrant magenta color (#FF00FF) placeholder, while other frames contain abstract, blurred art. The lighting comes from stylish ceiling fixtures. 4K, hyper-realistic, leading lines.',
    [Scenario.LIBRARY_FRAME]: 'Photograph of a classic, cozy home library with floor-to-ceiling dark wood bookshelves filled with books. In a clear space on the wall between two bookshelves hangs an ornate, vintage-style frame. The placeholder area inside the frame is a solid, vibrant magenta color (#FF00FF). A leather armchair and a warm reading lamp are nearby. The lighting is warm and moody. 4K, hyper-realistic, rich textures.',
    [Scenario.MINIMALIST_DESK_FRAME]: 'DSLR photograph of a clean, minimalist desk setup against a white wall. On the desk, leaning against the wall, is a simple, modern frame. The interior of the frame is a solid, vibrant magenta color (#FF00FF) as a placeholder. The desk has a laptop, a small plant, and a notebook. Natural light from a side window. 4K, hyper-realistic, Scandinavian design aesthetic.',
    [Scenario.CREATIVE_STUDIO_FRAME]: 'Photograph of a bright, airy artist\'s studio. In the center, there is a wooden easel. On the easel rests a large, gallery-style frame. The interior of the frame is a solid, vibrant magenta color (#FF00FF) as a placeholder. The studio is filled with art supplies, canvases, and has large windows letting in natural light. 4K, hyper-realistic, inspiring atmosphere.',
    [Scenario.OUTDOOR_CAFE_FRAME]: 'Lifestyle photograph, shallow depth of field. A person\'s hands are holding a medium-sized wooden frame at a table of a chic outdoor cafe. The placeholder area inside the frame is a solid, vibrant magenta color (#FF00FF). The background is a beautifully blurred street scene with warm afternoon light. 4K, hyper-realistic, cozy and stylish.',
    [Scenario.CORPORATE_BOARDROOM_FRAME]: 'DSLR photograph of a modern, high-end corporate boardroom. A long, polished conference table reflects the ceiling lights. On the main wall, made of dark wood paneling, hangs a large, minimalist metal frame. The interior of the frame is a solid, vibrant magenta color (#FF00FF) placeholder. The lighting is sleek and professional. 4K, hyper-realistic, architectural photography.',
    [Scenario.LUXURY_HOTEL_LOBBY_FRAME]: 'Wide-angle photograph of a grand, opulent hotel lobby with a marble floor, high ceilings, and luxurious furniture. On a prominent wall, a very large, ornate golden frame is hanging. The area inside the frame is a solid, vibrant magenta color (#FF00FF) as a placeholder. The lighting is warm and dramatic, highlighting the luxurious atmosphere. 8K resolution, hyper-realistic, majestic.',
    [Scenario.MODERN_OFFICE_RECEPTION_FRAME]: 'Photograph of a bright, minimalist reception area of a modern tech company. Behind the sleek, white reception desk, on a concrete feature wall, hangs a medium-sized, simple black frame. The interior of the frame is a solid, vibrant magenta color (#FF00FF) placeholder. The scene is lit with clean, natural light. 4K, hyper-realistic.',
    [Scenario.ARCHITECTS_OFFICE_FRAME]: 'DSLR photograph of a stylish and creative architect\'s office. The space is filled with models, blueprints, and design books. On a brick wall, a large, simple frame is hanging, as if displaying a current project. The inside of the frame is a solid, vibrant magenta color (#FF00FF) placeholder. The office is bathed in natural afternoon light. 4K, hyper-realistic, inspiring and professional.',
    [Scenario.RESTAURANT_WALL_FRAME]: 'Photograph of the interior of a trendy, upscale restaurant with a cozy, intimate ambiance. On a dark, textured wall, a medium-sized wooden frame is hung. The placeholder area inside the frame is a solid, vibrant magenta color (#FF00FF). The lighting is warm and moody, from pendant lights over the tables. Shallow depth of field with blurred diners in the background. 4K, hyper-realistic.',
    [Scenario.WOMAN_FRAME_ZURICH]: 'DSLR photograph, luxury lifestyle shot. A beautiful, elegant woman with a confident smile stands on Zurich\'s Bahnhofstrasse, with high-end boutiques blurred in the background. She is holding a large, simple, matte black frame. The interior of the frame is a solid, vibrant magenta color (#FF00FF) to serve as a placeholder. The frame is held naturally with both hands, facing the camera. The lighting is bright and crisp, reflecting a sunny day. Shallow depth of field. 4K, hyper-realistic, tack-sharp focus on the woman and frame.',
    [Scenario.WOMAN_FRAME_GENEVA]: 'Lifestyle photograph with a shallow depth of field. A sophisticated, beautiful woman stands on the promenade of Lake Geneva. The iconic Jet d\'Eau is visible in the softly blurred background. She is holding a large, simple, matte black frame in a natural, two-handed grip. The interior of the frame is a solid, vibrant magenta color (#FF00FF) to serve as a placeholder. Golden hour lighting creates a warm, inviting glow. 4K, hyper-realistic, professional color grading.',
    [Scenario.WOMAN_FRAME_ZERMATT]: 'Atmospheric lifestyle photograph. A chic, beautiful woman dressed in stylish winter-leisure wear stands on a charming, cobblestone street in Zermatt. Rustic wooden chalets and the snow-capped Matterhorn are visible in the blurred background. She holds a large, simple, matte black frame naturally with both hands. The interior of the frame is a solid, vibrant magenta color (#FF00FF) to serve as a placeholder. The lighting is soft and clear, characteristic of the alpine environment. 4K, hyper-realistic, cozy and upscale feel.',
    [Scenario.WOMAN_FRAME_BERN]: 'DSLR photograph, high-fashion lifestyle shot. A beautiful, impeccably dressed woman strolls through the medieval arcades of Bern\'s Old Town. She holds a large, simple, matte black frame naturally. The interior of the frame is a solid, vibrant magenta color (#FF00FF) to serve as a placeholder. The historic sandstone buildings and cobblestone streets are softly blurred in the background. The lighting is soft and even, typical of a slightly overcast day. 4K, hyper-realistic, tack-sharp focus on the woman and frame.',
    [Scenario.WOMAN_FRAME_LUCERNE]: 'Lifestyle photograph with a shallow depth of field. A sophisticated, beautiful woman stands on the Reuss river bank in Lucerne, with the Chapel Bridge (Kapellbrücke) and Water Tower beautifully blurred in the background. She is holding a large, simple, matte black frame. The interior of the frame is a solid, vibrant magenta color (#FF00FF) to serve as a placeholder. Golden hour light casts a warm, romantic glow over the scene. 4K, hyper-realistic, professional color grading.',
    [Scenario.WOMAN_FRAME_LUGANO]: 'Vibrant lifestyle photograph. A chic, beautiful woman with a sun-kissed look poses on the vibrant lakeside promenade in Lugano. Palm trees and the sparkling lake are visible in the blurred background. She holds a large, simple, matte black frame confidently and stylishly. The interior of the frame is a solid, vibrant magenta color (#FF00FF) to serve as a placeholder. The lighting is bright and sunny. 4K, hyper-realistic, upscale and summery vibe.',
    [Scenario.WOMAN_FRAME_ST_MORITZ]: 'DSLR photograph, luxury lifestyle magazine style. A glamorous, beautiful woman dressed in a chic winter coat and sunglasses stands on a sun-drenched street in St. Moritz. The background features exclusive boutiques and snow-dusted alpine peaks, softly blurred. She holds a large, simple, matte black frame with a natural, elegant grip. The interior of the frame is a solid, vibrant magenta color (#FF00FF) to serve as a placeholder. The lighting is bright and crisp, reflecting off the snow. 4K, hyper-realistic, tack-sharp focus on the woman and frame.',
    [Scenario.WOMAN_FRAME_INTERLAKEN]: 'Outdoor lifestyle photograph. An adventurous yet stylish, beautiful woman stands on a scenic viewpoint in Interlaken, with the turquoise lakes and the Jungfrau mountain range in the beautifully blurred background. She is holding a large, simple, matte black frame naturally. The interior of the frame is a solid, vibrant magenta color (#FF00FF) to serve as a placeholder. The lighting is clear, bright daylight, typical of the Swiss Alps. Shallow depth of field. 4K, hyper-realistic, vibrant and fresh feel.',
    [Scenario.WOMAN_FRAME_MONTREUX]: 'Cinematic lifestyle photograph with a shallow depth of field. An artistic, beautiful woman with a confident air strolls along the flower-lined lakeside promenade in Montreux. The Château de Chillon is faintly visible in the blurred distance across Lake Geneva. She holds a large, simple, matte black frame in a relaxed, elegant manner. The interior of the frame is a solid, vibrant magenta color (#FF00FF) to serve as a placeholder. The scene is bathed in the warm light of a late afternoon sun. 4K, hyper-realistic, professional color grading, sophisticated and chic vibe.',
    [Scenario.WOMAN_FRAME_CAIRO_MURALS]: 'DSLR photograph, stylish marketing advertisement. Square composition. A beautiful, elegant American woman on a street in Cairo, Egypt. She stands in front of a gallery of world-class, vibrant murals, which are beautifully blurred (bokeh). She is holding a large, very creative frame. The interior of the frame is a solid, vibrant magenta color (#FF00FF) to serve as a placeholder. The shot is a front view, with tack-sharp focus on the woman and the frame to highlight it. 4K, hyper-realistic.',
    [Scenario.WOMAN_FRAME_ROME_MURALS]: 'DSLR photograph, stylish marketing advertisement. Square composition. A beautiful, elegant Italian woman on a street in Rome, Italy. She stands in front of a gallery of world-class, vibrant murals, which are beautifully blurred (bokeh). She is holding a large, highly creative frame. The interior of the frame is a solid, vibrant magenta color (#FF00FF) to serve as a placeholder. The shot is a front view, with tack-sharp focus on the woman and the frame to highlight it. 4K, hyper-realistic.',
    [Scenario.ARMCHAIR_CHANDELIER]: 'Dramatic, elegant interior photograph. A woman in a stylish armchair in a luxurious room with a high ceiling looks up and points. Above her, hanging from the ceiling, is a simple, placeholder light fixture emitting a distinct, vibrant magenta glow (#FF00FF). This is the object to be replaced. The overall scene has moody, cinematic lighting. 4K, hyper-realistic, professional color grading.',
    [Scenario.GALLERY_CHANDELIER]: 'Professional photograph, wide-angle shot of a minimalist, white-walled art gallery with polished concrete floors. A stylishly dressed woman stands in the center, looking up in admiration. The gallery is empty except for her. Hanging from the high ceiling is a single, glowing magenta (#FF00FF) placeholder object, positioned as if it\'s a central art installation. The lighting is clean and diffuse, with soft shadows, typical of a high-end gallery. 4K, hyper-realistic, sophisticated atmosphere.',
    [Scenario.GOTHIC_CHANDELIER]: 'Cinematic photograph, moody and atmospheric. A woman in a long, elegant velvet gown stands in the center of a vast, gothic-style manor library with towering, dark wood bookshelves and a vaulted ceiling. A large, circular window at the back lets in faint moonlight. The only significant light source is a large, brightly glowing magenta (#FF00FF) placeholder object hanging from the center of the ceiling. The woman gestures gracefully towards it. The scene has high contrast, deep shadows, and a sense of timeless grandeur. 8K resolution, hyper-realistic, rich textures of wood and fabric.',
    [Scenario.PATIO_CHANDELIER]: 'Lifestyle photograph taken at dusk, golden hour lighting. A relaxed woman sits on a comfortable outdoor sofa on a a beautifully decorated bohemian-style patio with lush potted plants and string lights in the background. Above the seating area, hanging from a wooden pergola, is a glowing magenta (#FF00FF) placeholder for a chandelier. The atmosphere is warm, cozy, and inviting with a shallow depth of field (bokeh). 4K, hyper-realistic, soft and warm tones.',
    [Scenario.MODERN_DINING_CHANDELIER]: 'DSLR photograph of a modern, minimalist dining room. A long, dark wood dining table is centered in the room with elegant chairs. Above the table, hanging from the ceiling, is a single, glowing magenta (#FF00FF) placeholder object for a light fixture. The room has large windows with soft, natural light and polished concrete floors. 4K, hyper-realistic, architectural digest style, clean lines.',
    [Scenario.HOTEL_LOBBY_CHANDELIER]: 'Wide-angle photograph of a luxurious, grand hotel lobby with a double-height ceiling and a sweeping marble staircase. In the center of the vast space, hanging from the high ceiling, is a massive, glowing magenta (#FF00FF) placeholder object representing a grand chandelier. The lobby is decorated with plush seating areas and large indoor plants. The lighting is grand and impressive. 8K resolution, hyper-realistic, majestic atmosphere.',
    [Scenario.FARMHOUSE_CHANDELIER]: 'Photograph of a cozy, rustic farmhouse dining room. A large, reclaimed wood dining table sits under a vaulted ceiling with exposed wooden beams. Hanging from the central beam is a glowing magenta (#FF00FF) placeholder object for a chandelier. The room has a stone fireplace and warm, inviting lighting. 4K, hyper-realistic, country living magazine style, rich textures.',
    [Scenario.GRAND_STAIRCASE_CHANDELIER]: 'DSLR photograph of the grand foyer of a luxurious mansion. A sweeping, curved marble staircase dominates the scene. In the center of the double-height ceiling, hanging above the staircase, is a single, brightly glowing magenta (#FF00FF) placeholder object, representing a grand chandelier. The scene is lit by soft, natural light from a large arched window. 8K resolution, hyper-realistic, architectural digest style.',
    [Scenario.BANQUET_HALL_CHANDELIER]: 'Wide-angle photograph of a vast, elegant banquet hall prepared for a formal gala. Round tables with white tablecloths are perfectly set. The ceiling is high and ornate. Hanging in the center of the hall is a large, glowing magenta (#FF00FF) placeholder object for a chandelier. The lighting is warm and sophisticated. 4K, hyper-realistic, professional event photography.',
    [Scenario.MUSEUM_ATRIUM_CHANDELIER]: 'Architectural photograph of a modern art museum\'s central atrium. The space is minimalist with white walls, concrete floors, and a large skylight. Suspended from the high ceiling is a glowing magenta (#FF00FF) placeholder object for a modern, sculptural light fixture. The light is bright, natural, and diffuse. 4K, hyper-realistic, clean aesthetic.',
    [Scenario.OPERA_HOUSE_LOBBY_CHANDELIER]: 'Photograph of the opulent, historic lobby of a grand opera house, featuring red velvet curtains, gold leaf details, and classical architecture. Hanging from the center of a domed, frescoed ceiling is a massive, multi-tiered, glowing magenta (#FF00FF) placeholder object for a crystal chandelier. The atmosphere is rich and dramatic. 8K resolution, hyper-realistic.',
    [Scenario.PENTHOUSE_SUITE_CHANDELIER]: 'Photograph of a sleek, modern living room in a luxury penthouse suite at twilight. Floor-to-ceiling windows reveal a stunning, blurred city skyline with bokeh lights. Above the contemporary seating area, a glowing magenta (#FF00FF) placeholder object for a chandelier is hanging. The interior lighting is warm and stylish. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.PRODUCT_SHELF]: 'Commercial product photograph of a modern, brightly-lit retail shelf made of light wood and metal. On the shelf, in the center, is a simple, solid magenta (#FF00FF) cube acting as a placeholder for a product. The background is filled with generic, out-of-focus products to create a realistic store environment. Clean, minimalist aesthetic. 4K, hyper-realistic, tack-sharp focus on the magenta placeholder.',
    [Scenario.WOMAN_HOLDING_PRODUCT_STREET]: 'DSLR photograph, lifestyle product shot. A beautiful, stylish woman is standing on a busy, slightly blurred New York City street. She is smiling and holding a simple, solid magenta (#FF00FF) cube in her hands, presenting it towards the camera. The lighting is bright and natural, reflecting the city atmosphere. Shallow depth of field. 4K, hyper-realistic, sharp focus on the woman and the magenta placeholder.',
    [Scenario.WOMAN_STOOL_PRODUCT_LA]: 'DSLR photograph, stylish marketing advertisement. A beautiful, stylish woman is sitting on a modern stool in a chic, sun-drenched Los Angeles living room with large windows. She is holding a simple, solid magenta (#FF00FF) cube in her hands, presenting it towards the camera. The cube represents a product no taller than 25cm. The background is beautifully blurred (bokeh) to put sharp focus on the woman and the product placeholder. The shot is a cinematic front-view portrait. Vertical composition. 4K, hyper-realistic.',
    [Scenario.WOMAN_COUCH_PRODUCT_LA]: 'DSLR photograph, stylish marketing advertisement. A beautiful, stylish woman is sitting on a couch in a trendy, sun-drenched Los Angeles bedroom. She is looking at and pointing her finger towards a simple, solid magenta (#FF00FF) cube placed on the couch next to her. The cube represents a product no taller than 25cm. The background is beautifully blurred (bokeh) to put sharp focus on the woman and the product placeholder. The shot is a cinematic front-view portrait. Vertical composition. 4K, hyper-realistic.',
    [Scenario.WOMAN_SOFA_PRODUCT_PARIS]: 'DSLR photograph, stylish marketing advertisement. An elegant and beautiful woman is sitting on a velvet sofa in a modern Parisian living room. She is looking at and pointing her finger towards a simple, solid magenta (#FF00FF) cube placed on the sofa next to her. The cube represents a product no taller than 25cm. The background is beautifully blurred (bokeh) to put sharp focus on the woman and the product placeholder. The shot is a cinematic front-view portrait. Vertical composition. 4K, hyper-realistic.',
    [Scenario.WOMAN_LINGERIE_PRODUCT_SWISS_PARISIAN]: 'DSLR photograph, stylish marketing advertisement. A stylish and beautiful Swiss woman is wearing tasteful and chic lingerie. She is in a modern Parisian-style bedroom in Switzerland, sitting on a plush velvet sofa. She is looking at and pointing her finger gracefully towards a simple, solid magenta (#FF00FF) cube placed on the sofa next to her. The cube represents a product no taller than 25cm. The background is beautifully blurred (bokeh) to put sharp focus on the woman and the product placeholder. The shot is a cinematic front-view portrait. Vertical composition. 4K, hyper-realistic.',
    [Scenario.WOMAN_NIGHTGOWN_PRODUCT_SWISS_PARISIAN]: 'DSLR photograph, stylish marketing advertisement. An elegant and beautiful Swiss woman is wearing a chic white nightgown and robe. She is in a modern Parisian-style bedroom in Switzerland, sitting on a plush velvet sofa. She is looking at and pointing her finger gracefully towards a simple, solid magenta (#FF00FF) cube placed on the sofa next to her. The cube represents a product no taller than 25cm. The background is beautifully blurred (bokeh) to put sharp focus on the woman and the product placeholder. The shot is a cinematic front-view portrait. Vertical composition. 4K, hyper-realistic.',
    [Scenario.MOTHER_DAUGHTER_PRODUCT_CAMBRIDGE_ITALIANATE]: 'DSLR photograph, stylish marketing advertisement. A beautiful, elegant, blue-eyed American woman and her beautiful daughter are in a trendy Italianate hall in Cambridge. They sit together on a plush, velvet-bedded armchair, looking at a simple, solid magenta (#FF00FF) cube on a table with expressions of awe and amazement. The mother places her hand near her mouth, smiling a feminine smile. The cube represents a product no taller than 25cm. To highlight the product, the background is beautifully blurred (bokeh) and it is a front-facing shot. The portrait is cinematic in aspect ratio, with a vertical height. 4K, hyper-realistic.',
    [Scenario.WOMAN_PRODUCT_CAMBRIDGE_ITALIANATE]: 'DSLR photograph, stylish marketing advertisement. A beautiful, elegant, blue-eyed American woman is in a trendy Italianate hall in Cambridge. She sits on a plush, velvet-bedded armchair, looking at a simple, solid magenta (#FF00FF) cube on a table with an expression of awe and amazement. She places her hand near her mouth, smiling a feminine smile. The cube represents a product no taller than 25cm. To highlight the product, the background is beautifully blurred (bokeh) and it is a front-facing shot. The portrait is cinematic in aspect ratio, with a vertical height. 4K, hyper-realistic.',
    [Scenario.WOMAN_PRODUCT_ZURICH]: 'DSLR photograph, luxury lifestyle shot. A beautiful, elegant woman with a confident smile stands on Zurich\'s Bahnhofstrasse, with high-end boutiques blurred in the background. She is holding a simple, solid magenta (#FF00FF) cube in her hands naturally, as if she just purchased it. The lighting is bright and crisp, reflecting a sunny day. Shallow depth of field. 4K, hyper-realistic, tack-sharp focus on the woman and the magenta placeholder.',
    [Scenario.WOMAN_PRODUCT_GENEVA]: 'Lifestyle photograph with a shallow depth of field. A sophisticated, beautiful woman stands on the promenade of Lake Geneva. The iconic Jet d\'Eau is visible in the softly blurred background. She is holding a simple, solid magenta (#FF00FF) cube placeholder in a natural, two-handed grip, looking down at it with a pleased expression. Golden hour lighting creates a warm, inviting glow. 4K, hyper-realistic, professional color grading.',
    [Scenario.WOMAN_PRODUCT_ZERMATT]: 'Atmospheric lifestyle photograph. A chic, beautiful woman dressed in stylish winter-leisure wear stands on a charming, cobblestone street in Zermatt. Rustic wooden chalets and the snow-capped Matterhorn are visible in the blurred background. She holds a solid magenta (#FF00FF) cube placeholder in her hands naturally, as if it were a cherished item. The lighting is soft and clear, characteristic of the alpine environment. 4K, hyper-realistic, cozy and upscale feel.',
    [Scenario.WOMAN_PRODUCT_BERN]: 'DSLR photograph, high-fashion lifestyle shot. A beautiful, impeccably dressed woman strolls through the medieval arcades of Bern\'s Old Town. She holds a simple, solid magenta (#FF00FF) cube placeholder in her hands naturally. The historic sandstone buildings and cobblestone streets are softly blurred in the background. The lighting is soft and even, typical of a slightly overcast day. 4K, hyper-realistic, tack-sharp focus on the woman and the magenta placeholder.',
    [Scenario.WOMAN_PRODUCT_LUCERNE]: 'Lifestyle photograph with a shallow depth of field. A sophisticated, beautiful woman stands on the Reuss river bank in Lucerne, with the Chapel Bridge (Kapellbrücke) and Water Tower beautifully blurred in the background. She is holding a solid magenta (#FF00FF) cube placeholder in her hands, looking at it with a gentle smile. Golden hour light casts a warm, romantic glow over the scene. 4K, hyper-realistic, professional color grading.',
    [Scenario.WOMAN_PRODUCT_LUGANO]: 'Vibrant lifestyle photograph. A chic, beautiful woman with a sun-kissed look poses on the vibrant lakeside promenade in Lugano. Palm trees and the sparkling lake are visible in the blurred background, giving a Mediterranean feel. She holds a solid magenta (#FF00FF) cube placeholder in one hand, confidently and stylishly. The lighting is bright and sunny. 4K, hyper-realistic, upscale and summery vibe.',
    [Scenario.WOMAN_PRODUCT_ST_MORITZ]: 'DSLR photograph, luxury lifestyle magazine style. A glamorous, beautiful woman dressed in a chic winter coat and sunglasses stands on a sun-drenched street in St. Moritz. The background features exclusive boutiques and snow-dusted alpine peaks, softly blurred. She holds a solid magenta (#FF00FF) cube placeholder in her hands with a natural, elegant grip. The lighting is bright and crisp, reflecting off the snow. 4K, hyper-realistic, tack-sharp focus on the woman and the placeholder.',
    [Scenario.WOMAN_PRODUCT_INTERLAKEN]: 'Outdoor lifestyle photograph. An adventurous yet stylish, beautiful woman stands on a scenic viewpoint in Interlaken, with the turquoise lakes and the Jungfrau mountain range in the beautifully blurred background. She is holding a solid magenta (#FF00FF) cube placeholder in her hands naturally, as if it\'s an essential piece of gear. The lighting is clear, bright daylight, typical of the Swiss Alps. Shallow depth of field. 4K, hyper-realistic, vibrant and fresh feel.',
    [Scenario.WOMAN_PRODUCT_MONTREUX]: 'Cinematic lifestyle photograph with a shallow depth of field. An artistic, beautiful woman with a confident air strolls along the flower-lined lakeside promenade in Montreux. The Château de Chillon is faintly visible in the blurred distance across Lake Geneva. She holds a solid magenta (#FF00FF) cube placeholder in her hands in a relaxed, elegant manner. The scene is bathed in the warm light of a late afternoon sun. 4K, hyper-realistic, professional color grading, sophisticated and chic vibe.',
    [Scenario.WOMAN_PRODUCT_LIVING_ROOM]: 'DSLR photograph, lifestyle product shot. A beautiful, happy woman is relaxing in a bright, modern living room with a cozy sofa and large windows. She is holding a simple, solid magenta (#FF00FF) cube in her hands naturally, presenting it towards the camera with a smile. The lighting is soft and natural. Shallow depth of field. 4K, hyper-realistic, sharp focus on the woman and the magenta placeholder.',
    [Scenario.WOMAN_PRODUCT_KITCHEN]: 'Lifestyle photograph. A cheerful woman with a bright smile stands in a stylish, sunlit gourmet kitchen with marble countertops. She is holding a simple, solid magenta (#FF00FF) cube placeholder in her hands as if showing off a new purchase. The background is a clean, beautifully designed kitchen. 4K, hyper-realistic, warm and inviting atmosphere.',
    [Scenario.WOMAN_PRODUCT_BEDROOM]: 'Cozy and serene lifestyle photograph. An elegant woman is sitting on a beautifully made bed in a calm, minimalist bedroom. She is holding a simple, solid magenta (#FF00FF) cube placeholder delicately in her hands, looking at it with a gentle expression. Soft morning light streams through a window. Shallow depth of field. 4K, hyper-realistic, peaceful mood.',
    [Scenario.WOMAN_PRODUCT_HOME_OFFICE]: 'Professional lifestyle photograph. A confident, stylish woman is in her chic, organized home office with a minimalist desk and a bookshelf in the background. She is holding a solid magenta (#FF00FF) cube placeholder in one hand, presenting it to the camera professionally. The lighting is bright and even. 4K, hyper-realistic, inspiring and productive feel.',
    [Scenario.WOMAN_PRODUCT_BATHROOM]: 'Clean, luxury lifestyle photograph for beauty products. A beautiful woman with her hair in a towel wrap stands in a bright, modern bathroom with marble and gold accents. She holds a simple, solid magenta (#FF00FF) cube placeholder in her hands, as if it were a cosmetic jar, presenting it with a serene expression. The lighting is soft and flattering. 4K, hyper-realistic, spa-like atmosphere.',
    [Scenario.WOMAN_PRODUCT_NURSERY]: 'Heartwarming lifestyle photograph. A loving mother is sitting in a comfortable rocking chair in a bright, beautifully decorated nursery. She is holding a simple, solid magenta (#FF00FF) cube placeholder gently in her hands, as if it were a baby product, with a warm, caring smile. The room is filled with soft toys and pastel colors. Natural light floods the room. 4K, hyper-realistic, tender and sweet.',
    [Scenario.WOMAN_LASER_PRODUCT_MODERN_LIVING_ROOM]: 'DSLR photograph, cinematic style. A stylishly dressed woman in an elegant outfit is in a modern, high-end living room with designer furniture and large windows. She is holding a beautiful, handheld wooden laser light product. The product is a simple wooden cube, and its front face is a solid, vibrant magenta color (#FF00FF) placeholder. The product emits a soft, variable colored light that casts subtle highlights on her hands and the nearby environment. The overall lighting is warm and atmospheric. 4K, hyper-realistic, shallow depth of field, tack-sharp focus on the product.',
    [Scenario.WOMAN_LASER_PRODUCT_SCANDINAVIAN_BEDROOM]: 'Lifestyle photograph, cozy and elegant. A woman in a chic, comfortable outfit is sitting on a bed in a serene, Scandinavian-style bedroom with light wood furniture and neutral-toned textiles. She is holding a handheld wooden laser light product. The product is a simple wooden cube, and its front face is a solid, vibrant magenta color (#FF00FF) placeholder. The product emits a gentle, variable colored light, creating a calm ambiance. The scene is lit by soft, natural morning light. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.WOMAN_LASER_PRODUCT_BOHEMIAN_STUDIO]: 'Atmospheric photograph. A woman in a flowing, elegant bohemian-style dress is in a creative, artistic studio filled with plants and eclectic decor. She holds a unique, handheld wooden laser light product. The product is a simple wooden cube, with its front face being a solid, vibrant magenta (#FF00FF) placeholder. The product projects a soft, variable colored light, adding to the magical feel of the room. The lighting is warm and diffuse. 4K, hyper-realistic, artistic and moody.',
    [Scenario.WOMAN_LASER_PRODUCT_MINIMALIST_OFFICE]: 'Professional product lifestyle photograph. A woman in a sophisticated, business-casual outfit stands in a bright, minimalist home office with a clean desk and simple decor. She holds a sleek, handheld wooden laser light product. The product is a simple wooden cube, and its front face is a solid, vibrant magenta color (#FF00FF) placeholder. It emits a subtle, variable colored light, adding a touch of modern tech to the scene. The lighting is clean and bright from a large window. 4K, hyper-realistic, professional and sharp.',
    [Scenario.WOMAN_LASER_PRODUCT_RUSTIC_DINING_ROOM]: 'Cinematic photograph, warm tones. A woman in an elegant evening dress is in a rustic-chic dining room with a large reclaimed wood table and exposed brick. She holds a beautifully crafted, handheld wooden laser light product. The product is a simple wooden cube, its front face a solid, vibrant magenta (#FF00FF) placeholder. It casts a warm, variable colored glow, creating an intimate atmosphere for a dinner setting. The lighting is moody and warm, from pendant lights above. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.WOMAN_LASER_LAMP_KITCHEN]: 'DSLR photograph, luxury advertisement. A glamorous and elegant American woman in her late twenties stands in a luxurious, modern kitchen with bright natural light. She smiles warmly, pointing upwards. Suspended above the kitchen island is a simple, brightly glowing magenta (#FF00FF) cube as a placeholder for a lamp. The scene has a cinematic composition, ultra-realistic 8K quality, shallow depth of field, professional product photography style, and warm color gradation. Vertical composition.',
    [Scenario.OFFICE_SCREEN]: 'Professional photograph of a modern, sleek office environment. A high-end, bezel-less computer monitor sits on a clean, wooden desk. The monitor is turned on and displays a solid, vibrant magenta color (#FF00FF) as a placeholder for a UI design. A window in the background provides soft, natural light, creating subtle reflections on the screen. The background is stylishly blurred (bokeh effect). 4K, hyper-realistic.',
    [Scenario.TSHIRT_MODEL]: 'E-commerce fashion photograph. A model stands against a plain, off-white studio background. The model is wearing a high-quality, plain t-shirt. On the front of the t-shirt is a large, perfectly centered, solid magenta (#FF00FF) rectangle, serving as a clear placeholder for a design. The lighting is bright and even, with no harsh shadows. The focus is on the t-shirt. 4K, hyper-realistic, clean aesthetic.',
    [Scenario.HOODIE_MODEL]: 'Streetwear fashion photograph. A cool model in an urban city environment at golden hour. The model is wearing a plain, high-quality hoodie. On the front of the hoodie is a large, perfectly centered, solid magenta (#FF00FF) rectangle, serving as a clear placeholder for a design. The background is a slightly blurred city street with graffiti. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.SWEATSHIRT_HANGER]: 'Minimalist e-commerce product shot. A plain, high-quality crewneck sweatshirt is hanging on a simple wooden hanger against a clean, textured off-white wall. On the front of the sweatshirt is a large, centered, solid magenta (#FF00FF) rectangle placeholder. The lighting is soft and even, highlighting the fabric texture. 4K, hyper-realistic, clean aesthetic.',
    [Scenario.TANK_TOP_FITNESS]: 'Fitness lifestyle photograph. An athletic person is working out in a modern, sunlit gym. They are wearing a plain, athletic-fit tank top. The front of the tank top has a centered, solid magenta (#FF00FF) rectangle as a design placeholder. They are in a dynamic pose, like holding a dumbbell. The background is blurred. 4K, hyper-realistic, energetic mood.',
    [Scenario.FOLDED_SHIRT_HELD]: 'E-commerce fashion photograph. A person\'s hand is holding a neatly folded t-shirt on the left side. The visible portion of the folded shirt has a large, solid magenta (#FF00FF) rectangle as a placeholder for a logo or design. The background is an ultra-realistic outdoor scene with green grass, trees, and a blue sky. Cinematic lighting, clear details, and sharp focus on the shirt and placeholder. 4K, hyper-realistic.',
    [Scenario.TOTE_BAG_LIFESTYLE]: 'Lifestyle photograph. A stylish person is walking down a sunny street, carrying a canvas tote bag. The front of the tote bag facing the camera features a large, solid magenta (#FF00FF) rectangle as a design placeholder. The person\'s outfit is chic but casual. Shallow depth of field with a blurred background. 4K, hyper-realistic, bright and airy feel.',
    [Scenario.BASEBALL_CAP_MODEL]: 'Close-up portrait photograph. A person is wearing a classic baseball cap. The camera is focused on the cap. The front panel of the cap is a solid, vibrant magenta color (#FF00FF) placeholder. The person is looking slightly away from the camera. The background is softly blurred. Natural outdoor lighting. 4K, hyper-realistic, sharp focus on the cap.',
    [Scenario.BEANIE_MODEL]: 'Autumn portrait photograph. A person is wearing a cozy, knitted beanie in an outdoor park setting with autumn leaves in the background. The folded cuff of the beanie has a solid magenta (#FF00FF) rectangle as a placeholder for a patch or logo. The person is smiling. Warm, golden hour light. Shallow depth of field. 4K, hyper-realistic.',
    [Scenario.SOCKS_PAIR]: 'Product photograph. A pair of plain, white crew socks are laid flat on a clean, light gray background. The design area on the outer side of both socks is a solid magenta (#FF00FF) shape, acting as a placeholder. The lighting is even and shadowless, highlighting the texture of the socks. 4K, hyper-realistic, e-commerce style.',
    [Scenario.APRON_PERSON]: 'Lifestyle photograph. A person is in a bright, rustic kitchen, wearing a plain canvas apron. The front of the apron has a large, centered, solid magenta (#FF00FF) rectangle as a placeholder for a design. The person is in the middle of a cooking activity, like kneading dough, with their hands slightly dusty with flour. The background is a warm, inviting kitchen. 4K, hyper-realistic.',
    [Scenario.BABY_ONESIE_FLATLAY]: 'Top-down, flat lay photograph. A cute, plain white baby onesie is laid out neatly on a soft, pastel-colored blanket. Next to it are a few simple baby toys like wooden blocks. The front chest area of the onesie has a solid magenta (#FF00FF) rectangle as a placeholder for a design. The lighting is bright, soft, and natural. 4K, hyper-realistic, adorable and clean aesthetic.',
    [Scenario.CITY_BILLBOARD]: 'Ultra-realistic, cinematic photograph of a bustling city street at night, inspired by Tokyo\'s Shibuya Crossing. Towering skyscrapers with glowing neon signs. One massive, central digital billboard is turned on but displays only a solid, vibrant magenta color (#FF00FF) as a placeholder. Rain-slicked streets reflect the city lights. Long exposure effect with light trails from cars. Moody, cyberpunk aesthetic. 8K resolution, hyper-detailed.',
    [Scenario.HIGHWAY_BILLBOARD]: 'DSLR photograph of a massive, empty billboard next to a busy multi-lane highway at sunset. The sky is filled with warm, golden hour colors. The traffic on the highway is slightly motion-blurred. The face of the billboard is a solid, vibrant magenta color (#FF00FF) as a clear placeholder. Wide-angle shot, hyper-realistic, professional quality.',
    [Scenario.SUBWAY_AD]: 'Photograph of a modern, clean subway station platform. On the tiled wall, there is a large, backlit advertising panel. The panel is glowing and displays a solid, vibrant magenta color (#FF00FF) as a placeholder. A few blurred commuters are in the background. The lighting is fluorescent and even. 4K, hyper-realistic, sharp focus on the ad panel.',
    [Scenario.BUS_STOP_AD]: 'Eye-level photograph of a city bus stop with a glass shelter. One of the panels of the shelter is a backlit advertising space, which displays a solid, vibrant magenta color (#FF00FF) as a placeholder. The city street in the background is slightly blurred with daytime traffic. 4K, hyper-realistic, authentic urban feel.',
    [Scenario.RURAL_BILLBOARD]: 'Photograph of a classic, weathered billboard standing in a green field next to a quiet, two-lane country road. The sky is a clear blue with a few fluffy clouds. The face of the billboard is a solid, vibrant magenta color (#FF00FF) placeholder. The scene is peaceful and sunny. 4K, hyper-realistic, wide landscape shot.',
    [Scenario.BUILDING_BANNER]: 'Architectural photograph of a modern, glass and concrete skyscraper. A huge, vertical banner is hanging down the side of the building. The entire banner is a solid, vibrant magenta color (#FF00FF) as a placeholder. The shot is taken from a low angle, looking up to emphasize the scale. Bright, clear day. 4K, hyper-realistic.',
    [Scenario.TIMES_SQUARE_SCREENS]: 'Ultra-realistic, chaotic photograph of a city intersection like Times Square at night. The scene is filled with crowds of people and surrounded by towering buildings covered in dozens of giant, glowing digital screens. One prominent, central screen displays a solid, vibrant magenta color (#FF00FF) as a placeholder. The atmosphere is energetic and dazzling. 8K resolution, hyper-detailed.',
    [Scenario.STADIUM_JUMBOTRON]: 'Photograph from the stands of a packed, roaring sports stadium at night under bright floodlights. The massive jumbotron screen at one end of the stadium is on and displays a solid, vibrant magenta color (#FF00FF) as a placeholder. The crowd and the sports field are slightly out of focus. 4K, hyper-realistic, energetic atmosphere.',
    [Scenario.MALL_SCREEN]: 'Photograph inside a bright, modern, multi-level shopping mall. A large, sleek, vertical digital advertising screen is mounted on a pillar. The screen is glowing and displays a solid, vibrant magenta color (#FF00FF) as a placeholder. Shoppers are walking around in the blurred background. 4K, hyper-realistic, clean and commercial feel.',
    [Scenario.CONSTRUCTION_BANNER]: 'Photograph of a large banner attached to the chain-link fence of a city construction site. The background shows scaffolding and an unfinished building. The banner is taut and displays a solid, vibrant magenta color (#FF00FF) as a placeholder. The lighting is harsh, direct daylight. 4K, hyper-realistic, industrial and gritty.',
    [Scenario.COFFEE_MUG]: 'Shallow depth of field, professional cafe photograph. A person\'s hands are holding a clean, white ceramic coffee mug. The focus is on the mug. On the side of the mug facing the camera is a perfectly centered, solid magenta (#FF00FF) rectangle as a placeholder for a logo. The background is a warm, cozy, out-of-focus cafe with bokeh lights. Natural light from a window illuminates the scene. 4K, hyper-realistic, inviting atmosphere.',
    [Scenario.MUG_HELD_BY_PERSON]: 'Lifestyle photograph, close-up shot with a shallow depth of field. A person is holding a white ceramic mug with two hands, as if warming them. The side of the mug facing the camera has a solid, vibrant magenta color (#FF00FF) as a placeholder. The person is wearing a cozy sweater. The background is a softly blurred, warm interior. 4K, hyper-realistic, inviting and comfortable mood.',
    [Scenario.MUGS_PAIR]: 'DSLR photograph of two identical white ceramic mugs sitting side-by-side on a rustic wooden table. The front of each mug has a solid, vibrant magenta color (#FF00FF) as a placeholder. The scene is lit by soft, natural window light. Shallow depth of field with a blurred background. 4K, hyper-realistic.',
    [Scenario.MUG_CAMPING]: 'Outdoor lifestyle photograph. A rustic, metal enamel mug sits on a wooden log next to a crackling campfire. The side of the mug facing the camera features a solid, vibrant magenta color (#FF00FF) placeholder. The background is a blurred forest scene at dusk. The lighting is warm and comes from the fire. 4K, hyper-realistic, adventurous feel.',
    [Scenario.MUG_OFFICE_DESK]: 'Professional photograph of a modern, minimalist office desk with a sleek laptop, a notebook, and a pen. A clean, white ceramic mug sits on the desk. The front of the mug has a solid, vibrant magenta color (#FF00FF) placeholder. The scene is brightly lit by a large window. 4K, hyper-realistic, clean and professional aesthetic.',
    [Scenario.MUG_KITCHEN_COUNTER]: 'Bright, morning lifestyle photograph. A clean, white coffee mug is sitting on a white marble kitchen counter. Next to it is a croissant on a plate and a glass of orange juice. The front of the mug has a solid, vibrant magenta color (#FF00FF) placeholder. The scene is flooded with natural morning sunlight. 4K, hyper-realistic, fresh and cheerful.',
    [Scenario.MUG_WITH_BOOKS]: 'Cozy photograph. A white ceramic mug sits on a dark wood table next to a tall stack of vintage, hardcover books. The front of the mug has a solid, vibrant magenta color (#FF00FF) as a placeholder. The lighting is warm and soft, as if from a reading lamp. Shallow depth of field. 4K, hyper-realistic, intellectual and relaxing atmosphere.',
    [Scenario.MUG_HOLIDAY]: 'Festive holiday photograph. A white ceramic mug is placed on a wooden table, surrounded by blurred Christmas decorations like pine branches, ornaments, and twinkling fairy lights. The front of the mug has a solid, vibrant magenta color (#FF00FF) as a placeholder. The atmosphere is warm, cozy, and celebratory. 4K, hyper-realistic, bokeh background.',
    [Scenario.MUG_IN_GIFT_BOX]: 'Product photograph. A white ceramic mug is nestled in an open, elegant gift box with soft tissue paper. The front of the mug, visible to the camera, has a solid, vibrant magenta color (#FF00FF) as a placeholder. The lighting is clean, soft, and professional, as if for an e-commerce product listing. 4K, hyper-realistic.',
    [Scenario.ESPRESSO_CUP_SAUCER]: 'Photograph of a small, white ceramic espresso cup on its matching saucer, placed on the table of a high-end, chic cafe. The side of the cup facing the camera has a solid, vibrant magenta color (#FF00FF) as a placeholder. The background is a blurred, sophisticated cafe interior. 4K, hyper-realistic, elegant and stylish.',
    [Scenario.COSMETIC_JAR]: 'Luxury product photography. A premium, minimalist cosmetic jar (like a face cream jar) sits on a white marble vanity. Next to it are a few delicate rose petals and subtle water droplets. The jar is unbranded, but the area for the main label is a solid, vibrant magenta color (#FF00FF). The lighting is soft, diffuse, and elegant, creating soft shadows and highlights on the jar\'s glossy surface. 4K, hyper-realistic, clean and sophisticated aesthetic.',
    [Scenario.BOOK_COVER]: 'DSLR photograph of a thick hardcover book lying on a rustic wooden coffee table next to a steaming cup of coffee. The front cover of the book is a solid, vibrant magenta color (#FF00FF), acting as a placeholder. The scene has warm, soft lighting from a nearby window. Shallow depth of field. 4K, hyper-realistic, cozy atmosphere.',
    [Scenario.WINE_BOTTLE]: 'Professional product shot of a dark glass wine bottle on a dark, slate surface with some grapes scattered around. The bottle is unbranded, but the area for the main label is a solid, vibrant magenta color (#FF00FF). The lighting is moody and dramatic, with a single key light creating strong highlights and deep shadows. 4K, hyper-realistic, sophisticated and elegant.',
    [Scenario.SHOPPING_BAG]: 'Fashion lifestyle photograph. A stylishly dressed person is holding a high-quality paper shopping bag. The front face of the bag is a solid, vibrant magenta color (#FF00FF) as a placeholder for branding. The background is a slightly blurred, upscale city street. Natural afternoon light. 4K, hyper-realistic.',
    [Scenario.SODA_CAN]: 'Commercial photograph of a standard aluminum soda can, covered in realistic condensation droplets, sitting on a bed of ice. The wrap-around label area is a solid, vibrant magenta color (#FF00FF) as a placeholder. The lighting is bright and crisp, with strong highlights to emphasize the coldness. Macro shot, tack-sharp focus. 4K, hyper-realistic.',
    [Scenario.STREET_POSTER]: 'Urban photograph of a weathered, textured brick wall in an alleyway. A rectangular paper poster has been pasted onto the wall. The entire poster is a solid, vibrant magenta color (#FF00FF). The edges of the poster are slightly peeling, and the texture of the brick shows through subtly. The lighting is overcast and even. 4K, hyper-realistic, gritty and authentic.',
    [Scenario.FRAMED_POSTER_LIVING_ROOM]: 'Interior design photograph of a modern, Scandinavian-style living room. On a clean, light gray wall hangs a large, rectangular poster in a thin, black frame. The poster itself is a solid, vibrant magenta color (#FF00FF) as a placeholder. The room is well-lit with natural light and features a stylish sofa and a potted plant. 4K, hyper-realistic, minimalist aesthetic.',
    [Scenario.CAFE_INTERIOR_POSTER]: 'Photograph of the interior of a trendy, rustic coffee shop. On an exposed brick wall, there is a medium-sized poster in a simple wooden frame. The poster area is a solid, vibrant magenta color (#FF00FF). The scene is warm and inviting, with blurred patrons and soft lighting in the background. Shallow depth of field. 4K, hyper-realistic.',
    [Scenario.ART_GALLERY_POSTER]: 'Photograph of a large poster hanging on a clean, white wall in a minimalist modern art gallery. The poster is the only artwork visible. The area of the poster is a solid, vibrant magenta color (#FF00FF). The gallery has high ceilings and polished concrete floors, with diffuse, even lighting from track lights above. 4K, hyper-realistic, professional and clean.',
    [Scenario.STREET_A_FRAME_SIGN]: 'Eye-level photograph of a wooden A-frame sandwich board sign standing on a city sidewalk in front of a blurred-out storefront. The sign\'s main panel is a solid, vibrant magenta color (#FF00FF) as a placeholder. The scene has bright, direct sunlight creating a crisp shadow. 4K, hyper-realistic, commercial feel.',
    [Scenario.WHEATPASTE_POSTERS_WALL]: 'Urban photograph of a concrete wall covered in layers of old, torn, and weathered wheatpaste posters. In the center, one poster is perfectly applied and intact. This central poster is a solid, vibrant magenta color (#FF00FF). The overall texture is gritty and artistic. The lighting is overcast and even. 4K, hyper-realistic, street art aesthetic.',
    [Scenario.BUS_SHELTER_POSTER]: 'Photograph of the inside of a modern glass and metal bus stop shelter at dusk. A backlit advertising case contains a paper poster. The poster is a solid, vibrant magenta color (#FF00FF). The city lights are visible and blurred in the background. 4K, hyper-realistic, urban night scene.',
    [Scenario.MUSIC_VENUE_POSTER_WALL]: 'Gritty photograph of the exterior brick wall of a music club at night. The wall is covered with stapled and taped band posters. One prominent, rectangular poster space is a solid, vibrant magenta color (#FF00FF). The lighting is moody, coming from a single street lamp, creating long shadows. 4K, hyper-realistic, edgy and atmospheric.',
    [Scenario.COMMUNITY_BULLETIN_BOARD]: 'Close-up photograph of a cluttered cork community bulletin board. It is filled with various flyers, notes, and thumbtacks. There is one clean, empty rectangular space where a new poster is pinned. This poster is a solid, vibrant magenta color (#FF00FF). The lighting is flat and even. Shallow depth of field. 4K, hyper-realistic, authentic feel.',
    [Scenario.PERSON_HOLDING_POSTER]: 'Lifestyle photograph. A person, seen from the chest up, is holding a large, unrolled paper poster with both hands, showing it to the camera. The poster is a solid, vibrant magenta color (#FF00FF). The background is a softly blurred outdoor park on a sunny day. 4K, hyper-realistic, focus is on the poster.',
    [Scenario.LAPTOP_SCREEN]: 'Photograph of a modern, thin laptop sitting on a table in a bright, airy cafe. The laptop is open, and its screen is displaying a solid, vibrant magenta color (#FF00FF) as a placeholder. A cup of coffee is visible next to the laptop. The background is softly blurred. Natural light. 4K, hyper-realistic.',
    [Scenario.PHONE_SCREEN]: 'Close-up photograph of a person holding a modern smartphone. The phone\'s screen is on and displays a solid, vibrant magenta color (#FF00FF) as a placeholder. The person\'s thumb is near the edge of the screen. The background is a soft, out-of-focus indoor setting. 4K, hyper-realistic, sharp focus on the phone.',
    [Scenario.PILL_BOTTLE]: 'Clean, clinical product shot of a white plastic pill bottle standing on a pure white, reflective surface. The wrap-around label area is a solid, vibrant magenta color (#FF00FF). The lighting is bright, sterile, and shadowless, as seen in pharmaceutical advertisements. 4K, hyper-realistic.',
    [Scenario.CEREAL_BOX]: 'Bright and cheerful photograph of a cereal box on a clean kitchen counter, next to a bowl of cereal and a glass of milk. The front of the cereal box is a solid, vibrant magenta color (#FF00FF) as a placeholder. The scene is bathed in sunny morning light from a window. 4K, hyper-realistic, family-friendly atmosphere.',
    [Scenario.TABLET_ON_DESK]: 'DSLR photograph of a modern, white tablet lying on a wooden designer desk. The tablet screen is on and displays a solid, vibrant magenta color (#FF00FF) as a placeholder. The desk also has a sketchbook, a pen, and a small potted plant. The scene is brightly lit by natural window light. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.PHONE_OUTDOORS]: 'Lifestyle photograph. A person is holding a modern smartphone in their hand. The background is a beautifully blurred city park on a sunny day. The phone\'s screen is on and displays a solid, vibrant magenta color (#FF00FF) as a placeholder for an app UI. The focus is sharp on the phone. 4K, hyper-realistic, bokeh.',
    [Scenario.MULTI_DEVICE_SHOWCASE]: 'Professional studio shot against a clean, minimalist background. A modern laptop, a tablet, and a smartphone are arranged neatly side-by-side. The screens of all three devices are on and display a solid, vibrant magenta color (#FF00FF) as a placeholder, perfectly aligned. This is for showcasing responsive design. Soft, even lighting. 4K, hyper-realistic.',
    [Scenario.CAR_DASHBOARD_SCREEN]: 'Interior photograph of a modern electric car cockpit, focusing on the central infotainment touchscreen. The screen is on and displays a solid, vibrant magenta color (#FF00FF) as a placeholder for a UI. The rest of the car interior is dark and sleek, with subtle ambient lighting. 4K, hyper-realistic, sharp focus on the screen.',
    [Scenario.SMARTWATCH_ON_WRIST]: 'Macro photograph, close-up shot of a modern smartwatch on a person\'s wrist. The watch face is on and displays a solid, vibrant magenta color (#FF00FF) as a placeholder for an app. The background is softly blurred. The lighting highlights the details of the watch and the screen. 4K, hyper-realistic.',
    [Scenario.TV_IN_LIVING_ROOM]: 'Interior design photograph of a contemporary living room at dusk. A large, wall-mounted OLED TV is the centerpiece. The TV screen is on and glowing, displaying a solid, vibrant magenta color (#FF00FF) as a placeholder. The room has a comfortable sofa and warm ambient lighting. 4K, hyper-realistic, cozy atmosphere.',
    [Scenario.ATM_SCREEN]: 'Eye-level photograph of a modern, sleek ATM machine\'s interface. The touchscreen is brightly lit and displays a solid, vibrant magenta color (#FF00FF) as a placeholder for a banking UI. The surrounding keypad and card slot are slightly out of focus. The setting is a clean, well-lit bank lobby. 4K, hyper-realistic.',
    [Scenario.PROJECTOR_SCREEN_MEETING]: 'Photograph of a dark, modern corporate meeting room. A large projection screen on the wall is brightly illuminated, displaying a solid, vibrant magenta color (#FF00FF) as a placeholder for a presentation. The silhouettes of a few people sitting at a long table are visible in the foreground. The only light comes from the projector. Cinematic feel. 4K, hyper-realistic.',
    [Scenario.HANDHELD_CONSOLE_SCREEN]: 'Product photograph of a person holding a modern handheld gaming console (like a Nintendo Switch). Their thumbs are on the controls. The console\'s screen is bright and displays a solid, vibrant magenta color (#FF00FF) as a placeholder for a game UI. The background is dark to emphasize the glowing screen. 4K, hyper-realistic, dramatic lighting.',
    [Scenario.COWORKING_SPACE_LAPTOP]: 'Lifestyle photograph of a bustling, modern co-working space with an open-plan layout. In the foreground, a modern laptop is open on a shared desk. The laptop screen displays a solid, vibrant magenta color (#FF00FF) as a placeholder. The background is filled with blurred people working and collaborating. Natural light from large windows. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.MEDICAL_TABLET_SCREEN]: 'Clean, professional photograph set in a modern, sterile doctor\'s office or hospital room. A doctor or nurse is holding a tablet. The tablet\'s screen is on and displays a solid, vibrant magenta color (#FF00FF) placeholder for a medical UI. The background is clean and white/light blue, conveying a sense of health and technology. 4K, hyper-realistic.',
    [Scenario.RETAIL_POS_SCREEN]: 'Photograph of a modern point-of-sale (POS) terminal on the counter of a chic, minimalist fashion boutique. The touchscreen of the POS system is on and displays a solid, vibrant magenta color (#FF00FF) placeholder. The background is a beautifully merchandised but blurred clothing rack. 4K, hyper-realistic, commercial shot.',
    [Scenario.DIGITAL_WHITEBOARD_MEETING]: 'Photograph of a collaborative brainstorming session in a creative office. A group of people is gathered around a large, wall-mounted digital whiteboard. The screen of the whiteboard is illuminated and displays a solid, vibrant magenta color (#FF00FF) as a placeholder for a presentation or collaborative app. The people are slightly motion-blurred, indicating activity. 4K, hyper-realistic, dynamic and modern workplace.',
    [Scenario.SERUM_BOTTLE]: 'Luxury product photograph. A sleek, amber glass serum bottle with a black dropper cap sits on a minimalist marble surface. The area for the main label is a solid, vibrant magenta color (#FF00FF). The lighting is soft and diffuse, creating elegant reflections on the glass. 4K, hyper-realistic, skincare aesthetic.',
    [Scenario.PUMP_BOTTLE]: 'Clean product photograph. A white plastic pump bottle for lotion or soap stands on a bright, modern bathroom countertop. The wrap-around label area is a solid, vibrant magenta color (#FF00FF). The background is slightly blurred with clean tiles. 4K, hyper-realistic, fresh and hygienic feel.',
    [Scenario.SQUEEZE_TUBE]: 'Product photograph of a matte-finish cosmetic squeeze tube standing upright on a clean, reflective surface. The main branding area on the tube is a solid, vibrant magenta color (#FF00FF). The lighting is soft and even, studio quality. 4K, hyper-realistic, minimalist aesthetic.',
    [Scenario.CANDLE_JAR]: 'Lifestyle photograph of a glass candle jar sitting on a cozy wooden table next to a book. The candle is unlit. The label area on the front of the jar is a solid, vibrant magenta color (#FF00FF). The scene is warm and inviting with soft, ambient light. Shallow depth of field. 4K, hyper-realistic.',
    [Scenario.COFFEE_BAG]: 'Commercial photograph of a matte black stand-up coffee bag pouch on a clean, light-colored background. The front of the bag, where the label would be, is a solid, vibrant magenta color (#FF00FF). Some coffee beans are scattered artfully around the base of the bag. 4K, hyper-realistic, professional product shot.',
    [Scenario.BEER_BOTTLE]: 'Crisp product photograph of a cold, amber glass beer bottle with condensation droplets. The bottle is standing on a dark, wet surface. The main label area is a solid, vibrant magenta color (#FF00FF). The lighting is dramatic, highlighting the bottle\'s shape and texture. 4K, hyper-realistic, commercial quality.',
    [Scenario.HONEY_JAR]: 'Rustic photograph of a small, clear glass jar filled with golden honey. A wooden honey dipper rests against it. The jar\'s main label is a solid, vibrant magenta color (#FF00FF). The background is a warm, out-of-focus kitchen scene. Natural sunlight. 4K, hyper-realistic, artisanal feel.',
    [Scenario.SOAP_BAR_WRAP]: 'Top-down photograph of a rectangular, rustic handmade soap bar. The bar is wrapped in a simple paper band. The paper band is a solid, vibrant magenta color (#FF00FF) as a placeholder for the design. The background is a clean, textured slate surface. 4K, hyper-realistic.',
    [Scenario.SPRAY_BOTTLE]: 'Clean product shot of a transparent spray bottle with a white nozzle. The bottle is filled with a clear liquid. The wrap-around label area is a solid, vibrant magenta color (#FF00FF). The background is a pure, seamless white. Studio lighting. 4K, hyper-realistic.',
    [Scenario.ICE_CREAM_PINT]: 'Commercial product photograph of a pint of ice cream on a clean kitchen counter. The ice cream pint is made of paper and has a lid. The wrap-around label area is a solid, vibrant magenta color (#FF00FF) as a placeholder. The background is slightly blurred with a sunny kitchen. 4K, hyper-realistic, delicious looking.',
    [Scenario.CHOCOLATE_BAR_WRAPPER]: 'Product shot of a premium chocolate bar. The bar is partially unwrapped from a foil and paper wrapper. The paper wrapper design area is a solid, vibrant magenta color (#FF00FF) as a placeholder. Some chocolate squares and cocoa beans are scattered nearby. Moody, luxurious lighting. 4K, hyper-realistic.',
    [Scenario.OLIVE_OIL_BOTTLE]: 'Elegant photograph of a tall, dark glass bottle of extra virgin olive oil on a rustic wooden table. The front label area is a solid, vibrant magenta color (#FF00FF) as a placeholder. Some olives and a branch are next to the bottle. Warm, Mediterranean sunlight. 4K, hyper-realistic.',
    [Scenario.CHIPS_BAG]: 'Commercial studio photograph of a glossy, metallic bag of potato chips. The bag is standing upright and looks full. The front of the bag is a solid, vibrant magenta color (#FF00FF) as a placeholder for branding. The lighting is bright and poppy, with a clean white background. 4K, hyper-realistic, sharp focus.',
    [Scenario.YOGURT_CUP]: 'Healthy lifestyle photograph of a plastic yogurt cup on a breakfast table with granola and fresh berries. The wrap-around label on the cup is a solid, vibrant magenta color (#FF00FF) as a placeholder. Bright, morning light. 4K, hyper-realistic.',
    [Scenario.THROW_PILLOW_SOFA]: 'Interior design photograph of a square throw pillow resting on a modern, neutral-colored sofa. The entire front surface of the pillow is a solid, vibrant magenta color (#FF00FF) as a placeholder for a pattern or design. The texture of the fabric is visible. Soft, natural light from a window. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.DUVET_COVER_BED]: 'Photograph of a beautifully made bed in a bright, minimalist bedroom. The duvet cover is neatly spread out. The top surface of the duvet cover is a solid, vibrant magenta color (#FF00FF) as a placeholder for a design. The fabric has natural folds and wrinkles. 4K, hyper-realistic.',
    [Scenario.WALL_CLOCK_LIVING_ROOM]: 'Photograph of a modern living room wall. A large, round, frameless wall clock is hanging on the wall. The face of the clock is a solid, vibrant magenta color (#FF00FF) as a placeholder for a design. The wall is a neutral color. 4K, hyper-realistic, minimalist decor.',
    [Scenario.SHOWER_CURTAIN_BATHROOM]: 'Photograph of a clean, modern bathroom. A fabric shower curtain is hanging closed. The entire front surface of the shower curtain is a solid, vibrant magenta color (#FF00FF) as a placeholder for a design. The curtain has gentle folds. Bright, clean lighting. 4K, hyper-realistic.',
    [Scenario.BEACH_TOWEL_SAND]: 'Top-down photograph of a rectangular beach towel laid out on clean, fine sand at the beach. The top surface of the towel is a solid, vibrant magenta color (#FF00FF) as a placeholder for a design. The towel has a soft, terrycloth texture. Bright, direct sunlight. 4K, hyper-realistic.',
    [Scenario.DRONE_BOX_PACKAGING]: 'Sleek product packaging shot. A modern, rectangular box for a high-tech drone sits on a dark, reflective surface. The front of the box is a solid, vibrant magenta color (#FF00FF) as a placeholder for the packaging design. The lighting is futuristic and dramatic. 4K, hyper-realistic.',
    [Scenario.SMART_SPEAKER_BOX]: 'Commercial photograph of the retail box for a smart speaker. The cubic box is standing on a clean, white background. The front face of the box is a solid, vibrant magenta color (#FF00FF) as a placeholder. Minimalist and modern aesthetic. 4K, hyper-realistic.',
    [Scenario.CAMERA_BOX_PACKAGING]: 'Professional product shot of the packaging for a new mirrorless camera. The premium, black box is on a minimalist studio background. The front of the box has a solid, vibrant magenta color (#FF00FF) placeholder for the design. The lighting is clean and professional. 4K, hyper-realistic.',
    [Scenario.GAMING_MOUSE_BOX]: 'Dynamic shot of the packaging for a high-performance gaming mouse. The box has an angular, modern design and is surrounded by subtle RGB lighting effects. The front of the box is a solid, vibrant magenta color (#FF00FF) as a placeholder. Dark, moody, esports-themed background. 4K, hyper-realistic.',
    [Scenario.WEBCAM_BOX_PACKAGING]: 'Clean product shot of the retail box for a professional webcam. The small, rectangular box is standing on a desk next to a laptop. The front of the box is a solid, vibrant magenta color (#FF00FF) as a placeholder. Bright, home office environment. 4K, hyper-realistic.',
  },
  edit: {
    frame: 'Find the vibrant magenta area (#FF00FF) inside the frame and replace it perfectly with the provided user design. The design should inherit the scene\'s lighting, perspective, and any subtle shadows or reflections. Integrate it seamlessly for a photorealistic result.',
    chandelier: 'Replace the glowing magenta placeholder light fixture with the user-provided chandelier design. The new chandelier must be integrated into the ceiling, become the primary light source for the top of the scene, glow realistically, and cast accurate light and shadows onto the room and the woman below.',
    product: 'Find the magenta cube placeholder and replace it entirely with the provided user product image. The product should sit realistically on the shelf or be held naturally, adopting the scene\'s lighting and casting a soft, accurate shadow. The final image should look like a professional product shot.',
    screen: 'Find the magenta area (#FF00FF) on the monitor screen and replace it perfectly with the provided user UI design. The design should look like it is being displayed on a backlit screen, with a slight emissive glow. Preserve any natural screen reflections from the scene to maintain realism.',
    apparel: 'Find the magenta placeholder area (#FF00FF) on the apparel item and replace it with the provided user design. The design must warp and conform perfectly to the item\'s fabric, including any wrinkles, folds, and shadows. The texture of the fabric should be visible through the design for maximum realism.',
    billboard: 'Find the large, glowing magenta billboard (#FF00FF) in the image. Replace the magenta area entirely with the provided user\'s design. The design must look like it\'s being displayed on a realistic, emissive LED screen. It should be bright, casting a subtle colored light onto nearby surfaces and the wet street below. Ensure the perspective is perfect.',
    mug_design: 'Locate the magenta rectangular placeholder (#FF00FF) on the white coffee mug. Apply the user\'s design onto this area. The design must curve and distort naturally to match the mug\'s cylindrical shape. It should adopt the scene\'s lighting, with realistic highlights and shadows. The texture of the ceramic should subtly show through the design.',
    label: 'Find the magenta placeholder area (#FF00FF) on the product. Replace it with the user\'s label design. The label must wrap perfectly around the product\'s surface, conforming to its shape (cylindrical, flat, etc.). It should inherit the scene\'s lighting, reflections, and shadows to look like a real, printed label. Ensure the integration is seamless and photorealistic.',
    poster: 'Find the vibrant magenta area (#FF00FF) designated for the poster. Replace this area perfectly with the provided user design. The design must conform to the surface, whether it\'s flat paper, inside a frame, or pasted on a textured wall. It should inherit the scene\'s lighting, perspective, shadows, and reflections to create a seamless, photorealistic result.',
  }
};

const ARTISTIC_STYLES = [
  { id: 'none', label: 'styleNone', description: 'styleNoneDescription' },
  { id: 'tilt_shift', label: 'tiltShiftEffect', description: 'tiltShiftDescription' },
  { id: 'cinematic', label: 'styleCinematic', description: 'styleCinematicDescription' },
  { id: 'vintage', label: 'styleVintage', description: 'styleVintageDescription' },
  { id: 'watercolor', label: 'styleWatercolor', description: 'styleWatercolorDescription' },
  { id: 'noir', label: 'styleNoir', description: 'styleNoirDescription' },
  { id: 'pop_art', label: 'stylePopArt', description: 'stylePopArtDescription' },
  { id: 'impressionism', label: 'styleImpressionism', description: 'styleImpressionismDescription' },
];

const STYLE_PROMPTS = {
  tilt_shift: 'Apply a strong, convincing tilt-shift photography effect to the entire image. The focus should be sharp on the main subject, with the foreground and background heavily blurred to create a miniature, toy-like appearance. The effect should be artistic and professional.',
  cinematic: 'Apply a cinematic color grade to the image. Enhance the contrast, slightly desaturate the colors, and add a subtle teal and orange color palette. The result should look like a still from a high-end movie.',
  vintage: 'Give the image a vintage photograph look. Add a subtle sepia tone, increase the grain, slightly fade the blacks, and add a soft vignette effect around the edges. The result should feel nostalgic, like a photo from the 1970s.',
  watercolor: 'Transform the image into a beautiful watercolor painting. The lines should be soft, colors should bleed into each other realistically, and the overall texture should resemble watercolor paper. The result should be artistic and painterly, not just a simple filter.',
  noir: 'Convert the image to a high-contrast, black and white noir film still. Emphasize deep blacks, bright highlights, and dramatic, hard-edged shadows. The mood should be mysterious and cinematic.',
  pop_art: 'Transform the image into a 1960s pop art style, like the work of Andy Warhol or Roy Lichtenstein. Use vibrant, saturated, flat colors, bold black outlines, and Ben-Day dots for shading. The result should be graphic and energetic.',
  impressionism: 'Reimagine the image as an Impressionist painting. Use short, visible brushstrokes and a soft focus. Emphasize the quality of light and atmosphere over fine details. The colors should be vibrant and blended. The style should be similar to Monet or Renoir.',
};

interface ScenariosBySubcategory {
  [subcategory: string]: ScenarioOption[];
}

interface CategoryGroup {
  title: string;
  scenariosBySubcategory: ScenariosBySubcategory;
}

const SceneVariationSkeleton: React.FC = () => (
  <div className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg aspect-square w-full"></div>
);

const App: React.FC = () => {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  const SCENARIO_OPTIONS: ScenarioOption[] = useMemo(() => [
    {
      id: Scenario.SITTING_FRAME,
      title: t('SITTING_FRAME_title'),
      description: t('SITTING_FRAME_description'),
      image: 'https://picsum.photos/seed/sitting/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryPeople',
    },
    {
      id: Scenario.STANDING_FRAME,
      title: t('STANDING_FRAME_title'),
      description: t('STANDING_FRAME_description'),
      image: 'https://picsum.photos/seed/standing/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryPeople',
    },
    {
      id: Scenario.ARMCHAIR_FRAME,
      title: t('ARMCHAIR_FRAME_title'),
      description: t('ARMCHAIR_FRAME_description'),
      image: 'https://picsum.photos/seed/armchair/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryPeople',
    },
    {
      id: Scenario.OUTDOOR_CAFE_FRAME,
      title: t('OUTDOOR_CAFE_FRAME_title'),
      description: t('OUTDOOR_CAFE_FRAME_description'),
      image: 'https://picsum.photos/seed/cafeframe/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryPeople',
    },
    {
      id: Scenario.WOMAN_FRAME_ZURICH,
      title: t('WOMAN_FRAME_ZURICH_title'),
      description: t('WOMAN_FRAME_ZURICH_description'),
      image: 'https://picsum.photos/seed/framezurich/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryPeople',
    },
    {
      id: Scenario.WOMAN_FRAME_GENEVA,
      title: t('WOMAN_FRAME_GENEVA_title'),
      description: t('WOMAN_FRAME_GENEVA_description'),
      image: 'https://picsum.photos/seed/framegeneva/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryPeople',
    },
    {
      id: Scenario.WOMAN_FRAME_ZERMATT,
      title: t('WOMAN_FRAME_ZERMATT_title'),
      description: t('WOMAN_FRAME_ZERMATT_description'),
      image: 'https://picsum.photos/seed/framezermatt/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryPeople',
    },
    {
      id: Scenario.WOMAN_FRAME_BERN,
      title: t('WOMAN_FRAME_BERN_title'),
      description: t('WOMAN_FRAME_BERN_description'),
      image: 'https://picsum.photos/seed/framebern/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryPeople',
    },
    {
      id: Scenario.WOMAN_FRAME_LUCERNE,
      title: t('WOMAN_FRAME_LUCERNE_title'),
      description: t('WOMAN_FRAME_LUCERNE_description'),
      image: 'https://picsum.photos/seed/framelucerne/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryPeople',
    },
    {
      id: Scenario.WOMAN_FRAME_LUGANO,
      title: t('WOMAN_FRAME_LUGANO_title'),
      description: t('WOMAN_FRAME_LUGANO_description'),
      image: 'https://picsum.photos/seed/framelugano/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryPeople',
    },
    {
      id: Scenario.WOMAN_FRAME_ST_MORITZ,
      title: t('WOMAN_FRAME_ST_MORITZ_title'),
      description: t('WOMAN_FRAME_ST_MORITZ_description'),
      image: 'https://picsum.photos/seed/framestmoritz/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryPeople',
    },
    {
      id: Scenario.WOMAN_FRAME_INTERLAKEN,
      title: t('WOMAN_FRAME_INTERLAKEN_title'),
      description: t('WOMAN_FRAME_INTERLAKEN_description'),
      image: 'https://picsum.photos/seed/frameinterlaken/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryPeople',
    },
    {
      id: Scenario.WOMAN_FRAME_MONTREUX,
      title: t('WOMAN_FRAME_MONTREUX_title'),
      description: t('WOMAN_FRAME_MONTREUX_description'),
      image: 'https://picsum.photos/seed/framemontreux/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryPeople',
    },
    {
      id: Scenario.WOMAN_FRAME_CAIRO_MURALS,
      title: t('WOMAN_FRAME_CAIRO_MURALS_title'),
      description: t('WOMAN_FRAME_CAIRO_MURALS_description'),
      image: 'https://picsum.photos/seed/framecairo/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryPeople',
    },
    {
      id: Scenario.WOMAN_FRAME_ROME_MURALS,
      title: t('WOMAN_FRAME_ROME_MURALS_title'),
      description: t('WOMAN_FRAME_ROME_MURALS_description'),
      image: 'https://picsum.photos/seed/framerome/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryPeople',
    },
    {
      id: Scenario.HOME_FRAME,
      title: t('HOME_FRAME_title'),
      description: t('HOME_FRAME_description'),
      image: 'https://picsum.photos/seed/home/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryRooms',
    },
    {
      id: Scenario.KITCHEN_FRAME,
      title: t('KITCHEN_FRAME_title'),
      description: t('KITCHEN_FRAME_description'),
      image: 'https://picsum.photos/seed/kitchen/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryRooms',
    },
    {
      id: Scenario.LIVING_ROOM_FRAME,
      title: t('LIVING_ROOM_FRAME_title'),
      description: t('LIVING_ROOM_FRAME_description'),
      image: 'https://picsum.photos/seed/livingroom/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryRooms',
    },
    {
      id: Scenario.BEDROOM_FRAME,
      title: t('BEDROOM_FRAME_title'),
      description: t('BEDROOM_FRAME_description'),
      image: 'https://picsum.photos/seed/bedroom/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryRooms',
    },
    {
      id: Scenario.KIDS_ROOM_FRAME,
      title: t('KIDS_ROOM_FRAME_title'),
      description: t('KIDS_ROOM_FRAME_description'),
      image: 'https://picsum.photos/seed/kidsroom/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryRooms',
    },
    {
      id: Scenario.HALL_FRAME,
      title: t('HALL_FRAME_title'),
      description: t('HALL_FRAME_description'),
      image: 'https://picsum.photos/seed/hallway/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryRooms',
    },
    {
      id: Scenario.LIBRARY_FRAME,
      title: t('LIBRARY_FRAME_title'),
      description: t('LIBRARY_FRAME_description'),
      image: 'https://picsum.photos/seed/library/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryRooms',
    },
    {
      id: Scenario.MINIMALIST_DESK_FRAME,
      title: t('MINIMALIST_DESK_FRAME_title'),
      description: t('MINIMALIST_DESK_FRAME_description'),
      image: 'https://picsum.photos/seed/desk/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryRooms',
    },
    {
      id: Scenario.CREATIVE_STUDIO_FRAME,
      title: t('CREATIVE_STUDIO_FRAME_title'),
      description: t('CREATIVE_STUDIO_FRAME_description'),
      image: 'https://picsum.photos/seed/studio/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryRooms',
    },
    {
      id: Scenario.CORPORATE_BOARDROOM_FRAME,
      title: t('CORPORATE_BOARDROOM_FRAME_title'),
      description: t('CORPORATE_BOARDROOM_FRAME_description'),
      image: 'https://picsum.photos/seed/boardroom/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryRooms',
    },
    {
      id: Scenario.LUXURY_HOTEL_LOBBY_FRAME,
      title: t('LUXURY_HOTEL_LOBBY_FRAME_title'),
      description: t('LUXURY_HOTEL_LOBBY_FRAME_description'),
      image: 'https://picsum.photos/seed/hotelframe/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryRooms',
    },
    {
      id: Scenario.MODERN_OFFICE_RECEPTION_FRAME,
      title: t('MODERN_OFFICE_RECEPTION_FRAME_title'),
      description: t('MODERN_OFFICE_RECEPTION_FRAME_description'),
      image: 'https://picsum.photos/seed/reception/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryRooms',
    },
    {
      id: Scenario.ARCHITECTS_OFFICE_FRAME,
      title: t('ARCHITECTS_OFFICE_FRAME_title'),
      description: t('ARCHITECTS_OFFICE_FRAME_description'),
      image: 'https://picsum.photos/seed/architect/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryRooms',
    },
    {
      id: Scenario.RESTAURANT_WALL_FRAME,
      title: t('RESTAURANT_WALL_FRAME_title'),
      description: t('RESTAURANT_WALL_FRAME_description'),
      image: 'https://picsum.photos/seed/restaurant/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryRooms',
    },
    {
      id: Scenario.ARMCHAIR_CHANDELIER,
      title: t('ARMCHAIR_CHANDELIER_title'),
      description: t('ARMCHAIR_CHANDELIER_description'),
      image: 'https://picsum.photos/seed/chandelier/400/300',
      requiresDesign: 'chandelier',
    },
    {
      id: Scenario.GALLERY_CHANDELIER,
      title: t('GALLERY_CHANDELIER_title'),
      description: t('GALLERY_CHANDELIER_description'),
      image: 'https://picsum.photos/seed/gallery/400/300',
      requiresDesign: 'chandelier',
    },
    {
      id: Scenario.GOTHIC_CHANDELIER,
      title: t('GOTHIC_CHANDELIER_title'),
      description: t('GOTHIC_CHANDELIER_description'),
      image: 'https://picsum.photos/seed/gothic/400/300',
      requiresDesign: 'chandelier',
    },
    {
      id: Scenario.PATIO_CHANDELIER,
      title: t('PATIO_CHANDELIER_title'),
      description: t('PATIO_CHANDELIER_description'),
      image: 'https://picsum.photos/seed/patio/400/300',
      requiresDesign: 'chandelier',
    },
    {
      id: Scenario.MODERN_DINING_CHANDELIER,
      title: t('MODERN_DINING_CHANDELIER_title'),
      description: t('MODERN_DINING_CHANDELIER_description'),
      image: 'https://picsum.photos/seed/dining/400/300',
      requiresDesign: 'chandelier',
    },
    {
      id: Scenario.HOTEL_LOBBY_CHANDELIER,
      title: t('HOTEL_LOBBY_CHANDELIER_title'),
      description: t('HOTEL_LOBBY_CHANDELIER_description'),
      image: 'https://picsum.photos/seed/hotellobby/400/300',
      requiresDesign: 'chandelier',
    },
    {
      id: Scenario.FARMHOUSE_CHANDELIER,
      title: t('FARMHOUSE_CHANDELIER_title'),
      description: t('FARMHOUSE_CHANDELIER_description'),
      image: 'https://picsum.photos/seed/farmhouse/400/300',
      requiresDesign: 'chandelier',
    },
    {
      id: Scenario.GRAND_STAIRCASE_CHANDELIER,
      title: t('GRAND_STAIRCASE_CHANDELIER_title'),
      description: t('GRAND_STAIRCASE_CHANDELIER_description'),
      image: 'https://picsum.photos/seed/staircase/400/300',
      requiresDesign: 'chandelier',
    },
    {
      id: Scenario.BANQUET_HALL_CHANDELIER,
      title: t('BANQUET_HALL_CHANDELIER_title'),
      description: t('BANQUET_HALL_CHANDELIER_description'),
      image: 'https://picsum.photos/seed/banquet/400/300',
      requiresDesign: 'chandelier',
    },
    {
      id: Scenario.MUSEUM_ATRIUM_CHANDELIER,
      title: t('MUSEUM_ATRIUM_CHANDELIER_title'),
      description: t('MUSEUM_ATRIUM_CHANDELIER_description'),
      image: 'https://picsum.photos/seed/museum/400/300',
      requiresDesign: 'chandelier',
    },
    {
      id: Scenario.OPERA_HOUSE_LOBBY_CHANDELIER,
      title: t('OPERA_HOUSE_LOBBY_CHANDELIER_title'),
      description: t('OPERA_HOUSE_LOBBY_CHANDELIER_description'),
      image: 'https://picsum.photos/seed/opera/400/300',
      requiresDesign: 'chandelier',
    },
    {
      id: Scenario.PENTHOUSE_SUITE_CHANDELIER,
      title: t('PENTHOUSE_SUITE_CHANDELIER_title'),
      description: t('PENTHOUSE_SUITE_CHANDELIER_description'),
      image: 'https://picsum.photos/seed/penthouse/400/300',
      requiresDesign: 'chandelier',
    },
    {
      id: Scenario.PRODUCT_SHELF,
      title: t('PRODUCT_SHELF_title'),
      description: t('PRODUCT_SHELF_description'),
      image: 'https://picsum.photos/seed/shelf/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductRetail',
    },
    {
      id: Scenario.WOMAN_HOLDING_PRODUCT_STREET,
      title: t('WOMAN_HOLDING_PRODUCT_STREET_title'),
      description: t('WOMAN_HOLDING_PRODUCT_STREET_description'),
      image: 'https://picsum.photos/seed/productstreet/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductLifestyle',
    },
    {
      id: Scenario.WOMAN_STOOL_PRODUCT_LA,
      title: t('WOMAN_STOOL_PRODUCT_LA_title'),
      description: t('WOMAN_STOOL_PRODUCT_LA_description'),
      image: 'https://picsum.photos/seed/productla/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductLifestyle',
    },
    {
      id: Scenario.WOMAN_COUCH_PRODUCT_LA,
      title: t('WOMAN_COUCH_PRODUCT_LA_title'),
      description: t('WOMAN_COUCH_PRODUCT_LA_description'),
      image: 'https://picsum.photos/seed/productlacouch/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductHomeLifestyle',
    },
    {
      id: Scenario.WOMAN_SOFA_PRODUCT_PARIS,
      title: t('WOMAN_SOFA_PRODUCT_PARIS_title'),
      description: t('WOMAN_SOFA_PRODUCT_PARIS_description'),
      image: 'https://picsum.photos/seed/productparis/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductHomeLifestyle',
    },
    {
      id: Scenario.WOMAN_LINGERIE_PRODUCT_SWISS_PARISIAN,
      title: t('WOMAN_LINGERIE_PRODUCT_SWISS_PARISIAN_title'),
      description: t('WOMAN_LINGERIE_PRODUCT_SWISS_PARISIAN_description'),
      image: 'https://picsum.photos/seed/productlingerie/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductHomeLifestyle',
    },
    {
      id: Scenario.WOMAN_NIGHTGOWN_PRODUCT_SWISS_PARISIAN,
      title: t('WOMAN_NIGHTGOWN_PRODUCT_SWISS_PARISIAN_title'),
      description: t('WOMAN_NIGHTGOWN_PRODUCT_SWISS_PARISIAN_description'),
      image: 'https://picsum.photos/seed/productnightgown/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductHomeLifestyle',
    },
    {
      id: Scenario.MOTHER_DAUGHTER_PRODUCT_CAMBRIDGE_ITALIANATE,
      title: t('MOTHER_DAUGHTER_PRODUCT_CAMBRIDGE_ITALIANATE_title'),
      description: t('MOTHER_DAUGHTER_PRODUCT_CAMBRIDGE_ITALIANATE_description'),
      image: 'https://picsum.photos/seed/productcambridgehall/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductHomeLifestyle',
    },
    {
      id: Scenario.WOMAN_PRODUCT_CAMBRIDGE_ITALIANATE,
      title: t('WOMAN_PRODUCT_CAMBRIDGE_ITALIANATE_title'),
      description: t('WOMAN_PRODUCT_CAMBRIDGE_ITALIANATE_description'),
      image: 'https://picsum.photos/seed/productcambridgewoman/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductHomeLifestyle',
    },
    {
      id: Scenario.WOMAN_PRODUCT_ZURICH,
      title: t('WOMAN_PRODUCT_ZURICH_title'),
      description: t('WOMAN_PRODUCT_ZURICH_description'),
      image: 'https://picsum.photos/seed/productzurich/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductLifestyle',
    },
    {
      id: Scenario.WOMAN_PRODUCT_GENEVA,
      title: t('WOMAN_PRODUCT_GENEVA_title'),
      description: t('WOMAN_PRODUCT_GENEVA_description'),
      image: 'https://picsum.photos/seed/productgeneva/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductLifestyle',
    },
    {
      id: Scenario.WOMAN_PRODUCT_ZERMATT,
      title: t('WOMAN_PRODUCT_ZERMATT_title'),
      description: t('WOMAN_PRODUCT_ZERMATT_description'),
      image: 'https://picsum.photos/seed/productzermatt/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductLifestyle',
    },
    {
      id: Scenario.WOMAN_PRODUCT_BERN,
      title: t('WOMAN_PRODUCT_BERN_title'),
      description: t('WOMAN_PRODUCT_BERN_description'),
      image: 'https://picsum.photos/seed/productbern/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductLifestyle',
    },
    {
      id: Scenario.WOMAN_PRODUCT_LUCERNE,
      title: t('WOMAN_PRODUCT_LUCERNE_title'),
      description: t('WOMAN_PRODUCT_LUCERNE_description'),
      image: 'https://picsum.photos/seed/productlucerne/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductLifestyle',
    },
    {
      id: Scenario.WOMAN_PRODUCT_LUGANO,
      title: t('WOMAN_PRODUCT_LUGANO_title'),
      description: t('WOMAN_PRODUCT_LUGANO_description'),
      image: 'https://picsum.photos/seed/productlugano/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductLifestyle',
    },
    {
      id: Scenario.WOMAN_PRODUCT_ST_MORITZ,
      title: t('WOMAN_PRODUCT_ST_MORITZ_title'),
      description: t('WOMAN_PRODUCT_ST_MORITZ_description'),
      image: 'https://picsum.photos/seed/productstmoritz/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductLifestyle',
    },
    {
      id: Scenario.WOMAN_PRODUCT_INTERLAKEN,
      title: t('WOMAN_PRODUCT_INTERLAKEN_title'),
      description: t('WOMAN_PRODUCT_INTERLAKEN_description'),
      image: 'https://picsum.photos/seed/productinterlaken/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductLifestyle',
    },
    {
      id: Scenario.WOMAN_PRODUCT_MONTREUX,
      title: t('WOMAN_PRODUCT_MONTREUX_title'),
      description: t('WOMAN_PRODUCT_MONTREUX_description'),
      image: 'https://picsum.photos/seed/productmontreux/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductLifestyle',
    },
    {
      id: Scenario.WOMAN_PRODUCT_LIVING_ROOM,
      title: t('WOMAN_PRODUCT_LIVING_ROOM_title'),
      description: t('WOMAN_PRODUCT_LIVING_ROOM_description'),
      image: 'https://picsum.photos/seed/productlivingroom/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductHomeLifestyle',
    },
    {
      id: Scenario.WOMAN_PRODUCT_KITCHEN,
      title: t('WOMAN_PRODUCT_KITCHEN_title'),
      description: t('WOMAN_PRODUCT_KITCHEN_description'),
      image: 'https://picsum.photos/seed/productkitchen/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductHomeLifestyle',
    },
    {
      id: Scenario.WOMAN_PRODUCT_BEDROOM,
      title: t('WOMAN_PRODUCT_BEDROOM_title'),
      description: t('WOMAN_PRODUCT_BEDROOM_description'),
      image: 'https://picsum.photos/seed/productbedroom/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductHomeLifestyle',
    },
    {
      id: Scenario.WOMAN_PRODUCT_HOME_OFFICE,
      title: t('WOMAN_PRODUCT_HOME_OFFICE_title'),
      description: t('WOMAN_PRODUCT_HOME_OFFICE_description'),
      image: 'https://picsum.photos/seed/producthomeoffice/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductHomeLifestyle',
    },
    {
      id: Scenario.WOMAN_PRODUCT_BATHROOM,
      title: t('WOMAN_PRODUCT_BATHROOM_title'),
      description: t('WOMAN_PRODUCT_BATHROOM_description'),
      image: 'https://picsum.photos/seed/productbathroom/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductHomeLifestyle',
    },
    {
      id: Scenario.WOMAN_PRODUCT_NURSERY,
      title: t('WOMAN_PRODUCT_NURSERY_title'),
      description: t('WOMAN_PRODUCT_NURSERY_description'),
      image: 'https://picsum.photos/seed/productnursery/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductHomeLifestyle',
    },
    {
      id: Scenario.WOMAN_LASER_PRODUCT_MODERN_LIVING_ROOM,
      title: t('WOMAN_LASER_PRODUCT_MODERN_LIVING_ROOM_title'),
      description: t('WOMAN_LASER_PRODUCT_MODERN_LIVING_ROOM_description'),
      image: 'https://picsum.photos/seed/laserliving/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductHomeLifestyle',
    },
    {
      id: Scenario.WOMAN_LASER_PRODUCT_SCANDINAVIAN_BEDROOM,
      title: t('WOMAN_LASER_PRODUCT_SCANDINAVIAN_BEDROOM_title'),
      description: t('WOMAN_LASER_PRODUCT_SCANDINAVIAN_BEDROOM_description'),
      image: 'https://picsum.photos/seed/laserbedroom/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductHomeLifestyle',
    },
    {
      id: Scenario.WOMAN_LASER_PRODUCT_BOHEMIAN_STUDIO,
      title: t('WOMAN_LASER_PRODUCT_BOHEMIAN_STUDIO_title'),
      description: t('WOMAN_LASER_PRODUCT_BOHEMIAN_STUDIO_description'),
      image: 'https://picsum.photos/seed/laserboho/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductHomeLifestyle',
    },
    {
      id: Scenario.WOMAN_LASER_PRODUCT_MINIMALIST_OFFICE,
      title: t('WOMAN_LASER_PRODUCT_MINIMALIST_OFFICE_title'),
      description: t('WOMAN_LASER_PRODUCT_MINIMALIST_OFFICE_description'),
      image: 'https://picsum.photos/seed/laseroffice/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductHomeLifestyle',
    },
    {
      id: Scenario.WOMAN_LASER_PRODUCT_RUSTIC_DINING_ROOM,
      title: t('WOMAN_LASER_PRODUCT_RUSTIC_DINING_ROOM_title'),
      description: t('WOMAN_LASER_PRODUCT_RUSTIC_DINING_ROOM_description'),
      image: 'https://picsum.photos/seed/laserdining/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductHomeLifestyle',
    },
    {
      id: Scenario.WOMAN_LASER_LAMP_KITCHEN,
      title: t('WOMAN_LASER_LAMP_KITCHEN_title'),
      description: t('WOMAN_LASER_LAMP_KITCHEN_description'),
      image: 'https://picsum.photos/seed/laserlamp/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductHomeLifestyle',
    },
    {
      id: Scenario.BOOK_COVER,
      title: t('BOOK_COVER_title'),
      description: t('BOOK_COVER_description'),
      image: 'https://picsum.photos/seed/book/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductPackaging',
    },
    {
      id: Scenario.CEREAL_BOX,
      title: t('CEREAL_BOX_title'),
      description: t('CEREAL_BOX_description'),
      image: 'https://picsum.photos/seed/cereal/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductPackaging',
    },
    {
      id: Scenario.SHOPPING_BAG,
      title: t('SHOPPING_BAG_title'),
      description: t('SHOPPING_BAG_description'),
      image: 'https://picsum.photos/seed/bag/400/300',
      requiresDesign: 'product',
      subcategory: 'subcategoryProductLifestyle',
    },
    {
      id: Scenario.OFFICE_SCREEN,
      title: t('OFFICE_SCREEN_title'),
      description: t('OFFICE_SCREEN_description'),
      image: 'https://picsum.photos/seed/screen/400/300',
      requiresDesign: 'screen',
      subcategory: 'subcategoryScreens',
    },
    {
      id: Scenario.LAPTOP_SCREEN,
      title: t('LAPTOP_SCREEN_title'),
      description: t('LAPTOP_SCREEN_description'),
      image: 'https://picsum.photos/seed/laptop/400/300',
      requiresDesign: 'screen',
      subcategory: 'subcategoryScreens',
    },
    {
      id: Scenario.PHONE_SCREEN,
      title: t('PHONE_SCREEN_title'),
      description: t('PHONE_SCREEN_description'),
      image: 'https://picsum.photos/seed/phone/400/300',
      requiresDesign: 'screen',
      subcategory: 'subcategoryScreens',
    },
    {
      id: Scenario.TABLET_ON_DESK,
      title: t('TABLET_ON_DESK_title'),
      description: t('TABLET_ON_DESK_description'),
      image: 'https://picsum.photos/seed/tablet/400/300',
      requiresDesign: 'screen',
      subcategory: 'subcategoryScreens',
    },
    {
      id: Scenario.PHONE_OUTDOORS,
      title: t('PHONE_OUTDOORS_title'),
      description: t('PHONE_OUTDOORS_description'),
      image: 'https://picsum.photos/seed/phoneoutdoor/400/300',
      requiresDesign: 'screen',
      subcategory: 'subcategoryScreens',
    },
    {
      id: Scenario.MULTI_DEVICE_SHOWCASE,
      title: t('MULTI_DEVICE_SHOWCASE_title'),
      description: t('MULTI_DEVICE_SHOWCASE_description'),
      image: 'https://picsum.photos/seed/multidevice/400/300',
      requiresDesign: 'screen',
      subcategory: 'subcategoryScreens',
    },
    {
      id: Scenario.CAR_DASHBOARD_SCREEN,
      title: t('CAR_DASHBOARD_SCREEN_title'),
      description: t('CAR_DASHBOARD_SCREEN_description'),
      image: 'https://picsum.photos/seed/cardash/400/300',
      requiresDesign: 'screen',
      subcategory: 'subcategoryScreens',
    },
    {
      id: Scenario.SMARTWATCH_ON_WRIST,
      title: t('SMARTWATCH_ON_WRIST_title'),
      description: t('SMARTWATCH_ON_WRIST_description'),
      image: 'https://picsum.photos/seed/smartwatch/400/300',
      requiresDesign: 'screen',
      subcategory: 'subcategoryScreens',
    },
    {
      id: Scenario.TV_IN_LIVING_ROOM,
      title: t('TV_IN_LIVING_ROOM_title'),
      description: t('TV_IN_LIVING_ROOM_description'),
      image: 'https://picsum.photos/seed/tvscreen/400/300',
      requiresDesign: 'screen',
      subcategory: 'subcategoryScreens',
    },
    {
      id: Scenario.ATM_SCREEN,
      title: t('ATM_SCREEN_title'),
      description: t('ATM_SCREEN_description'),
      image: 'https://picsum.photos/seed/atm/400/300',
      requiresDesign: 'screen',
      subcategory: 'subcategoryScreens',
    },
    {
      id: Scenario.PROJECTOR_SCREEN_MEETING,
      title: t('PROJECTOR_SCREEN_MEETING_title'),
      description: t('PROJECTOR_SCREEN_MEETING_description'),
      image: 'https://picsum.photos/seed/projector/400/300',
      requiresDesign: 'screen',
      subcategory: 'subcategoryScreens',
    },
    {
      id: Scenario.HANDHELD_CONSOLE_SCREEN,
      title: t('HANDHELD_CONSOLE_SCREEN_title'),
      description: t('HANDHELD_CONSOLE_SCREEN_description'),
      image: 'https://picsum.photos/seed/handheld/400/300',
      requiresDesign: 'screen',
      subcategory: 'subcategoryScreens',
    },
    {
      id: Scenario.COWORKING_SPACE_LAPTOP,
      title: t('COWORKING_SPACE_LAPTOP_title'),
      description: t('COWORKING_SPACE_LAPTOP_description'),
      image: 'https://picsum.photos/seed/coworking/400/300',
      requiresDesign: 'screen',
      subcategory: 'subcategoryScreens',
    },
    {
      id: Scenario.MEDICAL_TABLET_SCREEN,
      title: t('MEDICAL_TABLET_SCREEN_title'),
      description: t('MEDICAL_TABLET_SCREEN_description'),
      image: 'https://picsum.photos/seed/medical/400/300',
      requiresDesign: 'screen',
      subcategory: 'subcategoryScreens',
    },
    {
      id: Scenario.RETAIL_POS_SCREEN,
      title: t('RETAIL_POS_SCREEN_title'),
      description: t('RETAIL_POS_SCREEN_description'),
      image: 'https://picsum.photos/seed/pos/400/300',
      requiresDesign: 'screen',
      subcategory: 'subcategoryScreens',
    },
    {
      id: Scenario.DIGITAL_WHITEBOARD_MEETING,
      title: t('DIGITAL_WHITEBOARD_MEETING_title'),
      description: t('DIGITAL_WHITEBOARD_MEETING_description'),
      image: 'https://picsum.photos/seed/whiteboard/400/300',
      requiresDesign: 'screen',
      subcategory: 'subcategoryScreens',
    },
    {
      id: Scenario.TSHIRT_MODEL,
      title: t('TSHIRT_MODEL_title'),
      description: t('TSHIRT_MODEL_description'),
      image: 'https://picsum.photos/seed/tshirt/400/300',
      requiresDesign: 'apparel',
      subcategory: 'subcategoryTops',
    },
    {
      id: Scenario.HOODIE_MODEL,
      title: t('HOODIE_MODEL_title'),
      description: t('HOODIE_MODEL_description'),
      image: 'https://picsum.photos/seed/hoodie/400/300',
      requiresDesign: 'apparel',
      subcategory: 'subcategoryTops',
    },
    {
      id: Scenario.SWEATSHIRT_HANGER,
      title: t('SWEATSHIRT_HANGER_title'),
      description: t('SWEATSHIRT_HANGER_description'),
      image: 'https://picsum.photos/seed/sweatshirt/400/300',
      requiresDesign: 'apparel',
      subcategory: 'subcategoryTops',
    },
    {
      id: Scenario.TANK_TOP_FITNESS,
      title: t('TANK_TOP_FITNESS_title'),
      description: t('TANK_TOP_FITNESS_description'),
      image: 'https://picsum.photos/seed/tanktop/400/300',
      requiresDesign: 'apparel',
      subcategory: 'subcategoryTops',
    },
    {
      id: Scenario.FOLDED_SHIRT_HELD,
      title: t('FOLDED_SHIRT_HELD_title'),
      description: t('FOLDED_SHIRT_HELD_description'),
      image: 'https://picsum.photos/seed/foldedshirt/400/300',
      requiresDesign: 'apparel',
      subcategory: 'subcategoryTops',
    },
    {
      id: Scenario.TOTE_BAG_LIFESTYLE,
      title: t('TOTE_BAG_LIFESTYLE_title'),
      description: t('TOTE_BAG_LIFESTYLE_description'),
      image: 'https://picsum.photos/seed/totebag/400/300',
      requiresDesign: 'apparel',
      subcategory: 'subcategoryAccessories',
    },
    {
      id: Scenario.BASEBALL_CAP_MODEL,
      title: t('BASEBALL_CAP_MODEL_title'),
      description: t('BASEBALL_CAP_MODEL_description'),
      image: 'https://picsum.photos/seed/cap/400/300',
      requiresDesign: 'apparel',
      subcategory: 'subcategoryAccessories',
    },
    {
      id: Scenario.BEANIE_MODEL,
      title: t('BEANIE_MODEL_title'),
      description: t('BEANIE_MODEL_description'),
      image: 'https://picsum.photos/seed/beanie/400/300',
      requiresDesign: 'apparel',
      subcategory: 'subcategoryAccessories',
    },
    {
      id: Scenario.SOCKS_PAIR,
      title: t('SOCKS_PAIR_title'),
      description: t('SOCKS_PAIR_description'),
      image: 'https://picsum.photos/seed/socks/400/300',
      requiresDesign: 'apparel',
      subcategory: 'subcategoryAccessories',
    },
    {
      id: Scenario.APRON_PERSON,
      title: t('APRON_PERSON_title'),
      description: t('APRON_PERSON_description'),
      image: 'https://picsum.photos/seed/apron/400/300',
      requiresDesign: 'apparel',
      subcategory: 'subcategoryAccessories',
    },
    {
      id: Scenario.BABY_ONESIE_FLATLAY,
      title: t('BABY_ONESIE_FLATLAY_title'),
      description: t('BABY_ONESIE_FLATLAY_description'),
      image: 'https://picsum.photos/seed/onesie/400/300',
      requiresDesign: 'apparel',
      subcategory: 'subcategoryKids',
    },
    {
      id: Scenario.CITY_BILLBOARD,
      title: t('CITY_BILLBOARD_title'),
      description: t('CITY_BILLBOARD_description'),
      image: 'https://picsum.photos/seed/billboard/400/300',
      requiresDesign: 'billboard',
      subcategory: 'subcategoryBillboardUrban',
    },
    {
      id: Scenario.TIMES_SQUARE_SCREENS,
      title: t('TIMES_SQUARE_SCREENS_title'),
      description: t('TIMES_SQUARE_SCREENS_description'),
      image: 'https://picsum.photos/seed/timessquare/400/300',
      requiresDesign: 'billboard',
      subcategory: 'subcategoryBillboardUrban',
    },
    {
      id: Scenario.SUBWAY_AD,
      title: t('SUBWAY_AD_title'),
      description: t('SUBWAY_AD_description'),
      image: 'https://picsum.photos/seed/subwayad/400/300',
      requiresDesign: 'billboard',
      subcategory: 'subcategoryBillboardUrban',
    },
    {
      id: Scenario.BUS_STOP_AD,
      title: t('BUS_STOP_AD_title'),
      description: t('BUS_STOP_AD_description'),
      image: 'https://picsum.photos/seed/busstopad/400/300',
      requiresDesign: 'billboard',
      subcategory: 'subcategoryBillboardUrban',
    },
    {
      id: Scenario.BUILDING_BANNER,
      title: t('BUILDING_BANNER_title'),
      description: t('BUILDING_BANNER_description'),
      image: 'https://picsum.photos/seed/buildingbanner/400/300',
      requiresDesign: 'billboard',
      subcategory: 'subcategoryBillboardUrban',
    },
    {
      id: Scenario.CONSTRUCTION_BANNER,
      title: t('CONSTRUCTION_BANNER_title'),
      description: t('CONSTRUCTION_BANNER_description'),
      image: 'https://picsum.photos/seed/construction/400/300',
      requiresDesign: 'billboard',
      subcategory: 'subcategoryBillboardUrban',
    },
    {
      id: Scenario.HIGHWAY_BILLBOARD,
      title: t('HIGHWAY_BILLBOARD_title'),
      description: t('HIGHWAY_BILLBOARD_description'),
      image: 'https://picsum.photos/seed/highway/400/300',
      requiresDesign: 'billboard',
      subcategory: 'subcategoryBillboardRoadside',
    },
    {
      id: Scenario.RURAL_BILLBOARD,
      title: t('RURAL_BILLBOARD_title'),
      description: t('RURAL_BILLBOARD_description'),
      image: 'https://picsum.photos/seed/ruralbillboard/400/300',
      requiresDesign: 'billboard',
      subcategory: 'subcategoryBillboardRoadside',
    },
    {
      id: Scenario.STADIUM_JUMBOTRON,
      title: t('STADIUM_JUMBOTRON_title'),
      description: t('STADIUM_JUMBOTRON_description'),
      image: 'https://picsum.photos/seed/jumbotron/400/300',
      requiresDesign: 'billboard',
      subcategory: 'subcategoryBillboardIndoor',
    },
    {
      id: Scenario.MALL_SCREEN,
      title: t('MALL_SCREEN_title'),
      description: t('MALL_SCREEN_description'),
      image: 'https://picsum.photos/seed/mallscreen/400/300',
      requiresDesign: 'billboard',
      subcategory: 'subcategoryBillboardIndoor',
    },
    {
      id: Scenario.STREET_POSTER,
      title: t('STREET_POSTER_title'),
      description: t('STREET_POSTER_description'),
      image: 'https://picsum.photos/seed/poster/400/300',
      requiresDesign: 'poster',
      subcategory: 'subcategoryPosterUrban',
    },
    {
      id: Scenario.FRAMED_POSTER_LIVING_ROOM,
      title: t('FRAMED_POSTER_LIVING_ROOM_title'),
      description: t('FRAMED_POSTER_LIVING_ROOM_description'),
      image: 'https://picsum.photos/seed/posterliving/400/300',
      requiresDesign: 'poster',
      subcategory: 'subcategoryPosterIndoor',
    },
    {
      id: Scenario.CAFE_INTERIOR_POSTER,
      title: t('CAFE_INTERIOR_POSTER_title'),
      description: t('CAFE_INTERIOR_POSTER_description'),
      image: 'https://picsum.photos/seed/postercafe/400/300',
      requiresDesign: 'poster',
      subcategory: 'subcategoryPosterIndoor',
    },
    {
      id: Scenario.ART_GALLERY_POSTER,
      title: t('ART_GALLERY_POSTER_title'),
      description: t('ART_GALLERY_POSTER_description'),
      image: 'https://picsum.photos/seed/postergallery/400/300',
      requiresDesign: 'poster',
      subcategory: 'subcategoryPosterIndoor',
    },
    {
      id: Scenario.STREET_A_FRAME_SIGN,
      title: t('STREET_A_FRAME_SIGN_title'),
      description: t('STREET_A_FRAME_SIGN_description'),
      image: 'https://picsum.photos/seed/posteraframe/400/300',
      requiresDesign: 'poster',
      subcategory: 'subcategoryPosterUrban',
    },
    {
      id: Scenario.WHEATPASTE_POSTERS_WALL,
      title: t('WHEATPASTE_POSTERS_WALL_title'),
      description: t('WHEATPASTE_POSTERS_WALL_description'),
      image: 'https://picsum.photos/seed/posterwheat/400/300',
      requiresDesign: 'poster',
      subcategory: 'subcategoryPosterUrban',
    },
    {
      id: Scenario.BUS_SHELTER_POSTER,
      title: t('BUS_SHELTER_POSTER_title'),
      description: t('BUS_SHELTER_POSTER_description'),
      image: 'https://picsum.photos/seed/posterbus/400/300',
      requiresDesign: 'poster',
      subcategory: 'subcategoryPosterUrban',
    },
    {
      id: Scenario.MUSIC_VENUE_POSTER_WALL,
      title: t('MUSIC_VENUE_POSTER_WALL_title'),
      description: t('MUSIC_VENUE_POSTER_WALL_description'),
      image: 'https://picsum.photos/seed/postermusic/400/300',
      requiresDesign: 'poster',
      subcategory: 'subcategoryPosterUrban',
    },
    {
      id: Scenario.COMMUNITY_BULLETIN_BOARD,
      title: t('COMMUNITY_BULLETIN_BOARD_title'),
      description: t('COMMUNITY_BULLETIN_BOARD_description'),
      image: 'https://picsum.photos/seed/posterboard/400/300',
      requiresDesign: 'poster',
      subcategory: 'subcategoryPosterCommunity',
    },
    {
      id: Scenario.PERSON_HOLDING_POSTER,
      title: t('PERSON_HOLDING_POSTER_title'),
      description: t('PERSON_HOLDING_POSTER_description'),
      image: 'https://picsum.photos/seed/posterholding/400/300',
      requiresDesign: 'poster',
      subcategory: 'subcategoryPosterCommunity',
    },
    {
      id: Scenario.COFFEE_MUG,
      title: t('COFFEE_MUG_title'),
      description: t('COFFEE_MUG_description'),
      image: 'https://picsum.photos/seed/mug/400/300',
      requiresDesign: 'mug_design',
      subcategory: 'subcategoryMugLifestyle',
    },
    {
      id: Scenario.MUG_HELD_BY_PERSON,
      title: t('MUG_HELD_BY_PERSON_title'),
      description: t('MUG_HELD_BY_PERSON_description'),
      image: 'https://picsum.photos/seed/mugholding/400/300',
      requiresDesign: 'mug_design',
      subcategory: 'subcategoryMugLifestyle',
    },
    {
      id: Scenario.MUGS_PAIR,
      title: t('MUGS_PAIR_title'),
      description: t('MUGS_PAIR_description'),
      image: 'https://picsum.photos/seed/mugpair/400/300',
      requiresDesign: 'mug_design',
      subcategory: 'subcategoryMugLifestyle',
    },
    {
      id: Scenario.MUG_CAMPING,
      title: t('MUG_CAMPING_title'),
      description: t('MUG_CAMPING_description'),
      image: 'https://picsum.photos/seed/mugcamping/400/300',
      requiresDesign: 'mug_design',
      subcategory: 'subcategoryMugLifestyle',
    },
    {
      id: Scenario.MUG_OFFICE_DESK,
      title: t('MUG_OFFICE_DESK_title'),
      description: t('MUG_OFFICE_DESK_description'),
      image: 'https://picsum.photos/seed/mugoffice/400/300',
      requiresDesign: 'mug_design',
      subcategory: 'subcategoryMugHomeOffice',
    },
    {
      id: Scenario.MUG_KITCHEN_COUNTER,
      title: t('MUG_KITCHEN_COUNTER_title'),
      description: t('MUG_KITCHEN_COUNTER_description'),
      image: 'https://picsum.photos/seed/mugkitchen/400/300',
      requiresDesign: 'mug_design',
      subcategory: 'subcategoryMugHomeOffice',
    },
    {
      id: Scenario.MUG_WITH_BOOKS,
      title: t('MUG_WITH_BOOKS_title'),
      description: t('MUG_WITH_BOOKS_description'),
      image: 'https://picsum.photos/seed/mugbooks/400/300',
      requiresDesign: 'mug_design',
      subcategory: 'subcategoryMugHomeOffice',
    },
    {
      id: Scenario.MUG_HOLIDAY,
      title: t('MUG_HOLIDAY_title'),
      description: t('MUG_HOLIDAY_description'),
      image: 'https://picsum.photos/seed/mugholiday/400/300',
      requiresDesign: 'mug_design',
      subcategory: 'subcategoryMugThemed',
    },
    {
      id: Scenario.MUG_IN_GIFT_BOX,
      title: t('MUG_IN_GIFT_BOX_title'),
      description: t('MUG_IN_GIFT_BOX_description'),
      image: 'https://picsum.photos/seed/mugbox/400/300',
      requiresDesign: 'mug_design',
      subcategory: 'subcategoryMugThemed',
    },
    {
      id: Scenario.ESPRESSO_CUP_SAUCER,
      title: t('ESPRESSO_CUP_SAUCER_title'),
      description: t('ESPRESSO_CUP_SAUCER_description'),
      image: 'https://picsum.photos/seed/mugespresso/400/300',
      requiresDesign: 'mug_design',
      subcategory: 'subcategoryMugThemed',
    },
    {
      id: Scenario.COSMETIC_JAR,
      title: t('COSMETIC_JAR_title'),
      description: t('COSMETIC_JAR_description'),
      image: 'https://picsum.photos/seed/cosmetic/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategoryCosmetics',
    },
    {
      id: Scenario.SERUM_BOTTLE,
      title: t('SERUM_BOTTLE_title'),
      description: t('SERUM_BOTTLE_description'),
      image: 'https://picsum.photos/seed/serum/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategoryCosmetics',
    },
    {
      id: Scenario.PUMP_BOTTLE,
      title: t('PUMP_BOTTLE_title'),
      description: t('PUMP_BOTTLE_description'),
      image: 'https://picsum.photos/seed/pump/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategoryCosmetics',
    },
    {
      id: Scenario.SQUEEZE_TUBE,
      title: t('SQUEEZE_TUBE_title'),
      description: t('SQUEEZE_TUBE_description'),
      image: 'https://picsum.photos/seed/tube/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategoryCosmetics',
    },
    {
      id: Scenario.WINE_BOTTLE,
      title: t('WINE_BOTTLE_title'),
      description: t('WINE_BOTTLE_description'),
      image: 'https://picsum.photos/seed/wine/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategoryBeverages',
    },
    {
      id: Scenario.SODA_CAN,
      title: t('SODA_CAN_title'),
      description: t('SODA_CAN_description'),
      image: 'https://picsum.photos/seed/soda/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategoryBeverages',
    },
    {
      id: Scenario.BEER_BOTTLE,
      title: t('BEER_BOTTLE_title'),
      description: t('BEER_BOTTLE_description'),
      image: 'https://picsum.photos/seed/beer/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategoryBeverages',
    },
    {
      id: Scenario.COFFEE_BAG,
      title: t('COFFEE_BAG_title'),
      description: t('COFFEE_BAG_description'),
      image: 'https://picsum.photos/seed/coffeebag/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategoryFoodPantry',
    },
    {
      id: Scenario.HONEY_JAR,
      title: t('HONEY_JAR_title'),
      description: t('HONEY_JAR_description'),
      image: 'https://picsum.photos/seed/honey/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategoryFoodPantry',
    },
    {
      id: Scenario.PILL_BOTTLE,
      title: t('PILL_BOTTLE_title'),
      description: t('PILL_BOTTLE_description'),
      image: 'https://picsum.photos/seed/pills/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategoryHomeHealth',
    },
    {
      id: Scenario.CANDLE_JAR,
      title: t('CANDLE_JAR_title'),
      description: t('CANDLE_JAR_description'),
      image: 'https://picsum.photos/seed/candle/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategoryHomeHealth',
    },
    {
      id: Scenario.SOAP_BAR_WRAP,
      title: t('SOAP_BAR_WRAP_title'),
      description: t('SOAP_BAR_WRAP_description'),
      image: 'https://picsum.photos/seed/soap/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategoryHomeHealth',
    },
    {
      id: Scenario.SPRAY_BOTTLE,
      title: t('SPRAY_BOTTLE_title'),
      description: t('SPRAY_BOTTLE_description'),
      image: 'https://picsum.photos/seed/spray/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategoryHomeHealth',
    },
    {
      id: Scenario.ICE_CREAM_PINT,
      title: t('ICE_CREAM_PINT_title'),
      description: t('ICE_CREAM_PINT_description'),
      image: 'https://picsum.photos/seed/icecream/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategorySnacksDesserts',
    },
    {
      id: Scenario.CHOCOLATE_BAR_WRAPPER,
      title: t('CHOCOLATE_BAR_WRAPPER_title'),
      description: t('CHOCOLATE_BAR_WRAPPER_description'),
      image: 'https://picsum.photos/seed/chocolate/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategorySnacksDesserts',
    },
    {
      id: Scenario.OLIVE_OIL_BOTTLE,
      title: t('OLIVE_OIL_BOTTLE_title'),
      description: t('OLIVE_OIL_BOTTLE_description'),
      image: 'https://picsum.photos/seed/oliveoil/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategoryFoodPantry',
    },
    {
      id: Scenario.CHIPS_BAG,
      title: t('CHIPS_BAG_title'),
      description: t('CHIPS_BAG_description'),
      image: 'https://picsum.photos/seed/chips/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategorySnacksDesserts',
    },
    {
      id: Scenario.YOGURT_CUP,
      title: t('YOGURT_CUP_title'),
      description: t('YOGURT_CUP_description'),
      image: 'https://picsum.photos/seed/yogurt/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategorySnacksDesserts',
    },
    {
      id: Scenario.THROW_PILLOW_SOFA,
      title: t('THROW_PILLOW_SOFA_title'),
      description: t('THROW_PILLOW_SOFA_description'),
      image: 'https://picsum.photos/seed/pillow/400/300',
      requiresDesign: 'apparel',
      subcategory: 'subcategoryHomeGoods',
    },
    {
      id: Scenario.DUVET_COVER_BED,
      title: t('DUVET_COVER_BED_title'),
      description: t('DUVET_COVER_BED_description'),
      image: 'https://picsum.photos/seed/duvet/400/300',
      requiresDesign: 'apparel',
      subcategory: 'subcategoryHomeGoods',
    },
    {
      id: Scenario.WALL_CLOCK_LIVING_ROOM,
      title: t('WALL_CLOCK_LIVING_ROOM_title'),
      description: t('WALL_CLOCK_LIVING_ROOM_description'),
      image: 'https://picsum.photos/seed/wallclock/400/300',
      requiresDesign: 'frame',
      subcategory: 'subcategoryHomeGoods',
    },
    {
      id: Scenario.SHOWER_CURTAIN_BATHROOM,
      title: t('SHOWER_CURTAIN_BATHROOM_title'),
      description: t('SHOWER_CURTAIN_BATHROOM_description'),
      image: 'https://picsum.photos/seed/showercurtain/400/300',
      requiresDesign: 'apparel',
      subcategory: 'subcategoryHomeGoods',
    },
    {
      id: Scenario.BEACH_TOWEL_SAND,
      title: t('BEACH_TOWEL_SAND_title'),
      description: t('BEACH_TOWEL_SAND_description'),
      image: 'https://picsum.photos/seed/beachtowel/400/300',
      requiresDesign: 'apparel',
      subcategory: 'subcategoryHomeGoods',
    },
    {
      id: Scenario.DRONE_BOX_PACKAGING,
      title: t('DRONE_BOX_PACKAGING_title'),
      description: t('DRONE_BOX_PACKAGING_description'),
      image: 'https://picsum.photos/seed/dronebox/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategoryElectronicsPackaging',
    },
    {
      id: Scenario.SMART_SPEAKER_BOX,
      title: t('SMART_SPEAKER_BOX_title'),
      description: t('SMART_SPEAKER_BOX_description'),
      image: 'https://picsum.photos/seed/speakerbox/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategoryElectronicsPackaging',
    },
    {
      id: Scenario.CAMERA_BOX_PACKAGING,
      title: t('CAMERA_BOX_PACKAGING_title'),
      description: t('CAMERA_BOX_PACKAGING_description'),
      image: 'https://picsum.photos/seed/camerabox/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategoryElectronicsPackaging',
    },
    {
      id: Scenario.GAMING_MOUSE_BOX,
      title: t('GAMING_MOUSE_BOX_title'),
      description: t('GAMING_MOUSE_BOX_description'),
      image: 'https://picsum.photos/seed/mousebox/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategoryElectronicsPackaging',
    },
    {
      id: Scenario.WEBCAM_BOX_PACKAGING,
      title: t('WEBCAM_BOX_PACKAGING_title'),
      description: t('WEBCAM_BOX_PACKAGING_description'),
      image: 'https://picsum.photos/seed/webcambox/400/300',
      requiresDesign: 'label',
      subcategory: 'subcategoryElectronicsPackaging',
    },
  ], [t]);

  const SCENARIO_CATEGORIES = useMemo(() => {
    return SCENARIO_OPTIONS.reduce((acc, scenario) => {
      const categoryKey = scenario.requiresDesign;
      if (categoryKey !== 'none') {
        if (!acc[categoryKey]) {
          acc[categoryKey] = {
            title: t(`category_${categoryKey}`),
            scenariosBySubcategory: {},
          };
        }
    
        const subcategoryKey = scenario.subcategory || 'general';
    
        if (!acc[categoryKey].scenariosBySubcategory[subcategoryKey]) {
          acc[categoryKey].scenariosBySubcategory[subcategoryKey] = [];
        }
    
        acc[categoryKey].scenariosBySubcategory[subcategoryKey].push(scenario);
      }
      return acc;
    }, {} as Record<string, CategoryGroup>);
  }, [t, SCENARIO_OPTIONS]);

  const categoryKeys = Object.keys(SCENARIO_CATEGORIES);
  
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryKeys[0]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIO_CATEGORIES[categoryKeys[0]].scenariosBySubcategory[Object.keys(SCENARIO_CATEGORIES[categoryKeys[0]].scenariosBySubcategory)[0]][0].id);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [numVariations, setNumVariations] = useState<number>(3);
  
  const [sceneVariations, setSceneVariations] = useState<string[]>([]);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(null);
  const [isGeneratingScenes, setIsGeneratingScenes] = useState<boolean>(false);

  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [uploaderError, setUploaderError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('none');
  const [isHighQuality, setIsHighQuality] = useState<boolean>(false);
  
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.body.className = `bg-gray-100 dark:bg-gray-800`;
  }, [theme]);
  
  const handleImageUpload = useCallback((base64: string, mime: string, dataUrl: string) => {
    setUploadedImage(base64);
    setMimeType(mime);
    setPreviewUrl(dataUrl);
    setUploaderError(null);
  }, []);

  const handleClearImage = useCallback(() => {
    setUploadedImage('');
    setMimeType('');
    setPreviewUrl(null);
    setUploaderError(null);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    const firstSubcategoryKey = Object.keys(SCENARIO_CATEGORIES[category].scenariosBySubcategory)[0];
    setSelectedScenario(SCENARIO_CATEGORIES[category].scenariosBySubcategory[firstSubcategoryKey][0].id);
    handleClearImage();
    setGeneratedImage(null);
    setSceneVariations([]);
    setSelectedSceneIndex(null);
    setError(null);
  }, [handleClearImage, SCENARIO_CATEGORIES]);

  const handleScenarioChange = useCallback((scenario: Scenario) => {
    setSelectedScenario(scenario);
    setSceneVariations([]);
    setSelectedSceneIndex(null);
    setGeneratedImage(null);
    setError(null);
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

  const handleGenerateScenes = async () => {
    setIsGeneratingScenes(true);
    setError(null);
    setGeneratedImage(null);
    setSceneVariations([]);
    setSelectedSceneIndex(null);
    try {
      const basePrompt = PROMPTS.base[selectedScenario];
      const aspectRatioHints: { [key: string]: string } = {
        '16:9': 'Widescreen, landscape orientation. ',
        '9:16': 'Vertical composition, portrait orientation. ',
        '1:1': 'Square composition. '
      };
      let finalPrompt = (aspectRatioHints[aspectRatio] || '') + basePrompt;
      
      if (isHighQuality) {
        finalPrompt += ', ultra high definition, photorealistic masterpiece, award-winning photography, 16K resolution.';
      }
      const baseImageB64Array = await generateBaseImage(finalPrompt, aspectRatio, numVariations);
      setSceneVariations(baseImageB64Array);
      setSelectedSceneIndex(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error("Scene generation failed:", err);
      setError(errorMessage);
    } finally {
      setIsGeneratingScenes(false);
    }
  };

  const handleGenerate = async () => {
    const scenarioInfo = SCENARIO_OPTIONS.find(s => s.id === selectedScenario);
    if (!scenarioInfo || scenarioInfo.requiresDesign === 'none') {
        setError("Please select a valid scenario that requires a design.");
        return;
    }
    if (selectedSceneIndex === null || sceneVariations.length === 0) {
      setError("Please generate and select a scene variation first.");
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
      // Step 1: Composite the design
      setLoadingStep(t('compositingDesign'));
      const baseImageB64 = sceneVariations[selectedSceneIndex];
      const designType = scenarioInfo.requiresDesign;
      const editPrompt = PROMPTS.edit[designType as keyof typeof PROMPTS.edit];
      const compositeImageB64 = await editImage(baseImageB64, uploadedImage, mimeType, editPrompt);

      let finalImageB64 = compositeImageB64;

      // Step 2: Apply artistic style if selected
      if (selectedStyle !== 'none') {
        setLoadingStep(t('applyingStyle'));
        const stylePrompt = STYLE_PROMPTS[selectedStyle as keyof typeof STYLE_PROMPTS];
        if (stylePrompt) {
            finalImageB64 = await applyArtisticStyle(compositeImageB64, stylePrompt);
        }
      }

      setGeneratedImage(`data:image/png;base64,${finalImageB64}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error("Mockup generation failed:", err);
      setError(errorMessage);
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
            <div className="p-6 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <ScenarioSelector 
                categories={SCENARIO_CATEGORIES}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategoryChange}
                selectedScenario={selectedScenario}
                onSelectScenario={handleScenarioChange}
              />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('step2Title')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('step2Subtitle')}</p>
              <div className="space-y-6 p-6 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                <VariationCountSelector value={numVariations} onChange={setNumVariations} />
                <div className="text-center">
                    <Button onClick={handleGenerateScenes} disabled={isGeneratingScenes} className="w-full sm:w-auto">
                        {isGeneratingScenes ? t('generatingScenes') : t('generateScenesButton')}
                    </Button>
                </div>
                 <div className="grid grid-cols-3 gap-4">
                    {isGeneratingScenes && (
                        <>
                          {[...Array(numVariations)].map((_, index) => (
                            <SceneVariationSkeleton key={index} />
                          ))}
                        </>
                    )}
                    {!isGeneratingScenes && sceneVariations.map((src, index) => (
                        <button
                        key={index}
                        onClick={() => setSelectedSceneIndex(index)}
                        className={`block rounded-lg overflow-hidden border-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-gray-500 ${
                            selectedSceneIndex === index ? 'border-gray-800 dark:border-gray-500 scale-105 shadow-lg' : 'border-transparent hover:border-gray-400 dark:hover:border-gray-600'
                        }`}
                        aria-pressed={selectedSceneIndex === index}
                        aria-label={`Select scene variation ${index + 1}`}
                        >
                        <img src={`data:image/png;base64,${src}`} alt={`Scene variation ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
              </div>
            </div>

            {currentScenario && currentScenario.requiresDesign !== 'none' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('step3Title')}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t('step3Subtitle', { designType: currentScenario.requiresDesign.replace('_', ' ') })}
                </p>
                <ImageUploader 
                  onImageUpload={handleImageUpload}
                  onClearImage={handleClearImage}
                  onError={setUploaderError}
                  previewUrl={previewUrl}
                  designType={currentScenario.requiresDesign}
                />
                {uploaderError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                    {uploaderError}
                  </p>
                )}
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('step4Title')}</h2>
              <div className="mt-4 bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
                <ToggleSwitch
                  label={t('highQualityMode')}
                  description={t('highQualityModeDescription')}
                  checked={isHighQuality}
                  onChange={setIsHighQuality}
                />
                <hr className="border-gray-200 dark:border-gray-700" />
                <ArtisticStyleSelector
                  styles={ARTISTIC_STYLES}
                  selectedStyle={selectedStyle}
                  onSelectStyle={setSelectedStyle}
                />
              </div>
            </div>
            
            <div className="text-center pt-4">
               <Button 
                onClick={handleGenerate}
                disabled={isLoading || isGeneratingScenes || (currentScenario?.requiresDesign !== 'none' && (!uploadedImage || !!uploaderError)) || selectedSceneIndex === null}
              >
                {isLoading ? t('generatingButton') : t('generateButton')}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sticky top-12 h-max">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t('step5Title')}</h2>
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