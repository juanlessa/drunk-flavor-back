import { DrinkPermissionModel } from '../entities/drink';

export type DrinkSubject = ['create' | 'delete' | 'list' | 'get' | 'update' | 'manage', 'Drink' | DrinkPermissionModel];
