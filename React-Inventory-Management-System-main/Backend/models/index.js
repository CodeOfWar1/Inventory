const mongoose = require("mongoose");
const dns = require("dns");

const DEFAULT_URI =
  "mongodb+srv://adminhamza:adminhamza123%26@cluster0.pzcviot.mongodb.net/InventoryManagementApp?retryWrites=true&w=majority";

async function main() {
  const uri = process.env.MONGO_URI || DEFAULT_URI;
  const dnsServers = (process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (dnsServers.length > 0) {
    dns.setServers(dnsServers);
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.log("MongoDB connection error:", err.message);
  }
}

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = { main, isDbConnected };