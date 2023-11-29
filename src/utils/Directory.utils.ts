import path from "path";
import fs from "fs";

export class DirectoryUtils {
  static createPathRecursively(dirPath) {
    const normalizedPath = path.normalize(dirPath);

    normalizedPath.split(path.sep).reduce((currentPath, folder) => {
      currentPath += folder + path.sep;
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath);
      }
      return currentPath;
    }, "");
  }

}
