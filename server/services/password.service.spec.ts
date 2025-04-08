import { assertEquals } from "jsr:@std/assert@~0.222.1/assert-equals";
import { faker } from "npm:@faker-js/faker";
import passwordService from "./password.service.ts";

Deno.bench({
  name: "Faker name and email generation",
  fn() {
    const first_name = faker.person.firstName();
    const last_name = faker.person.lastName();
    const email = faker.internet.email({
      firstName: first_name,
      lastName: last_name,
    });
    const name = `${first_name} ${last_name}`;

    assertEquals(typeof name, "string");
    assertEquals(typeof email, "string");
  },
});

Deno.bench({
  name: "Password hashing (scrypt)",
  fn() {
    const password = "someString";
    const hash = passwordService.hashPassword({ password });

    assertEquals(typeof hash, "string");
    assertEquals(hash.length > 10, true);
  },
});

Deno.bench({
  name: "Generate password and hash (faker + scrypt)",
  fn() {
    const password = faker.internet.password();
    const hashed = passwordService.hashPassword({ password });

    assertEquals(typeof password, "string");
    assertEquals(typeof hashed, "string");
    assertEquals(hashed.length > 10, true);
  },
});
