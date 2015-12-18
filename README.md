# React Render Server
A least opinionated render-server using React [universally](https://medium.com/@mjackson/universal-javascript-4761051b7ae9).

> This project is heavily based on [@erikras](https://github.com/erikras/react-redux-universal-hot-example)\`s,
> but using just few tools and dealing only with the front-end on both server and client.

## Styles and Assets Management
Any asset must be imported directly to the javascript file which is going to need it.
The imports results in the URL of the asset, or, for styles, the local classes.

For more information, read [CSS-Modules](https://github.com/css-modules/css-modules).


## Installation
```sh
npm install
```

## Development
```sh
npm run dev
```
It starts both server on development and client watcher.

> The first time it may take a little while to generate the first webpack-assets.json and complain with a few dozen [webpack-isomorphic-tools] (waiting for the first Webpack build to finish) printouts, but be patient. Give it 30 seconds.

## Production
```sh
npm run build
npm run start
```

project.
