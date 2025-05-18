import fs from 'fs-extra';
import logger from 'jet-logger';
import childProcess from 'child_process';


/**
 * Start
 */
(async () => {  try {    // Remove current build
    await remove('./dist/');
    // Generate Prisma client before building with explicit env file
    await exec('dotenv -e ./config/.env.production -- npx prisma generate', './');
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
      // Copy environment files for runtime use
    if (fs.existsSync('./config/.env.production')) {
      await fs.ensureDir('./dist/config');
      await copy('./config/.env.production', './dist/config/.env.production');
    }
    
    // Also copy the .prisma runtime binaries if they exist
    if (fs.existsSync('./node_modules/.prisma')) {
      await fs.ensureDir('./dist/.prisma');
      await copy('./node_modules/.prisma', './dist/.prisma');
    }
    
    // Create necessary view directories and files that may not exist in source
    await fs.ensureDir('./dist/views');
    if (!fs.existsSync('./dist/views/users.html')) {
      // Create a simple placeholder HTML file
      fs.writeFileSync('./dist/views/users.html', `
        <!DOCTYPE html>
        <html>
        <head>
          <title>LocationSearch - Users</title>
        </head>
        <body>
          <h1>LocationSearch API</h1>
          <p>Please use our API documentation to access services</p>
          <a href="/api/docs">API Documentation</a>
        </body>
        </html>
      `);
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
