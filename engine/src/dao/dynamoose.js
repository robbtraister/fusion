'use strict'

const dynamoose = require('dynamoose')

const defaultSchema = new dynamoose.Schema(
  {
    env: {
      type: String,
      hashKey: true
    },
    id: {
      type: String,
      default: model => uuidv4(),
      rangeKey: true
    },
    type: {
      type: String,
      required: true,
      index: {
        global: false
      }
    },
    timestamp: {
      type: Number,
      required: true,
      index: {
        global: false
      }
    },
    username: {
      type: String,
      required: true,
      index: {
        global: false
      }
    }
  },
  { useDocumentTypes: true }
)

class EventsController {
  constructor (env, configs) {
    this.configs = configs
    this.env = env

    const region = (configs.region instanceof Function)
      ? configs.region(env)
      : configs.region

    this.region = region

    const d = new dynamoose.Dynamoose()
    d.AWS.config.update({region})
    this.model = d.model(configs.table || 'maestro.events', configs.schema || defaultSchema)
  }

  get (id) {
    return this.model.get({env: this.env, id})
  }

  list (options) {
    const schema = this.model.$__.schema
    const filterMap = {}
    Object.keys(options)
      .forEach(field => {
        let operator = 'eq'
        let value = options[field]

        if (field.endsWith('<')) {
          field = field.slice(0, -1)
          operator = 'le'
        } else if (field.endsWith('>')) {
          field = field.slice(0, -1)
          operator = 'ge'
        // -- `endsWith` is not a valid dynamo search operator
        // } else if (value.startsWith('*')) {
        //   value = value.slice(1)
        //   operator = 'endsWith'
        } else if (value.endsWith('*')) {
          value = value.slice(0, -1)
          operator = 'beginsWith'
        }

        if (field === 'env') {
          throw new Error('Cannot specify `env` attribute')
        }

        // ensure field is part of the schema
        if (field in schema.attributes) {
          const whereable = (
            schema.hashKey.name === field ||
            schema.rangeKey.name === field ||
            schema.attributes[field].indexes
          )
          const filter = {
            whereable,
            field,
            operator,
            value: [value]
          }
          filterMap[field] = filterMap[field] || {}
          filterMap[field][operator] = filter
        // -- ignore stray attributes
        // } else {
        //   throw new Error(`${field} is not a schema attribute`)
        }
      })

    Object.keys(filterMap)
      .forEach(field => {
        const filter = filterMap[field]
        if (filter.ge && filter.le) {
          filter.between = {
            whereable: filter.ge.whereable,
            field: filter.ge.field,
            operator: 'between',
            value: [filter.ge.value[0], filter.le.value[0]]
          }
          delete filter.ge
          delete filter.le
        }
      })

    const filters = [].concat(...Object.keys(filterMap).map(field =>
      Object.keys(filterMap[field]).map(operator => filterMap[field][operator])
    ))
      .filter(filter => !!filter)

    const where = filters.find(filter => filter.whereable)
    const queryAction = (filters.length === 0 || where) ? 'query' : 'scan'

    let query = this.model[queryAction]('env').eq(this.env)
    if (where) {
      query = query.where(where.field)[where.operator](...where.value)
    }
    filters
      .filter(filter => !where || filter.field !== where.field)
      .forEach(filter => {
        query = query.filter(filter.field)[filter.operator](...filter.value)
      })

    return query.exec()
  }

  put (event) {
    return new Promise((resolve, reject) => {
      this.model.create(Object.assign({}, event, {env: this.env}), (err, data) => (err ? reject(err) : resolve(data)))
    })
      // don't throw exception on event logging
      .catch((err) => {
        console.error(err)
        return null
      })
  }
}

module.exports = EventsController
