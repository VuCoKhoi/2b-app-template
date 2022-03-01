const addPrefix = (name) => {
  const prefix = `[2B-avara-boutique]`;
  return `${prefix}-${name}`;
};

module.exports = {
  apps: [
    {
      name: addPrefix("frontend"),
      cwd: "./frontend",
      append_env_to_name: false,
      script: "yarn start",
      instances: 1,
      autorestart: true,
      max_memory_restart: "1G",
      watch: ["./frontend"],
    },
    {
      name: addPrefix("backend"),
      cwd: "./backend",
      append_env_to_name: false,
      script: "yarn start",
      instances: 1,
      autorestart: true,
      max_memory_restart: "1G",
      watch: ["./backend"],
    },
    {
      name: addPrefix("crawl-product"),
      cwd: "./backend",
      append_env_to_name: false,
      script: "yarn start-product-crawl",
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M",
      watch: ["./backend"],
    },
    {
      name: addPrefix("crawl-order"),
      cwd: "./backend",
      append_env_to_name: false,
      script: "yarn start-order-crawl",
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M",
      watch: ["./backend"],
    },
    {
      name: addPrefix("crawl-inventory-item"),
      cwd: "./backend",
      append_env_to_name: false,
      script: "yarn start-inventory-item-crawl",
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M",
      watch: ["./backend"],
    },
    {
      name: addPrefix("proxy"),
      cwd: "./proxy",
      append_env_to_name: false,
      script: "yarn start",
      instances: 1,
      autorestart: true,
      max_memory_restart: "1G",
      watch: ["./proxy"],
    },
  ],

  deploy: {
    production: {
      user: "ubuntu",
      host: "52.54.53.127",
      ref: "origin/jobs/avara-boutique-app",
      repo: "git@github.com:VuCoKhoi/2b-app-template.git",
      path: "/home/ubuntu/avara-boutique-app",
      "post-deploy":
        "yarn start-setup && pm2 reload ecosystem.config.js --env production",
    },
  },
};
