
//  (c) 2012 Beau Sorensen
//  MIT Licensed
//  For all details and documentation:
//  https://github.com/tblobaum/mongoose-troop

// Pagination
// ----------

// Plugin
function pagination (schema, options) {
  options = options || {}

  // Options
  var defaultLimit = options.defaultLimit || 10
    , defaultQuery = options.defaultQuery || {}
    , defaultFields = options.defaultFields || {}
    , defaultSort = options.defaultSort || {}
    , defaultPopulate = options.defaultPopulate || null
    , remember = options.remember || false
    , defaultPage = 1
    , currentLimit = defaultLimit
    , currentQuery = defaultQuery
    , currentFields = defaultFields
    , currentSort = defaultSort
    , currentPopulate = defaultPopulate

  // Main pagination method, can pass `query`, `page`, `limit`
  // and `fields` into the options to pass directly into the 
  // mongoose ORM, returns the standard `err` and `docs`, along with
  // the total object count, total pages, and current page
  schema.static('paginate', function (opt, fn) {
    if (!fn) { fn = opt; opt = {} }
    var self = this
      , query = opt.query || currentQuery
      , page = opt.page || defaultPage
      , limit = opt.limit || currentLimit
      , fields = opt.fields || currentFields
      , sort = opt.sort || currentSort
      , populate = opt.populate || currentPopulate

    if (remember) {
      opt.query && (currentQuery = opt.query)
      opt.limit && (currentLimit = opt.limit)
      opt.fields && (currentFields = opt.fields)
      opt.sort && (currentSort = opt.sort)
      opt.populate && (currentPopulate = opt.populate)
    }

    // default query
    var q = this.find(query, fields, {
      skip: (limit * (page - 1))
    , limit: limit
    });
    // sorting
    if (sort)
      q.sort(sort);
    // population
    if (populate)
      q.populate(populate);
    // execute query
    q.exec(function(err, docs) {
      if (err) return (fn && fn(err))
      self.count(query, function (err, count) {
        if (err) return (fn && fn(err))
        fn && fn(err, { docs: docs, count: count, pages: Math.ceil(count / limit), page: page, limit: limit })
      })
    })
    return this
  })
  
  // Shortcut method for retrieving the first page
  schema.static('firstPage', function (opt, fn) {
    if (!fn) { fn = opt; opt = {} }
    var query = opt.query || currentQuery
      , limit = opt.limit || currentLimit
      , fields = opt.fields || currentFields
      , sort = opt.sort || currentSort
      , populate = opt.populate || currentPopulate
    
    this.paginate({
      query: query
    , page: 1
    , limit: limit
    , fields: fields
    , sort: sort
    , populate: populate
    }, fn)
    return this
  })

  // Shortcut method for retrieving the last page
  schema.static('lastPage', function (opt, fn) {
    if (!fn) { fn = opt; opt = {} }
    var self = this
      , query = opt.query || currentQuery
      , limit = opt.limit || currentLimit
      , fields = opt.fields || currentFields
      , sort = opt.sort || currentSort
      , populate = opt.populate || currentPopulate

    this.count(query, function (err, count) {
      if (err) return (fn && fn(err))
      self.paginate({
        query: query
      , page: Math.ceil(count / limit)
      , limit: limit
      , fields: fields
      , sort: sort
      , populate: populate
      }, fn)
    })
    return this
  })
}

module.exports = pagination
