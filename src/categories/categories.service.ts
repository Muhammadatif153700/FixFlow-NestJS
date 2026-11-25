import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FIXFLOW_STORE } from '../storage/storage.token';
import type { FixFlowStore, Category } from '../storage/storage.interface';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@Inject(FIXFLOW_STORE) private store: FixFlowStore) {}

  findAllActive() {
    return this.store.categories.filter(c => c.active);
  }

  create(dto: CreateCategoryDto) {
    const exists = this.store.categories.find(c => c.name.toLowerCase() === dto.name.toLowerCase());
    if (exists) throw new ConflictException('Category name already exists');

    const newCategory: Category = {
      id: this.store.nextId.category++,
      name: dto.name,
      description: dto.description,
      active: true,
    };
    this.store.categories.push(newCategory);
    return newCategory;
  }

  update(id: number, dto: UpdateCategoryDto) {
    const category = this.store.categories.find(c => c.id === id);
    if (!category) throw new NotFoundException('Category not found');

    if (dto.name && dto.name.toLowerCase() !== category.name.toLowerCase()) {
      const exists = this.store.categories.find(c => c.name.toLowerCase() === dto.name!.toLowerCase());
      if (exists) throw new ConflictException('Category name already exists');
    }

    Object.assign(category, dto);
    return category;
  }
}