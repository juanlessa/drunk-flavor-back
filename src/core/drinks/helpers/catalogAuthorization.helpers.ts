import { defineAbilityFor } from '@/shared/accessControl';
import { Actor } from '@/shared/accessControl/actor.types';
import { categoryPermissionSchema } from '@/shared/accessControl/entities/category';
import { drinkPermissionSchema } from '@/shared/accessControl/entities/drink';
import { ingredientPermissionSchema } from '@/shared/accessControl/entities/ingredient';
import { unitPermissionSchema } from '@/shared/accessControl/entities/unit';
import { userPermissionSchema } from '@/shared/accessControl/entities/user';
import { ForbiddenError } from '@/shared/error/error.lib';

type CatalogRecord = { id: string; createdBy?: string };
export type CatalogChange = 'update' | 'delete';

const toUserPermission = (actor: Actor) => userPermissionSchema.parse({ id: actor.id, role: actor.role });

/**
 * The permission check of one record, which the route middleware cannot do because it does not know the record:
 * a partner changes only what they created, an admin and the owner change anything.
 */
export const assertCanChangeUnit = (action: CatalogChange, unit: CatalogRecord, actor: Actor, path: string): void => {
	const subject = unitPermissionSchema.parse({ id: unit.id, createdBy: unit.createdBy });
	if (defineAbilityFor(toUserPermission(actor)).cannot(action, subject)) throw forbidden(path);
};

export const assertCanChangeCategory = (
	action: CatalogChange,
	category: CatalogRecord,
	actor: Actor,
	path: string,
): void => {
	const subject = categoryPermissionSchema.parse({ id: category.id, createdBy: category.createdBy });
	if (defineAbilityFor(toUserPermission(actor)).cannot(action, subject)) throw forbidden(path);
};

export const assertCanChangeIngredient = (
	action: CatalogChange,
	ingredient: CatalogRecord,
	actor: Actor,
	path: string,
): void => {
	const subject = ingredientPermissionSchema.parse({ id: ingredient.id, createdBy: ingredient.createdBy });
	if (defineAbilityFor(toUserPermission(actor)).cannot(action, subject)) throw forbidden(path);
};

export const assertCanChangeDrink = (action: CatalogChange, drink: CatalogRecord, actor: Actor, path: string): void => {
	const subject = drinkPermissionSchema.parse({ id: drink.id, createdBy: drink.createdBy });
	if (defineAbilityFor(toUserPermission(actor)).cannot(action, subject)) throw forbidden(path);
};

const forbidden = (path: string) => new ForbiddenError('apiResponses.auth.insufficientPermissions', { path });
