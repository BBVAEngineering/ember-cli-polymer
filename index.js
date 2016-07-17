/* jshint node: true */
'use strict';
var fs = require('fs');
var path = require('path');
var MergeTrees = require('broccoli-merge-trees');
var Vulcanize = require('broccoli-vulcanize');

module.exports = {
  name: 'ember-polymer',

  included: function(app) {
    this._super.included.apply(this, arguments);

    this.addonOptions = this.app.options['ember-polymer'] || {};
    this.htmlImportsDir = this.addonOptions.htmlImportsDir || 'app';
    this.htmlImportsFile = this.addonOptions.htmlImportsFile || 'elements.html';
    this.vulcanizedOutput = this.addonOptions.vulcanizedOutput ||
      path.join('assets', 'vulcanized.html');
    this.projectTree = app.trees.app;

    app.import(app.bowerDirectory + '/webcomponentsjs/webcomponents.min.js');
  },

  // insert polymer and vulcanized elements
  contentFor: function(type) {
    if (type === 'head') {
      var str = '<script>window.Polymer = window.Polymer || {};';
      // (!) shadow DOM is required for Polymer and Ember to interoperate
      str += 'window.Polymer.dom = "shadow";</script>';
      str += '<link rel="import" href="assets/vulcanized.html">';
      return str;
    }
  },

  // vulcanize elements, starting at specified html imports file
  postprocessTree: function(type, tree) {
    if (type === 'all') {
      if (!this.htmlImportsFile.endsWith('.html')) { // wrong extension
        throw new Error('ember-polymer build failed. ' +
          'The html import you specified is not of html extension, ' +
          'this is however required by the vulcanize tool. ' +
          'Try importing custom elements using a html file.');
      }
      if (!this.vulcanizedOutput.endsWith('.html')) { // wrong extension
        throw new Error('ember-polymer vulcanize output file not a html file.');
      }

      var filePath = path.join(this.app.project.root,
                               this.htmlImportsDir,
                               this.htmlImportsFile);
      if (fs.existsSync(filePath)) {
        var vulcanized = new Vulcanize(this.projectTree, {
          input: this.htmlImportsFile,
          output: this.vulcanizedOutput,
          inlineCss: true
        });

        return new MergeTrees([ tree, vulcanized ], {
          overwrite: true,
          annotation: 'Merge (ember-polymer merge vulcanized with addon tree)'
        });
      }
    }

    return tree;
  }
};
