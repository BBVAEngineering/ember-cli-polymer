/* jshint node: true */
'use strict';
let path = require('path');
let fs = require('fs');
let readFile = fs.readFileSync;
let fileExists = fs.existsSync;

module.exports = class Package {
  constructor(dir, name, pkgFile) {
    this.dir = dir;
    this.name = name;
    this.pkgFile = pkgFile;
  }

  get elementPath() {
    return path.join(this.dir, this.name, `${this.name}.html`);
  }

  get packagePath() {
    return path.join(this.dir, this.name, this.pkgFile);
  }

  get allImports() {
    return path.join(this.dir, this.name, 'all-imports.html');
  }

  get linkPath() {
    // number of `../` should be related to htmlImportsDir
    // this might disable the need for the manual fixer!
    // TODO !
    return path.join('..', '..', fileExists(this.allImports) ?
                    this.allImports : this.elementPath);
  }

  get link() {
    return `<link rel="import" href="${this.linkPath}">`;
  }

  hasWebComponentsKeyword() {
    if (fileExists(this.packagePath)) {
      let json = JSON.parse(readFile(this.packagePath));
      return !!json && !!json.keywords &&
        json.keywords.indexOf('web-components') !== -1;
    } else {
      return false;
    }
  }

  isWebComponent() {
    return fileExists(this.elementPath) && this.hasWebComponentsKeyword();
  }
};
