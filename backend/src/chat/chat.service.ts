import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { PetProfileService } from '../pet-profile/pet-profile.service';

const EMERGENCY_KEYWORDS = [
  'vomiting blood', 'blood in vomit', 'bloody vomit',
  'seizure', 'seizures', 'seizing', 'convulsing', 'convulsion',
  'difficulty breathing', "can't breathe", 'cant breathe', 'struggling to breathe',
  'choking', 'not breathing',
  'poisoning', 'poison', 'poisoned', 'ate poison', 'toxic', 'toxin',
  'ate chocolate', 'ate xylitol', 'ate grapes', 'ate raisins', 'ate onion',
  'antifreeze', 'rat poison', 'snail bait',
  'collapse', 'collapsed', 'unconscious', 'unresponsive', 'fainted',
  'swallowed', 'foreign object', 'ate something', 'swallowed bone',
  'hit by car', 'hit by a car', 'run over', 'car accident', 'vehicle',
  'bleeding heavily', 'severe bleeding', "won't stop bleeding", 'deep cut', 'deep wound',
  'broken bone', 'fracture', 'limping badly',
  'bitten by snake', 'snake bite', 'scorpion sting', 'bee sting swelling',
  'bloated stomach', 'bloat', 'stomach twisted', 'gdv',
  'eye injury', 'eye popping out', 'proptosis',
  'heatstroke', 'heat stroke', 'overheating',
  'drowning', 'nearly drowned',
  'electrocuted', 'electric shock',
  'giving birth', 'labor', 'difficulty whelping', 'stuck puppy', 'stuck kitten',
  'paralyzed', 'paralysis', "can't move legs", 'dragging legs',
  'swollen face', 'allergic reaction', 'anaphylaxis',
  'blood in stool', 'bloody diarrhea', 'black stool',
  'not eating for days', "hasn't eaten in",
  'high fever', 'very high temperature',
  'my pet is dying', 'is dying', 'about to die',
  // Hebrew Emergency Keywords
  'דם', 'מקיא דם', 'פרכוס', 'פרכוסים', 'קשיי נשימה', 'נחנק', 'מורעל', 'הרעלה',
  'אכל שוקולד', 'אכל רעל', 'נדרס', 'תאונה', 'דימום קשה', 'שבר', 'הכשת נחש', 'עקיצה',
  'התעלף', 'גוסס', 'מתנשף בכבדות', 'עין נפוחה', 'מכת חום', 'טביעה', 'שיתוק',
  // Arabic Emergency Keywords
  'دم', 'يتقيأ دم', 'تشنج', 'صعوبة تنفس', 'اختناق', 'تسمم', 'سم', 'حادث سيارة', 'نزيف شديد', 'كسر', 'لدغة ثعبان',
];

const SYSTEM_PROMPT = `You are PetSOS AI Veterinary Assistant, a friendly and expert pet care advisor. Your role is to help pet owners with questions about:
- Diet and nutrition (puppy, adult, senior, wet food, raw, dry food)
- Behavior, anxiety, and positive reinforcement training
- Pet product and supplement recommendations
- Analyzing pet skin conditions, coat health, or uploaded photos safely
- General wellness, activity guidelines, and daily care

CRITICAL SAFETY RULES:
1. You are NOT a substitute for an in-person veterinarian during life-threatening crises.
2. If a user describes severe trauma, profuse bleeding, seizures, toxin ingestion, or difficulty breathing, respond with: {"emergency": true, "message": "Emergency detected: Please rush to your nearest 24/7 veterinary hospital immediately!"}
3. Always respond fluently in the EXACT language of the user prompt (Hebrew, Arabic, Russian, English, etc.).
4. Use clear bullet points, warm tone, and emojis 🐾.`;

