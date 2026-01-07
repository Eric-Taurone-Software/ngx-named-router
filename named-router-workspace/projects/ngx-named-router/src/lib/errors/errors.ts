/**
 * Error thrown when route configuration is invalid
 */
export class NamedRouteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NamedRouteError';
  }
}

/**
 * Error thrown when a duplicate route name is detected
 */
export class DuplicateRouteNameError extends NamedRouteError {
  constructor(routeName: string, existingPath: string, newPath: string) {
    super(
      `Duplicate route name '${routeName}' detected. ` +
      `Existing path: '${existingPath}', New path: '${newPath}'. ` +
      `Route names must be unique across the entire application.`
    );
    this.name = 'DuplicateRouteNameError';
  }
}
