var config = {};

var env = process.env;
if (env.NODE_ENV === "production") {
   var useMemory = {
      "use_memory": true,
      "use_cache": false
   };
   var useMemoryAndCache = {
      "use_memory": true,
      "use_cache": true
   };
   // OpenShift config settings
   config = {
      "siteName": "PencilBlue on OpenShift",
      "siteRoot": "http://" + env.OPENSHIFT_GEAR_DNS,
      "siteIP": env.OPENSHIFT_NODEDIY_IP,
      "sitePort": env.OPENSHIFT_NODEDIY_PORT,
      "log_level": "info",
      "db": {
         "type": "mongo",
         "servers": [
            env.OPENSHIFT_MONGODB_DB_URL
         ],
         "name": env.OPENSHIFT_APP_NAME,
         "writeConcern": 1
      },
      "cache": {
         "fake": true,
         "host": "localhost",
         "port": 6379
      },
      "settings": useMemory,
      "templates": useMemory,
      "plugins": {
         "caching": useMemory
      }
   };
   if (env.OPENSHIFT_REDIS_DB_HOST || env.OPENSHIFT_REDIS_HOST) {
      // OpenShift Redis config
      // ENV vars will have REDIS_DB_* when the app is in a scaled environment
      config.cache = {
         "host": env.OPENSHIFT_REDIS_DB_HOST || env.OPENSHIFT_REDIS_HOST,
         "port": env.OPENSHIFT_REDIS_DB_PORT || env.OPENSHIFT_REDIS_PORT,
         "auth_pass": env.OPENSHIFT_REDIS_DB_PASSWORD || env.REDIS_PASSWORD
      };
      config.settings = useMemoryAndCache;
      config.templates = useMemoryAndCache;
      config.plugins.caching = useMemoryAndCache;
   }
   if (env.OPENSHIFT_HAPROXY_VERSION) {
      // Scaled application
      config.cluster = {
         "self_managed": false
      };
   }
} else {
   // local dev settings
   config = {
      "siteName": "PencilBlue Local",
      "siteRoot": "http://localhost:8080",
      "siteIP": "0.0.0.0",
      "sitePort": 8080,
      "log_level": "info",
      "db": {
         "type": "mongo",
         "servers": [
            "mongodb://localhost:27017/pencilblue/"
         ],
         "name": "pencilblue",
         "writeConcern": 1
      }
   }

}

module.exports = config;
