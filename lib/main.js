var request         = require('request'),
    crypto          = require('crypto');

// Globals
var API_URL = 'https://api.gengo.com/v2/',
    SANDBOX_API_URL = 'http://api.sandbox.gengo.com/v2/';

////
//   REQUEST HANDLERS
////

// Create api signature
var createApiSignature = function(publicKey, privateKey) {
  var ts = new Date() / 1000 | 0;
  return {
    ts: ts,
    api_sig: crypto.createHmac('sha1', privateKey).update(ts.toString()).digest('hex'),
    api_key: publicKey
  };
};

var createMethod = function(method, signature, sandbox) {
  return function(uri, data, cb) {
    if (typeof data === 'function') {
      cb = data;
      data = {};
    } else if (['string', 'number'].indexOf(typeof data) !== -1) {
      data = { id: data };
    }
    
    var options = {
      method: method,
      timeout: 300000,
      uri: (sandbox ? SANDBOX_API_URL : API_URL) + uri,
      headers: { 'Accept': 'application/json' }
    };
    
    // Add data to request
    data = keysToUnderscore(data);
    if (method === 'GET' || method === 'DELETE') options.qs = data || {};
    else options.form = { data: JSON.stringify(data) || {} };

    // Add signature
    for (var prop in signature) (options.form || options.qs)[prop] = signature[prop]; 

    request(options, globalResponseHandler(cb));
  };
};

var keysToUnderscore = function(obj) {
  if (obj !== Object(obj)) return obj;

  Object.keys(obj).forEach(function(key) {
    var underscoredKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

    obj[underscoredKey] = keysToUnderscore(obj[key]);
    if (key !== underscoredKey) delete obj[key];
  });

  return obj;
};


////
//   RESPONSE HANDLERS
////

var globalResponseHandler = function(cb) {
  return function(err, res, body) {
    if (typeof cb !== 'function') return;

    // Catch connection errors
    if (err || !res || res.statusCode !== 200) return cb([err, res]);

    // Try to parse response
    if (body !== Object(body)) {
      try {
        body = JSON.parse(body);
      } catch(e) {
        return cb('Could not parse response from Gengo: ' + body, null);
      }
    }

    // Check for error returned in a 200 response
    if (body.opstat === 'error') {
      if (body.err) return cb(body.err);
      return cb(err);
    }

    // Make sure response is OK
    if (body.opstat === 'ok') body = body.response;

    // Return response
    cb(null, body);
  };
};



////
//   PUBLIC API
////

module.exports = function(publicKey, privateKey, sandbox) {
  var signature = createApiSignature(publicKey, privateKey),
      sendGet = createMethod('GET', signature, sandbox),
      sendPost = createMethod('POST', signature, sandbox),
      sendPut = createMethod('PUT', signature, sandbox),
      sendDelete = createMethod('DELETE', signature, sandbox);

  // Get ID from string or object formatted as { id: 'id' }
  var getId = function(id) {
    return id === Object(id) ? id.id : id;
  };

  // RETURN API
  return {
    account: {
      stats: function(cb) { sendGet('account/stats', cb); },
      balance: function(cb) { sendGet('account/balance', cb); },
      preferredTranslators: function(cb) { sendGet('account/preferred_translators', cb); }
    },
    job: {
      get: function(data, cb) {
        sendGet('translate/job/' + getId(data), data, cb);
      },
      update: function(data, cb) {
        sendPut('translate/job/' + getId(data), data, cb);
      },
      delete: function(data, cb) {
        sendDelete('translate/job/' + getId(data), data, cb);
      },
      feedback: function(data, cb) {
        sendGet('translate/job/' + getId(data) + '/feedback', data, cb);          
      },
      revisions: {
        list: function(data, cb) {
          sendGet('translate/job/' + getId(data) + '/revisions', data, cb);          
        },
        get: function(data, cb) {
          sendGet('translate/job/' + data.id + '/revision/' + (data.rev_id || data.revId), data, cb);          
        },
      },
      comments: {
        get: function(data, cb) {
          sendGet('translate/job/' + getId(data) + '/comments', data, cb);   
        },
        create: function(data, cb) {
          sendPost('translate/job/' + getId(data) + '/comment', data, cb);   
        }
      },
    },
    jobs: {
      create: function(data, cb) {
        sendPost('translate/jobs', data, cb);
      },
      list: function(data, cb) {
        sendGet('translate/jobs', data, cb);
      },
      get: function(data, cb) {
        if (Array.isArray(data)) {
          sendGet('translate/jobs/' + data.join(','), null, cb);
        } else {
          sendGet('translate/jobs/', data, cb);
        }
      }
    },
    order: {
      get: function(data, cb) {
        sendGet('translate/order/' + getId(data), data, cb);
      },
      delete: function(data, cb) {
        sendDelete('translate/order/' + getId(data), data, cb);
      },
    },
    glossary: {
      list: function(data, cb) {
        sendGet('translate/glossary', data, cb);        
      },
      get: function(data, cb) {
        sendGet('translate/glossary/' + getId(data), data, cb);
      }
    },
    service: {
      languagePairs: function(data, cb) {
        sendGet('translate/service/language_pairs', data, cb);        
      },
      languages: function(data, cb) {
        sendGet('translate/service/languages', data, cb);        
      },
      quote: function(data, cb) {
        sendPost('translate/service/quote', data, cb);
      },
      quoteFiles: function(data, cb) {
        sendPost('translate/service/quote', data, cb);
      }
    }
  };
};
