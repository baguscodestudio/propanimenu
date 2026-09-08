import { mount } from 'svelte';
import './global.css';
import App from './App.svelte';
import { isEnvBrowser } from '$lib/misc';

if (isEnvBrowser()) {
    document.body.classList.add('bg-green-500');
}
const app = mount(App, {
    target: document.getElementById('app')!,
});

export default app;
