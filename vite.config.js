import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const pages = {"tous":{"outputDir":"./tous","lang":"fr","title":"De Saison","cacheVersion":15,"meta":[{"name":"title","content":"De Saison"},{"name":"description","content":"Quels sont les fruits et légumes à consommer ce mois-ci ?"},{"name":"image","content":"/images/Fraise.webp?_wwcv=15"},{"itemprop":"name","content":"De Saison"},{"itemprop":"description","content":"Quels sont les fruits et légumes à consommer ce mois-ci ?"},{"itemprop":"image","content":"/images/Fraise.webp?_wwcv=15"},{"name":"twitter:card","content":"summary"},{"name":"twitter:title","content":"De Saison"},{"name":"twitter:description","content":"Quels sont les fruits et légumes à consommer ce mois-ci ?"},{"name":"twitter:image","content":"/images/Fraise.webp?_wwcv=15"},{"property":"og:title","content":"De Saison"},{"property":"og:description","content":"Quels sont les fruits et légumes à consommer ce mois-ci ?"},{"property":"og:image","content":"/images/Fraise.webp?_wwcv=15"},{"property":"og:site_name","content":"De Saison"},{"property":"og:type","content":"website"},{"name":"robots","content":"index, follow"}],"scripts":{"head":"\n","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://e12c57ab-3173-43de-ab81-f6db6c16be1d.weweb-preview.io/tous/"},{"rel":"alternate","hreflang":"fr","href":"https://e12c57ab-3173-43de-ab81-f6db6c16be1d.weweb-preview.io/tous/"}]},"index":{"outputDir":"./","lang":"fr","title":"De Saison","cacheVersion":15,"meta":[{"name":"title","content":"De Saison"},{"name":"description","content":"Quels sont les fruits et légumes à consommer ce mois-ci ?"},{"name":"image","content":"/images/Fraise.webp?_wwcv=15"},{"itemprop":"name","content":"De Saison"},{"itemprop":"description","content":"Quels sont les fruits et légumes à consommer ce mois-ci ?"},{"itemprop":"image","content":"/images/Fraise.webp?_wwcv=15"},{"name":"twitter:card","content":"summary"},{"name":"twitter:title","content":"De Saison"},{"name":"twitter:description","content":"Quels sont les fruits et légumes à consommer ce mois-ci ?"},{"name":"twitter:image","content":"/images/Fraise.webp?_wwcv=15"},{"property":"og:title","content":"De Saison"},{"property":"og:description","content":"Quels sont les fruits et légumes à consommer ce mois-ci ?"},{"property":"og:image","content":"/images/Fraise.webp?_wwcv=15"},{"property":"og:site_name","content":"De Saison"},{"property":"og:type","content":"website"},{"name":"robots","content":"index, follow"}],"scripts":{"head":"\n","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://e12c57ab-3173-43de-ab81-f6db6c16be1d.weweb-preview.io/"},{"rel":"alternate","hreflang":"fr","href":"https://e12c57ab-3173-43de-ab81-f6db6c16be1d.weweb-preview.io/"}]}};

// Read the main HTML template
const template = fs.readFileSync(path.resolve(__dirname, 'template.html'), 'utf-8');
const compiledTemplate = handlebars.compile(template);

// Generate an HTML file for each page with its metadata
Object.values(pages).forEach(pageConfig => {
    // Compile the template with page metadata
    const html = compiledTemplate({
        title: pageConfig.title,
        lang: pageConfig.lang,
        meta: pageConfig.meta,
        scripts: {
            head: pageConfig.scripts.head,
            body: pageConfig.scripts.body,
        },
        alternateLinks: pageConfig.alternateLinks,
        cacheVersion: pageConfig.cacheVersion,
        baseTag: pageConfig.baseTag,
    });

    // Save output html for each page
    if (!fs.existsSync(pageConfig.outputDir)) {
        fs.mkdirSync(pageConfig.outputDir, { recursive: true });
    }
    fs.writeFileSync(`${pageConfig.outputDir}/index.html`, html);
});

const rollupOptionsInput = {};
for (const pageName in pages) {
    rollupOptionsInput[pageName] = path.resolve(__dirname, pages[pageName].outputDir, 'index.html');
}

export default defineConfig(() => {
    return {
        plugins: [nodePolyfills({ include: ['events', 'stream', 'string_decoder'] }), vue()],
        base: "/",
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler',
                },
            },
            postcss: {
                plugins: [autoprefixer],
            },
        },
        build: {
            chunkSizeWarningLimit: 10000,
            rollupOptions: {
                input: rollupOptionsInput,
                onwarn: (entry, next) => {
                    if (entry.loc?.file && /js$/.test(entry.loc.file) && /Use of eval in/.test(entry.message)) return;
                    return next(entry);
                },
                maxParallelFileOps: 900,
            },
        },
        logLevel: 'warn',
    };
});
