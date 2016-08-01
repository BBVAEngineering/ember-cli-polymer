import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('foo-bar', 'Integration | Polymer | Shadow DOM', {
  integration: true
});

test('Uses native Shadow DOM if available', function(assert) {
  if (!window.Polymer.Settings.nativeShadow) {
    return assert.expect(0);
  }

  assert.expect(2);

  this.render(hbs`<paper-button></paper-button>`);

  assert.ok(document.querySelector('paper-button').shadowRoot,
    'paper-button has shadowRoot');
  assert.equal(this.$('paper-button').attr('role'), 'button',
    'role is attached to button immediately');
});
