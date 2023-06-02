import { faker } from "@faker-js/faker";

describe("Stages", () => {
  afterEach(() => {
    // cy.cleanupUser();
  });

  it("should load the stages list", () => {
    // const testNote = {
    //   title: faker.lorem.words(1),
    //   body: faker.lorem.sentences(1),
    // };
    cy.visitAndCheck("/stages");

    // check to see if a link with Pyramid Stage exists
    const pyramidStageLink = cy.get("a").contains("Pyramid Stage");

    // check it links to the stage
    pyramidStageLink.click();
    cy.url().should("include", "/stages/pyramid-stage");
  });
});
