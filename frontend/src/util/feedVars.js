export const feedVars = (route) => {
  const { params, query } = route
  return {
    sort: params.sort ? params.sort.toUpperCase() : 'HOT',
    time: params.time ? params.time.toUpperCase() : 'ALL',
    filter: route.name === 'home' ? 'JOINED' : 'ALL',
    planet: params.planet,
    tag: params.tag,
    username: params.username,
    search: query.q
  }
}
