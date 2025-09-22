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

const SCENARIO_OPTIONS: ScenarioOption[] = [
  {
    id: Scenario.SITTING_FRAME,
    title: 'Woman Sitting with Frame',
    description: 'An elegant woman sitting in a stylish interior, holding a frame for your design.',
    image: 'https://picsum.photos/seed/sitting/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryPeople',
  },
  {
    id: Scenario.STANDING_FRAME,
    title: 'Woman Standing with Frame',
    description: 'A professional shot of a woman standing and presenting a frame for your artwork.',
    image: 'https://picsum.photos/seed/standing/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryPeople',
  },
  {
    id: Scenario.ARMCHAIR_FRAME,
    title: 'Woman in Armchair with Frame',
    description: 'A cozy, high-end scene of a woman on an armchair holding a frame.',
    image: 'https://picsum.photos/seed/armchair/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryPeople',
  },
  {
    id: Scenario.OUTDOOR_CAFE_FRAME,
    title: 'Outdoor Cafe Frame',
    description: 'A person holding your frame at a stylish outdoor cafe.',
    image: 'https://picsum.photos/seed/cafeframe/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryPeople',
  },
  {
    id: Scenario.WOMAN_FRAME_ZURICH,
    title: 'Woman Holding Frame in Zurich',
    description: 'A stylish woman holds your frame on Bahnhofstrasse, Zurich\'s luxury shopping street.',
    image: 'https://picsum.photos/seed/framezurich/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryPeople',
  },
  {
    id: Scenario.WOMAN_FRAME_GENEVA,
    title: 'Woman Holding Frame in Geneva',
    description: 'An elegant woman holds your frame by Lake Geneva, with the Jet d\'Eau in the background.',
    image: 'https://picsum.photos/seed/framegeneva/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryPeople',
  },
  {
    id: Scenario.WOMAN_FRAME_ZERMATT,
    title: 'Woman Holding Frame in Zermatt',
    description: 'A chic woman showcases your frame in the charming, car-free village of Zermatt.',
    image: 'https://picsum.photos/seed/framezermatt/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryPeople',
  },
  {
    id: Scenario.WOMAN_FRAME_BERN,
    title: 'Woman Holding Frame in Bern',
    description: 'A chic woman presents your frame in the UNESCO World Heritage Old Town of Bern.',
    image: 'https://picsum.photos/seed/framebern/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryPeople',
  },
  {
    id: Scenario.WOMAN_FRAME_LUCERNE,
    title: 'Woman Holding Frame in Lucerne',
    description: 'An elegant woman holds your frame near the iconic Chapel Bridge in Lucerne.',
    image: 'https://picsum.photos/seed/framelucerne/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryPeople',
  },
  {
    id: Scenario.WOMAN_FRAME_LUGANO,
    title: 'Woman Holding Frame in Lugano',
    description: 'A stylish woman showcases your frame with the Mediterranean flair of Lugano\'s lakeside.',
    image: 'https://picsum.photos/seed/framelugano/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryPeople',
  },
  {
    id: Scenario.WOMAN_FRAME_ST_MORITZ,
    title: 'Woman Holding Frame in St. Moritz',
    description: 'A glamorous woman showcases your frame in the luxurious alpine resort of St. Moritz.',
    image: 'https://picsum.photos/seed/framestmoritz/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryPeople',
  },
  {
    id: Scenario.WOMAN_FRAME_INTERLAKEN,
    title: 'Woman Holding Frame in Interlaken',
    description: 'An adventurous woman holds your frame against the stunning backdrop of Interlaken\'s lakes and mountains.',
    image: 'https://picsum.photos/seed/frameinterlaken/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryPeople',
  },
  {
    id: Scenario.WOMAN_FRAME_MONTREUX,
    title: 'Woman Holding Frame in Montreux',
    description: 'An artistic woman presents your frame on the beautiful, chic lakeside promenade of Montreux.',
    image: 'https://picsum.photos/seed/framemontreux/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryPeople',
  },
  {
    id: Scenario.HOME_FRAME,
    title: 'Frame in Modern Home Entryway',
    description: 'A stylish, welcoming entryway of a modern home, perfect for showcasing art.',
    image: 'https://picsum.photos/seed/home/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryRooms',
  },
  {
    id: Scenario.KITCHEN_FRAME,
    title: 'Frame in a Gourmet Kitchen',
    description: 'Your artwork displayed in a bright, modern kitchen with marble countertops.',
    image: 'https://picsum.photos/seed/kitchen/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryRooms',
  },
  {
    id: Scenario.LIVING_ROOM_FRAME,
    title: 'Frame Above a Living Room Sofa',
    description: 'A classic living room setting with your design in a frame above a cozy sofa.',
    image: 'https://picsum.photos/seed/livingroom/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryRooms',
  },
  {
    id: Scenario.BEDROOM_FRAME,
    title: 'Frame in a Serene Bedroom',
    description: 'Display your art in a tranquil, beautifully decorated bedroom setting.',
    image: 'https://picsum.photos/seed/bedroom/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryRooms',
  },
  {
    id: Scenario.KIDS_ROOM_FRAME,
    title: 'Frame in a Playful Kids\' Room',
    description: 'A fun and colorful children\'s bedroom, perfect for whimsical designs.',
    image: 'https://picsum.photos/seed/kidsroom/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryRooms',
  },
  {
    id: Scenario.HALL_FRAME,
    title: 'Gallery Frame in a Hallway',
    description: 'Your design as part of a gallery wall in an elegant, well-lit hallway.',
    image: 'https://picsum.photos/seed/hallway/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryRooms',
  },
  {
    id: Scenario.LIBRARY_FRAME,
    title: 'Frame in a Classic Library',
    description: 'An intellectual and cozy home library with floor-to-ceiling bookshelves.',
    image: 'https://picsum.photos/seed/library/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryRooms',
  },
  {
    id: Scenario.MINIMALIST_DESK_FRAME,
    title: 'Minimalist Desk Frame',
    description: 'A clean, minimalist desk with your design in a frame.',
    image: 'https://picsum.photos/seed/desk/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryRooms',
  },
  {
    id: Scenario.CREATIVE_STUDIO_FRAME,
    title: 'Creative Studio Frame',
    description: 'An artistic studio setting featuring your frame on an easel.',
    image: 'https://picsum.photos/seed/studio/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryRooms',
  },
  {
    id: Scenario.CORPORATE_BOARDROOM_FRAME,
    title: 'Corporate Boardroom Frame',
    description: 'A sleek frame on the wall of a modern, executive boardroom.',
    image: 'https://picsum.photos/seed/boardroom/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryRooms',
  },
  {
    id: Scenario.LUXURY_HOTEL_LOBBY_FRAME,
    title: 'Luxury Hotel Lobby Frame',
    description: 'A large, impressive frame in the opulent lobby of a five-star hotel.',
    image: 'https://picsum.photos/seed/hotelframe/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryRooms',
  },
  {
    id: Scenario.MODERN_OFFICE_RECEPTION_FRAME,
    title: 'Modern Office Reception Frame',
    description: 'Your design in a frame behind the reception desk of a contemporary office.',
    image: 'https://picsum.photos/seed/reception/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryRooms',
  },
  {
    id: Scenario.ARCHITECTS_OFFICE_FRAME,
    title: 'Architect\'s Office Frame',
    description: 'Showcase your work in the context of a creative architect\'s studio.',
    image: 'https://picsum.photos/seed/architect/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryRooms',
  },
  {
    id: Scenario.RESTAURANT_WALL_FRAME,
    title: 'Restaurant Wall Frame',
    description: 'A framed piece on the wall of a trendy, upscale bistro or restaurant.',
    image: 'https://picsum.photos/seed/restaurant/400/300',
    requiresDesign: 'frame',
    subcategory: 'subcategoryRooms',
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
    id: Scenario.MODERN_DINING_CHANDELIER,
    title: 'Modern Dining Room Light',
    description: 'A sleek, minimalist dining room with a modern table, perfect for contemporary light fixtures.',
    image: 'https://picsum.photos/seed/dining/400/300',
    requiresDesign: 'chandelier',
  },
  {
    id: Scenario.HOTEL_LOBBY_CHANDELIER,
    title: 'Grand Hotel Lobby Chandelier',
    description: 'An opulent, grand hotel lobby with high ceilings, ideal for showcasing large, statement chandeliers.',
    image: 'https://picsum.photos/seed/hotellobby/400/300',
    requiresDesign: 'chandelier',
  },
  {
    id: Scenario.FARMHOUSE_CHANDELIER,
    title: 'Rustic Farmhouse Chandelier',
    description: 'A charming, rustic farmhouse dining area with exposed wooden beams, perfect for rustic or industrial designs.',
    image: 'https://picsum.photos/seed/farmhouse/400/300',
    requiresDesign: 'chandelier',
  },
  {
    id: Scenario.GRAND_STAIRCASE_CHANDELIER,
    title: 'Grand Staircase Chandelier',
    description: 'A magnificent chandelier hanging in the grand foyer of a luxurious mansion with a sweeping staircase.',
    image: 'https://picsum.photos/seed/staircase/400/300',
    requiresDesign: 'chandelier',
  },
  {
    id: Scenario.BANQUET_HALL_CHANDELIER,
    title: 'Banquet Hall Chandelier',
    description: 'Showcase your design in a formal banquet hall, set for a gala event with high ceilings.',
    image: 'https://picsum.photos/seed/banquet/400/300',
    requiresDesign: 'chandelier',
  },
  {
    id: Scenario.MUSEUM_ATRIUM_CHANDELIER,
    title: 'Museum Atrium Chandelier',
    description: 'A modern, sculptural chandelier as the centerpiece of a bright, minimalist museum atrium.',
    image: 'https://picsum.photos/seed/museum/400/300',
    requiresDesign: 'chandelier',
  },
  {
    id: Scenario.OPERA_HOUSE_LOBBY_CHANDELIER,
    title: 'Opera House Lobby Chandelier',
    description: 'A classic, multi-tiered crystal chandelier in the opulent, historic lobby of an opera house.',
    image: 'https://picsum.photos/seed/opera/400/300',
    requiresDesign: 'chandelier',
  },
  {
    id: Scenario.PENTHOUSE_SUITE_CHANDELIER,
    title: 'Penthouse Suite Chandelier',
    description: 'A contemporary chandelier in a luxurious penthouse suite with floor-to-ceiling windows showing a city skyline.',
    image: 'https://picsum.photos/seed/penthouse/400/300',
    requiresDesign: 'chandelier',
  },
  {
    id: Scenario.PRODUCT_SHELF,
    title: 'Product on Store Shelf',
    description: 'Showcase your product on a brightly lit, modern retail shelf.',
    image: 'https://picsum.photos/seed/shelf/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductRetail',
  },
  {
    id: Scenario.WOMAN_HOLDING_PRODUCT_STREET,
    title: 'Woman Holding Product on Street',
    description: 'A beautiful woman holding your product on a vibrant American city street.',
    image: 'https://picsum.photos/seed/productstreet/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductLifestyle',
  },
  {
    id: Scenario.WOMAN_STOOL_PRODUCT_LA,
    title: 'Woman on Stool with Product in LA',
    description: 'A stylish woman in a modern Los Angeles living room, sitting on a stool and holding your product.',
    image: 'https://picsum.photos/seed/productla/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductLifestyle',
  },
  {
    id: Scenario.WOMAN_COUCH_PRODUCT_LA,
    title: 'Woman on Couch with Product in LA',
    description: 'A stylish woman in a trendy Los Angeles bedroom, sitting on a couch, pointing at your product.',
    image: 'https://picsum.photos/seed/productlacouch/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductHomeLifestyle',
  },
  {
    id: Scenario.WOMAN_SOFA_PRODUCT_PARIS,
    title: 'Woman on Sofa with Product in Paris',
    description: 'An elegant woman in a modern Parisian living room, sitting on a velvet sofa, pointing at your product.',
    image: 'https://picsum.photos/seed/productparis/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductHomeLifestyle',
  },
  {
    id: Scenario.WOMAN_LINGERIE_PRODUCT_SWISS_PARISIAN,
    title: 'Woman in Lingerie with Product (Swiss/Parisian)',
    description: 'An elegant Swiss woman in tasteful lingerie, in a Parisian-style bedroom in Switzerland, pointing to your product.',
    image: 'https://picsum.photos/seed/productlingerie/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductHomeLifestyle',
  },
  {
    id: Scenario.WOMAN_NIGHTGOWN_PRODUCT_SWISS_PARISIAN,
    title: 'Woman in Nightgown with Product (Swiss/Parisian)',
    description: 'An elegant Swiss woman in a white nightgown and robe, in a Parisian-style bedroom in Switzerland, pointing to your product.',
    image: 'https://picsum.photos/seed/productnightgown/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductHomeLifestyle',
  },
  {
    id: Scenario.MOTHER_DAUGHTER_PRODUCT_CAMBRIDGE_ITALIANATE,
    title: 'Mother & Daughter with Product (Cambridge Hall)',
    description: 'An elegant American woman and her daughter in a trendy Italianate hall in Cambridge, showing awe and amazement towards your product.',
    image: 'https://picsum.photos/seed/productcambridgehall/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductHomeLifestyle',
  },
  {
    id: Scenario.WOMAN_PRODUCT_CAMBRIDGE_ITALIANATE,
    title: 'Woman with Product (Cambridge Hall)',
    description: 'An elegant American woman in a trendy Italianate hall in Cambridge, showing awe and amazement towards your product.',
    image: 'https://picsum.photos/seed/productcambridgewoman/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductHomeLifestyle',
  },
  {
    id: Scenario.WOMAN_PRODUCT_ZURICH,
    title: 'Woman with Product in Zurich',
    description: 'A stylish woman presents your product on Bahnhofstrasse, Zurich\'s luxury shopping street.',
    image: 'https://picsum.photos/seed/productzurich/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductLifestyle',
  },
  {
    id: Scenario.WOMAN_PRODUCT_GENEVA,
    title: 'Woman with Product in Geneva',
    description: 'An elegant woman holds your product by Lake Geneva, with the Jet d\'Eau in the background.',
    image: 'https://picsum.photos/seed/productgeneva/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductLifestyle',
  },
  {
    id: Scenario.WOMAN_PRODUCT_ZERMATT,
    title: 'Woman with Product in Zermatt',
    description: 'A chic woman showcases your product in the charming, car-free village of Zermatt.',
    image: 'https://picsum.photos/seed/productzermatt/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductLifestyle',
  },
  {
    id: Scenario.WOMAN_PRODUCT_BERN,
    title: 'Woman with Product in Bern',
    description: 'A chic woman presents your product in the UNESCO World Heritage Old Town of Bern.',
    image: 'https://picsum.photos/seed/productbern/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductLifestyle',
  },
  {
    id: Scenario.WOMAN_PRODUCT_LUCERNE,
    title: 'Woman with Product in Lucerne',
    description: 'An elegant woman holds your product near the iconic Chapel Bridge in Lucerne.',
    image: 'https://picsum.photos/seed/productlucerne/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductLifestyle',
  },
  {
    id: Scenario.WOMAN_PRODUCT_LUGANO,
    title: 'Woman with Product in Lugano',
    description: 'A stylish woman showcases your product with the Mediterranean flair of Lugano\'s lakeside.',
    image: 'https://picsum.photos/seed/productlugano/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductLifestyle',
  },
  {
    id: Scenario.WOMAN_PRODUCT_ST_MORITZ,
    title: 'Woman with Product in St. Moritz',
    description: 'A glamorous woman showcases your product in the luxurious alpine resort of St. Moritz.',
    image: 'https://picsum.photos/seed/productstmoritz/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductLifestyle',
  },
  {
    id: Scenario.WOMAN_PRODUCT_INTERLAKEN,
    title: 'Woman with Product in Interlaken',
    description: 'An adventurous woman holds your product against the stunning backdrop of Interlaken\'s lakes and mountains.',
    image: 'https://picsum.photos/seed/productinterlaken/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductLifestyle',
  },
  {
    id: Scenario.WOMAN_PRODUCT_MONTREUX,
    title: 'Woman with Product in Montreux',
    description: 'An artistic woman presents your product on the beautiful, chic lakeside promenade of Montreux.',
    image: 'https://picsum.photos/seed/productmontreux/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductLifestyle',
  },
  {
    id: Scenario.WOMAN_PRODUCT_LIVING_ROOM,
    title: 'Woman with Product in Living Room',
    description: 'A beautiful woman holds your product naturally in a bright, modern living room.',
    image: 'https://picsum.photos/seed/productlivingroom/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductHomeLifestyle',
  },
  {
    id: Scenario.WOMAN_PRODUCT_KITCHEN,
    title: 'Woman with Product in Kitchen',
    description: 'A cheerful woman showcases your product while in a stylish, sunlit kitchen.',
    image: 'https://picsum.photos/seed/productkitchen/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductHomeLifestyle',
  },
  {
    id: Scenario.WOMAN_PRODUCT_BEDROOM,
    title: 'Woman with Product in Bedroom',
    description: 'An elegant woman presents your product in a serene and cozy bedroom setting.',
    image: 'https://picsum.photos/seed/productbedroom/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductHomeLifestyle',
  },
  {
    id: Scenario.WOMAN_PRODUCT_HOME_OFFICE,
    title: 'Woman with Product in Home Office',
    description: 'A professional woman holds your product in her chic and organized home office.',
    image: 'https://picsum.photos/seed/producthomeoffice/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductHomeLifestyle',
  },
  {
    id: Scenario.WOMAN_PRODUCT_BATHROOM,
    title: 'Woman with Product in Bathroom',
    description: 'A woman presents your skincare or beauty product in a clean, luxurious bathroom.',
    image: 'https://picsum.photos/seed/productbathroom/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductHomeLifestyle',
  },
  {
    id: Scenario.WOMAN_PRODUCT_NURSERY,
    title: 'Woman with Product in Nursery',
    description: 'A mother lovingly holds your baby-related product in a bright and adorable nursery.',
    image: 'https://picsum.photos/seed/productnursery/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductHomeLifestyle',
  },
  {
    id: Scenario.WOMAN_LASER_PRODUCT_MODERN_LIVING_ROOM,
    title: 'Woman with Laser Light (Modern Living Room)',
    description: 'An elegant woman in a chic outfit holds a wooden laser light product in a modern, stylish living room.',
    image: 'https://picsum.photos/seed/laserliving/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductHomeLifestyle',
  },
  {
    id: Scenario.WOMAN_LASER_PRODUCT_SCANDINAVIAN_BEDROOM,
    title: 'Woman with Laser Light (Scandinavian Bedroom)',
    description: 'A woman in a cozy, elegant outfit showcases a wooden laser light product in a serene, Scandinavian-style bedroom.',
    image: 'https://picsum.photos/seed/laserbedroom/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductHomeLifestyle',
  },
  {
    id: Scenario.WOMAN_LASER_PRODUCT_BOHEMIAN_STUDIO,
    title: 'Woman with Laser Light (Bohemian Studio)',
    description: 'A woman in a flowing, elegant outfit presents a wooden laser light product in an artistic, bohemian-style studio apartment.',
    image: 'https://picsum.photos/seed/laserboho/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductHomeLifestyle',
  },
  {
    id: Scenario.WOMAN_LASER_PRODUCT_MINIMALIST_OFFICE,
    title: 'Woman with Laser Light (Minimalist Office)',
    description: 'A professional woman in an elegant business-casual outfit holds a wooden laser light product in a clean, minimalist home office.',
    image: 'https://picsum.photos/seed/laseroffice/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductHomeLifestyle',
  },
  {
    id: Scenario.WOMAN_LASER_PRODUCT_RUSTIC_DINING_ROOM,
    title: 'Woman with Laser Light (Rustic Dining Room)',
    description: 'A woman in a sophisticated, elegant dress holds a wooden laser light product in a warm, rustic dining room with natural wood elements.',
    image: 'https://picsum.photos/seed/laserdining/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductHomeLifestyle',
  },
  {
    id: Scenario.BOOK_COVER,
    title: 'Hardcover Book Cover',
    description: 'Display your cover design on a realistic hardcover book in a cozy setting.',
    image: 'https://picsum.photos/seed/book/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductPackaging',
  },
  {
    id: Scenario.CEREAL_BOX,
    title: 'Cereal Box Packaging',
    description: 'Your design on a cereal box placed on a sunny kitchen counter.',
    image: 'https://picsum.photos/seed/cereal/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductPackaging',
  },
  {
    id: Scenario.SHOPPING_BAG,
    title: 'Luxury Shopping Bag',
    description: 'Present your brand on a high-end paper shopping bag held by a model.',
    image: 'https://picsum.photos/seed/bag/400/300',
    requiresDesign: 'product',
    subcategory: 'subcategoryProductLifestyle',
  },
  {
    id: Scenario.OFFICE_SCREEN,
    title: 'App on Office Screen',
    description: 'Display your app or website on a sleek monitor in a modern office.',
    image: 'https://picsum.photos/seed/screen/400/300',
    requiresDesign: 'screen',
    subcategory: 'subcategoryScreens',
  },
  {
    id: Scenario.LAPTOP_SCREEN,
    title: 'App on Laptop Screen',
    description: 'Showcase your website or app on a laptop screen in a cafe environment.',
    image: 'https://picsum.photos/seed/laptop/400/300',
    requiresDesign: 'screen',
    subcategory: 'subcategoryScreens',
  },
  {
    id: Scenario.PHONE_SCREEN,
    title: 'App on Phone Screen',
    description: 'Your app UI displayed on a modern smartphone held by a user.',
    image: 'https://picsum.photos/seed/phone/400/300',
    requiresDesign: 'screen',
    subcategory: 'subcategoryScreens',
  },
  {
    id: Scenario.TABLET_ON_DESK,
    title: 'App on Tablet Screen',
    description: 'Showcase your app or website on a tablet resting on a creative professional\'s desk.',
    image: 'https://picsum.photos/seed/tablet/400/300',
    requiresDesign: 'screen',
    subcategory: 'subcategoryScreens',
  },
  {
    id: Scenario.PHONE_OUTDOORS,
    title: 'App on Phone (Outdoor)',
    description: 'A lifestyle shot of your app being used on a phone in a bright, outdoor setting.',
    image: 'https://picsum.photos/seed/phoneoutdoor/400/300',
    requiresDesign: 'screen',
    subcategory: 'subcategoryScreens',
  },
  {
    id: Scenario.MULTI_DEVICE_SHOWCASE,
    title: 'Responsive UI Showcase',
    description: 'Display your responsive design across a laptop, tablet, and smartphone simultaneously.',
    image: 'https://picsum.photos/seed/multidevice/400/300',
    requiresDesign: 'screen',
    subcategory: 'subcategoryScreens',
  },
  {
    id: Scenario.CAR_DASHBOARD_SCREEN,
    title: 'In-Car Infotainment UI',
    description: 'Present your automotive UI design on the central dashboard screen of a modern car.',
    image: 'https://picsum.photos/seed/cardash/400/300',
    requiresDesign: 'screen',
    subcategory: 'subcategoryScreens',
  },
  {
    id: Scenario.SMARTWATCH_ON_WRIST,
    title: 'Smartwatch App Face',
    description: 'A close-up view of your app interface on a stylish smartwatch.',
    image: 'https://picsum.photos/seed/smartwatch/400/300',
    requiresDesign: 'screen',
    subcategory: 'subcategoryScreens',
  },
  {
    id: Scenario.TV_IN_LIVING_ROOM,
    title: 'Smart TV App Interface',
    description: 'Your app or streaming service UI displayed on a large smart TV in a cozy living room.',
    image: 'https://picsum.photos/seed/tvscreen/400/300',
    requiresDesign: 'screen',
    subcategory: 'subcategoryScreens',
  },
  {
    id: Scenario.ATM_SCREEN,
    title: 'ATM / Kiosk Interface',
    description: 'Mockup your banking or information kiosk UI on a realistic ATM screen.',
    image: 'https://picsum.photos/seed/atm/400/300',
    requiresDesign: 'screen',
    subcategory: 'subcategoryScreens',
  },
  {
    id: Scenario.PROJECTOR_SCREEN_MEETING,
    title: 'Projector Screen in Meeting',
    description: 'Showcase your presentation or dashboard on a large projector screen in a corporate meeting room.',
    image: 'https://picsum.photos/seed/projector/400/300',
    requiresDesign: 'screen',
    subcategory: 'subcategoryScreens',
  },
  {
    id: Scenario.HANDHELD_CONSOLE_SCREEN,
    title: 'Handheld Gaming Console UI',
    description: 'Display your game UI or app on the screen of a modern handheld gaming device.',
    image: 'https://picsum.photos/seed/handheld/400/300',
    requiresDesign: 'screen',
    subcategory: 'subcategoryScreens',
  },
  {
    id: Scenario.COWORKING_SPACE_LAPTOP,
    title: 'Laptop in Co-working Space',
    description: 'Your app on a laptop in a vibrant, collaborative co-working environment.',
    image: 'https://picsum.photos/seed/coworking/400/300',
    requiresDesign: 'screen',
    subcategory: 'subcategoryScreens',
  },
  {
    id: Scenario.MEDICAL_TABLET_SCREEN,
    title: 'Medical Tablet Screen',
    description: 'Display your health or medical UI on a tablet in a clean, modern clinic setting.',
    image: 'https://picsum.photos/seed/medical/400/300',
    requiresDesign: 'screen',
    subcategory: 'subcategoryScreens',
  },
  {
    id: Scenario.RETAIL_POS_SCREEN,
    title: 'Retail Point-of-Sale Screen',
    description: 'Showcase your software on a point-of-sale terminal in a chic boutique.',
    image: 'https://picsum.photos/seed/pos/400/300',
    requiresDesign: 'screen',
    subcategory: 'subcategoryScreens',
  },
  {
    id: Scenario.DIGITAL_WHITEBOARD_MEETING,
    title: 'Digital Whiteboard in Meeting',
    description: 'Your presentation or app on a large, interactive whiteboard during a team brainstorm.',
    image: 'https://picsum.photos/seed/whiteboard/400/300',
    requiresDesign: 'screen',
    subcategory: 'subcategoryScreens',
  },
  {
    id: Scenario.TSHIRT_MODEL,
    title: 'T-Shirt on Model',
    description: 'Your design printed on a t-shirt worn by a model in a studio setting.',
    image: 'https://picsum.photos/seed/tshirt/400/300',
    requiresDesign: 'apparel',
    subcategory: 'subcategoryTops',
  },
  {
    id: Scenario.HOODIE_MODEL,
    title: 'Hoodie on Model (Streetwear)',
    description: 'Showcase your design on a hoodie worn by a model in a cool urban setting.',
    image: 'https://picsum.photos/seed/hoodie/400/300',
    requiresDesign: 'apparel',
    subcategory: 'subcategoryTops',
  },
  {
    id: Scenario.SWEATSHIRT_HANGER,
    title: 'Sweatshirt on Hanger',
    description: 'A clean, minimalist shot of your design on a sweatshirt hanging against a textured wall.',
    image: 'https://picsum.photos/seed/sweatshirt/400/300',
    requiresDesign: 'apparel',
    subcategory: 'subcategoryTops',
  },
  {
    id: Scenario.TANK_TOP_FITNESS,
    title: 'Tank Top on Fitness Model',
    description: 'Your design on an athletic tank top, worn by a model in a modern gym.',
    image: 'https://picsum.photos/seed/tanktop/400/300',
    requiresDesign: 'apparel',
    subcategory: 'subcategoryTops',
  },
  {
    id: Scenario.TOTE_BAG_LIFESTYLE,
    title: 'Tote Bag (Lifestyle)',
    description: 'A person carrying a canvas tote bag with your design in a bright, everyday scene.',
    image: 'https://picsum.photos/seed/totebag/400/300',
    requiresDesign: 'apparel',
    subcategory: 'subcategoryAccessories',
  },
  {
    id: Scenario.BASEBALL_CAP_MODEL,
    title: 'Baseball Cap on Model',
    description: 'A close-up of a person wearing a baseball cap featuring your logo or design.',
    image: 'https://picsum.photos/seed/cap/400/300',
    requiresDesign: 'apparel',
    subcategory: 'subcategoryAccessories',
  },
  {
    id: Scenario.BEANIE_MODEL,
    title: 'Beanie on Model (Autumn)',
    description: 'Display your design on a cozy beanie in a warm, autumnal outdoor setting.',
    image: 'https://picsum.photos/seed/beanie/400/300',
    requiresDesign: 'apparel',
    subcategory: 'subcategoryAccessories',
  },
  {
    id: Scenario.SOCKS_PAIR,
    title: 'Pair of Socks',
    description: 'A clean flat-lay of a pair of socks, perfect for showcasing pattern designs.',
    image: 'https://picsum.photos/seed/socks/400/300',
    requiresDesign: 'apparel',
    subcategory: 'subcategoryAccessories',
  },
  {
    id: Scenario.APRON_PERSON,
    title: 'Apron in Kitchen',
    description: 'Your design on an apron worn by someone in a rustic, inviting kitchen.',
    image: 'https://picsum.photos/seed/apron/400/300',
    requiresDesign: 'apparel',
    subcategory: 'subcategoryAccessories',
  },
  {
    id: Scenario.BABY_ONESIE_FLATLAY,
    title: 'Baby Onesie (Flat Lay)',
    description: 'An adorable top-down view of a baby onesie for your cute designs.',
    image: 'https://picsum.photos/seed/onesie/400/300',
    requiresDesign: 'apparel',
    subcategory: 'subcategoryKids',
  },
  {
    id: Scenario.CITY_BILLBOARD,
    title: 'Billboard in Neon City',
    description: 'Your ad on a giant billboard in a vibrant, futuristic city at night.',
    image: 'https://picsum.photos/seed/billboard/400/300',
    requiresDesign: 'billboard',
    subcategory: 'subcategoryBillboardUrban',
  },
  {
    id: Scenario.TIMES_SQUARE_SCREENS,
    title: 'Times Square Style Digital Screens',
    description: 'Your ad on multiple massive screens in a bustling city square at night.',
    image: 'https://picsum.photos/seed/timessquare/400/300',
    requiresDesign: 'billboard',
    subcategory: 'subcategoryBillboardUrban',
  },
  {
    id: Scenario.SUBWAY_AD,
    title: 'Subway Station Ad',
    description: 'Display your poster in a brightly lit, modern subway station ad panel.',
    image: 'https://picsum.photos/seed/subwayad/400/300',
    requiresDesign: 'billboard',
    subcategory: 'subcategoryBillboardUrban',
  },
  {
    id: Scenario.BUS_STOP_AD,
    title: 'Bus Stop Shelter Ad',
    description: 'Your design on an advertising panel at a glass bus stop on a city street.',
    image: 'https://picsum.photos/seed/busstopad/400/300',
    requiresDesign: 'billboard',
    subcategory: 'subcategoryBillboardUrban',
  },
  {
    id: Scenario.BUILDING_BANNER,
    title: 'Building-Side Banner',
    description: 'A huge vertical banner with your design hanging on the facade of a modern building.',
    image: 'https://picsum.photos/seed/buildingbanner/400/300',
    requiresDesign: 'billboard',
    subcategory: 'subcategoryBillboardUrban',
  },
  {
    id: Scenario.CONSTRUCTION_BANNER,
    title: 'Construction Site Banner',
    description: 'Showcase your ad on a banner attached to a fence at a city construction site.',
    image: 'https://picsum.photos/seed/construction/400/300',
    requiresDesign: 'billboard',
    subcategory: 'subcategoryBillboardUrban',
  },
  {
    id: Scenario.HIGHWAY_BILLBOARD,
    title: 'Highway Billboard at Sunset',
    description: 'Your ad on a large, classic billboard next to a busy highway during golden hour.',
    image: 'https://picsum.photos/seed/highway/400/300',
    requiresDesign: 'billboard',
    subcategory: 'subcategoryBillboardRoadside',
  },
  {
    id: Scenario.RURAL_BILLBOARD,
    title: 'Rural Roadside Billboard',
    description: 'Display your design on a billboard on a quiet country road with open fields.',
    image: 'https://picsum.photos/seed/ruralbillboard/400/300',
    requiresDesign: 'billboard',
    subcategory: 'subcategoryBillboardRoadside',
  },
  {
    id: Scenario.STADIUM_JUMBOTRON,
    title: 'Stadium Jumbotron Screen',
    description: 'Your ad displayed on a giant jumbotron screen in a packed sports stadium.',
    image: 'https://picsum.photos/seed/jumbotron/400/300',
    requiresDesign: 'billboard',
    subcategory: 'subcategoryBillboardIndoor',
  },
  {
    id: Scenario.MALL_SCREEN,
    title: 'Shopping Mall Digital Screen',
    description: 'A vertical digital advertising screen in a bright, modern shopping mall.',
    image: 'https://picsum.photos/seed/mallscreen/400/300',
    requiresDesign: 'billboard',
    subcategory: 'subcategoryBillboardIndoor',
  },
  {
    id: Scenario.STREET_POSTER,
    title: 'Poster on Brick Wall',
    description: 'Your poster design realistically pasted onto an urban brick wall.',
    image: 'https://picsum.photos/seed/poster/400/300',
    requiresDesign: 'poster',
    subcategory: 'subcategoryPosterUrban',
  },
  {
    id: Scenario.FRAMED_POSTER_LIVING_ROOM,
    title: 'Framed Poster in Living Room',
    description: 'A clean, stylish living room with a large framed poster on the wall.',
    image: 'https://picsum.photos/seed/posterliving/400/300',
    requiresDesign: 'poster',
    subcategory: 'subcategoryPosterIndoor',
  },
  {
    id: Scenario.CAFE_INTERIOR_POSTER,
    title: 'Cafe Interior Poster',
    description: 'A poster in a frame on the wall of a trendy, cozy coffee shop.',
    image: 'https://picsum.photos/seed/postercafe/400/300',
    requiresDesign: 'poster',
    subcategory: 'subcategoryPosterIndoor',
  },
  {
    id: Scenario.ART_GALLERY_POSTER,
    title: 'Art Gallery Poster',
    description: 'Your poster displayed cleanly on the wall of a minimalist modern art gallery.',
    image: 'https://picsum.photos/seed/postergallery/400/300',
    requiresDesign: 'poster',
    subcategory: 'subcategoryPosterIndoor',
  },
  {
    id: Scenario.STREET_A_FRAME_SIGN,
    title: 'Street A-Frame Sign',
    description: 'A classic sandwich board sign on a city sidewalk outside a shop.',
    image: 'https://picsum.photos/seed/posteraframe/400/300',
    requiresDesign: 'poster',
    subcategory: 'subcategoryPosterUrban',
  },
  {
    id: Scenario.WHEATPASTE_POSTERS_WALL,
    title: 'Wheatpaste Posters Wall',
    description: 'An urban wall covered in multiple, slightly overlapping wheatpaste posters.',
    image: 'https://picsum.photos/seed/posterwheat/400/300',
    requiresDesign: 'poster',
    subcategory: 'subcategoryPosterUrban',
  },
  {
    id: Scenario.BUS_SHELTER_POSTER,
    title: 'Bus Shelter Poster',
    description: 'A backlit paper poster inside a modern, glass bus stop shelter.',
    image: 'https://picsum.photos/seed/posterbus/400/300',
    requiresDesign: 'poster',
    subcategory: 'subcategoryPosterUrban',
  },
  {
    id: Scenario.MUSIC_VENUE_POSTER_WALL,
    title: 'Music Venue Poster Wall',
    description: 'Your design on a poster on a gritty wall outside a music venue.',
    image: 'https://picsum.photos/seed/postermusic/400/300',
    requiresDesign: 'poster',
    subcategory: 'subcategoryPosterUrban',
  },
  {
    id: Scenario.COMMUNITY_BULLETIN_BOARD,
    title: 'Community Bulletin Board',
    description: 'Your poster pinned to a cork bulletin board filled with other flyers.',
    image: 'https://picsum.photos/seed/posterboard/400/300',
    requiresDesign: 'poster',
    subcategory: 'subcategoryPosterCommunity',
  },
  {
    id: Scenario.PERSON_HOLDING_POSTER,
    title: 'Person Holding Poster',
    description: 'A lifestyle shot of a person holding up your poster design in their hands.',
    image: 'https://picsum.photos/seed/posterholding/400/300',
    requiresDesign: 'poster',
    subcategory: 'subcategoryPosterCommunity',
  },
  {
    id: Scenario.COFFEE_MUG,
    title: 'Logo on Coffee Mug',
    description: 'Your design on a mug held in a cozy cafe with a blurred background.',
    image: 'https://picsum.photos/seed/mug/400/300',
    requiresDesign: 'mug_design',
    subcategory: 'subcategoryMugLifestyle',
  },
  {
    id: Scenario.MUG_HELD_BY_PERSON,
    title: 'Mug Held by Person',
    description: 'A close-up, lifestyle shot of a person holding your mug, perfect for a relatable feel.',
    image: 'https://picsum.photos/seed/mugholding/400/300',
    requiresDesign: 'mug_design',
    subcategory: 'subcategoryMugLifestyle',
  },
  {
    id: Scenario.MUGS_PAIR,
    title: 'Pair of Matching Mugs',
    description: 'Two mugs side-by-side, ideal for couple\'s designs or complementary patterns.',
    image: 'https://picsum.photos/seed/mugpair/400/300',
    requiresDesign: 'mug_design',
    subcategory: 'subcategoryMugLifestyle',
  },
  {
    id: Scenario.MUG_CAMPING,
    title: 'Enamel Camping Mug',
    description: 'A rugged enamel mug in a rustic outdoor setting, perfect for adventure-themed designs.',
    image: 'https://picsum.photos/seed/mugcamping/400/300',
    requiresDesign: 'mug_design',
    subcategory: 'subcategoryMugLifestyle',
  },
  {
    id: Scenario.MUG_OFFICE_DESK,
    title: 'Mug on Office Desk',
    description: 'Your design on a professional-looking mug on a modern, stylish office desk.',
    image: 'https://picsum.photos/seed/mugoffice/400/300',
    requiresDesign: 'mug_design',
    subcategory: 'subcategoryMugHomeOffice',
  },
  {
    id: Scenario.MUG_KITCHEN_COUNTER,
    title: 'Mug on Kitchen Counter',
    description: 'A clean, bright shot of your mug on a modern kitchen counter with morning light.',
    image: 'https://picsum.photos/seed/mugkitchen/400/300',
    requiresDesign: 'mug_design',
    subcategory: 'subcategoryMugHomeOffice',
  },
  {
    id: Scenario.MUG_WITH_BOOKS,
    title: 'Mug with Books',
    description: 'A cozy, intellectual scene with your mug next to a stack of books in a library.',
    image: 'https://picsum.photos/seed/mugbooks/400/300',
    requiresDesign: 'mug_design',
    subcategory: 'subcategoryMugHomeOffice',
  },
  {
    id: Scenario.MUG_HOLIDAY,
    title: 'Holiday-Themed Mug',
    description: 'A festive scene with your mug surrounded by warm holiday decorations.',
    image: 'https://picsum.photos/seed/mugholiday/400/300',
    requiresDesign: 'mug_design',
    subcategory: 'subcategoryMugThemed',
  },
  {
    id: Scenario.MUG_IN_GIFT_BOX,
    title: 'Mug in Gift Box',
    description: 'Showcase your mug as a premium product, presented elegantly inside a gift box.',
    image: 'https://picsum.photos/seed/mugbox/400/300',
    requiresDesign: 'mug_design',
    subcategory: 'subcategoryMugThemed',
  },
  {
    id: Scenario.ESPRESSO_CUP_SAUCER,
    title: 'Espresso Cup & Saucer',
    description: 'A chic, high-end cafe scene featuring your design on a small espresso cup.',
    image: 'https://picsum.photos/seed/mugespresso/400/300',
    requiresDesign: 'mug_design',
    subcategory: 'subcategoryMugThemed',
  },
  {
    id: Scenario.COSMETIC_JAR,
    title: 'Luxury Cosmetic Jar',
    description: 'Display your brand on a premium cosmetic jar on an elegant marble surface.',
    image: 'https://picsum.photos/seed/cosmetic/400/300',
    requiresDesign: 'label',
    subcategory: 'subcategoryCosmetics',
  },
  {
    id: Scenario.SERUM_BOTTLE,
    title: 'Serum Dropper Bottle',
    description: 'A sleek glass dropper bottle, perfect for showcasing luxury skincare or oil labels.',
    image: 'https://picsum.photos/seed/serum/400/300',
    requiresDesign: 'label',
    subcategory: 'subcategoryCosmetics',
  },
  {
    id: Scenario.PUMP_BOTTLE,
    title: 'Lotion Pump Bottle',
    description: 'A versatile pump bottle for lotions, soaps, or sanitizers on a clean bathroom counter.',
    image: 'https://picsum.photos/seed/pump/400/300',
    requiresDesign: 'label',
    subcategory: 'subcategoryCosmetics',
  },
  {
    id: Scenario.SQUEEZE_TUBE,
    title: 'Cosmetic Squeeze Tube',
    description: 'Display your design on a soft cosmetic tube for creams, gels, or cleansers.',
    image: 'https://picsum.photos/seed/tube/400/300',
    requiresDesign: 'label',
    subcategory: 'subcategoryCosmetics',
  },
  {
    id: Scenario.WINE_BOTTLE,
    title: 'Wine Bottle Label',
    description: 'Your label design on a classic wine bottle with a moody, atmospheric background.',
    image: 'https://picsum.photos/seed/wine/400/300',
    requiresDesign: 'label',
    subcategory: 'subcategoryBeverages',
  },
  {
    id: Scenario.SODA_CAN,
    title: 'Soda Can Label',
    description: 'Present your branding on a cold, condensation-covered aluminum soda can.',
    image: 'https://picsum.photos/seed/soda/400/300',
    requiresDesign: 'label',
    subcategory: 'subcategoryBeverages',
  },
  {
    id: Scenario.BEER_BOTTLE,
    title: 'Craft Beer Bottle',
    description: 'Your label design on a chilled amber glass beer bottle, ready for a close-up.',
    image: 'https://picsum.photos/seed/beer/400/300',
    requiresDesign: 'label',
    subcategory: 'subcategoryBeverages',
  },
  {
    id: Scenario.COFFEE_BAG,
    title: 'Coffee Bag Packaging',
    description: 'Showcase your brand on a stand-up coffee bag pouch with a modern, fresh aesthetic.',
    image: 'https://picsum.photos/seed/coffeebag/400/300',
    requiresDesign: 'label',
    subcategory: 'subcategoryFoodPantry',
  },
  {
    id: Scenario.HONEY_JAR,
    title: 'Artisanal Honey Jar',
    description: 'A rustic glass honey jar with a wooden dipper, perfect for organic or gourmet brands.',
    image: 'https://picsum.photos/seed/honey/400/300',
    requiresDesign: 'label',
    subcategory: 'subcategoryFoodPantry',
  },
  {
    id: Scenario.PILL_BOTTLE,
    title: 'Pill Bottle Label',
    description: 'A clean mockup of your label on a pharmaceutical pill bottle.',
    image: 'https://picsum.photos/seed/pills/400/300',
    requiresDesign: 'label',
    subcategory: 'subcategoryHomeHealth',
  },
  {
    id: Scenario.CANDLE_JAR,
    title: 'Scented Candle Jar',
    description: 'A cozy scene with your label design on a glass candle jar.',
    image: 'https://picsum.photos/seed/candle/400/300',
    requiresDesign: 'label',
    subcategory: 'subcategoryHomeHealth',
  },
  {
    id: Scenario.SOAP_BAR_WRAP,
    title: 'Handmade Soap Bar Wrap',
    description: 'Your packaging design wrapped around a rustic, handmade bar of soap.',
    image: 'https://picsum.photos/seed/soap/400/300',
    requiresDesign: 'label',
    subcategory: 'subcategoryHomeHealth',
  },
  {
    id: Scenario.SPRAY_BOTTLE,
    title: 'Spray Bottle',
    description: 'A clean mockup of your label on a spray bottle, suitable for cleaning or beauty products.',
    image: 'https://picsum.photos/seed/spray/400/300',
    requiresDesign: 'label',
    subcategory: 'subcategoryHomeHealth',
  },
];

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
    [Scenario.OFFICE_SCREEN]: 'Professional photograph of a modern, sleek office environment. A high-end, bezel-less computer monitor sits on a clean, wooden desk. The monitor is turned on and displays a solid, vibrant magenta color (#FF00FF) as a placeholder for a UI design. A window in the background provides soft, natural light, creating subtle reflections on the screen. The background is stylishly blurred (bokeh effect). 4K, hyper-realistic.',
    [Scenario.TSHIRT_MODEL]: 'E-commerce fashion photograph. A model stands against a plain, off-white studio background. The model is wearing a high-quality, plain t-shirt. On the front of the t-shirt is a large, perfectly centered, solid magenta (#FF00FF) rectangle, serving as a clear placeholder for a design. The lighting is bright and even, with no harsh shadows. The focus is on the t-shirt. 4K, hyper-realistic, clean aesthetic.',
    [Scenario.HOODIE_MODEL]: 'Streetwear fashion photograph. A cool model in an urban city environment at golden hour. The model is wearing a plain, high-quality hoodie. On the front of the hoodie is a large, perfectly centered, solid magenta (#FF00FF) rectangle, serving as a clear placeholder for a design. The background is a slightly blurred city street with graffiti. 4K, hyper-realistic, shallow depth of field.',
    [Scenario.SWEATSHIRT_HANGER]: 'Minimalist e-commerce product shot. A plain, high-quality crewneck sweatshirt is hanging on a simple wooden hanger against a clean, textured off-white wall. On the front of the sweatshirt is a large, centered, solid magenta (#FF00FF) rectangle placeholder. The lighting is soft and even, highlighting the fabric texture. 4K, hyper-realistic, clean aesthetic.',
    [Scenario.TANK_TOP_FITNESS]: 'Fitness lifestyle photograph. An athletic person is working out in a modern, sunlit gym. They are wearing a plain, athletic-fit tank top. The front of the tank top has a centered, solid magenta (#FF00FF) rectangle as a design placeholder. They are in a dynamic pose, like holding a dumbbell. The background is blurred. 4K, hyper-realistic, energetic mood.',
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

const CATEGORY_TITLES: Record<string, string> = {
  frame: 'Frame Mockups',
  chandelier: 'Chandelier Mockups',
  product: 'Product Mockups',
  screen: 'Screen & App Mockups',
  apparel: 'Apparel Mockups',
  billboard: 'Billboard Mockups',
  poster: 'Poster Mockups',
  mug_design: 'Coffee Mug Mockups',
  label: 'Cosmetic & Label Mockups'
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

  const SCENARIO_CATEGORIES = useMemo(() => {
    return SCENARIO_OPTIONS.reduce((acc, scenario) => {
      const categoryKey = scenario.requiresDesign;
      if (categoryKey !== 'none') {
        if (!acc[categoryKey]) {
          acc[categoryKey] = {
            title: t(CATEGORY_TITLES[categoryKey] || `${categoryKey.replace('_', ' ')} Mockups`),
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
  }, [t]);

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