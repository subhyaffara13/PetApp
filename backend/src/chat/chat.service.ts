import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { PetProfileService } from '../pet-profile/pet-profile.service';
import { User, UserDocument } from '../schemas/user.schema';

const EMERGENCY_KEYWORDS = [
  'vomiting blood',
  'blood in vomit',
  'bloody vomit',
  'seizure',
  'seizures',
  'seizing',
  'convulsing',
  'convulsion',
  'difficulty breathing',
  "can't breathe",
  'cant breathe',
  'struggling to breathe',
  'choking',
  'not breathing',
  'poisoning',
  'poison',
  'poisoned',
  'ate poison',
  'toxic',
  'toxin',
  'ate chocolate',
  'ate xylitol',
  'ate grapes',
  'ate raisins',
  'ate onion',
  'antifreeze',
  'rat poison',
  'snail bait',
  'collapse',
  'collapsed',
  'unconscious',
  'unresponsive',
  'fainted',
  'swallowed',
  'foreign object',
  'ate something',
  'swallowed bone',
  'hit by car',
  'hit by a car',
  'run over',
  'car accident',
  'vehicle',
  'bleeding heavily',
  'severe bleeding',
  "won't stop bleeding",
  'deep cut',
  'deep wound',
  'broken bone',
  'fracture',
  'limping badly',
  'bitten by snake',
  'snake bite',
  'scorpion sting',
  'bee sting swelling',
  'bloated stomach',
  'bloat',
  'stomach twisted',
  'gdv',
  'eye injury',
  'eye popping out',
  'proptosis',
  'heatstroke',
  'heat stroke',
  'overheating',
  'drowning',
  'nearly drowned',
  'electrocuted',
  'electric shock',
  'giving birth',
  'labor',
  'difficulty whelping',
  'stuck puppy',
  'stuck kitten',
  'paralyzed',
  'paralysis',
  "can't move legs",
  'dragging legs',
  'swollen face',
  'allergic reaction',
  'anaphylaxis',
  'blood in stool',
  'bloody diarrhea',
  'black stool',
  'not eating for days',
  "hasn't eaten in",
  'high fever',
  'very high temperature',
  'my pet is dying',
  'is dying',
  'about to die',
  // Hebrew Emergency Keywords
  'דם',
  'מקיא דם',
  'פרכוס',
  'פרכוסים',
  'קשיי נשימה',
  'נחנק',
  'מורעל',
  'הרעלה',
  'אכל שוקולד',
  'אכל רעל',
  'נדרס',
  'תאונה',
  'דימום קשה',
  'שבר',
  'הכשת נחש',
  'עקיצה',
  'התעלף',
  'גוסס',
  'מתנשף בכבדות',
  'עין נפוחה',
  'מכת חום',
  'טביעה',
  'שיתוק',
  // Arabic Emergency Keywords
  'دم',
  'يتقيأ دم',
  'تشنج',
  'صعوبة تنفس',
  'اختناق',
  'تسمم',
  'سم',
  'حادث سيارة',
  'نزيف شديد',
  'كسر',
  'لدغة ثعبان',
];

