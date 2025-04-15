import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        host: '0.0.0.0', // 모든 네트워크 인터페이스에서 접근 가능
    port: 4173,
  },
	  logLevel: 'info' , // 또는 'debug',
	plugins: [sveltekit()],
	// vite.config.js
  optimizeDeps: {
    exclude: ['chunk-5NBDWHZT.js', 'chunk-RD6LQPS4.js', 'chunk-4Y3F4O2W.js']
  }


});


