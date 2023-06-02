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
    cy.login();
    cy.visitAndCheck("/");

    cy.findByRole("link", { name: /acts/i }).click();
    cy.findByText("10yrs of My Nu Leng");
  });
});