const SYSTEM_PROMPT = `You are PetSOS Companion, a warm, chill, and deeply knowledgeable pet lover and guide. You talk to pet parents like an experienced, relaxed friend who truly understands pets.

CONVERSATIONAL TONE & STYLE:
- Be warm, chill, natural, and conversational. NEVER sound like a rigid corporate bot or a sterile medical textbook.
- Avoid repetitive disclaimers (e.g. "As an AI...", "I am a language model...").
- Keep explanations relaxed, encouraging, and clear. Avoid stiff bullet points unless the user specifically asks for a checklist.
- Always respond in the EXACT language the user speaks (English, Hebrew, Arabic, Russian, French, Spanish, etc.).

CRITICAL SAFETY & MEDICAL BOUNDARIES:
- You are NOT a doctor or surgeon, and you never pretend to diagnose complex internal conditions or prescribe prescription drugs.
- You do NOT provide formal emergency triage.
- If the user describes a true, life-threatening emergency (profuse bleeding, active seizures, unresponsiveness, poison/toxin ingestion like antifreeze or chocolate, severe respiratory distress, broken limbs, bloated rigid abdomen), calmly but urgently tell them:
"🚨 This sounds like an emergency. Please don't wait — head to your nearest 24/7 emergency veterinary hospital or use the PetSOS Alert Clinic feature right now!"

CONVERSATIONAL PET ONBOARDING & SETUP:
You can directly set up and register pet profiles into PetSOS through natural conversation!
1. When a user introduces a pet, talks about getting a new pet, or asks you to set up/register their pet, chat with them warmly to get their pet's details (Name, Species like dog/cat/rabbit, Breed, Age, Weight, and any Allergies or Medications).
2. If any important detail is missing, ask for it naturally (e.g. "Aww what's their name? And are they a dog, cat, or another furry friend?").
3. Once you have at least the name and species (and ideally age/breed), tell the user with excitement that you've created their pet's official PetSOS Passport.
4. AT THE VERY END OF YOUR RESPONSE, append this exact JSON action block so the platform creates the pet in their account:
\`\`\`json:pet_setup
{
  "action": "create_pet",
  "name": "PetName",
  "species": "dog",
  "breed": "BreedName",
  "age": 2,
  "weight": 15,
  "allergies": [],
  "medications": []
}
\`\`\`
Only output this code block when you have gathered the details and are creating the pet profile.`;

