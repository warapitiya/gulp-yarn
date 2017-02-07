<p align="center">
  <a href="https://github.com/warapitiya/gulp-yarn">
    <img alt="Gulp-Yarn" src="https://github.com/warapitiya/assets/blob/master/gulp-yarn.png?raw=true" width="546">
  </a>
</p>

<p align="center">
  Automatically install yarn packages/dependencies.
</p>
<p  align="center">
Because we <img alt="emoji=heart" src="https://github.com/warapitiya/assets/blob/master/heart-emoji.png?raw=true" width="15"> Yarn!</p>

<p align="center">
  <a href="https://travis-ci.org/warapitiya/gulp-yarn"><img alt="Travis Status" src="https://travis-ci.org/warapitiya/gulp-yarn.svg?branch=master"></a>
  <a href='https://coveralls.io/github/warapitiya/gulp-yarn?branch=master'><img src='https://coveralls.io/repos/github/warapitiya/gulp-yarn/badge.svg?branch=master' alt='Coverage Status' /></a>
  <a href="https://www.npmjs.com/package/gulp-yarn"><img src="https://img.shields.io/npm/v/gulp-yarn.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/gulp-yarn"><img src="https://img.shields.io/npm/dt/gulp-yarn.svg" alt="npm downloads"></a>
  <a href="https://github.com/sindresorhus/xo"><img src="https://img.shields.io/badge/code_style-XO-5ed9c7.svg" alt="xo"></a>
</p>

---

## Installing Gulp-Yarn
Install `gulp-yarn` as a development dependency:

```sh
npm install gulp-yarn --save-dev
```

or

```sh
yarn add gulp-yarn --dev
```


## Using Gulp-Yarn

**Basic:** Better performance when in same directory.

```javascript
var yarn = require('gulp-yarn');

gulp.src(['./package.json'])
    .pipe(yarn());
```

**Move:** Remember to include `yarn.lock` file.

```javascript
var yarn = require('gulp-yarn');

gulp.src(['./package.json', './yarn.lock'])
    .pipe(gulp.dest('./dist'))
    .pipe(yarn({
        production: true
    }));
```

## Contributing to Gulp-Yarn

Contributions are always welcome, no matter how large or small. Before contributing.

## Test
```sh
yarn test		#run mocha test
```

**Clone:**
```sh
git clone https://github.com/warapitiya/gulp-yarn.git
```

**Yarn:**
```sh
cd gulp-yarn/ 	#move to gulp-yarn directory
yarn 			#install yarn dependencies
```

**Run test:**
```sh
yarn test		#run mocha test
```

## Options

**+ Production**

**Type:** `Boolean`

Using the `--production` flag, or when the NODE_ENV environment variable is set to production, Yarn will not install any package listed in devDependencies.

**Example:**

```javascript
var yarn = require('gulp-yarn');

gulp.src(['./package.json'])
    .pipe(yarn({production: true}))
    .pipe(gulp.dest('./dist'));
```

**+ Dev**

**Type:** `Boolean`

Yarn will only install listed devDependencies.

**Example:**

```javascript
var yarn = require('gulp-yarn');

gulp.src(['./package.json'])
    .pipe(yarn({dev: true}))
    .pipe(gulp.dest('./dist'));
```
**+ Flat**

**Type:** `Boolean`

Only allow one version of a package. On the first run this will prompt you to choose a single version for each package that is depended on at multiple version ranges.

**Example:**

```javascript
var yarn = require('gulp-yarn');

gulp.src(['./package.json'])
    .pipe(yarn({flat: true}))
    .pipe(gulp.dest('./dist'));
```

**+ Force**

**Type:** `Boolean`

This refetches all packages, even ones that were previously installed.

**Example:**

```javascript
var yarn = require('gulp-yarn');

gulp.src(['./package.json'])
    .pipe(yarn({force: true}))
    .pipe(gulp.dest('./dist'));
```

**+ Ignore Engines**

**Type:** `Boolean`

Ignore all the required engines force by some packages.

**Example:**

```javascript
var yarn = require('gulp-yarn');

gulp.src(['./package.json'])
    .pipe(yarn({ignoreEngines: true}))
    .pipe(gulp.dest('./dist'));
```

**+ No Bin Links**

**Type:** `Boolean`

None of `node_module` bin links getting created.

**Example:**

```javascript
var yarn = require('gulp-yarn');

gulp.src(['./package.json'])
    .pipe(yarn({noBinLinks: true}))
    .pipe(gulp.dest('./dist'));
```
