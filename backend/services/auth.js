const Iron = require('@hapi/iron');
const db = require('./db');

const secret_key = 'change_me_asdjakhds12412dakT*&ASDY(*AYSDHNCAJSCO';

async function get_credentials(authorization) {
  if (!authorization) {
    return null;
  } 

  let unsealed;
  try {
    unsealed = await Iron.unseal(authorization, secret_key, Iron.defaults);
  } catch (err) {
    console.log(err);
    return null;
  }

  return unsealed;
}

async function authenticate(username, password) {
  const user = await db.get_user(username, password);

  if (!user) {
    return null
  }

  const credentials = {
    username: user.username,
    role: user.role
  };

  const sealed = await Iron.seal(credentials, secret_key, Iron.defaults);
  return sealed;
}

module.exports = { get_credentials, authenticate };
