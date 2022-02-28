module.exports = {
  apps: [
    // {
    //   name: "frontend",
    //   cwd: "./frontend",
    //   append_env_to_name: false,
    //   script: "yarn start",
    //   instances: 1,
    //   autorestart: true,
    //   max_memory_restart: "1G",
    //   watch: ["./frontend"],
    // },
    // {
    //   name: "backend",
    //   cwd: "./backend",
    //   append_env_to_name: false,
    //   script: "yarn start",
    //   instances: 1,
    //   autorestart: true,
    //   max_memory_restart: "1G",
    //   watch: ["./backend"],
    // },
    {
      name: "crawl-product",
      cwd: "./backend",
      append_env_to_name: false,
      script: "yarn start-product-crawl",
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M",
      watch: ["./backend"],
    },
    {
      name: "crawl-order",
      cwd: "./backend",
      append_env_to_name: false,
      script: "yarn start-order-crawl",
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M",
      watch: ["./backend"],
    },
    {
      name: "crawl-inventory-item",
      cwd: "./backend",
      append_env_to_name: false,
      script: "yarn start-inventory-item-crawl",
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M",
      watch: ["./backend"],
    },
    // {
    //   name: "proxy",
    //   cwd: "./proxy",
    //   append_env_to_name: false,
    //   script: "yarn start",
    //   instances: 1,
    //   autorestart: true,
    //   max_memory_restart: "1G",
    //   watch: ["./proxy"],
    // },
  ],

  deploy: {
    production: {
      user: "SSH_USERNAME",
      host: "SSH_HOSTMACHINE",
      ref: "origin/master",
      repo: "GIT_REPOSITORY",
      path: "DESTINATION_PATH",
      "post-deploy":
        "yarn start-setup && pm2 reload ecosystem.config.js --env production",
    },
  },
};
