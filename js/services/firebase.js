import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";
import { config } from "../config/config.js";

const app = initializeApp(config.firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
