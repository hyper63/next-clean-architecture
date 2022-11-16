# NextJS Clean Architecture

This is a [Next.js](https://nextjs.org/) project bootstrapped with
[`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

This stack employs the tenants of Clean Architecture, using
[`hyper`](https://hyper.io) as general purpose services tier
and [`graphql`](https://graphql.org/) to expose a presentation model.

## Getting Started

> If you're using Gitpod, all of this is done for you

Run `yarn` to install dependencies

You'll need to create a `.env` file. You can generate one with default values by
running `node env.cjs`.

```text
HYPER=...
```

Then:

```
yarn dev
```

This will start:

- [NextJS](https://nextjs.org/) on
  [http://localhost:3000](http://localhost:3000)
- [`hyper-nano`](https://blog.hyper.io/introducing-hyper-nano-hyper-cloud-in-a-bottle/)
  will be downloaded, started on port `6363`, and a `data` and `cache` service bootstrapped

There is a `graphql` at `/api/graphql` equipped with the [`GraphiQL Playground`](https://github.com/graphql/graphiql)

There is also a serveless function endpoint at `/api/hello`

These both demonstrate how dependencies may be injected, so that even endpoints and graphql resolvers can be easily unit tested.

## Relevant Code

### Business Logic and Entities

All business logic and entities can be found in [./lib/domain](./lib/domain/)

In particular [./lib/domain/models](./lib/domain/models) contains all our entities and business rules. All of this logic has no dependencies other than utilities ie. `ramda`, `zod`, etc. and each other, and therefore is very easy to unit test!

[./lib/domain/apis](./lib/domain/apis) weaves side effects, received via simple dependency injection, with our business rules.

> Read more on business logic encapsulation and Clean Architecture
> [here](https://blog.hyper.io/clean-architecture-at-hyper/)

You can access business services in an
[API Route Handler](https://nextjs.org/docs/api-routes/introduction) by wrapping
the handler with the [`withMiddleware`](./lib/middleware/index.ts)
middleware. This will add the `DomainContexrt` on the `NextApiRequest` at
`req.domain`.

You can access business services in
[`getServerSideProps`](https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props)
by wrapping the function with the
[`withMiddlewareSsr`](./lib/middleware/index.ts) middleware. This will add
the `DomainContexrt` on the `GetServerSidePropsContext` at
`context.req.domain`.
