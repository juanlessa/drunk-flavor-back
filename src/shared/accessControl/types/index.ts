import { CanParameters, MongoAbility } from '@casl/ability';
import { UserSubject } from '../subjects/user';
import { CategorySubject } from '../subjects/category';
import { IngredientSubject } from '../subjects/ingredient';
import { DrinkSubject } from '../subjects/drink';
import { CommentSubject } from '../subjects/comment';
import { RatingSubject } from '../subjects/rating';
import { UnitSubject } from '../subjects/unit';

type AppAbilities =
	| UserSubject
	| CategorySubject
	| IngredientSubject
	| DrinkSubject
	| CommentSubject
	| RatingSubject
	| UnitSubject
	| ['manage', 'all'];

export type AppAbility = MongoAbility<AppAbilities>;

export type AppCanParameters = CanParameters<AppAbilities>;
