import {
	GarnishStyles,
	GlassPreparationModes,
	IceKinds,
	Intensities,
	RecipeLists,
	RimCoverages,
	StrainKinds,
} from '@/core/drinks/modules/preparation/constants/technique.constants';

export type IceKind = (typeof IceKinds)[keyof typeof IceKinds];
export type Intensity = (typeof Intensities)[keyof typeof Intensities];
export type StrainKind = (typeof StrainKinds)[keyof typeof StrainKinds];
export type GarnishStyle = (typeof GarnishStyles)[keyof typeof GarnishStyles];
export type GlassPreparationMode = (typeof GlassPreparationModes)[keyof typeof GlassPreparationModes];
export type RimCoverage = (typeof RimCoverages)[keyof typeof RimCoverages];
export type RecipeList = (typeof RecipeLists)[keyof typeof RecipeLists];
