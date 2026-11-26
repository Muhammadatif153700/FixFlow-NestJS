import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from '../src/categories/categories.service';
import { FIXFLOW_STORE } from '../src/storage/storage.token';
import { buildSeedStore } from '../src/storage/seed';

describe('Storage Replacement Demo', () => {
  let categoriesService: CategoriesService;

  beforeEach(async () => {
    // 1. Create a fake implementation of the store
    const fakeStore = {
      users: [],
      categories: [{ id: 99, name: 'Fake Category', description: 'This is a fake description', active: true }],
      requests: [],
      history: [],
      feedback: [],
      nextId: { user: 1, category: 100, request: 1, history: 1, feedback: 1 },
    };

    // 2. Set up the module, but override the FIXFLOW_STORE token
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: FIXFLOW_STORE,
          useValue: fakeStore, // <-- Replacing the real storage with our fake one
        },
      ],
    }).compile();

    categoriesService = module.get<CategoriesService>(CategoriesService);
  });

  it('should use the fake store without changing business code', () => {
    const activeCategories = categoriesService.findAllActive();
    
    // It should return the fake category we injected, not the seeded ones
    expect(activeCategories.length).toBe(1);
    expect(activeCategories[0].name).toBe('Fake Category');
  });
});