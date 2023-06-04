import { faker } from "@faker-js/faker";

describe("Acts index", () => {
  afterEach(() => {
    // cy.cleanupUser();
  });

  it("should load the first page of acts", () => {
    // const testNote = {
    //   title: faker.lorem.words(1),
    //   body: faker.lorem.sentences(1),
    // };
    cy.visitAndCheck("/acts");

    cy.findAllByText("Circus Eruption");
  });

  it("should load more acts on scroll", () => {
    cy.visitAndCheck("/acts");

    cy.scrollTo("bottom");
    cy.findAllByText("Groovy Guy");
  });

  it("should show 'save' buttons if logged in", () => {
    cy.visitAndCheck("/acts");

    cy.findAllByRole("button", { name: "Add to lineup" }).should("not.exist");

    cy.login();
    cy.visitAndCheck("/acts");
    cy.findAllByRole("button", { name: "Add to lineup" }).should("exist");

  });
});
