import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Product: a
    .model({
      name: a.string().required(),
      description: a.string(),
      price: a.float().required(),
      category: a.enum([
        "zapatos",
        "ropa",
        "electrónicos",
        "libros",
        "otros",
      ]),
      stock: a.integer().required(),
      imageUrl: a.string(),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.authenticated().to(["read"]),
      allow.group("Administradores").to(["create", "update", "delete", "read"]),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "iam",
  },
});
