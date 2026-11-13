/** A favorite is always the actor's own (the routes are under `/me`), so it has no conditional rules and no subject model. */
export type FavoriteSubject = ['create' | 'delete' | 'list' | 'manage', 'Favorite'];
