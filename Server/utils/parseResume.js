import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function parseResume(filePath) {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, "../python/parse_resume.py");

    execFile("python", [scriptPath, filePath], (err, stdout, stderr) => {
      if (err || stderr) {
        console.error("Python Error:", stderr || err);
        return resolve(null);
      }

      try {
        return resolve(JSON.parse(stdout));
      } catch (e) {
        console.error("Invalid JSON from python:", stdout);
        return resolve(null);
      }
    });
  });
}
