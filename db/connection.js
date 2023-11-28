const chalk = require("chalk");
const mongoose = require("mongoose");
const DB = process.env.MONGO_URL;

main()
  .then((_) => console.log(chalk.bold.greenBright("MongoDB Connected Successfully")))
  .catch((err) => console.log(chalk.bold.red(err)));

async function main() {
  await mongoose.connect(DB);
}
