const esbuild = require('esbuild');
esbuild.buildSync({
  entryPoints: ['src/App.tsx'],
  outfile: 'out.js',
  logLevel: 'error'
});
