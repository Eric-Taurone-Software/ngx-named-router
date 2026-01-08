# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.1] - 2026-01-07

### Added

- Initial release of ngx-named-router
- Named route navigation with semantic route names
- `NamedRouterLinkDirective` for template-based navigation
- `NamedRouterService` for programmatic navigation
- `NamedRouteService` for route registry management
- Full TypeScript support with type-safe parameters
- Lazy loading support with automatic route discovery
- Comprehensive error handling with `NamedRouteError` and `DuplicateRouteNameError`
- Fragment and query parameter support
- URL generation utilities (`createUrlTree`, `serializeUrl`)
- Route existence checking (`hasRoute`, `getAllRouteNames`)
- Support for Angular 20+ with standalone components
- Support for optional route parameters
- Support for route parameter constraints (regex patterns)
- Automatic URL encoding for special characters in parameters
- Navigation extras support (skipLocationChange, replaceUrl, etc.)

### Documentation

- Comprehensive README with quick start guide
- Full API reference
- Usage examples for templates and TypeScript
- Best practices guide
- Troubleshooting section

[Unreleased]: https://github.com/Eric-Taurone-Software/ngx-named-router/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/Eric-Taurone-Software/ngx-named-router/releases/tag/v0.0.1

