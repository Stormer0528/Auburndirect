import { compose } from 'redux';

/**
* This is a policy manager, which is used to register,
* get and run policies over actions and responses
*
* A policy is a middleware, and it should follow the signature bellow
* store => done => (action, error, response) => done(action, error, response);
* A policy must have a applyPoint property. The available apply points are:
* 'beforeRequest', 'onResponse'
*/

var applyPoints = ['beforeRequest', 'onResponse'];

export var globalPolicies = {};

export var reset = function reset() {
  Object.keys(globalPolicies).forEach(function (key) {
    delete globalPolicies[key];
  });
};

export var register = function register(name, policy) {
  var _Object$assign;

  if (globalPolicies[name]) {
    throw new Error('Called register with policy: ' + name + ' more than once');
  }

  if (applyPoints.indexOf(policy.applyPoint) < 0) {
    var invalid = 'Invalid applyPoint: ' + policy.applyPoint + ', provided with policy: ' + name + '.';
    var available = 'The apply points available are: ' + applyPoints.join(', ');
    throw new Error(invalid + ' ' + available);
  }
  Object.assign(globalPolicies, (_Object$assign = {}, _Object$assign[name] = policy, _Object$assign));
};

var get = function get(policyNames) {
  return function (applyPoint) {
    var policies = policyNames.map(function (name) {
      return globalPolicies[name];
    }).filter(function (policy) {
      return policy.applyPoint === applyPoint;
    });

    return function (store) {
      return function (done) {
        var chain = policies.map(function (policy) {
          return policy(store);
        });
        return compose.apply(undefined, chain)(done);
      };
    };
  };
};

export var getActionPolicies = function getActionPolicies(policies) {
  if (Array.isArray(policies)) {
    var policyNames = Object.keys(globalPolicies).filter(function (key) {
      return policies.indexOf(key) >= 0;
    });
    return get(policyNames);
  }
  return get([]);
};

export default {
  globalPolicies: globalPolicies,
  register: register,
  getActionPolicies: getActionPolicies,
  reset: reset
};