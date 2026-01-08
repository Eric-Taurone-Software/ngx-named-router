# ngx-named-router

[![npm version](https://badge.fury.io/js/ngx-named-router.svg)](https://www.npmjs.com/package/ngx-named-router)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful Angular library that brings **named route navigation** to your Angular applications. Navigate using semantic route names instead of brittle URL paths, making your code more maintainable and refactor-friendly.

> 📚 **For full documentation, API reference, and usage examples, see the [library README](projects/ngx-named-router/README.md)** or visit [npm](https://www.npmjs.com/package/ngx-named-router).

---

## Quick Overview

Traditional Angular routing requires hardcoded paths:

```typescript
// ❌ Brittle - breaks when URLs change
this.router.navigate(['/users', userId, 'settings']);
```

With ngx-named-router, you use semantic names:

```typescript
// ✅ Maintainable - survives URL refactoring
this.namedRouter.navigate('user-settings', { routeParams: { userId: 123 } });
```

## Installation

```bash
npm install ngx-named-router
```

## Quick Start

```typescript
// 1. Add names to your routes
export const routes: NamedRoute[] = [
  { path: 'users/:id', component: UserDetailComponent, name: 'user-detail' }
];

// 2. Configure your app
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideNamedRoutes()  // 👈 Add this
  ]
};

// 3. Use in templates
<a [namedRouterLink]="'user-detail'" [routeParams]="{id: 123}">View User</a>

// 4. Or use programmatically
this.namedRouter.navigate('user-detail', { routeParams: { id: 123 } });
```

---

## Development

This is the development workspace for the ngx-named-router library.

### Project Structure

```
ngx-named-router/
├── projects/
│   └── ngx-named-router/          # Library source code
│       ├── src/
│       │   ├── lib/               # Library implementation
│       │   └── public-api.ts      # Public API exports
│       ├── package.json           # Library package.json (published to npm)
│       └── README.md              # Library documentation (published to npm)
└── README.md                      # This file (workspace documentation)
```

### Setup

```bash
# Clone the repository
git clone https://github.com/Eric-Taurone-Software/ngx-named-router.git
cd ngx-named-router

# Install dependencies
npm install
```

### Development Workflow

#### Build the Library

```bash
# Build once
npm run build:lib

# Build and watch for changes
npm run watch:lib
```

The built library will be in `dist/ngx-named-router/`.

#### Run Tests

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

#### Run Demo Application

```bash
# Start the demo app
npm start

# Navigate to http://localhost:4200
```

The demo application demonstrates all features of the library.

### Publishing

Before publishing a new version:

1. **Update version** in `projects/ngx-named-router/package.json`
2. **Update CHANGELOG.md** with the new version changes
3. **Build the library**:
   ```bash
   npm run build:lib
   ```
4. **Publish to npm** from the dist folder:
   ```bash
   cd dist/ngx-named-router
   npm publish
   ```

### Testing the Package Locally

To test the built package locally before publishing:

```bash
# Build the library
npm run build:lib

# Create a tarball
cd dist/ngx-named-router
npm pack

# In another Angular project, install the tarball
npm install /path/to/ngx-named-router/dist/ngx-named-router/ngx-named-router-0.0.1.tgz
```

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/my-feature`
3. **Make your changes** with appropriate tests
4. **Ensure builds pass**: `npm run build:lib`
5. **Run tests**: `npm test`
6. **Commit with conventional commits**: `git commit -m "feat: add my feature"`
7. **Push to your fork**: `git push origin feature/my-feature`
8. **Open a Pull Request**

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Code Style

- Follow the existing code style
- Use Prettier for formatting (configured in `package.json`)
- Write meaningful commit messages
- Add tests for new features

---

## License

MIT © Eric Taurone

See [LICENSE](LICENSE) file for details.

---

## Support & Links

- 📦 [npm Package](https://www.npmjs.com/package/ngx-named-router)
- 📖 [Documentation](projects/ngx-named-router/README.md)
- 🐛 [Issue Tracker](https://github.com/Eric-Taurone-Software/ngx-named-router/issues)
- 💬 [Discussions](https://github.com/Eric-Taurone-Software/ngx-named-router/discussions)
- 📝 [Changelog](CHANGELOG.md)

---

**Made with ❤️ for the Angular community**



