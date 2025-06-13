module.exports = {
    apps: [
      {
        name: 'my-node-app',
        script: './server.js', 
        env: {
          NODE_ENV: 'development'
        },
        env_production: {
          NODE_ENV: 'production'
        }
      }
    ]
  };
  