import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { PetProfileService } from '../pet-profile/pet-profile.service';

describe('ChatService — Emergency Triage & AI Guardrails', () => {
  let service: ChatService;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'GEMINI_API_KEY') return 'mock-gemini-key';
      return null;
    }),
  };

  const mockPetProfileService = {
    findAll: jest.fn().mockResolvedValue([
      { name: 'Buddy', species: 'Dog', breed: 'Golden Retriever', age: 3, allergies: ['Chicken'] },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PetProfileService, useValue: mockPetProfileService },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Multilingual Emergency Triage', () => {
    it('should detect English life-threatening emergency keyword (vomiting blood)', async () => {
      const res = await service.processMessage('My dog is vomiting blood and breathing fast', []);
      expect(res.emergency).toBe(true);
      expect(res.message).toContain('🚨 Potential emergency detected');
    });

    it('should detect Hebrew emergency keyword (דימום קשה / מורעל)', async () => {
      const res = await service.processMessage('הכלב שלי אכל שוקולד ויש לו דימום קשה', []);
      expect(res.emergency).toBe(true);
      expect(res.message).toContain('🚨 זוהה מצב חירום');
    });

    it('should detect Arabic emergency keyword (تسمم / نزيف شديد)', async () => {
      const res = await service.processMessage('كلبي يعاني من تسمم ونزيف شديد', []);
      expect(res.emergency).toBe(true);
      expect(res.message).toContain('🚨 تم اكتشاف حالة طوارئ');
    });

    it('should safely provide advice for non-emergency diet queries', async () => {
      const res = await service.processMessage('What is the best food diet for my golden retriever?', []);
      expect(res.emergency).toBe(false);
      expect(res.message).toContain('Pet Nutrition');
    });

    it('should provide skin & itching advice for allergy queries', async () => {
      const res = await service.processMessage('My dog has an itchy rash and keeps scratching', []);
      expect(res.emergency).toBe(false);
      expect(res.message).toContain('Skin & Itching');
    });
  });
});
