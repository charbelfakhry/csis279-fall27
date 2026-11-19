import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { CategoriesRepository } from '../categories.repository.js';
import { CategoryType } from './category.type.js';

// one loader per request: every category asked for while resolving a query
// is fetched in a single SELECT ... WHERE id IN (...)
@Injectable({ scope: Scope.REQUEST })
export class CategoriesLoader extends DataLoader<number, CategoryType | null> {
  constructor(categoriesRepository: CategoriesRepository) {
    super(async (ids) => {
      const categories: CategoryType[] = await categoriesRepository.findByIds([...ids]);
      const byId = new Map(categories.map((category) => [category.id, category]));
      return ids.map((id) => byId.get(id) ?? null); // same order as the ids asked for
    });
  }
}
