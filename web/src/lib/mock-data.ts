import type { Animations, Props } from "$lib/types";

export const MOCK_ANIMATIONS: Animations = Array.from({ length: 200 }, (_, i) => [
	`anim_dict_${Math.floor(i / 10) + 1}`,
	`clip_action_${i + 1}`,
]);

export const MOCK_PROPS: Props = Array.from(
	{ length: 200 },
	(_, i) => `prop_object_model_${i + 1}`
);
