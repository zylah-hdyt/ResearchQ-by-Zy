import {loadFont as anton} from '@remotion/google-fonts/Anton';
import {loadFont as caveat} from '@remotion/google-fonts/Caveat';
import {loadFont as instrument} from '@remotion/google-fonts/InstrumentSerif';
import {loadFont as inter} from '@remotion/google-fonts/Inter';
import {loadFont as interTight} from '@remotion/google-fonts/InterTight';
import {loadFont as jetbrains} from '@remotion/google-fonts/JetBrainsMono';
import {loadFont as playfair} from '@remotion/google-fonts/PlayfairDisplay';
import {loadFont as archivo} from '@remotion/google-fonts/ArchivoBlack';

const latin = {subsets: ['latin' as const]};

export const FONT = {
	anton: anton('normal', {...latin, weights: ['400']}).fontFamily,
	caveat: caveat('normal', {...latin, weights: ['600', '700']}).fontFamily,
	serif: instrument('normal', {...latin, weights: ['400']}).fontFamily,
	serifItalic: instrument('italic', {...latin, weights: ['400']}).fontFamily,
	inter: inter('normal', {...latin, weights: ['400', '500', '600', '700']}).fontFamily,
	tight: interTight('normal', {...latin, weights: ['300', '500', '600', '800']}).fontFamily,
	mono: jetbrains('normal', {...latin, weights: ['400', '500', '700']}).fontFamily,
	playfair: playfair('italic', {...latin, weights: ['400', '600']}).fontFamily,
	playfairRoman: playfair('normal', {...latin, weights: ['600', '800']}).fontFamily,
	archivo: archivo('normal', {...latin, weights: ['400']}).fontFamily,
};
