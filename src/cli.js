// function overloadConfig
// function parseArgIntoOptions
// function askMissingOptions
//

import * as fs from 'fs';

import arg from 'arg';
import chalk from 'chalk';
import inquirer from 'inquirer';

import defaultConfig from './config';
import { createProject } from './create';
import { verifyProject } from './verify';

const cliLink = new URL(import.meta.url).pathname;

async function readConfig(link) {
  const rawdata = fs.readFileSync(link);
  const student = JSON.parse(rawdata);
  return student;
}

function parseArgs(rawArgs) {
  try {
    const args = arg(
      {
        '--create': Boolean,
        '--verify': Boolean,
        '-c': '--create',
        '-v': '--verify',
      },
      {
        argv: rawArgs.slice(2),
      }
    );

    return args
  } catch (error) {
    console.log(`%s ${error.message}`, chalk.red.bold('Error'));
    process.exit(1)
  }
}

function configAccess(file) {
  const url = new URL(import.meta.url).pathname.split('/');
  url[url.length-1] = file;

  return url.join('/')
}

async function promptForOptions(options) {
  console.log(options)
  const questions = [];
  questions.push({
    type: 'input',
    name: 'name',
    message: 'Please choose the name of your project',
  });

  questions.push({
    type: 'list',
    name: 'template',
    message: 'Please choose which project template to use',
    choices: ['amazon', 'google', 'microsoft', 'scalway'],
    default: 'amazon',
  });

  const answers = await inquirer.prompt(questions);
  console.log(answers)
  return answers;
}

export async function cli(args, config = 'config.json') {
  console.log('hello world');
  const configLink = configAccess(config);
  const conf = await readConfig(configLink);
  const mode = parseArgs(args);

  if(mode["--create"]) {
    console.log('create')
    const options = await promptForOptions();
    await createProject(conf.create, options);
  }
  else if(mode["--verify"]){
    console.log('verify')
    await verifyProject(conf.verify);
  }
  else {
    console.log('%s Unknow mode', chalk.red.bold('Error'));
    process.exit(1)
  }
  // overload config
  // parseArg
  // askMissing
  // createProject
};

