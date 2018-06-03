Gengo API for Node
===========

This Node.js module provides access to the [Gengo API](http://developers.gengo.com/) for ordering translations.

Installation
----------

Install via [npm](http://npmjs.org/)

    npm install gengo --save


Initialize Gengo with your public and private keys. If querying the Gengo sandbox, set `sandbox` to true.

    var gengo = require('gengo')(publicKey, privateKey, sandbox);


Endpoints
----------
  
- All callbacks are passed an error and response: `callback(err, res)`.
- Supports camelCase and underscore naming conventions (Gengo uses the underscore convention).
- Please refer to Gengo's [API Docs](http://developers.gengo.com/v2/api_methods/) for endpoint details.

  
**gengo.account**

    gengo.account.stats(callback);

    gengo.account.balance(callback);

    gengo.account.preferredTranslators(callback);
    
**gengo.job**

    gengo.job.get(jobId, callback);
    
    gengo.job.update({ id: jobId, action: 'approve' }, callback);
    
    gengo.job.delete(jobId, callback);
    
    gengo.job.feedback(jobId, callback);

    gengo.job.revisions.list(jobId, callback);
    
    gengo.job.revisions.get({ id: jobId, revId: revisionId }, callback);
    
    gengo.job.comments.list(jobId, callback);
    
    gengo.job.comments.create({ id: jobId, body: 'Great job!' }, callback);
    
**gengo.jobs**

    gengo.jobs.create(jobsObject, callback);

    gengo.jobs.list({ status: 'approved' }, callback);

    gengo.jobs.get([jobId, jobId2, ...], callback);
    
**gengo.order**

    gengo.order.get(orderId, callback);

    gengo.order.delete(orderId, callback);
    
**gengo.glossary**

    gengo.glossary.list(callback);

    gengo.glossary.get(glossaryId, callback);
    
**gengo.service**

    gengo.service.languagePairs({lc_src: 'en' }, callback);

    gengo.service.languages(callback);

    gengo.service.quote(jobs, callback);

    gengo.service.quoteFiles({ jobs: jobs, files: files }, callback);



Contribute
----------

Forks and pull requests welcome!

TODO
----------
* gengo.service.quoteFiles isn't working currently
* Add tests


Author
----------

Supported and maintained by [Localize](https://localizejs.com/).
