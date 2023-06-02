import { faker } from "@faker-js/faker";

describe("Acts by id", () => {
  afterEach(() => {
    // cy.cleanupUser();
  });

  it("should load the act", () => {
    // const testNote = {
    //   title: faker.lorem.words(1),
    //   body: faker.lorem.sentences(1),
    // };
    cy.login();
    cy.visitAndCheck("/acts/10yrs-of-my-nu-leng");

    cy.findByText("10yrs of My Nu Leng");
  });
});
