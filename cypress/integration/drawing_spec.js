describe('Drawing shapes', () => {
  it('While drawing…', () => {
    cy.visit('/');

    cy.window().its('MAP_LOADED').should('eq', true);

    // Clicking the activation button
    cy.get('[aria-label="Draw shape"]').click();

    cy.get('#root').click(450, 150).click(550, 150).click(550, 350).click(420, 300);

    // Close marker is visible
    cy.get('.leaflet-area-draw-selection-pane .end-selection-area').should('be.visible');
    // Closing line is visible too
    cy.get('.areaCloseLine').should('be.visible');
  });

  it('Drawing shape', () => {
    cy.visit('/');

    cy.window().its('MAP_LOADED').should('eq', true);

    // Clicking the activation button
    cy.get('[aria-label="Draw shape"]').click();

    cy.get('#root').click(450, 150).click(550, 150).click(550, 350).click(420, 300);

    cy.get('.leaflet-area-draw-selection-pane .end-selection-area').click();

    cy.get('.area-select-marker').should('have.length', 4);
    cy.get('.area-select-ghost-marker').should('have.length', 4);
  });

  it('Adjusting polygon', () => {
    cy.visit('/');

    cy.window().its('MAP_LOADED').should('eq', true);

    // Clicking the activation button
    cy.get('[aria-label="Draw shape"]').click();

    cy.get('#root').click(450, 150).click(550, 150).click(550, 350).click(420, 300);
    cy.get('.leaflet-area-draw-selection-pane .end-selection-area').click();

    // Storing current polygon
    cy.document().then((doc) => {
      const polygon = doc.querySelector('#polygon').innerText;

      cy.get('.area-select-marker').should('have.length', 4);
      cy.dragAndDrop('.leaflet-marker-draggable:eq(0)', 320, 150);

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(100)
        .get('#polygon')
        .then(($polygon) => {
          cy.wrap($polygon.get(0).innerText).should('not.equal', polygon);
        });
    });
  });

  it('Adding vertex', () => {
    cy.visit('/');

    cy.window().its('MAP_LOADED').should('eq', true);

    // Clicking the activation button
    cy.get('[aria-label="Draw shape"]').click();

    cy.get('#root').click(450, 150).click(550, 150).click(550, 350).click(420, 300);
    cy.get('.leaflet-area-draw-selection-pane .end-selection-area').click();

    cy.dragAndDrop('.area-select-ghost-marker:eq(0)', 420, 100);

    cy.get('.area-select-marker').should('have.length', 5);
    cy.get('.area-select-ghost-marker').should('have.length', 5);
  });
});
