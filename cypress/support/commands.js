/* eslint-disable cypress/no-unnecessary-waiting */
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

const BUTTON_INDEX = 0;
const SLOPPY_CLICK_THRESHOLD = 3;

Cypress.Commands.add('dragAndDropElement', (subject, x, y) => {
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
  cy.get(subject).then((subject) => {
    const coordsDrag = subject[0].getBoundingClientRect();
    const centerX = coordsDrag.x + coordsDrag.width / 2;
    const centerY = coordsDrag.y + coordsDrag.height / 2;
    cy.wrap(subject)
      .trigger('dragstart')
      .trigger('mousedown', {
        button: BUTTON_INDEX,
        clientX: centerX,
        clientY: centerY,
        which: 1,
      })
      .trigger('mousemove', {
        button: BUTTON_INDEX,
        clientX: centerX + SLOPPY_CLICK_THRESHOLD,
        clientY: centerY + SLOPPY_CLICK_THRESHOLD,
        which: 1,
      });
    cy.get('body')
      .trigger('mousemove', {
        button: BUTTON_INDEX,
        clientX: x,
        clientY: y,
        which: 1,
      })
      .trigger('mouseup');
  });
});

/**
 * General drag&drop on the page
 */
Cypress.Commands.add('dragAndDrop', (subject, from, to) => {
  Cypress.log({
    name: 'DRAGNDROP',
    message: `Dragging from ${from} to ${to}`,
    consoleProps: () => {
      return {
        from,
        to,
      };
    },
  });
  cy.get(subject).then((subject) => {
    cy.wrap(subject)
      .trigger('dragstart', {
        clientX: from[0],
        clientY: from[1],
        which: 1,
        buttons: 1,
      })
      .trigger('mousedown', {
        button: BUTTON_INDEX,
        clientX: from[0],
        clientY: from[1],
        which: 1,
        buttons: 1,
      })
      .trigger('mousemove', {
        button: BUTTON_INDEX,
        clientX: from[0] + SLOPPY_CLICK_THRESHOLD,
        clientY: from[1] + SLOPPY_CLICK_THRESHOLD,
        which: 1,
        buttons: 1,
      });
    cy.get('body')
      .trigger('mousemove', {
        button: BUTTON_INDEX,
        clientX: to[0],
        clientY: to[1],
        which: 1,
        buttons: 1,
      })
      .trigger('mouseup', {
        button: BUTTON_INDEX,
        clientX: to[0],
        clientY: to[1],
      });
  });
});
