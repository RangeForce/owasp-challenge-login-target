const Hapi = require('@hapi/hapi');
const Iron = require('@hapi/iron');
const Joi = require('@hapi/joi');

const auth = require('./services/auth');

async function init() {
  const server = new Hapi.Server({  
    host: '0.0.0.0',
    port: 3000,
    routes: {
        cors: {
            origin: ['*'], 
            headers: ['Authorization'], 
            exposedHeaders: ['Accept'], 
            maxAge: 60,
        }
    }
  });

  server.route({  
    method: 'GET',
    path: '/me',
    handler: async (request, h) => {
      const credentials = await auth.get_credentials(request.headers.authorization);

      if (!credentials) {
        return h.response('Not authenticated.\n').code(403);
      } 
      return h.response(credentials);
    },
    options: {
      validate: {
        headers: Joi.object({
            authorization: Joi.string().required()
        }),
        options: {
            allowUnknown: true
        }
      }
    }
  });

  server.route({  
    method: 'POST',
    path: '/login',
    handler: async (request, h) => {
      let sealed_credentials;
      try {
        sealed_credentials = await auth.authenticate(request.payload.username, request.payload.password);
      } catch (err) {
        return h.response(`Internal server error: ${err.message}`).code(500);
      }

      if (!sealed_credentials) {
        return h.response('Invalid credentials.\n').code(403);
      }

      return h.response(sealed_credentials);
    },
    options: {
      validate: {
        payload: Joi.object({
          username: Joi.string().required(),
          password: Joi.string().required()
        })
      }
    }
  });

  server.route({  
    method: 'GET',
    path: '/flag',
    handler: async (request, h) => {
      const credentials = await auth.get_credentials(request.headers.authorization);
      console.log(credentials);

      if (!credentials) {
        return h.response('Not authenticated.\n').code(403);
      } 

      if (credentials.role != 'admin') {
        return h.response(`Insufficient permissions.\n`).code(403);
      }
      const flag = process.env.FLAG;

      return h.response(`${flag}\n`);
    },
    options: {
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required()
        }),
        options: {
          allowUnknown: true,
        }
      }
    }

  });

  await server.start();
  console.log('server running on port 3000');
}

init();

