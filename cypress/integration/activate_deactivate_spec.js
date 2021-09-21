describe('Activating and deactivating', () => {
  it('Plugin activation and deactivation', () => {
    cy.visit('/');

    cy.window().its('MAP_LOADED').should('eq', true);

    // Clicking the activation button
    cy.get('[aria-label="Draw shape"]').should('be.visible').should('be.enabled').click();

    // Button should have active class now
    cy.get('[aria-label="Draw shape"]').should('to.have.class', 'active');

    // Drawing overlay should be over the map now
    cy.get('.leaflet-area-draw-selection-pane').should('be.visible');
  });
});
