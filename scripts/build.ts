import fs from 'fs-extra';
import logger from 'jet-logger';
import childProcess from 'child_process';


/**
 * Start
 */
(async () => {  try {
    // Remove current build
    await remove('./dist/');
    // Generate Prisma client before building
    await exec('npx prisma generate', './');
    await exec('tsc --build tsconfig.prod.json', './');
    // Copy    await copy('./src/public', './dist/public');
    await copy('./temp/config.js', './config.js');
    await copy('./temp/src', './dist');
    await copy('./prisma', './dist');
    
    // Make sure the generated Prisma files are copied correctly
    if (fs.existsSync('./src/generated/prisma')) {
      await fs.ensureDir('./dist/generated');
      await copy('./src/generated/prisma', './dist/generated/prisma');
    }
    
    // Also copy the .prisma runtime binaries if they exist
    if (fs.existsSync('./node_modules/.prisma')) {
      await fs.ensureDir('./dist/.prisma');
      await copy('./node_modules/.prisma', './dist/.prisma');
    }
    await remove('./temp/');
  } catch (err) {
    logger.err(err);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
})();

/**
 * Remove file
 */
function remove(loc: string): Promise<void> {
  return new Promise((res, rej) => {
    return fs.remove(loc, err => {
      return (!!err ? rej(err) : res());
    });
  });
}

/**
 * Copy file.
 */
function copy(src: string, dest: string): Promise<void> {
  return new Promise((res, rej) => {
    return fs.copy(src, dest, err => {
      return (!!err ? rej(err) : res());
    });
  });
}

/**
 * Do command line command.
 */
function exec(cmd: string, loc: string): Promise<void> {
  return new Promise((res, rej) => {
    return childProcess.exec(cmd, {cwd: loc}, (err, stdout, stderr) => {
      if (!!stdout) {
        logger.info(stdout);
      }
      if (!!stderr) {
        logger.warn(stderr);
      }
      return (!!err ? rej(err) : res());
    });
  });
}