const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private genAI?: GoogleGenerativeAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly petProfileService: PetProfileService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey && apiKey.trim().length > 10) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey.trim());
      } catch (err) {
        this.logger.warn('Could not initialize GoogleGenerativeAI:', err);
      }
    }
  }

  async processMessage(
    message: string,
    history: { role: string; content: string }[],
    _petProfileId?: string,
    image?: { data: string; mimeType: string },
  ): Promise<{ message: string; emergency: boolean }> {
    try {
      // 1. Check for emergency keywords
      const lowerMessage = (message || '').toLowerCase();
      for (const keyword of EMERGENCY_KEYWORDS) {
        if (lowerMessage.includes(keyword)) {
          this.logger.warn(`Emergency keyword detected: "${keyword}" in message: "${message}"`);
          const isHebrew = /[\u0590-\u05FF]/.test(message);
          const isArabic = /[\u0600-\u06FF]/.test(message);
          return {
            emergency: true,
            message: isHebrew
              ? `🚨 זוהה מצב חירום פוטנציאלי הקשור ל-"${keyword}". אנא פנה לבית חולים וטרינרי לחירום באופן מיידי!`
              : isArabic
              ? `🚨 تم اكتشاف حالة طوارئ محتملة تتعلق بـ "${keyword}". يرجى الاتصال بمستشفى الطوارئ البيطري فوراً!`
              : `🚨 Potential emergency detected related to "${keyword}". Please contact an emergency animal hospital immediately!`,
          };
        }
      }

      // 2. Fetch full platform RAG context: Pets & Medical History
      let dynamicRAGContext = '';
      try {
        const allPets = await this.petProfileService.findAll();
        if (allPets && allPets.length > 0) {
          const petSummaries = allPets.map((p) => {
            return `- Name: ${p.name}, Species: ${p.species}, Breed: ${p.breed}, Age: ${p.age}y, Allergies: ${p.allergies?.join(', ') || 'None'}`;
          });
          dynamicRAGContext += `\n\nUSER'S REGISTERED PETS:\n` + petSummaries.join('\n');
        }
      } catch {}

      const fullSystemPrompt = SYSTEM_PROMPT + dynamicRAGContext;

      // 3. Try calling Google Gemini AI
      if (this.genAI) {
        for (const modelName of GEMINI_MODELS) {
          try {
            const model = this.genAI.getGenerativeModel({ model: modelName });
            const chat = model.startChat({
              history: [
                { role: 'user', parts: [{ text: 'System instructions: ' + fullSystemPrompt }] },
                { role: 'model', parts: [{ text: 'Understood. I will provide helpful veterinary pet care advice.' }] },
                ...history.slice(-10).map((msg) => ({
                  role: msg.role === 'assistant' ? 'model' : 'user',
                  parts: [{ text: msg.content }],
                })),
              ],
            });

            const parts: any[] = [{ text: message }];
            if (image?.data) {
              parts.push({
                inlineData: {
                  data: image.data,
                  mimeType: image.mimeType || 'image/jpeg',
                },
              });
            }

            const result = await chat.sendMessage(parts);
            const responseText = result.response.text();
            if (responseText) {
              return { message: responseText, emergency: false };
            }
          } catch (err: any) {
            this.logger.warn(`Gemini model ${modelName} call failed:`, err?.message);
          }
        }
      }

      // 4. Intelligent Rule-Based Diagnostic Response (Zero Failures)
      return this.generateSmartDiagnosticResponse(message);
    } catch (err: any) {
      return {
        message: '🐾 I am here to help! Please tell me about your pet’s symptoms, age, and breed.',
        emergency: false,
      };
    }
  }

  private generateSmartDiagnosticResponse(message: string): { message: string; emergency: boolean } {
    const text = message.toLowerCase();
    const isHebrew = /[\u0590-\u05FF]/.test(message);

    if (text.includes('food') || text.includes('diet') || text.includes('אוכל') || text.includes('מזון')) {
      return {
        message: isHebrew
          ? `🍖 **המלצות תזונה ודיאטה לחיות מחמד**:\n- **גורים**: מזון עתיר חלבון ושומן בריא (3-4 ארוחות ביום).\n- **בוגרים**: מזון יבש מאוזן מותאם לגודל וגזע (2 ארוחות ביום).\n- **מזונות מסוכנים**: שוקולד, ענבים, בצל, שום, קסיליטול ועצמות מבושלות.\n\nהאם תרצה המלצה למותג ספציפי עבור הכלב/חתול שלך?`
          : `🍖 **Pet Nutrition & Diet Guidance**:\n- **Puppies/Kittens**: High-protein, DHA-rich growth formula (3-4 meals/day).\n- **Adults**: Complete balanced kibble or wet food suited to their breed and weight (2 meals/day).\n- **Strictly Avoid**: Chocolate, grapes/raisins, onions, garlic, xylitol, and cooked bones.\n\nWould you like recommendations tailored to a specific breed or allergy?`,
        emergency: false,
      };
    }

    if (text.includes('rash') || text.includes('itch') || text.includes('scratch') || text.includes('גרד') || text.includes('עור')) {
      return {
        message: isHebrew
          ? `🩺 **אבחון גירוד ובעיות עור**:\n- גירוד מתמשך יכול לנבוע מפרעושים, אלרגיה למזון (עוף/דגנים), או אטופיה סביבתית.\n- **עזרה ראשונה**: סרוק עם מסרק פרעושים, שטוף בשמפו שיבולת שועל היפואלרגני, והימנע מחשיפה לדשא טרי.\n- אם יש פצע אדום חם ("Hot Spot"), יש לפנות לבדיקת וטרינר למתן טיפול מרגיע.`
          : `🩺 **Skin & Itching Assessment**:\n- Common causes: Fleas/parasites, food sensitivities (e.g. chicken protein), or environmental allergens.\n- **Home Care**: Check for flea dirt with a fine comb, apply a hypoallergenic oatmeal rinse, and prevent licking.\n- If you notice hair loss, open sores, or a hot spot, an in-clinic veterinary check is recommended for targeted relief.`,
        emergency: false,
      };
    }

    return {
      message: isHebrew
        ? `🐾 **שלום! אני כאן לעזור בנושאי בריאות, תזונה והתנהגות של חיות מחמד**.\nספר לי על הגזע, הגיל והתסמינים שאתה מזהה, או העלה תמונה לבדיקה.`
        : `🐾 **Hello! I'm here to help with your pet's wellness, nutrition, and behavior**.\nTell me about your pet's breed, age, and symptoms, or upload a photo for visual guidance!`,
      emergency: false,
    };
  }
}
