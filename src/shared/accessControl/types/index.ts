import { CanParameters, MongoAbility } from '@casl/ability';
import { UserSubject } from '../subjects/user';
import { CategorySubject } from '../subjects/category';
import { IngredientSubject } from '../subjects/ingredient';
import { DrinkSubject } from '../subjects/drink';
import { CommentSubject } from '../subjects/coment';

type AppAbilities =
	| UserSubject
	| CategorySubject
	| IngredientSubject
	| DrinkSubject
	| CommentSubject
	| ['manage', 'all'];

export type AppAbility = MongoAbility<AppAbilities>;

export type AppCanParameters = CanParameters<AppAbilities>;
