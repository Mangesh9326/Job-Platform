import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function parseResume(filePath) {
  return new Promise((resolve) => {
    // Make sure this points to the correct python file name
    const scriptPath = path.join(__dirname, "../python/parse_resume.py");

    execFile("python", [scriptPath, filePath], (err, stdout, stderr) => {
      
      // 1. Log stderr as warnings (don't return null yet!)
      if (stderr) {
        console.warn("🐍 Python Log:", stderr); 
      }

      // 2. Only fail if there is a system/execution error
      if (err) {
        console.error("❌ Python Execution Failed:", err);
        return resolve(null);
      }

      // 3. Parse the JSON result from stdout
      try {
        if (!stdout) throw new Error("Empty stdout");
        const data = JSON.parse(stdout);
        return resolve(data);
      } catch (e) {
        console.error("❌ Invalid JSON from Python:", e.message);
        console.error("Raw Stdout was:", stdout); // Helpful for debugging
        return resolve(null);
      }
    });
  });
}