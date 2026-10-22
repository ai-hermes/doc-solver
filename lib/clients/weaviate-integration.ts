import pkg from '../../package.json';

// Weaviate (>= 1.38) reads this header to attribute requests to the integration that sent them.
const version = typeof pkg.version === 'string' && pkg.version ? pkg.version : 'unknown';

export const weaviateIntegrationHeaders: Record<string, string> = {
    'X-Weaviate-Client-Integration': `doc-solver/${version}`,
};
