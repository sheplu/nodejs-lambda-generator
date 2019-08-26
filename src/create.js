import * as fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import chalk from 'chalk';
import Listr from 'listr';
import ncp from 'ncp';
import { projectInstall } from 'pkg-install';


const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplateFiles(templateDir, options) {
  const folder = `/${options.name}`
  return copy(templateDir, `${process.cwd()}${folder}`, {
    clobber: false,
  });
}

async function createDirectory(path) {
  return fs.mkdirSync(path)
}

export async function createProject(conf, options) {
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

    let folderPath;
    if(options.folder) {
      folderPath = `${process.cwd()}${options.name}`;
    }
    else {
      folderPath = process.cwd();
    }

    console.log(folderPath)

    const createFolder = {
      title: 'Creating folder',
      task: () => createDirectory(folderPath),
    };

    const copyFiles = {
      title: 'Copy project files',
      task: () => copyTemplateFiles(templateDir, options),
    };

    const installDeps = {
      title: 'Install dependencies',
      task: () => projectInstall({ cwd: folderPath, }),
    };

    const tasks = new Listr(
      [],
      {
        exitOnError: false,
      }
    );

    if (options.folder) {
      tasks.add(createFolder);
    }
    tasks.add(copyFiles);
    tasks.add(installDeps)

    await tasks.run();
    console.log('%s Project ready', chalk.green.bold('DONE'));

    return true;
  }