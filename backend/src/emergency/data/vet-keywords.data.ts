/**
 * Multilingual Veterinary Search Keywords & Language Detector
 */

export function getLocalizedVetKeywords(
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
    he: ['וטרינר', 'מרפאה וטרינרית', 'בית חולים וטרינרי', 'חירום וטרינרי'],
    ar: ['طبيب بيطري', 'عيادة بيطرية', 'مستشفى بيطري', 'طوارئ بيطرية'],
    de: ['Tierarzt', 'Tierklinik', 'Tierarztpraxis', 'Tiernotdienst'],
    fr: [
      'vétérinaire',
      'clinique vétérinaire',
      'urgence vétérinaire',
      'hôpital vétérinaire',
    ],
    es: [
      'veterinario',
      'clínica veterinaria',
      'hospital veterinario',
      'urgencias veterinarias',
    ],
    it: ['veterinario', 'clinica veterinaria', 'pronto soccorso veterinario'],
    pt: ['veterinário', 'clínica veterinária', 'hospital veterinário'],
    ru: [
      'ветеринар',
      'ветклиника',
      'ветеринарная клиника',
      'ветеринарная помощь',
    ],
    ja: ['獣医', '動物病院', '夜間救急動物病院'],
    zh: ['宠物医院', '兽医', '动物医院'],
    en: [
      'veterinary clinic',
      'animal hospital',
      'emergency vet',
      '24/7 pet clinic',
    ],
  };

  const selectedKeywords = keywordMap[detectedLang] || keywordMap.en;
  return {
    keywords: selectedKeywords,
    langCode: detectedLang,
  };
}
