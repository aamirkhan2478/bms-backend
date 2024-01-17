import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const swaggerJsdoc = YAML.load("./api-docs.yaml");

export default (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJsdoc));
};
