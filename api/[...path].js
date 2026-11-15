import app from "../server/src/app.js";
import { connectDB } from "../server/src/config/db.js";

let databaseConnection;

export default async function handler(request, response) {
  try {
    databaseConnection ??= connectDB().catch((error) => {
      databaseConnection = undefined;
      throw error;
    });
    await databaseConnection;
    return app(request, response);
  } catch (error) {
    console.error("Wholesale API initialization failed:", error);
    return response.status(503).json({
      message: "The API is not configured. Check its database and server environment variables.",
    });
  }
}
