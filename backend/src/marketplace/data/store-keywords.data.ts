/**
 * Multilingual Pet Store & Supplies Search Keywords & Language Detector
 */

export function getLocalizedPetStoreKeywords(
  lang?: string,
  country?: string,
  lat?: number,
  lon?: number,
): { keywords: string[]; langCode: string } {
  const normLang = (lang || '').toLowerCase().slice(0, 2);
  const normCountry = (country || '').toLowerCase();

  let detectedLang = normLang;
  if (!detectedLang || detectedLang === 'un') {
    if (
      normCountry.includes('israel') ||
      (lat && lat > 29.4 && lat < 33.4 && lon && lon > 34.2 && lon < 35.9)
    ) {
      detectedLang = 'he';
    } else if (
      normCountry.includes('germany') ||
      normCountry.includes('austria') ||
      normCountry.includes('switzerland')
    ) {
      detectedLang = 'de';
    } else if (
      normCountry.includes('france') ||
      normCountry.includes('belgium')
    ) {
      detectedLang = 'fr';
    } else if (
      normCountry.includes('spain') ||
      normCountry.includes('mexico') ||
      normCountry.includes('argentina') ||
      normCountry.includes('colombia')
    ) {
      detectedLang = 'es';
    } else if (normCountry.includes('italy')) {
      detectedLang = 'it';
    } else if (
      normCountry.includes('russia') ||
      normCountry.includes('ukraine') ||
      normCountry.includes('belarus')
    ) {
      detectedLang = 'ru';
    } else if (normCountry.includes('japan')) {
      detectedLang = 'ja';
    } else if (
      normCountry.includes('uae') ||
      normCountry.includes('egypt') ||
      normCountry.includes('saudi') ||
      normCountry.includes('jordan') ||
      normCountry.includes('morocco')
    ) {
      detectedLang = 'ar';
    } else if (
      normCountry.includes('brazil') ||
      normCountry.includes('portugal')
    ) {
      detectedLang = 'pt';
    } else {
      detectedLang = 'en';
    }
  }

  const keywordMap: Record<string, string[]> = {
    he: ['חנות חיות', 'מזון לבעלי חיים', 'ציוד לחיות מחמד', 'חנות לחיות מחמד'],
    ar: [
      'محل حيوانات أليفة',
      'مستلزمات حيوانات',
      'طعام كلاب وقطط',
      'متجر حيوانات',
    ],
    de: ['Zoohandlung', 'Tierhandlung', 'Haustierbedarf', 'Tierfutter'],
    fr: [
      'animalerie',
      'magasin pour animaux',
      'accessoires animaux',
      'nourriture pour animaux',
    ],
    es: [
      'tienda de mascotas',
      'artículos para mascotas',
      'tienda de animales',
      'alimento para mascotas',
    ],
    it: [
      'negozio di animali',
      'articoli per animali',
      'pet shop',
      'cibo per animali',
    ],
    pt: [
      'pet shop',
      'loja de animais',
      'rações e acessórios',
      'produtos para animais',
    ],
    ru: ['зоомагазин', 'товары для животных', 'корм для животных', 'зоотовары'],
    ja: ['ペットショップ', 'ペット用品', 'ペットフード'],
    zh: ['宠物店', '宠物用品店', '宠物食品'],
    en: ['pet store', 'pet shop', 'pet supplies', 'pet food and accessories'],
  };

  const selectedKeywords = keywordMap[detectedLang] || keywordMap.en;
  return {
    keywords: selectedKeywords,
    langCode: detectedLang,
  };
}
