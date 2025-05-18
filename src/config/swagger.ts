import swaggerJsDoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';

// Load version from package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'),
);
const version = packageJson.version;

// Swagger definition
const swaggerOptions: swaggerJsDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LocationSearch API' as string,
      version: version as string,
      description: 'A location search service API' as string,
      contact: {
        name: 'API Support' as string,
      },
    },
    servers: [
      {
        url: '/',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
          },
        },
        ValidationErrors: {
          type: 'object',
          properties: {
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                  },
                  value: {
                    type: 'string',
                  },
                  msg: {
                    type: 'string',
                  },
                  path: {
                    type: 'string',
                  },
                  location: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/**/*.ts',
    './src/dtos/*.ts',
  ],
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

export default swaggerSpec;