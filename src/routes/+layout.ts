import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { browser } from '$app/environment';

///////////////////////////////
export const prerender = true;
//////////////////////////////

export const load = ({ url }) => {
	if (browser && url.pathname !== resolve('/')) {
		goto(resolve('/'), { replaceState: true });
	}
};
