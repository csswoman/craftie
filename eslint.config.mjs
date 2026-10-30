import { defineConfig, globalIgnores } from 'eslint/config';
import nextConfig from 'eslint-config-next';

export default defineConfig([...nextConfig, globalIgnores(['coverage/**'])]);
