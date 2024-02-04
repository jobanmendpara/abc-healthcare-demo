export default defineNuxtRouteMiddleware((to, _from) => {
  // TODO: Consider some way to make url params type safe
  const email = to.query.email;

  if (!email || email.toString().trim() === '')
    return navigateTo({ name: 'index' });
});
