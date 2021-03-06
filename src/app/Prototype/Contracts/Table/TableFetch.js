export default {
  /**
   */
  methods: {
    /**
     * @param {Object} options
     */
    fetchRecords (options = {}) {
      this.loading = true
      this.$q.loading.show({ delay: 100 })

      const hide = () => {
        this.$q.loading.hide()
        this.loading = false
      }

      if (options === undefined || Object.keys(options).length === 0) {
        options = {
          pagination: {
            ...this.pagination,
            page: this.$route.query.page ? Number(this.$route.query.page) : 1
          }
        }
      }

      if (options.pagination) {
        this.pagination = options.pagination
      }
      if (!this.pagination.sortBy) {
        this.pagination.sortBy = this.displayKey
        this.pagination.descending = false
      }
      this.sorter = this.pagination.sortBy
      this.filters = [this.sorter]

      const parameters = {
        pagination: this.pagination,
        sorter: this.sorter,
        filter: this.filter
      }

      try {
        if (typeof this.service === 'function') {
          return this
            .service(parameters, this.filters)
            .then(this.successFetchRecords)
            .catch(this.errorFetchRecords)
            .finally(hide)
        }

        return this.service
          .search(parameters, this.filters)
          .then(this.successFetchRecords)
          .catch(this.errorFetchRecords)
          .finally(hide)
      } catch (error) {
        hide()
      }
    },
    /**
     * @param {Object} response
     */
    successFetchRecords (response) {
      this.data = response.rows
      this.pagination.rowsPerPage = response.rowsPerPage
      this.pagination.pagesNumber = response.pagesNumber
      this.pagination.page = response.page
      this.pagination.rowsNumber = response.rowsNumber
      /* "sortBy": null, "descending": false, "page": 1, "": 5  */

      if (!this.triggerHook) {
        return
      }
      this.triggerHook('fetch:records')
    },
    /**
     * // @param {Object} error
     */
    errorFetchRecords (/* error */) {
      this.data = []
    },
    /**
     */
    previousPage () {
      const query = { page: Number(this.pagination.page) - 1 }
      if (this.filter) {
        query.search = this.filter
      }
      this.$router.push({ query })
    },
    /**
     */
    nextPage () {
      const query = { page: Number(this.pagination.page) + 1 }
      if (this.filter) {
        query.search = this.filter
      }
      this.$router.push({ query })
    },
    /**
     */
    search () {
      this.$router.push({ query: { search: this.filter } })
    }
  },
  /**
   */
  watch: {
    '$route.query.page' (page) {
      this.fetchRecords({ pagination: { ...this.pagination, page: Number(page) } })
    },
    '$route.query.search' () {
      this.fetchRecords()
    }
  }
}
