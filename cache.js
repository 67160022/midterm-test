// redis client — เชื่อมต่อไว้ให้แล้ว พร้อมใช้งาน ไม่ต้องแก้ไข
const { createClient } = require("redis");
const { redisUrl } = require("./config");

const redisClient = createClient({ url: redisUrl });
redisClient.on("error", (err) => console.error("Redis error:", err.message));

async function connectRedis() {
  if (!redisClient.isOpen) await redisClient.connect();
}

module.exports = { redisClient, connectRedis };
