import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "product-images",
  access: (allow) => ({
    "product-images/public/*": [
      allow.guest.to(["read"]),
      allow.authenticated.to(["read"]),
      allow.groups(["Administradores"]).to(["read", "write", "delete"]),
    ],
  }),
});
