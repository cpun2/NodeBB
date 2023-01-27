import nconf from 'nconf';
import chalk from 'chalk';
import * as packageInstall from './package-install';
import { upgradePlugins } from './upgrade-plugins';

const steps: { [key: string]: upgradePlugins } = {
    package: {
        message: 'Updating package.json file with defaults...',
        handler: function () {
            packageInstall.updatePackageFile();
            packageInstall.preserveExtraneousPlugins();
            process.stdout.write(chalk.green(' OK\n'));
        },
    },
    install: {
        message: 'Bringing base dependencies up to date...',
        handler: function () {
            process.stdout.write(chalk.green(' started\n'));
            packageInstall.installAll();
        },
    },
    plugins: {
        message: 'Checking installed plugins for updates...',
        handler: async function () {
            // await import('../database').then(mod => mod.init());
            await upgradePlugins();
        },
    },
    schema: {
        message: 'Updating NodeBB data store schema...',
        handler: async function () {
            // await import('../database').then(mod => mod.init());
            // await import('../meta').then(mod => mod.configs.init());
            // await import('../upgrade').then(mod => mod.run());
        },
    },
    build: {
        message: 'Rebuilding assets...',
        handler: async function () {
            await import('../meta/build').then(mod => mod.buildAll());
        },
    },
};

async function runSteps(tasks: string[]) {
/*     try { */
    for (let i = 0; i < tasks.length; i++) {
        /* const step = steps[tasks[i]];
        const m = step.message; */
        if (steps[tasks[i]] /* && m && step.handler */) {
            process.stdout.write(`\n${chalk.bold(`${i + 1}. `)}`);
            /* eslint-disable-next-line */
            await steps[tasks[i]].handler();
        }
    }
    const message = 'NodeBB Upgrade Complete!';
    // some consoles will return undefined/zero columns,
    // so just use 2 spaces in upgrade script if we can't get our column count
    const { columns } = process.stdout;
    const spaces = columns ? new Array(Math.floor(columns / 2) - (message.length / 2) + 1).join(' ') : ' ';
    console.log(`\n\n${spaces}${chalk.green.bold(message)}\n`);
    process.exit();
/*     } catch (err) {
        //console.error(`Error occurred during upgrade: ${err.stack}`);
        throw err;
    } */
}

export default async function
runUpgrade(upgrades: string[] | boolean, options: { [key: string]: upgradePlugins } = {}) {
    console.log(chalk.cyan('\nUpdating NodeBB...'));
    // disable mongo timeouts during upgrade
    nconf.set('mongo:options:socketTimeoutMS', 0);
    if (upgrades === true) {
        let tasks = Object.keys(steps);
        if (options.package || options.install ||
            options.plugins || options.schema || options.build) {
            tasks = tasks.filter(key => options[key]);
        }
        await runSteps(tasks);
        return;
    }
    // await require('../database').init();
    // await require('../meta').configs.init();
    // await require('../upgrade').runParticular(upgrades);
    process.exit(0);
}


