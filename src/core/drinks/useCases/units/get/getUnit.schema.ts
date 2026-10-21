import { unitIdValidation } from '@/core/drinks/schemas/unit.schemas';
import { z } from 'zod/v4';

export const getUnitSchema = z.object({ id: unitIdValidation });
