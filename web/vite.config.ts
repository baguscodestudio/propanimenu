import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { exec } from 'child_process';

const runPostProcess = () => {
    return {
        name: 'run-post-process',
        closeBundle() {
            exec('node post-process-css.mjs', (err, stdout) => {
                if (err) {
                    console.error('Error running post-process-css:', err);
                    return;
                }
                if (stdout) console.log(stdout.trim());
            });
        }
    };
};

// https://vite.dev/config/
export default defineConfig({
    plugins: [svelte(), tailwindcss(), runPostProcess()],
    resolve: {
        alias: {
            $lib: path.resolve('./src/lib'),
        },
    },
    base: './',
});
