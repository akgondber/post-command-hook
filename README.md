# post-command-hook [![NPM version][npm-image]][npm-url]
> Run a command and then all registered hook(s).

## Installation

```sh
$ npm install --save post-command-hook
```

or

```sh
$ yarn add post-command-hook
```

## Usage

Let's suppose we want to add [esdoc](https://github.com/esdoc/esdoc) to our project, create config file and generate a documentation. To achieve that we could create a file `esdoc-setup.js` and use the following snippet:

```js
const PostCommandHook = require('post-command-hook');

const postCommandHook = new PostCommandHook({ command: 'npm', args: ['i', '--save-dev', 'esdoc', 'esdoc-standard-plugin'] });
postCommandHook.use(() => {
  require('fs').writeFile("./.esdoc.json", `{
    "source": "./lib",
    "destination": "./docs",
    "plugins": [{"name": "esdoc-standard-plugin"}]
  }`, (err) => {
    if (err) {
      console.log(err);
    }
  });
}).use({ command: './node_modules/.bin/esdoc' });

(async () => {
  await postCommandHook.run();
})();
```

and run it:

```shell
$ node esdoc-setup.js
```

## API

### new PostCommandHook(baseCommand, execaOptions)

Constructs an instance of PostCommandHook class providing `baseCommand` and `execaOptions`. The `baseCommand` is an object with the following keys:

#### baseCommand

Type: `object`

Base command to be issued. It must have required `command` key, `args` is optional one.

##### command
Type: `string`
Required: `true`

A command that should be issued.

##### args
Type: `array`

A command arguments to construct the whole command.

##### premessage
Type: `string`

A message to be displayed before execution of the specified command.

##### postmessage
Type: `string`

A message to be displayed after execution of the specified command.

#### execaOptions

Options to be used while executing a command. Default value is `{ stdio: "inherit" }`. See [execa](https://github.com/sindresorhus/execa) documentation for details.

### .use(plugin)

Registers specified plugin that will be issued after execution of the base command. Could be chained.

#### plugin
Type: `object`, `function` or an instance of class responding to `.run`.

### .setRunOnce(value)

Instructs to keep already performed commands in the registry and not to run them again. It allows you to add plugins and run them without executing previously issued commands.

##### value

Type: `boolean`

Whether to issue a commands which are previously have been executed.

### .run(options)

Executes the base command and then executes all registered plugins.

#### options

Type: `object`

##### skipErrors

Type: `boolean`

Instructs to not throw an error if any happens and silently skip it. Note that this option will not apply for base command execution hence if base command fails an error will be thrown.

## License

MIT © [Rushan Alyautdinov](https://github.com/akgondber)


[npm-image]: https://img.shields.io/npm/v/post-command-hook.svg?style=flat
[npm-url]: https://npmjs.org/package/post-command-hook
