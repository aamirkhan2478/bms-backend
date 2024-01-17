import chalk from "chalk";
import mongoose from "mongoose";

async function main() {
  const DB = process.env.MONGO_URL;
  try {
    await mongoose.connect(DB);
    console.log(chalk.bold.greenBright("Connection Successfully"));
  } catch (error) {
    console.log(chalk.bold.redBright(error));
    console.log(chalk.bold.redBright("Connection Error"));
  }
}

export default main;