import { faker } from "@faker-js/faker";

describe("Stages by id", () => {
  afterEach(() => {
    // cy.cleanupUser();
  });

  it("should load the stage list", () => {
    // const testNote = {
    //   title: faker.lorem.words(1),
    //   body: faker.lorem.sentences(1),
    // };
    cy.visitAndCheck("/stages/pyramid-stage");

    // h1 should be the stage name
    cy.get("h1").contains("Pyramid Stage");

    // check to see if a link with Pyramid Stage exists
    const texasLink = cy.get("a").contains("Texas");

    // check it links to the stage
    texasLink.click();
    cy.url().should("include", "/acts/texas");
  });
});
