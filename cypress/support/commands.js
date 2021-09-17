// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('dragAndDrop', (subject, x, y) => {
  cy.get(subject).should('be.visible', { timeout: 20000 });
  Cypress.log({
    name: 'DRAGNDROP',
    message: `Dragging element ${subject} to ${x}, {y}`,
    consoleProps: () => {
      return {
        subject,
        x,
        y,
      };
    },
  });
  const BUTTON_INDEX = 0;
  const SLOPPY_CLICK_THRESHOLD = 3;
  cy.get(subject).then((subject) => {
    const coordsDrag = subject[0].getBoundingClientRect();
    const centerX = coordsDrag.x + coordsDrag.width / 2;
    const centerY = coordsDrag.y + coordsDrag.height / 2;
    console.log(subject[0], coordsDrag);
    cy.wrap(subject)
      .trigger('dragstart')
      .trigger('mousedown', {
        button: BUTTON_INDEX,
        clientX: centerX,
        clientY: centerY,
        force: true,
        which: 1,
      })
      .trigger('mousemove', {
        button: BUTTON_INDEX,
        clientX: centerX + SLOPPY_CLICK_THRESHOLD,
        clientY: centerY + SLOPPY_CLICK_THRESHOLD,
        pageX: centerX + SLOPPY_CLICK_THRESHOLD,
        pageY: centerY + SLOPPY_CLICK_THRESHOLD,
        screenX: centerX + SLOPPY_CLICK_THRESHOLD,
        screenY: centerY + SLOPPY_CLICK_THRESHOLD,
        force: true,
        which: 1,
      });
    cy.get('body')
      .trigger('mousemove', {
        button: BUTTON_INDEX,
        clientX: x,
        clientY: y,
        pageX: x,
        pageY: y,
        screenX: x,
        screenY: y,
        force: true,
        which: 1,
      })
      .trigger('mouseup');
  });
});
