# Contributing to xscrape

Thank you for your interest in contributing to `xscrape`! We appreciate your help in improving our library. This guide will help you understand how you can contribute and make the most out of your development experience.

## How Can I Contribute?

1. **Reporting Bugs**: If you find a bug, please check our [GitHub Issues](https://github.com/johnie/xscrape/issues) to see if it has already been reported. If not, feel free to create a new issue, providing as much detail as possible.
2. **Feature Requests**: If you have an idea for a new feature, please open a GitHub issue and describe your proposal in detail.
3. **Pull Requests**: We welcome contributions through Pull Requests (PRs). Here's how you can create one:
   1. Fork the repository and clone the fork to your local development environment.
   2. Create a new branch for your changes: `git checkout -b feature/my-feature` or `fix/my-bugfix`.
   3. Make the changes you wish to contribute. Ensure your code is well-documented and tested.
   4. Commit your changes: `git commit -m 'Add new feature/fix bug'`.
   5. Push your changes to your fork: `git push origin feature/my-feature`.
   6. Create a Pull Request from your feature branch to the main branch of the xscrape repository.

## Development Environment Setup

1. **Clone the Repository**: Clone the repository from GitHub.
   ```bash
   git clone https://github.com/johnie/xscrape.git
   ```
2. **Navigate to Project Directory**:
   ```bash
   cd xscrape
   ```
3. **Install Dependencies**: Install the required packages using pnpm (preferred), npm, or yarn:
   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```
4. **Build the Project**: Ensure the project builds correctly by running the build script:
   ```bash
   pnpm build
   # or
   npm run build
   ```
5. **Run Tests**: To keep the codebase reliable, make sure all tests are passing:
   ```bash
   pnpm test
   # or
   npm run test
   ```
6. **Format Code**: Use Prettier to format code according to the project style:
   ```bash
   pnpm format
   # or
   npm run format
   ```

## Code Guidelines

1. **Coding Style**: Please adhere to the project's coding style. We use Prettier to enforce code formatting consistently across the codebase.
2. **Commit Messages**: Write clear, concise commit messages. Follow the convention: `type(scope): description [skip ci] [optional body] [optional footer(s)]`
   - `type` can be `fix`, `feat`, `docs`, `style`, etc.
   - `scope` is optional and may relate to the specific part of the module you are working on.
3. **Add Tests**: Tests are important to ensure the stability of the code. Please add or update tests for any code changes.
4. **Documentation**: Ensure any new features or changes are reflected in the documentation. Update doc comments within the code as necessary.

## Reporting a Bug

If you encounter a bug or issue, please follow these steps to report it:

- **Search Existing Issues**: Before opening a new issue, check whether the bug has been already reported.
- **Create a New Issue**: If you don't find an existing issue, you can create a new one on our [GitHub Issues page](https://github.com/johnie/xscrape/issues).
- **Provide Details**: Describe the bug briefly and include steps to reproduce it, along with any other relevant information (e.g., version, environment).

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

For questions and additional information, feel free to reach out through the project's [GitHub Discussions](https://github.com/johnie/xscrape/discussions) or contribute directly by submitting an issue or pull request. Your participation is crucial to our success!

Thank you for your contributions!
