export default defineNuxtRouteMiddleware((to, _from) => {
  const phone = to.query.phone;

  if (!phone || phone.toString().trim() === '')
    return navigateTo('/');
});
