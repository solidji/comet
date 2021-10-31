import { ApolloClient, InMemoryCache, from, Reference } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { onError } from '@apollo/client/link/error'
import { RetryLink } from '@apollo/client/link/retry'
import toast from 'react-hot-toast'
import { isLiveQueryOperationDefinitionNode } from '@n1ru4l/graphql-live-query'
import { UploadLink } from '@/graphql/upload'
import i18n from '@/locales/i18n'
import { WebSocketLink } from '@/graphql/WebSocketLink'
import { setContext } from '@apollo/client/link/context'
// import _ from 'lodash'

const url = import.meta.env.PROD
  ? `https://${import.meta.env.VITE_API_DOMAIN}/graphql`
  : 'http://localhost:4000/graphql'

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach((error) => {
      const { message, locations, path } = error
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
      if (
        message !==
        'Access denied! You need to be authorized to perform this action!'
      )
        toast.error(i18n.t(message))
    })
  if (networkError) {
    console.log(`[Network error]: ${networkError}`)
    toast.error(networkError.message)
  }
})

const httpLink = new UploadLink({
  uri: url,
  headers: { token: localStorage.getItem('token') }
})

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('token')
  // return the headers to the context so httpLink can read them
  return {
    headers: token
      ? {
          ...headers,
          token
        }
      : headers
  }
})

const webSocketLink = new WebSocketLink()

const splitLink = new RetryLink().split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      (definition.operation === 'subscription' ||
        isLiveQueryOperationDefinitionNode(definition))
    )
  },
  webSocketLink,
  authLink.concat(httpLink)
)

const finalLink = from([errorLink, splitLink])

function merge(existing, incoming) {
  if (existing) return existing
  return incoming
}

export const apolloClient = new ApolloClient({
  link: finalLink,
  cache: new InMemoryCache({
    typePolicies: {
      User: {
        fields: {
          servers: {
            merge: false
          },
          folders: {
            merge: false
          },
          relatedUsers: {
            merge: false
          }
        }
      },
      Server: {
        fields: {
          channels: {
            merge: false
          },
          folders: {
            merge: false
          },
          owner: {
            merge: true
          },
          permissions: {
            merge: false
          },
          roles: {
            merge: false
          }
        }
      },
      Post: {
        fields: {
          author: {
            merge
          },
          serverUser: {
            merge
          },
          server: {
            merge
          }
        }
      },
      Comment: {
        fields: {
          author: {
            merge
          },
          serverUser: {
            merge
          }
        }
      },
      Message: {
        fields: {
          author: {
            merge
          },
          serverUser: {
            merge
          },
          channel: {
            merge
          },
          group: {
            merge
          },
          toUser: {
            merge
          }
        }
      },
      Query: {
        fields: {
          serverUsers: {
            merge: false
          },
          user: {
            merge: true
          },
          server: {
            merge: true
          },
          folder: {
            merge: true
          },
          publicServers: {
            merge: false
          },
          posts: {
            keyArgs: ['serverId', 'folderId', 'sort', 'feed', 'time'],
            merge(existing, incoming, { args: { offset = 0 }}) {
              // Slicing is necessary because the existing data is
              // immutable, and frozen in development.
              let merged: Reference[] = [];
              if (existing && existing.posts) {
                merged = existing.posts.slice(0)
              } 
              if (incoming && incoming.posts) {
                for (let i = 0; i < incoming.posts.length; ++i) {
                  merged[offset + i] = incoming.posts[i]
                }
              }
              
              return {
                hasMore: incoming ? incoming.hasMore : false,
                posts: merged
              };
            },
            // merge(existing, incoming) {
            //   let posts: Reference[] = [];
            //   if (existing && existing.posts) {
            //     posts = posts.concat(existing.posts);
            //   }
            //   if (incoming && incoming.posts) {
            //     posts = posts.concat(incoming.posts);
            //   }
            //   posts = _.uniqBy(posts, (i)=>i['__ref']);
            //   return {
            //     ...incoming,
            //     posts,
            //   };
            // }
          },
          events: {
            keyArgs: ['serverId', 'sort', 'time'],
            merge(existing, incoming, { args: { offset = 0 }}) {
              let merged: Reference[] = [];
              if (existing && existing.events) {
                merged = existing.events.slice(0)
              } 
              if (incoming && incoming.events) {
                for (let i = 0; i < incoming.events.length; ++i) {
                  merged[offset + i] = incoming.events[i]
                }
              }
              
              return {
                hasMore: incoming ? incoming.hasMore : false,
                events: merged
              };
            }, 
          }
        }
      }
    }
  })
})