const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.0-flash',
];

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private genAI?: GoogleGenerativeAI;
  private sessionPetDrafts = new Map<string, any>();

  constructor(
    private readonly configService: ConfigService,
    private readonly petProfileService: PetProfileService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
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

  private extractPetInfoFromText(text: string, currentDraft: any = {}): any {
    const lower = text.toLowerCase().trim();
    const draft = { ...currentDraft };

    // Species detection
    if (/(?:dog|puppy|pup|canine|hound|כלב|גור כלבים|כלבה)/i.test(lower)) {
      draft.species = 'dog';
    } else if (/(?:cat|kitten|kitty|feline|חתול|חתולה|גור חתולים)/i.test(lower)) {
      draft.species = 'cat';
    } else if (/(?:rabbit|bunny|ארנב|ארנבת)/i.test(lower)) {
      draft.species = 'rabbit';
    } else if (/(?:bird|parrot|תוכי)/i.test(lower)) {
      draft.species = 'bird';
    } else if (/(?:hamster|אוגר)/i.test(lower)) {
      draft.species = 'hamster';
    }

    // Common Breeds
    const knownBreeds = [
      'Golden Retriever', 'Labrador', 'German Shepherd', 'French Bulldog', 'Bulldog',
      'Poodle', 'Beagle', 'Rottweiler', 'Husky', 'Siberian Husky', 'Pomeranian',
      'Chihuahua', 'Shih Tzu', 'Boxer', 'Dachshund', 'Border Collie', 'Corgi',
      'Doberman', 'Great Dane', 'Pitbull', 'Maltese', 'Pug', 'Mastiff',
      'Australian Shepherd', 'Cavalier', 'Bernese Mountain', 'Akita', 'Samoyed',
      'Cane Corso', 'Maine Coon', 'Persian', 'Siamese', 'Bengal', 'Ragdoll',
      'British Shorthair', 'Scottish Fold', 'Sphynx', 'Abyssinian', 'Russian Blue',
      'Burmese', 'Norwegian Forest', 'Devon Rex', 'Tabby', 'Calico', 'Tuxedo', 'Mixed Breed'
    ];
    for (const b of knownBreeds) {
      if (lower.includes(b.toLowerCase())) {
        draft.breed = b;
        if (!draft.species) {
          draft.species = ['Maine Coon', 'Persian', 'Siamese', 'Bengal', 'Ragdoll', 'British Shorthair', 'Scottish Fold', 'Sphynx', 'Abyssinian', 'Russian Blue', 'Burmese', 'Norwegian Forest', 'Devon Rex', 'Tabby', 'Calico', 'Tuxedo'].includes(b) ? 'cat' : 'dog';
        }
        break;
      }
    }

    // Name extraction
    const nameMatch =
      text.match(/(?:named|called|name is|name's|call (?:him|her)|שמו|שמה|קוראים לו|קוראים לה)\s+([A-Za-z\u0590-\u05FF]+)/i) ||
      text.match(/(?:my (?:dog|cat|pet|puppy|kitten)|הכלב שלי|החתול שלי)\s+([A-Za-z\u0590-\u05FF]+)/i);

    if (nameMatch && nameMatch[1]) {
      const candidate = nameMatch[1].trim();
      const forbidden = ['a', 'an', 'the', 'my', 'pet', 'dog', 'cat', 'puppy', 'kitten', 'good', 'boy', 'girl', 'great', 'new'];
      if (!forbidden.includes(candidate.toLowerCase())) {
        draft.name = candidate.charAt(0).toUpperCase() + candidate.slice(1);
      }
    } else if (!draft.name && /^[A-Za-z\u0590-\u05FF]{2,15}$/.test(text.trim())) {
      const candidate = text.trim();
      const forbidden = ['dog', 'cat', 'pet', 'yes', 'no', 'male', 'female', 'boy', 'girl', 'puppy', 'kitten', 'none', 'hello', 'hi', 'hey', 'כלב', 'חתול', 'כן', 'לא'];
      if (!forbidden.includes(candidate.toLowerCase())) {
        draft.name = candidate.charAt(0).toUpperCase() + candidate.slice(1);
      }
    }

    // Age extraction
    const ageMatch =
      text.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?|yr|y\.?o\.?|שנים|שנה)/i) ||
      text.match(/(?:age|aged|בן|בת|age is)\s*(\d+)/i) ||
      text.match(/(?:he is|she is|he's|she's|is)\s+(\d+)\b/i);
    if (ageMatch && ageMatch[1]) {
      draft.age = parseFloat(ageMatch[1]);
    } else if (draft.age === undefined && /^\d+$/.test(text.trim())) {
      const val = parseInt(text.trim(), 10);
      if (val > 0 && val < 30) draft.age = val;
    }

    // Gender
    if (/(?:male|boy|good boy|זכר|ילד)/i.test(lower)) {
      draft.gender = 'male';
    } else if (/(?:female|girl|good girl|נקבה|ילדה)/i.test(lower)) {
      draft.gender = 'female';
    }

    // Weight
    const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos?|lbs?|ק"ג|קילו)/i);
    if (weightMatch && weightMatch[1]) {
      draft.weight = parseFloat(weightMatch[1]);
    }

    return draft;
  }

  async processMessage(
    message: string,
    history: { role: string; content: string }[] = [],
    petProfileId?: string,
    image?: { data: string; mimeType: string },
    userId?: string,
    sessionId?: string,
    petContext?: string,
  ): Promise<{
    message: string;
    emergency: boolean;
    sessionId: string;
    memorySnapshot?: any;
    petCreated?: any;
    petDraft?: any;
  }> {
    const activeSessionId =
      sessionId ||
      `sess-${Date.now()}-${randomBytes(4).toString('hex')}`;
    let responseText = '';
    let isEmergency = false;
    let petCreated: any = null;

    try {
      // 1. Check for emergency keywords
      const lowerMessage = (message || '').toLowerCase();
      for (const keyword of EMERGENCY_KEYWORDS) {
        if (lowerMessage.includes(keyword)) {
          this.logger.warn(
            `Emergency keyword detected: "${keyword}" in message: "${message}"`,
          );
          isEmergency = true;
          const isHebrew = /[\u0590-\u05FF]/.test(message);
          const isArabic = /[\u0600-\u06FF]/.test(message);
          responseText = isHebrew
            ? `🚨 זוהה מצב חירום פוטנציאלי הקשור ל-"${keyword}". אנא פנה לבית חולים וטרינרי לחירום באופן מיידי!`
            : isArabic
              ? `🚨 تم اكتشاف حالة طوارئ محتملة تتعلق بـ "${keyword}". يرجى الاتصال بمستشفى الطوارئ البيطري فوراً!`
              : `🚨 Potential emergency detected related to "${keyword}". Please contact an emergency animal hospital immediately!`;
          break;
        }
      }

      // 2. Fetch User & Active Pets & AI Memory Context from Atlas
      let userDoc: UserDocument | null = null;
      let dynamicRAGContext = '';

      if (userId && userId !== 'guest-anonymous' && userId !== 'current-user') {
        try {
          userDoc = await this.userModel.findById(userId).exec();
        } catch {}
      }

      // User's Registered Pets Context
      try {
        const userPets =
          userId && userId !== 'guest-anonymous'
            ? await this.petProfileService.findAll(userId)
            : await this.petProfileService.findAll();

        if (userPets && userPets.length > 0) {
          const petSummaries = userPets
            .filter((p) => !p.isArchived)
            .map((p) => {
              return `- Name: ${p.name}, Species: ${p.species}, Breed: ${p.breed}, Age: ${p.age}y, Allergies: ${p.allergies?.join(', ') || 'None'}, Meds: ${p.medications?.join(', ') || 'None'}`;
            });
          if (petSummaries.length > 0) {
            dynamicRAGContext +=
              `\n\nUSER'S REGISTERED PETS (ACTIVE PASSPORTS):\n` +
              petSummaries.join('\n');
          }
        }
      } catch {}

      // Injected AI Long-term Memory
      if (userDoc?.aiMemory) {
        const mem = userDoc.aiMemory;
        const memoryLines: string[] = [];
        if (mem.dietaryRestrictions?.length) {
          memoryLines.push(
            `- Dietary Restrictions & Allergies: ${mem.dietaryRestrictions.join(', ')}`,
          );
        }
        if (mem.preferences?.length) {
          memoryLines.push(`- Pet Preferences: ${mem.preferences.join(', ')}`);
        }
        if (mem.behavioralNotes?.length) {
          memoryLines.push(
            `- Behavioral & Personality Notes: ${mem.behavioralNotes.join(', ')}`,
          );
        }
        if (mem.healthSummary) {
          memoryLines.push(`- Chronic Health Summary: ${mem.healthSummary}`);
        }

        if (memoryLines.length > 0) {
          dynamicRAGContext +=
            `\n\nAI PET LONG-TERM MEMORY (PAST CONVERSATIONS):\n` +
            memoryLines.join('\n');
        }
      }

      if (petContext) {
        dynamicRAGContext += `\n\nUSER'S ACTIVE PET CONTEXT:\n${petContext}`;
      }

      const fullSystemPrompt = SYSTEM_PROMPT + dynamicRAGContext;

      // 3. Try calling Google Gemini AI (if not emergency)
      if (!isEmergency && this.genAI) {
        for (const modelName of GEMINI_MODELS) {
          try {
            const model = this.genAI.getGenerativeModel({ model: modelName });
            const chat = model.startChat({
              history: [
                {
                  role: 'user',
                  parts: [{ text: 'System instructions: ' + fullSystemPrompt }],
                },
                {
                  role: 'model',
                  parts: [
                    {
                      text: 'Hey! Got it completely. I am your chill, friendly pet companion. I will chat warmly and naturally, help fill out pet profiles conversationally, never play doctor or diagnose illnesses, and only flag true life-threatening emergencies.',
                    },
                  ],
                },
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
            const generated = result.response.text();
            if (generated) {
              responseText = generated;
              break;
            }
          } catch (err: any) {
            this.logger.warn(
              `Gemini model ${modelName} call failed:`,
              err?.message,
            );
          }
        }
      }

      let petDraft: any = null;

      // 4. Extract pet setup JSON action if generated by Gemini
      const petSetupRegex =
        /```(?:json:pet_setup|pet_setup|json)?\s*(\{\s*"action"\s*:\s*"create_pet"[\s\S]*?\})\s*```/i;
      const petMatch = responseText.match(petSetupRegex);
      if (petMatch) {
        try {
          const petData = JSON.parse(petMatch[1]);
          responseText = responseText.replace(petMatch[0], '').trim();
          if (userId && userId !== 'guest-anonymous') {
            petCreated = await this.petProfileService.create(
              petData,
              userId,
              userDoc?.name || 'Pet Parent',
            );
          } else {
            petCreated = {
              ...petData,
              _id: `pet-preview-${Date.now()}`,
              petId: `PET-${Date.now().toString().slice(-6)}`,
              isArchived: false,
            };
          }
          this.sessionPetDrafts.delete(activeSessionId);
          petDraft = { ...petData, isComplete: true };
        } catch (err: any) {
          this.logger.warn(
            'Failed to parse or create pet from chat action:',
            err?.message,
          );
        }
      }

      // Extract in-progress pet draft if returned by Gemini
      const draftMatch = responseText.match(
        /```(?:json:pet_draft|pet_draft|json)?\s*(\{\s*"name"[\s\S]*?\})\s*```/i,
      );
      if (draftMatch && !petCreated) {
        try {
          petDraft = JSON.parse(draftMatch[1]);
          responseText = responseText.replace(draftMatch[0], '').trim();
          this.sessionPetDrafts.set(activeSessionId, petDraft);
        } catch {}
      }

      // 5. Robust multi-turn conversational pet onboarding engine (runs when Gemini is offline or did not format)
      if (!isEmergency) {
        let draft =
          this.sessionPetDrafts.get(activeSessionId) ||
          userDoc?.aiChatSessions?.find((s) => s.sessionId === activeSessionId)
            ?.petDraft ||
          null;

        const isHebrew = /[\u0590-\u05FF]/.test(message);
        const isPetOnboardingTrigger =
          /(?:setup (?:my|a) pet|add (?:my|a) pet|new pet|new dog|new cat|new puppy|new kitten|got a (?:new )?(?:dog|cat|puppy|kitten|pet)|adopted|register my pet|register a pet|להוסיף (?:כלב|חתול|חיה)|פתחתי כרטיס|חיה חדשה|אימצתי|גור חדש)/i.test(
            message,
          );

        if (!petCreated && (isPetOnboardingTrigger || (draft && !draft.isComplete))) {
          draft = this.extractPetInfoFromText(message, draft || {});
          petDraft = draft;
          this.sessionPetDrafts.set(activeSessionId, draft);

          const hasName = Boolean(draft.name && draft.name.trim().length > 1);
          const hasSpecies = Boolean(draft.species);
          const hasAge = draft.age !== undefined && draft.age !== null;
          const hasBreed = Boolean(
            draft.breed &&
              draft.breed !== 'Mixed' &&
              draft.breed !== 'Mixed Breed',
          );

          if (!hasName) {
            responseText = isHebrew
              ? `איזה כיף! אשמח לעזור לך להקים את כרטיס הבריאות שלו ב-PetSOS 🐾 איך קוראים לו או לה?`
              : `Aww, that's exciting! I'd love to help set up their official PetSOS Passport right here in our chat 🐾 What's their name?`;
          } else if (!hasSpecies || (!hasBreed && draft.species === 'dog')) {
            responseText = isHebrew
              ? `איזה שם מקסים! ${draft.name} הוא כלב, חתול או חיה אחרת? ואיזה גזע הוא? 🐾`
              : `Aww, ${draft.name} is such an awesome name! Are they a dog, a cat, or another furry buddy? And what breed are they? 🐾`;
          } else if (!hasAge) {
            responseText = isHebrew
              ? `מגניב לגמרי! ובן כמה ${draft.name}? 🎂`
              : `Love that! And how old is ${draft.name}? 🎂`;
          } else {
            // All essentials present! Create pet!
            const petData = {
              name: draft.name,
              species: draft.species || 'dog',
              breed: draft.breed || 'Mixed Breed',
              age: draft.age,
              weight: draft.weight || (draft.species === 'cat' ? 4 : 15),
              gender: draft.gender || 'unknown',
              allergies: draft.allergies || [],
              medications: draft.medications || [],
            };

            try {
              if (userId && userId !== 'guest-anonymous') {
                petCreated = await this.petProfileService.create(
                  petData,
                  userId,
                  userDoc?.name || 'Pet Parent',
                );
              } else {
                petCreated = {
                  ...petData,
                  _id: `pet-preview-${Date.now()}`,
                  petId: `PET-${Date.now().toString().slice(-6)}`,
                  isArchived: false,
                };
              }
              draft.isComplete = true;
              petDraft = draft;
              this.sessionPetDrafts.delete(activeSessionId);

              responseText = isHebrew
                ? `איזה כיף להכיר את ${draft.name}! 🐾\nהקמתי עבורכם את דרכון הבריאות הרשמי של ${draft.name} ב-PetSOS. תוכל לראות את הכרטיס שלו ממש כאן למטה, ולעדכן תמונות, חיסונים או משקל בכל עת דרך הפרופיל. איך ${draft.name} מרגיש היום?`
                : `Aww, so wonderful to meet ${draft.name}! 🐾\nI've officially set up ${draft.name}'s PetSOS Passport for you! You can check out their interactive passport card right below, and manage vaccines, photos, or checkups anytime in your profile. How is ${draft.name} doing today?`;
            } catch (createErr: any) {
              this.logger.warn(
                'Could not create pet in multi-turn onboarding:',
                createErr?.message,
              );
            }
          }
        } else if (!responseText) {
          const lower = (message || '').toLowerCase();
          const mentionsPetInfo =
            lower.includes('my pet') ||
            lower.includes('my cat') ||
            lower.includes('my dog') ||
            lower.includes('see my') ||
            lower.includes('pet info') ||
            lower.includes('cats info') ||
            lower.includes('dogs info');

          if (mentionsPetInfo && dynamicRAGContext.length > 0) {
            const cleanInfo = dynamicRAGContext
              .replace(/USER'S.*:\n/g, '')
              .trim();
            responseText = `🐾 **Yes, I can see your pet's information!**\n\nHere is what I have registered in your pet profile:\n${cleanInfo}\n\nHow can I help you take care of them today?`;
          } else {
            const smartDiag = this.generateSmartDiagnosticResponse(message);
            responseText = smartDiag.message;
            isEmergency = smartDiag.emergency;
          }
        }
      }

      // 6. Persist Session & AI Memory into MongoDB Atlas
      if (userDoc) {
        try {
          if (!userDoc.aiChatSessions) userDoc.aiChatSessions = [];
          let session = userDoc.aiChatSessions.find(
            (s) => s.sessionId === activeSessionId,
          );

          if (!session) {
            const title =
              message.length > 35
                ? message.substring(0, 35) + '...'
                : message || 'Pet Care Consultation';
            session = {
              sessionId: activeSessionId,
              title,
              petId: petProfileId || '',
              messages: [],
              lastActiveAt: new Date(),
            };
            userDoc.aiChatSessions.unshift(session);
          }

          session.messages.push({
            role: 'user',
            content: message,
            timestamp: new Date(),
            urgencyLevel: isEmergency ? 'emergency' : 'routine',
          });

          session.messages.push({
            role: 'model',
            content: responseText,
            timestamp: new Date(),
            urgencyLevel: isEmergency ? 'emergency' : 'routine',
          });

          session.lastActiveAt = new Date();
          session.petDraft = petDraft || null;

          // Auto-learn pet memory from turn
          if (!userDoc.aiMemory) {
            userDoc.aiMemory = {
              preferences: [],
              dietaryRestrictions: [],
              behavioralNotes: [],
              healthSummary: '',
              interactionFacts: {},
            };
          }

          const lower = message.toLowerCase();
          if (
            (lower.includes('allergic to') || lower.includes('allergy')) &&
            !userDoc.aiMemory.dietaryRestrictions.includes(message.trim())
          ) {
            userDoc.aiMemory.dietaryRestrictions.push(message.trim());
          }
          if (
            (lower.includes('loves') || lower.includes('favorite food')) &&
            !userDoc.aiMemory.preferences.includes(message.trim())
          ) {
            userDoc.aiMemory.preferences.push(message.trim());
          }
          if (
            (lower.includes('afraid of') ||
              lower.includes('scared of') ||
              lower.includes('anxious')) &&
            !userDoc.aiMemory.behavioralNotes.includes(message.trim())
          ) {
            userDoc.aiMemory.behavioralNotes.push(message.trim());
          }

          await userDoc.save();
        } catch (saveErr: any) {
          this.logger.warn(
            'Failed to persist AI chat session/memory:',
            saveErr?.message,
          );
        }
      }

      return {
        message: responseText,
        emergency: isEmergency,
        sessionId: activeSessionId,
        memorySnapshot: userDoc?.aiMemory,
        petCreated,
        petDraft,
      };
    } catch (err: any) {
      return {
        message:
          '🐾 Hey! I am here to help you and your pet. Feel free to tell me about your furry friend or ask anything about their daily care!',
        emergency: false,
        sessionId: activeSessionId,
      };
    }
  }

  async getUserSessions(userId: string) {
    if (!userId || userId === 'guest-anonymous') return [];
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user || !user.aiChatSessions) return [];
      return user.aiChatSessions.sort(
        (a, b) =>
          new Date(b.lastActiveAt).getTime() -
          new Date(a.lastActiveAt).getTime(),
      );
    } catch {
      return [];
    }
  }

  async getSessionMessages(userId: string, sessionId: string) {
    if (!userId || userId === 'guest-anonymous') return null;
    try {
      const user = await this.userModel.findById(userId).exec();
      const session = user?.aiChatSessions?.find(
        (s) => s.sessionId === sessionId,
      );
      return session || null;
    } catch {
      return null;
    }
  }

  async deleteSession(userId: string, sessionId: string) {
    if (!userId || userId === 'guest-anonymous') return { success: false };
    try {
      await this.userModel.updateOne(
        { _id: userId },
        { $pull: { aiChatSessions: { sessionId } } },
      );
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  async getPetMemory(userId: string) {
    if (!userId || userId === 'guest-anonymous') return null;
    try {
      const user = await this.userModel.findById(userId).exec();
      return user?.aiMemory || null;
    } catch {
      return null;
    }
  }

  async updatePetMemory(userId: string, memoryUpdate: any) {
    if (!userId || userId === 'guest-anonymous') return null;
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user) return null;
      user.aiMemory = {
        ...user.aiMemory,
        ...memoryUpdate,
      };
      await user.save();
      return user.aiMemory;
    } catch {
      return null;
    }
  }

  private generateSmartDiagnosticResponse(message: string): {
    message: string;
    emergency: boolean;
  } {
    const text = message.toLowerCase();
    const isHebrew = /[\u0590-\u05FF]/.test(message);

    if (
      text.includes('food') ||
      text.includes('diet') ||
      text.includes('אוכל') ||
      text.includes('מזון')
    ) {
      return {
        message: isHebrew
          ? `היי! כשמדובר באוכל, לשמור על תזונה פשוטה ואיכותית זה הדבר הכי חשוב 🍖 לגורים כדאי לתת מזון עתיר חלבון ושומן בריא כדי לתמוך בגדילה, ולבוגרים מנות קבועות פעמיים ביום. הכי חשוב להרחיק שוקולד, ענבים, בצל, שום ועצמות מבושלות. מחפש המלצה מיוחדת לגיל או גזע מסוים?`
          : `Hey! When it comes to feeding, keeping things simple and wholesome makes all the difference 🍖 For puppies and kittens, high-protein growth food gives them all that growing energy, while adults do best with balanced portions twice a day. Just keep chocolate, grapes, onions, garlic, and cooked bones well out of their reach! Are you looking for tips for a specific pet or food type?`,
        emergency: false,
      };
    }

    if (
      text.includes('rash') ||
      text.includes('itch') ||
      text.includes('scratch') ||
      text.includes('גרד') ||
      text.includes('עור')
    ) {
      return {
        message: isHebrew
          ? `מבאס מאוד לראות אותם מתגרדים! 🐾 לרוב מדובר בפרעושים קטנים, אלרגיה עונתית לפריחה או רגישות לעוף במזון. סירוק במסרק צפוף או שטיפה במים פושרים יכולים להקל. אם האזור נהיה אדום וחם או שיש פצע, כדאי שווטרינר יעיף מבט קצר בקליניקה כדי לתת לו משהו מרגיע. כמה זמן הוא כבר מתגרד?`
          : `It's always tough seeing our buddies itchy! 🐾 Most of the time it's either seasonal pollen, a pesky flea, or a mild food sensitivity (like chicken protein). A gentle oatmeal wash or checking with a flea comb can bring some fast comfort. If the spot is red, warm to the touch, or losing fur, having your local vet take a quick look in clinic is the best way to get them relief. How long has your pet been scratching?`,
        emergency: false,
      };
    }

    return {
      message: isHebrew
        ? `היי! 🐾 אני כאן בשבילך ובשביל החיה שלך. אפשר לספר לי על חיית המחמד שלך כדי שנקים לה דרכון בריאות ב-PetSOS, או סתם לקשקש על הרגלים, טיפים יומיים וצעצועים. מה שלומכם היום?`
        : `Hey! 🐾 I'm here for you and your animal buddy. You can tell me about your pet so we can set up their official PetSOS Passport right here, or chat about daily habits, wholesome food, and training tips. What's on your mind today?`,
      emergency: false,
    };
  }
}
