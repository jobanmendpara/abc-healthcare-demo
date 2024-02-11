import { api } from '~/plugins/server';

export default defineNuxtRouteMiddleware(async (to, _from) => {
  // TODO: Consider some way to make url params type safe
  const token = to.query.token;

  if (!token || token.toString().trim() === '') {
    navigateTo({ name: 'index' });
    return;
  }

  const doesInviteExist = await api.invites.verify.query(token.toString());

  if (!doesInviteExist)
    return navigateTo({ name: 'index' });
});
