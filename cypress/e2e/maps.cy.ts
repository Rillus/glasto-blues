import { faker } from "@faker-js/faker";

describe("Maps", () => {

  it("should show maps", () => {
    cy.visitAndCheck("/maps");

    cy.findByRole("button", { name: "Official map" }).click();
  });
});
