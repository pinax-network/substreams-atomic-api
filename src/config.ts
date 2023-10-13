import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import "dotenv/config";

const EnvSchema = Type.Object({
  PORT: Type.Optional(
    Type.Transform(Type.String())
      .Decode((str) => parseInt(str))
      .Encode((num) => num.toString())
  ),
  DB_HOST: Type.String(),
  DB_NAME: Type.String(),
  DB_USERNAME: Type.String(),
  DB_PASSWORD: Type.String({ default: "" }),
});

const config = Value.Decode(EnvSchema, process.env);
export default config;