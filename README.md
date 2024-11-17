# Unify Ventures

Website source code for [unifyventures.vc](https://dev.unifyventures.vc) (Currently under dev environment)

## Getting Started

First clone the repo and install dependencies:

```bash
git clone https://github.com/Unify-Ventures/website.git
cd website
```

Install the dependencies:

```
bun install
```

## Development

To run the project locally, run:

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173), and the website should be running.

## Building

To build the project for production, run:

```bash
bun run build
```

The built files will be in the `build` directory.

## Type Generation

To generate the types for the PocketBase API, run:

```bash
bun run typegen
```

This will generate the types in the `src/lib/pb-types.ts` file.

## Ready to Deploy?

You can deploy the project by tagging the commit with the current datetime:

```bash
bun run deploy
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

When creating contributions please do so in a separate branch and open a pull request against the `main` branch.
