# post-command-hook
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
}).use({ command: './node_modules/.bin/esdoc' }).run();
```

## API

### new PostCommandHook(baseCommand)

Constructs an instance of PostCommandHook class providing `baseCommand` as an argument. The `baseCommand` is an object with the following keys:

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

### .use(plugin)

Registers specified plugin that will be issued after execution of the base command. Could be chained.

#### plugin
Type: `object`, `function` or an instance of class responding to `.run`.

### .run(options)

Executes the base command and then executes all registered plugins.

#### options

Type: `object`

##### skipErrors

Type: `boolean`

Instructs to not throw an error if any happens and silently skip it.

## License

MIT © [Rushan Alyautdinov](https://github.com/akgondber)
