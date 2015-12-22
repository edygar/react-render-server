import { Schema, arrayOf, normalize } from 'normalizr'

export const User = new Schema('users', {
  idAttribute: 'login'
});

export const UserCollection = arrayOf(User);

export const Repo = new Schema('repos', {
  idAttribute: 'fullName'
});

export const RepoCollection arrayOf(Repo);

Repo.define({
  owner: User
});

