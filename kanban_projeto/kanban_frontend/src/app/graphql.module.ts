import { NgModule } from '@angular/core';
import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApolloClientOptions, InMemoryCache, ApolloLink } from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';

const uri = 'http://localhost:3000/graphql';

export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
  // Error handling link
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );
      });
    }
    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
    }
  });

  // Logging link to log requests and responses
  const loggingLink = new ApolloLink((operation, forward) => {
    console.log(`[GraphQL request] Operation name: ${operation.operationName}`);
    console.log('[GraphQL request] Variables:', JSON.stringify(operation.variables, null, 2));
    
    return forward(operation).map((response) => {
      console.log(`[GraphQL response] Operation name: ${operation.operationName}`);
      console.log('[GraphQL response] Data:', JSON.stringify(response.data, null, 2));
      if (response.errors) {
        console.error('[GraphQL response] Errors:', JSON.stringify(response.errors, null, 2));
      }
      return response;
    });
  });

  // Combine error link with http link
  const link = ApolloLink.from([
    errorLink,
    loggingLink,
    httpLink.create({ uri })
  ]);

  return {
    link,
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            getBoard: {
              merge(existing, incoming) {
                return incoming;
              }
            }
          }
        }
      }
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      mutate: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      }
    },
  };
}

@NgModule({
  providers: [
    Apollo,
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {}
