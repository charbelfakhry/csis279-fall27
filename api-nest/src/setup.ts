import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';

// shared by main.ts and the e2e tests, so tests run the app exactly as it is served
export function configureApp(app: INestApplication) {
  app.setGlobalPrefix('api');
  app.enableCors();
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // drops fields the dto does not declare
      transform: true, // turn the json body into a DTO instance
      // one message per field: "Email is required", not also "Invalid email".
      // decorators run bottom-up, so the last failed rule is the top-most one in the dto
      exceptionFactory: (errors) =>
        new BadRequestException({
          errors: errors.map((error) => Object.values(error.constraints ?? {}).at(-1)).filter(Boolean),
        }),
    }),
  );
  return app;
}
