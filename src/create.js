import * as fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import chalk from 'chalk';
import Listr from 'listr';
import ncp from 'ncp';
import { projectInstall } from 'pkg-install';


const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplateFiles(templateDir) {
  return copy(templateDir, process.cwd(), {
    clobber: false,
  });
}

export async function createProject(options) {
    const templateDir = path.resolve(
      new URL(import.meta.url).pathname,
      `../../templates/${options.template}`,
    );

    try {
      await access(templateDir, fs.constants.R_OK);
    } catch (err) {
      console.error('%s Invalid template name', chalk.red.bold('ERROR'));
      process.exit(1);
    }

    const tasks = new Listr(
      [
        {
          title: 'Copy project files',
          task: () => copyTemplateFiles(templateDir),
        },
        {
          title: 'Install dependencies',
          task: () => projectInstall({ cwd: process.cwd(), }),
        },
      ],
      {
        exitOnError: false,
      }
    );

    await tasks.run();
    console.log('%s Project ready', chalk.green.bold('DONE'));

    return true;
  }