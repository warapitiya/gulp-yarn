# gulp-yarn [![Build Status](https://travis-ci.org/warapitiya/gulp-yarn.svg?branch=master)](https://travis-ci.org/warapitiya/gulp-yarn)
Automatically install yarn packages/dependencies.

### **Install**

Install `gulp-yarn` as a development dependency:

```sh
npm install --save-dev gulp-yarn
```

or

```sh
yarn add gulp-yarn --dev
```

### **Usage**

##### In your `gulpfile.js`:

```javascript
var yarn = require('gulp-yarn');

gulp.src(['./package.json'])
    .pipe(yarn());
```

##### Move to subdirectory

```javascript
var yarn = require('gulp-yarn');

gulp.src(['./package.json', './yarn.lock'])
    .pipe(gulp.dest('./dist'))
    .pipe(yarn({
        production: true
    }));
```


### **Options**

#### production (--production)
Using the --production flag, or when the NODE_ENV environment variable is set to production, Yarn will not install any package listed in devDependencies.

#### dev (--dev)
Yarn will only install listed devDependencies.

#### flat (--flat)
Only allow one version of a package. On the first run this will prompt you to choose a single version for each package that is depended on at multiple version ranges.

#### force (--force)
This refetches all packages, even ones that were previously installed.

#### ignore-engines(--ignore-engines)

#### no-bin-links(--no-bin-links)