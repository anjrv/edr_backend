import { access, readFile as fsReadFile } from 'fs/promises'; // eslint-disable-line import/no-unresolved
import fs from 'fs';

/**
 * Helper function to check read permissions of a directory
 *
 * @param {string} dir directory path
 * @returns true/false
 */
export async function isReadable(dir) {
  let readable = true;
  try {
    await access(dir, fs.constants.R_OK);
  } catch (err) {
    readable = false;
  }

  return readable;
}

/**
 * Function to fetch the contents of a file as a string
 *
 * @param {string} file file path
 * @param {string} encoding encoding of the file
 * @returns content of the file transformed to a string value
 */
export async function readFile(file, encoding = 'utf8') {
  if (!(await isReadable(file))) {
    return null;
  }

  const content = await fsReadFile(file);

  if (!encoding) {
    return content;
  }

  return content.toString(encoding);
}
